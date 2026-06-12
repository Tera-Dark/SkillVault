import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import matter from 'gray-matter';
import os from 'os';
import { exec, spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 23335;

app.use(cors());
app.use(express.json());

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 默认存储路径
const DEFAULT_SKILLS_DIR = path.join(__dirname, 'skills');

// 获取当前工作目录
async function getSkillsDir() {
  try {
    if (await fs.pathExists(CONFIG_FILE)) {
      const config = await fs.readJson(CONFIG_FILE);
      if (config.skillsDir) {
        // 确保目录存在，不存在则自动创建
        await fs.ensureDir(config.skillsDir);
        return config.skillsDir;
      }
    }
  } catch (error) {
    console.error('读取配置文件失败，使用默认路径:', error.message);
  }
  
  // 使用默认目录
  await fs.ensureDir(DEFAULT_SKILLS_DIR);
  return DEFAULT_SKILLS_DIR;
}

// 格式化文件名，过滤掉 windows 不允许的字符
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').trim();
}

// 检查 targetPath 是否在 baseDir 内 (基于 path.relative 计算，杜绝目录穿越与前缀匹配绕过漏洞)
function ensureSafePath(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  
  const relative = path.relative(resolvedBase, resolvedTarget);
  // relative 为空代表是 baseDir 自身，否则如果以 '..' 开头或者为绝对路径说明超出了目录范围
  const isSafe = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  
  if (!isSafe) {
    throw new Error('安全校验拦截：禁止跨越工作目录访问外部路径！');
  }
  return resolvedTarget;
}

// 自适应混合物理与虚拟路径定位函数
function resolveSkillFilePath(skillsDir, category, filename) {
  const cleanCategory = (category || '未分类').trim();
  const cleanFilename = filename.trim();

  // 1. 如果 filename 已经在根目录下直接存在
  const rootPath = path.join(skillsDir, cleanFilename);
  if (fs.existsSync(rootPath)) {
    return rootPath;
  }

  // 2. 如果物理上在子目录下存在
  if (cleanCategory !== '未分类') {
    const subPath = path.join(skillsDir, cleanCategory, cleanFilename);
    if (fs.existsSync(subPath)) {
      return subPath;
    }
  }

  // 3. 针对新建文件或不存在的文件：
  // 如果 category 不是未分类，且文件名没有以 "category_" 开头，采用新命名规范直接创建在根目录
  if (cleanCategory !== '未分类') {
    const prefix = `${cleanCategory}_`;
    if (!cleanFilename.startsWith(prefix)) {
      return path.join(skillsDir, `${cleanCategory}_${cleanFilename}`);
    }
  }

  // 4. 兜底返回根目录物理路径
  return rootPath;
}

// 原子化安全写入物理文件，防止写入断电或冲突时数据丢失损坏
async function atomicWriteFile(filePath, content, encoding = 'utf-8') {
  const tempPath = filePath + '.tmp';
  try {
    await fs.writeFile(tempPath, content, encoding);
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // 失败时清理临时文件
    try {
      if (await fs.pathExists(tempPath)) {
        await fs.unlink(tempPath);
      }
    } catch (e) {}
    throw error;
  }
}

// 辅助方法：检查请求是否来自本地回环地址 (127.0.0.1 或 ::1)
function isLocalRequest(req) {
  const ip = req.ip || req.connection.remoteAddress;
  return ip === '127.0.0.1' || 
         ip === '::1' || 
         ip === '::ffff:127.0.0.1' || 
         ip === 'localhost';
}

// 辅助方法：检查路径是否为禁止的敏感系统路径
function isForbiddenSystemPath(targetPath) {
  try {
    const p = path.resolve(targetPath).toLowerCase();
    const parsed = path.parse(p);
    
    // 1. 禁止设为驱动器根目录 (例如 C:\, D:\, /)
    if (p === parsed.root.toLowerCase()) {
      return true;
    }
    
    // 2. 禁止设为关键系统目录
    const forbiddenDirs = [
      'c:\\windows',
      'c:\\windows\\system32',
      'c:\\program files',
      'c:\\program files (x86)',
      'c:\\users',
      '/etc',
      '/usr',
      '/var',
      '/bin',
      '/sbin'
    ];
    
    return forbiddenDirs.includes(p);
  } catch (e) {
    return true; // 发生异常时，出于安全起见保守判定为不安全
  }
}

// ==========================================
// 内存元数据缓存与目录监听器辅助逻辑
// ==========================================
let skillsCache = null; // 全局缓存，格式：{ [relativeFilePath]: skillMetadataObject }
let activeWatcher = null; // 活动的文件监视器实例
let watcherDebounceTimer = null; // 目录监视防抖定时器
let sseClients = []; // 活跃的 SSE 客户端连接池

// 加载单个文件的元数据到缓存
async function loadFileToCache(skillsDir, relativePath) {
  try {
    const filePath = path.join(skillsDir, relativePath);
    if (!(await fs.pathExists(filePath))) {
      if (skillsCache) {
        delete skillsCache[relativePath.replace(/\\/g, '/')];
      }
      return;
    }
    
    // 只处理 .md 文件
    if (!relativePath.endsWith('.md')) return;
    
    // 排除以 . 开头的隐藏文件夹（如 .trash, .git）
    const parts = relativePath.split(/[\\/]/);
    if (parts.some(p => p.startsWith('.'))) return;
    
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    let data = {};
    try {
      const parsed = matter(content);
      data = parsed.data || {};
    } catch (e) {
      data = {
        title: path.basename(relativePath, '.md'),
        description: `⚠️ YAML Front Matter 解析失败，请检查文件头部格式：${e.message}`,
        tags: ['格式错误'],
        star: false
      };
    }
    
    let categoryName = parts.length > 1 ? parts[0] : '未分类';
    const filename = parts[parts.length - 1];

    // 自适应从带有 "分类_" 前缀的文件名中解析出分类
    if (parts.length === 1 && filename.includes('_')) {
      const idx = filename.indexOf('_');
      const prefix = filename.substring(0, idx);
      if (prefix && prefix !== '未分类' && !prefix.includes('.') && !prefix.includes('/') && !prefix.includes('\\')) {
        categoryName = prefix;
      }
    }

    const key = relativePath.replace(/\\/g, '/');
    
    if (!skillsCache) skillsCache = {};
    skillsCache[key] = {
      key: key,
      title: data.title || path.basename(filename, '.md'),
      description: data.description || '',
      tags: data.tags || [],
      category: categoryName,
      filename: filename,
      updatedAt: stats.mtime,
      createdAt: stats.birthtime,
      star: !!data.star
    };
  } catch (error) {
    console.warn(`[Cache] 加载文件元数据失败: ${relativePath}`, error.message);
  }
}

// 全量扫描并构建缓存
async function buildSkillsCache(skillsDir) {
  console.log(`[Cache] 开始构建元数据缓存: ${skillsDir}`);
  const start = Date.now();
  skillsCache = {};
  
  if (!(await fs.pathExists(skillsDir))) {
    console.log(`[Cache] 目录不存在，缓存初始化为空`);
    return;
  }
  
  try {
    const items = (await fs.readdir(skillsDir, { withFileTypes: true }))
      .filter(item => !item.name.startsWith('.'));
      
    // 扫描根目录下的 .md
    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.md')) {
        await loadFileToCache(skillsDir, item.name);
      } else if (item.isDirectory()) {
        const subDirPath = path.join(skillsDir, item.name);
        const subFiles = await fs.readdir(subDirPath, { withFileTypes: true });
        for (const file of subFiles) {
          if (file.isFile() && file.name.endsWith('.md')) {
            await loadFileToCache(skillsDir, path.join(item.name, file.name));
          }
        }
      }
    }
    console.log(`[Cache] 缓存构建完成，包含 ${Object.keys(skillsCache).length} 个项目，耗时 ${Date.now() - start}ms`);
  } catch (error) {
    console.error(`[Cache] 构建缓存失败:`, error.message);
  }
}

// 自动启动目录监听器 (防抖触发)
function startDirectoryWatcher(skillsDir) {
  if (activeWatcher) {
    try {
      activeWatcher.close();
    } catch (e) {}
  }
  
  console.log(`[Watcher] 正在启动文件监视器: ${skillsDir}`);
  try {
    activeWatcher = fs.watch(skillsDir, { recursive: true }, (eventType, filename) => {
      if (!filename || !filename.endsWith('.md')) return;
      
      // 排除隐藏文件或 .trash
      const parts = filename.split(/[\\/]/);
      if (parts.some(p => p.startsWith('.'))) return;
      
      // 排除 backups 目录
      if (parts[0] === 'backups') return;
      
      // 防抖重新加载该文件元数据
      clearTimeout(watcherDebounceTimer);
      watcherDebounceTimer = setTimeout(async () => {
        console.log(`[Watcher] 检测到外部变更事件: ${eventType} on ${filename}，正在更新缓存...`);
        const filePath = path.join(skillsDir, filename);
        if (await fs.pathExists(filePath)) {
          await loadFileToCache(skillsDir, filename);
        } else {
          // 删除的情况
          const key = filename.replace(/\\/g, '/');
          if (skillsCache && skillsCache[key]) {
            delete skillsCache[key];
            console.log(`[Watcher] 缓存中已移除被删除文件: ${key}`);
          }
        }
        
        // 广播变更通知给所有活跃的网页端
        sseClients.forEach(client => {
          try {
            client.write('data: {"type":"skills_updated"}\n\n');
          } catch (e) {
            console.error('[Watcher] SSE 推送失败:', e.message);
          }
        });
      }, 300);
    });
  } catch (error) {
    console.warn(`[Watcher] 启动文件监视失败（可能在非 Windows 环境或目录无权限）:`, error.message);
  }
}

// 重新检测 Git、初始化并刷新缓存及文件监视器
async function initSkillsDirectory(skillsDir) {
  await checkGitSupport(skillsDir);
  await buildSkillsCache(skillsDir);
  startDirectoryWatcher(skillsDir);
}

// ==========================================
// Git 版本时光机核心辅助逻辑
// ==========================================
let isGitSupported = false;

// 初始化 Git 仓储并在本地环境做鲁棒防护配置
async function initGitRepo(skillsDir) {
  try {
    const isGit = await fs.pathExists(path.join(skillsDir, '.git'));
    if (isGit) {
      console.log(`[Git] 目录已是 Git 仓储: ${skillsDir}`);
      return true;
    }

    console.log(`[Git] 正在初始化 Git 仓储于: ${skillsDir}`);
    
    // 执行 git init
    await new Promise((resolve, reject) => {
      const ps = spawn('git', ['init'], { cwd: skillsDir });
      ps.on('close', (code) => code === 0 ? resolve() : reject(new Error(`git init exit code ${code}`)));
    });

    // 写入 .gitignore (排除 .trash 与 backups 目录，防止 Git 历史爆增及污染)
    const gitignorePath = path.join(skillsDir, '.gitignore');
    if (!(await fs.pathExists(gitignorePath))) {
      await fs.writeFile(gitignorePath, ".trash/\nbackups/\n", 'utf-8');
    }

    // 为当前本地 Git 仓储进行局部 user.name 与 email 配置，防止由于全局未配置 Git 导致 Commit 失败
    await new Promise((resolve) => {
      spawn('git', ['config', '--local', 'user.name', 'SkillVault'], { cwd: skillsDir }).on('close', resolve);
    });
    await new Promise((resolve) => {
      spawn('git', ['config', '--local', 'user.email', 'backup@skillvault.local'], { cwd: skillsDir }).on('close', resolve);
    });

    // 创建初始 Commit
    await new Promise((resolve) => {
      const ps = spawn('git', ['add', '.gitignore'], { cwd: skillsDir });
      ps.on('close', () => {
        spawn('git', ['commit', '-m', 'Initial commit by SkillVault'], { cwd: skillsDir }).on('close', resolve);
      });
    });

    console.log(`[Git] Git 仓储初始化成功！`);
    return true;
  } catch (error) {
    console.warn(`[Git] 自动初始化 Git 失败 (可能系统未安装 git):`, error.message);
    return false;
  }
}

// 检查系统是否支持 Git 并触发初始化
async function checkGitSupport(skillsDir) {
  return new Promise((resolve) => {
    const ps = spawn('git', ['--version']);
    ps.on('error', () => {
      isGitSupported = false;
      console.warn('[Git] 系统未检测到 Git，版本时光机功能将降级停用。');
      resolve(false);
    });
    ps.on('close', async (code) => {
      if (code === 0) {
        isGitSupported = true;
        await initGitRepo(skillsDir);
        resolve(true);
      } else {
        isGitSupported = false;
        console.warn('[Git] 系统 Git 运行异常，版本时光机功能将降级停用。');
        resolve(false);
      }
    });
  });
}

// Git 写入队列，防止并发 git add / git commit 命令操作 index 冲突导致锁死
let gitWriteQueue = Promise.resolve();

function queueGitWrite(fn) {
  return new Promise((resolve, reject) => {
    gitWriteQueue = gitWriteQueue.then(async () => {
      try {
        const res = await fn();
        resolve(res);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// 自动为文件变更发起增量提交 (已加入队列机制，防止 index.lock 锁冲突)
async function commitFileChange(skillsDir, relativePath, message) {
  if (!isGitSupported) return;
  return queueGitWrite(async () => {
    try {
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      // 1. git add
      await new Promise((resolve, reject) => {
        const ps = spawn('git', ['add', normalizedPath], { cwd: skillsDir });
        ps.on('close', (code) => code === 0 ? resolve() : reject(new Error(`git add failed: ${code}`)));
      });

      // 2. git commit (允许退出码 1，代表没有需要提交的变动)
      await new Promise((resolve) => {
        const ps = spawn('git', ['commit', '-m', message], { cwd: skillsDir });
        ps.on('close', () => resolve());
      });
    } catch (error) {
      console.warn(`[Git] 自动提交失败:`, error.message);
    }
  });
}

// API: 获取当前配置路径
app.get('/api/config', async (req, res) => {
  console.log('>>> 收到 /api/config 请求');
  try {
    const hasConfig = await fs.pathExists(CONFIG_FILE);
    const currentDir = await getSkillsDir();
    res.json({ skillsDir: currentDir, isCustomConfigured: hasConfig });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 保存新配置路径
app.post('/api/config', async (req, res) => {
  // 安全加固：仅限本地设备（localhost）修改工作目录，防止局域网内越权篡改
  if (!isLocalRequest(req)) {
    return res.status(403).json({ error: '安全策略拦截：仅限本地设备（localhost）修改工作目录！' });
  }

  const { skillsDir } = req.body;
  if (!skillsDir) {
    return res.status(400).json({ error: '路径不能为空' });
  }
  
  try {
    // 转换为绝对路径并标准化
    const absolutePath = path.resolve(skillsDir.trim());
    
    // 安全加固：禁止指向敏感的系统关键路径
    if (isForbiddenSystemPath(absolutePath)) {
      return res.status(400).json({ error: '安全策略拦截：禁止使用驱动器根目录或关键系统目录作为工作目录！' });
    }

    await fs.ensureDir(absolutePath);
    
    // 写入配置
    await fs.writeJson(CONFIG_FILE, { skillsDir: absolutePath }, { spaces: 2 });
    initSkillsDirectory(absolutePath); // 重新进行 Git 检测、初始化并刷新缓存与监听
    console.log(`工作目录已切换至: ${absolutePath}`);
    res.json({ success: true, skillsDir: absolutePath });
  } catch (error) {
    res.status(500).json({ error: `无法使用或创建该路径: ${error.message}` });
  }
});

// 辅助函数：读取自定义卡片排序配置文件
async function getSkillsOrder(skillsDir) {
  const orderFile = path.join(skillsDir, '.skillvault-order.json');
  try {
    if (await fs.pathExists(orderFile)) {
      const order = await fs.readJson(orderFile);
      if (Array.isArray(order)) {
        return order;
      }
    }
  } catch (error) {
    console.error('读取排序配置文件失败:', error.message);
  }
  return null;
}

// API: SSE 实时事件推送通道，用于推送物理文件变更消息
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 流式推送连接成功初始信号，确保连接畅通且不超时
  res.write('data: {"type":"connected"}\n\n');

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// API: 获取所有 Skill 列表 (元数据)
app.get('/api/skills', async (req, res) => {
  console.log('>>> 收到 /api/skills 请求');
  try {
    const skillsDir = await getSkillsDir();
    
    // 如果缓存为空，则进行首次初始化
    if (skillsCache === null) {
      await buildSkillsCache(skillsDir);
      startDirectoryWatcher(skillsDir);
    }
    
    const list = Object.values(skillsCache);
    const order = await getSkillsOrder(skillsDir);
    
    if (order && order.length > 0) {
      const orderMap = new Map();
      order.forEach((key, index) => {
        if (typeof key !== 'string') return;
        orderMap.set(key, index);
        const parts = key.split('/');
        const cleanFile = parts[parts.length - 1];
        if (!orderMap.has(cleanFile)) {
          orderMap.set(cleanFile, index);
        }
      });
      
      list.sort((a, b) => {
        const keyA = a.key;
        const keyB = b.key;
        
        let hasA = orderMap.has(keyA);
        let hasB = orderMap.has(keyB);
        let idxA = hasA ? orderMap.get(keyA) : -1;
        let idxB = hasB ? orderMap.get(keyB) : -1;
        
        if (!hasA && a.filename) {
          const fileA = a.filename;
          if (orderMap.has(fileA)) {
            hasA = true;
            idxA = orderMap.get(fileA);
          }
        }
        
        if (!hasB && b.filename) {
          const fileB = b.filename;
          if (orderMap.has(fileB)) {
            hasB = true;
            idxB = orderMap.get(fileB);
          }
        }
        
        if (hasA && hasB) {
          return idxA - idxB;
        }
        if (hasA) return -1;
        if (hasB) return 1;
        
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    } else {
      // 默认按更新时间降序排序
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    
    res.json(list);
  } catch (error) {
    console.error('获取元数据缓存失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: 保存自定义卡片拖拽排序
app.post('/api/skills/order', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: '排序内容必须是数组' });
  }
  
  try {
    const skillsDir = await getSkillsDir();
    const orderFile = path.join(skillsDir, '.skillvault-order.json');
    
    ensureSafePath(skillsDir, orderFile);
    
    // 安全过滤：自适应过滤掉非法字符，只保留合法的根目录或子目录相对路径格式
    const sanitizedOrder = order.map(item => {
      if (typeof item !== 'string') return null;
      const parts = item.split('/');
      if (parts.length === 2) {
        const cleanCat = parts[0] === '未分类' ? '未分类' : sanitizeFilename(parts[0]);
        const cleanFile = sanitizeFilename(parts[1]);
        if (!cleanCat || !cleanFile || !cleanFile.endsWith('.md')) return null;
        return `${cleanCat}/${cleanFile}`;
      } else if (parts.length === 1) {
        const cleanFile = sanitizeFilename(parts[0]);
        if (!cleanFile || !cleanFile.endsWith('.md')) return null;
        return cleanFile;
      }
      return null;
    }).filter(Boolean);
    
    // 原子化写入配置文件
    await atomicWriteFile(orderFile, JSON.stringify(sanitizedOrder, null, 2), 'utf-8');
    
    // 异步提交 Git 历史记录
    await commitFileChange(skillsDir, '.skillvault-order.json', 'update: customize cards order');
    
    res.json({ success: true });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 批量软删除技能卡片并合并提交 Git 事务
app.post('/api/skills/batch-delete', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '请选择要删除的技能包' });
  }

  try {
    const skillsDir = await getSkillsDir();
    const deletedFiles = [];

    for (const item of items) {
      const { category, filename } = item;
      if (!filename) continue;

      const cleanCategory = (category || '未分类').trim();
      const filePath = resolveSkillFilePath(skillsDir, cleanCategory, filename);

      ensureSafePath(skillsDir, filePath);

      if (await fs.pathExists(filePath)) {
        const trashDir = path.join(skillsDir, '.trash', cleanCategory);
        await fs.ensureDir(trashDir);
        const targetPath = path.join(trashDir, filename);

        ensureSafePath(skillsDir, targetPath);

        // 防止覆盖移动失败
        if (await fs.pathExists(targetPath)) {
          await fs.remove(targetPath);
        }

        // 移动物理文件
        await fs.move(filePath, targetPath);

        // 智能获取缓存中的相对路径 key
        const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
        const relativePath = isRootFile ? filename : path.join(cleanCategory, filename);
        const cacheKey = relativePath.replace(/\\/g, '/');
        if (skillsCache && skillsCache[cacheKey]) {
          delete skillsCache[cacheKey];
        }

        deletedFiles.push(relativePath);

        // 如果分类文件夹空了，清理它
        if (cleanCategory !== '未分类') {
          const dirPath = path.join(skillsDir, cleanCategory);
          if (await fs.pathExists(dirPath) && (await fs.readdir(dirPath)).length === 0) {
            await fs.remove(dirPath);
          }
        }
      }
    }

    // 一次性合并提交 Git，规避并发 index 锁冲突
    if (deletedFiles.length > 0) {
      await commitFileChange(skillsDir, '.', `batch delete: ${deletedFiles.length} items`);
    }

    res.json({ success: true, count: deletedFiles.length });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 批量打包导出技能卡片为 ZIP (利用 PowerShell 无依赖压缩)
app.post('/api/skills/batch-download', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '请选择要打包的技能包' });
  }

  try {
    const skillsDir = await getSkillsDir();
    const verifiedPaths = [];

    // 安全检查并收集绝对路径
    for (const item of items) {
      const { category, filename } = item;
      if (!filename) continue;

      const cleanCategory = (category || '未分类').trim();
      const filePath = resolveSkillFilePath(skillsDir, cleanCategory, filename);

      ensureSafePath(skillsDir, filePath);

      if (await fs.pathExists(filePath)) {
        const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
        const relativePath = isRootFile ? filename : path.join(cleanCategory, filename);
        verifiedPaths.push(relativePath);
      }
    }

    if (verifiedPaths.length === 0) {
      return res.status(404).json({ error: '未找到选中的物理文件' });
    }

    const backupsDir = path.join(skillsDir, 'backups');
    await fs.ensureDir(backupsDir);
    
    // 生成唯一的临时压缩包名称
    const tempZipName = `temp-export-${Date.now()}-${Math.floor(Math.random() * 1000)}.zip`;
    const tempZipPath = path.join(backupsDir, tempZipName);

    ensureSafePath(skillsDir, tempZipPath);

    // 并发启动 PowerShell 进行压缩
    const ps = spawn('powershell', [
      '-NoProfile',
      '-Command',
      `
      [Console]::InputEncoding = [System.Text.Encoding]::UTF8;
      [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
      $skillsDir = [Console]::In.ReadLine();
      $destZip = [Console]::In.ReadLine();
      $files = @();
      while ($line = [Console]::In.ReadLine()) {
        if ($line.Trim() -ne '') {
          $files += Join-Path $skillsDir $line;
        }
      }
      if ($files) {
        Compress-Archive -Path $files -DestinationPath $destZip -Force;
      }
      `
    ]);

    let stderr = '';
    ps.stderr.on('data', (data) => stderr += data.toString());

    ps.on('close', async (code) => {
      if (code !== 0) {
        console.error(`PowerShell 批量打包失败 (退出码 ${code}): ${stderr.trim()}`);
        return res.status(500).json({ error: `批量打包失败: ${stderr.trim()}` });
      }

      if (!(await fs.pathExists(tempZipPath))) {
        return res.status(500).json({ error: '打包文件未能成功生成' });
      }

      // 流式下发，结束后强制擦除磁盘上的临时 ZIP 归档，防止脏文件泄露
      res.download(tempZipPath, 'skills-export.zip', async (err) => {
        try {
          if (await fs.pathExists(tempZipPath)) {
            await fs.remove(tempZipPath);
            console.log(`[Cleaner] 临时批量打包 ZIP 已清理: ${tempZipName}`);
          }
        } catch (cleanErr) {
          console.error('[Cleaner] 清理临时 ZIP 失败:', cleanErr.message);
        }
      });
    });

    // 写入必要参数
    ps.stdin.write(skillsDir + '\n');
    ps.stdin.write(tempZipPath + '\n');
    
    // 写入文件相对路径列表
    verifiedPaths.forEach(relPath => {
      ps.stdin.write(relPath + '\n');
    });
    ps.stdin.end();

  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/skills/:category/:filename', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);
      
    ensureSafePath(skillsDir, filePath);
      
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    let data = {};
    let content = '';
    try {
      const parsed = matter(fileContent);
      data = parsed.data || {};
      content = parsed.content || '';
    } catch (e) {
      console.warn(`[Warning] 读取详情时解析 YAML 失败: ${filePath}`, e.message);
      data = {
        title: path.basename(filename, '.md'),
        description: `⚠️ YAML Front Matter 解析失败，请检查格式：${e.message}`,
        tags: ['格式错误'],
        star: false
      };
      // 降级：直接展示全文件源码
      content = `⚠️ **YAML Front Matter 头部格式损坏，以下为文件原始源码：**\n\n\`\`\`markdown\n${fileContent}\n\`\`\``;
    }
    
    res.json({
      title: data.title || path.basename(filename, '.md'),
      description: data.description || '',
      tags: data.tags || [],
      category,
      filename,
      content: content.trim(),
      star: !!data.star
    });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 创建新的 Skill
app.post('/api/skills', async (req, res) => {
  const { title, category, description, tags, content, star } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  
  try {
    const skillsDir = await getSkillsDir();
    let cleanCategory = (category || '未分类').trim();
    if (cleanCategory !== '未分类') {
      // 净化分类名称，防止特殊字符或斜杠导致路径问题
      cleanCategory = sanitizeFilename(cleanCategory);
      if (!cleanCategory) {
        cleanCategory = '未分类';
      }
    }
    const cleanTitle = title.trim();
    const filename = `${sanitizeFilename(cleanTitle)}.md`;
    
    // 确定写入物理文件路径与目标文件夹
    const filePath = resolveSkillFilePath(skillsDir, cleanCategory, filename);
    const targetDir = path.dirname(filePath);
      
    await fs.ensureDir(targetDir);
    
    ensureSafePath(skillsDir, filePath);
    
    if (await fs.pathExists(filePath)) {
      return res.status(400).json({ error: '同名 Skill 已存在，请更换标题' });
    }
    
    // 构建 Front Matter + 内容
    const fileContent = matter.stringify(content, {
      title: cleanTitle,
      category: cleanCategory,
      description: description || '',
      tags: tags || [],
      star: !!star
    });
    
    await atomicWriteFile(filePath, fileContent, 'utf-8');
    
    const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
    const relativePath = isRootFile ? filename : path.join(cleanCategory, filename);
    // 更新缓存
    await loadFileToCache(skillsDir, relativePath);

    // 异步触发 Git 增量提交
    await commitFileChange(skillsDir, relativePath, `create: ${cleanTitle}`);

    res.status(201).json({ success: true, filename, category: cleanCategory });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 修改 Skill
app.put('/api/skills/:oldCategory/:oldFilename', async (req, res) => {
  const oldCategory = req.params.oldCategory;
  const oldFilename = req.params.oldFilename;
  const { title, category, description, tags, content, star } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  
  try {
    const skillsDir = await getSkillsDir();
    let newCategory = (category || '未分类').trim();
    if (newCategory !== '未分类') {
      // 净化新分类名称，防止包含斜杠等非法字符导致目录逃逸
      newCategory = sanitizeFilename(newCategory);
      if (!newCategory) {
        newCategory = '未分类';
      }
    }
    const newTitle = title.trim();
    const newFilename = `${sanitizeFilename(newTitle)}.md`;
    
    const oldFilePath = resolveSkillFilePath(skillsDir, oldCategory, oldFilename);
    const newFilePath = resolveSkillFilePath(skillsDir, newCategory, newFilename);
    const newTargetDir = path.dirname(newFilePath);
    
    ensureSafePath(skillsDir, oldFilePath);
    ensureSafePath(skillsDir, newFilePath);
    
    if (!(await fs.pathExists(oldFilePath))) {
      return res.status(404).json({ error: '原文件不存在' });
    }
    
    // 如果文件名或路径变了，且新目标物理文件已存在，防止冲突
    if (oldFilePath !== newFilePath && (await fs.pathExists(newFilePath))) {
      return res.status(400).json({ error: '目标分类下已存在同名 Skill' });
    }
    
    // 构建 Front Matter + 内容
    const fileContent = matter.stringify(content, {
      title: newTitle,
      category: newCategory,
      description: description || '',
      tags: tags || [],
      star: !!star
    });
    
    // 如果分类或标题变了，先删除旧文件，再写入新文件
    const isOldRoot = path.dirname(oldFilePath) === path.resolve(skillsDir);
    const oldRelativePath = isOldRoot ? path.basename(oldFilePath) : path.join(oldCategory, path.basename(oldFilePath));
    
    const isNewRoot = path.dirname(newFilePath) === path.resolve(skillsDir);
    const newRelativePath = isNewRoot ? path.basename(newFilePath) : path.join(newCategory, path.basename(newFilePath));

    if (oldCategory !== newCategory || oldFilename !== newFilename) {
      await fs.remove(oldFilePath);
      if (skillsCache) {
        delete skillsCache[oldRelativePath.replace(/\\/g, '/')];
      }
      // 如果老文件夹空了，可以顺便清理
      if (oldCategory !== '未分类') {
        const oldDir = path.join(skillsDir, oldCategory);
        if (await fs.pathExists(oldDir) && (await fs.readdir(oldDir)).length === 0) {
          await fs.remove(oldDir);
        }
      }
    }
    
    await fs.ensureDir(newTargetDir);
    await atomicWriteFile(newFilePath, fileContent, 'utf-8');
    
    // 更新缓存
    await loadFileToCache(skillsDir, newRelativePath);
    
    // 异步触发 Git 增量提交
    if (oldRelativePath !== newRelativePath) {
      await commitFileChange(skillsDir, oldRelativePath, `remove (rename): ${oldFilename}`);
      await commitFileChange(skillsDir, newRelativePath, `create (rename): ${newTitle}`);
    } else {
      await commitFileChange(skillsDir, newRelativePath, `update: ${newTitle}`);
    }

    res.json({ success: true, filename: newFilename, category: newCategory });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 收藏/取消收藏 Skill
app.post('/api/skills/:category/:filename/star', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  const { star } = req.body;

  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);

    ensureSafePath(skillsDir, filePath);

    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    parsed.data.star = !!star;

    const newContent = matter.stringify(parsed.content, parsed.data);
    await atomicWriteFile(filePath, newContent, 'utf-8');
    
    const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
    const relativePath = isRootFile ? filename : path.join(category, filename);
    // 更新缓存
    await loadFileToCache(skillsDir, relativePath);
    
    // 异步触发 Git 增量提交
    const title = parsed.data.title || path.basename(filename, '.md');
    await commitFileChange(skillsDir, relativePath, `${star ? 'star' : 'unstar'}: ${title}`);

    res.json({ success: true, star: !!star });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 删除 Skill (软删除移入本地垃圾桶)
app.delete('/api/skills/:category/:filename', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);
      
    ensureSafePath(skillsDir, filePath);
      
    if (await fs.pathExists(filePath)) {
      // 确立垃圾桶内对应的分类子目录
      const trashDir = path.join(skillsDir, '.trash', category);
      await fs.ensureDir(trashDir);
      const targetPath = path.join(trashDir, filename);
      
      ensureSafePath(skillsDir, targetPath);
      
      // 如果垃圾桶里已存在同名，先删掉，防止移动失败
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
      }
      
      // 移动物理文件
      await fs.move(filePath, targetPath);
      
      // 智能获取相对路径并强刷缓存
      const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
      const relativePath = isRootFile ? filename : path.join(category, filename);
      const cacheKey = relativePath.replace(/\\/g, '/');
      if (skillsCache && skillsCache[cacheKey]) {
        delete skillsCache[cacheKey];
      }
      
      // 异步触发 Git 增量提交
      await commitFileChange(skillsDir, relativePath, `delete: ${filename}`);
      
      // 如果原分类文件夹空了，清理原文件夹
      if (category !== '未分类') {
        const dirPath = path.join(skillsDir, category);
        if (await fs.pathExists(dirPath) && (await fs.readdir(dirPath)).length === 0) {
          await fs.remove(dirPath);
        }
      }
      res.json({ success: true, message: '已移入垃圾桶' });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 获取垃圾桶里的 Skill 列表
app.get('/api/trash', async (req, res) => {
  try {
    const skillsDir = await getSkillsDir();
    const trashDir = path.join(skillsDir, '.trash');
    const list = [];
    
    if (!(await fs.pathExists(trashDir))) {
      return res.json([]);
    }
    
    const categories = await fs.readdir(trashDir, { withFileTypes: true });
    for (const cat of categories) {
      if (cat.isDirectory()) {
        const catPath = path.join(trashDir, cat.name);
        const files = await fs.readdir(catPath, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(catPath, file.name);
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            const { data } = matter(content);
            
            list.push({
              title: data.title || path.basename(file.name, '.md'),
              description: data.description || '',
              tags: data.tags || [],
              category: cat.name,
              filename: file.name,
              updatedAt: stats.mtime,
              deletedAt: stats.mtime
            });
          }
        }
      }
    }
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 从垃圾桶恢复 Skill 文件
app.post('/api/trash/:category/:filename/restore', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const trashFilePath = path.join(skillsDir, '.trash', category, filename);
    
    ensureSafePath(skillsDir, trashFilePath);
    
    if (!(await fs.pathExists(trashFilePath))) {
      return res.status(404).json({ error: '垃圾桶中未找到该文件' });
    }
    
    const targetDir = category === '未分类'
      ? skillsDir
      : path.join(skillsDir, category);
      
    await fs.ensureDir(targetDir);
    const targetFilePath = path.join(targetDir, filename);
    
    ensureSafePath(skillsDir, targetFilePath);
    
    if (await fs.pathExists(targetFilePath)) {
      return res.status(400).json({ error: '恢复失败，当前目录下已存在同名技能包' });
    }
    
    await fs.move(trashFilePath, targetFilePath);
    
    // 异步触发 Git 增量提交
    const relativePath = category === '未分类' ? filename : path.join(category, filename);
    await commitFileChange(skillsDir, relativePath, `restore: ${filename}`);
    
    // 检查垃圾桶分类子目录是否空了，空了就清理
    const trashCatDir = path.join(skillsDir, '.trash', category);
    if (await fs.pathExists(trashCatDir) && (await fs.readdir(trashCatDir)).length === 0) {
      await fs.remove(trashCatDir);
    }
    
    res.json({ success: true });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// 移送至 Windows 回收站核心方法 (使用 spawn 配合 stdin 管道传参，100% 免疫命令行转义与引号注入问题)
// 自动修剪备份，保留最多 10 个备份 ZIP
async function rotateBackups(backupsDir) {
  try {
    if (!(await fs.pathExists(backupsDir))) return;
    const files = await fs.readdir(backupsDir);
    const zipFiles = [];
    for (const file of files) {
      if (file.endsWith('.zip') && file !== 'emergency-auto-backup.zip') {
        const filePath = path.join(backupsDir, file);
        const stats = await fs.stat(filePath);
        zipFiles.push({
          name: file,
          path: filePath,
          mtime: stats.mtime
        });
      }
    }
    
    // 如果超过 10 个，按修改时间升序排列，删除最旧的
    if (zipFiles.length > 10) {
      zipFiles.sort((a, b) => a.mtime - b.mtime);
      const toDeleteCount = zipFiles.length - 10;
      console.log(`[Backup] 备份数量超过限额（10个），正在修剪 ${toDeleteCount} 个最旧的备份...`);
      for (let i = 0; i < toDeleteCount; i++) {
        await fs.remove(zipFiles[i].path);
        console.log(`[Backup] 已物理删除老旧备份: ${zipFiles[i].name}`);
      }
    }
  } catch (error) {
    console.warn(`[Backup] 备份轮转检查失败:`, error.message);
  }
}

// 跨平台移入系统回收站 (支持 Windows/macOS/Linux)
function moveToSystemRecycleBin(filePath) {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows: 使用 PowerShell Microsoft.VisualBasic.FileIO.FileSystem 移入回收站
      const ps = spawn('powershell', [
        '-NoProfile',
        '-Command',
        "[Console]::InputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $path = [Console]::In.ReadLine(); Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($path, 'OnlyErrorDialogs', 'SendToRecycleBin')"
      ]);

      let stderr = '';
      ps.stderr.on('data', (data) => stderr += data.toString());

      ps.on('close', (code) => {
        if (code !== 0) {
          console.warn(`[Recycle] Windows PowerShell 移送回收站失败 (退出码 ${code}): ${stderr.trim()}。降级物理删除...`);
          fs.remove(filePath).then(() => resolve(true)).catch(reject);
        } else {
          resolve(true);
        }
      });

      ps.stdin.write(absolutePath + '\n', 'utf-8');
      ps.stdin.end();
    } else if (platform === 'darwin') {
      // macOS: 通过 osascript 使用 Finder 将文件移入废纸篓
      console.log(`[Recycle] macOS 系统检测，正在通过 AppleScript 移入废纸篓: ${absolutePath}`);
      const appleScript = `tell application "Finder" to move POSIX file "${absolutePath.replace(/"/g, '\\"')}" to trash`;
      const ps = spawn('osascript', ['-e', appleScript]);

      let stderr = '';
      ps.stderr.on('data', (data) => stderr += data.toString());

      ps.on('close', (code) => {
        if (code !== 0) {
          console.warn(`[Recycle] macOS osascript 移送废纸篓失败 (退出码 ${code}): ${stderr.trim()}。降级物理删除...`);
          fs.remove(filePath).then(() => resolve(true)).catch(reject);
        } else {
          resolve(true);
        }
      });
    } else {
      // Linux/其他: 寻找常见的回收站路径，或者使用安全降级
      console.log(`[Recycle] Linux/其他系统检测，正在尝试移入 XDG 垃圾桶...`);
      try {
        const homeDir = os.homedir();
        const xdgTrashFiles = path.join(homeDir, '.local/share/Trash/files');
        
        fs.ensureDir(xdgTrashFiles)
          .then(() => {
            const destPath = path.join(xdgTrashFiles, path.basename(absolutePath));
            return fs.move(absolutePath, destPath, { overwrite: true });
          })
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            console.warn(`[Recycle] 移入 Linux 垃圾桶失败: ${err.message}。降级物理删除...`);
            fs.remove(filePath).then(() => resolve(true)).catch(reject);
          });
      } catch (e) {
        console.warn(`[Recycle] 探测 Linux 垃圾桶路径异常: ${e.message}。降级物理删除...`);
        fs.remove(filePath).then(() => resolve(true)).catch(reject);
      }
    }
  });
}

// API: 彻底删除 (移入 Windows 系统回收站)
app.delete('/api/trash/:category/:filename/permanent', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const trashFilePath = path.join(skillsDir, '.trash', category, filename);
    
    ensureSafePath(skillsDir, trashFilePath);
    
    if (!(await fs.pathExists(trashFilePath))) {
      return res.status(404).json({ error: '文件不存在于垃圾桶中' });
    }
    
    await moveToSystemRecycleBin(trashFilePath);
    
    // 清理空子目录
    const trashCatDir = path.join(skillsDir, '.trash', category);
    if (await fs.pathExists(trashCatDir) && (await fs.readdir(trashCatDir)).length === 0) {
      await fs.remove(trashCatDir);
    }
    
    res.json({ success: true });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 一键清空垃圾桶 (全部投递至系统回收站)
app.delete('/api/trash/empty', async (req, res) => {
  try {
    const skillsDir = await getSkillsDir();
    const trashDir = path.join(skillsDir, '.trash');
    
    if (!(await fs.pathExists(trashDir))) {
      return res.json({ success: true, message: '垃圾桶已为空' });
    }
    
    const categories = await fs.readdir(trashDir, { withFileTypes: true });
    for (const cat of categories) {
      if (cat.isDirectory()) {
        const catPath = path.join(trashDir, cat.name);
        const files = await fs.readdir(catPath, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(catPath, file.name);
            await moveToSystemRecycleBin(filePath);
          }
        }
      }
    }
    
    // 清除隐藏垃圾桶根目录自身
    await fs.remove(trashDir);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Git 版本时光机 & 安全备份映射 API
// ==========================================

// 1. 获取特定 Skill 的版本历史线
app.get('/api/skills/:category/:filename/history', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;

  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);

    ensureSafePath(skillsDir, filePath);

    if (!isGitSupported) {
      return res.json({ supported: false, history: [] });
    }

    const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
    const relativePath = isRootFile ? filename : path.join(category, filename);
    const normalizedPath = relativePath.replace(/\\/g, '/');

    // 运行 git log 获取提交历史
    const gitLog = await new Promise((resolve) => {
      let stdout = '';
      const ps = spawn('git', [
        'log',
        '--follow',
        '--pretty=format:%h|%ad|%s',
        '--date=iso-strict',
        '--',
        normalizedPath
      ], { cwd: skillsDir });
      ps.stdout.on('data', (data) => stdout += data.toString());
      ps.on('close', () => resolve(stdout.trim()));
    });

    if (!gitLog) {
      return res.json({ supported: true, history: [] });
    }

    const list = gitLog.split('\n').map(line => {
      const [hash, date, message] = line.split('|');
      return { hash, date, message };
    });

    res.json({ supported: true, history: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 读取特定 Skill 在某个历史版本下的正文和元数据
app.get('/api/skills/:category/:filename/history/:commitHash', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  const commitHash = req.params.commitHash;

  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);

    ensureSafePath(skillsDir, filePath);

    if (!isGitSupported) {
      return res.status(400).json({ error: '系统未启用 Git，无法读取历史版本' });
    }

    const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
    const relativePath = isRootFile ? filename : path.join(category, filename);
    const normalizedPath = relativePath.replace(/\\/g, '/');

    const fileContent = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const ps = spawn('git', ['show', `${commitHash}:${normalizedPath}`], { cwd: skillsDir });
      ps.stdout.on('data', (data) => stdout += data.toString());
      ps.stderr.on('data', (data) => stderr += data.toString());
      ps.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`读取历史版本失败: ${stderr.trim()}`));
        }
      });
    });

    let data = {};
    let content = '';
    try {
      const parsed = matter(fileContent);
      data = parsed.data || {};
      content = parsed.content || '';
    } catch (e) {
      data = {
        title: path.basename(filename, '.md'),
        description: '⚠️ YAML Front Matter 解析失败，原内容已损坏',
        tags: ['格式错误'],
        star: false
      };
      content = fileContent;
    }

    res.json({
      title: data.title || path.basename(filename, '.md'),
      description: data.description || '',
      tags: data.tags || [],
      category,
      filename,
      content: content.trim(),
      star: !!data.star
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 一键回滚文件至某个历史版本
app.post('/api/skills/:category/:filename/history/:commitHash/rollback', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  const commitHash = req.params.commitHash;

  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);

    ensureSafePath(skillsDir, filePath);

    if (!isGitSupported) {
      return res.status(400).json({ error: '系统未启用 Git，无法执行回滚' });
    }

    const isRootFile = path.dirname(filePath) === path.resolve(skillsDir);
    const relativePath = isRootFile ? filename : path.join(category, filename);
    const normalizedPath = relativePath.replace(/\\/g, '/');

    // 运行 git checkout
    await new Promise((resolve, reject) => {
      let stderr = '';
      const ps = spawn('git', ['checkout', commitHash, '--', normalizedPath], { cwd: skillsDir });
      ps.stderr.on('data', (data) => stderr += data.toString());
      ps.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Git checkout 失败: ${stderr.trim()}`));
      });
    });

    // 提交回退记录
    const content = await fs.readFile(filePath, 'utf-8');
    let title = path.basename(filename, '.md');
    try {
      const parsed = matter(content);
      title = parsed.data.title || title;
    } catch (e) {}

    await commitFileChange(skillsDir, relativePath, `rollback: ${title} to ${commitHash}`);

    res.json({ success: true, title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. 获取备份列表
app.get('/api/backups', async (req, res) => {
  try {
    const skillsDir = await getSkillsDir();
    const backupsDir = path.join(skillsDir, 'backups');
    
    if (!(await fs.pathExists(backupsDir))) {
      return res.json([]);
    }

    const files = await fs.readdir(backupsDir);
    const list = [];
    for (const file of files) {
      if (file.endsWith('.zip')) {
        const filePath = path.join(backupsDir, file);
        const stats = await fs.stat(filePath);
        list.push({
          name: file,
          size: stats.size,
          createdAt: stats.birthtime
        });
      }
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. 创建全量备份 (导出)
app.post('/api/backups/export', async (req, res) => {
  try {
    const skillsDir = await getSkillsDir();
    const backupsDir = path.join(skillsDir, 'backups');
    await fs.ensureDir(backupsDir);

    const dateStr = new Date().toISOString().replace(/T/, '-').replace(/:/g, '').replace(/\..+/, '').replace(/-/g, '');
    const backupName = `backup-${dateStr}.zip`;
    const backupZipPath = path.join(backupsDir, backupName);

    // 调用 PowerShell 压缩
    const ps = spawn('powershell', [
      '-NoProfile',
      '-Command',
      `
      [Console]::InputEncoding = [System.Text.Encoding]::UTF8;
      [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
      $skillsDir = [Console]::In.ReadLine();
      $backupZip = [Console]::In.ReadLine();
      $items = Get-ChildItem -Path $skillsDir | Where-Object { $_.Name -ne '.git' -and $_.Name -ne '.trash' -and $_.Name -ne 'backups' };
      if ($items) {
        Compress-Archive -Path $items.FullName -DestinationPath $backupZip -Force;
      }
      `
    ]);

    let stderr = '';
    ps.stderr.on('data', (data) => stderr += data.toString());

    ps.on('close', async (code) => {
      if (code !== 0) {
        console.error(`PowerShell 备份失败 (退出码 ${code}): ${stderr.trim()}`);
        return res.status(500).json({ error: `备份失败: ${stderr.trim()}` });
      }
      
      // 检查并自动修剪老旧备份
      await rotateBackups(backupsDir);
      
      const stats = await fs.stat(backupZipPath);
      res.json({
        success: true,
        backup: {
          name: backupName,
          size: stats.size,
          createdAt: stats.birthtime
        }
      });
    });

    ps.stdin.write(skillsDir + '\n');
    ps.stdin.write(backupZipPath + '\n');
    ps.stdin.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. 恢复全量备份
app.post('/api/backups/:backupName/restore', async (req, res) => {
  const backupName = req.params.backupName;

  try {
    const skillsDir = await getSkillsDir();
    const backupsDir = path.join(skillsDir, 'backups');
    const backupZipPath = path.join(backupsDir, backupName);

    ensureSafePath(skillsDir, backupZipPath);

    if (!(await fs.pathExists(backupZipPath))) {
      return res.status(404).json({ error: '备份文件不存在' });
    }

    // A. 强制为当前做一次紧急自动备份
    const autoBackupName = `emergency-auto-backup.zip`;
    const autoBackupPath = path.join(backupsDir, autoBackupName);

    await new Promise((resolve) => {
      const ps = spawn('powershell', [
        '-NoProfile',
        '-Command',
        `
        [Console]::InputEncoding = [System.Text.Encoding]::UTF8;
        $skillsDir = [Console]::In.ReadLine();
        $backupZip = [Console]::In.ReadLine();
        $items = Get-ChildItem -Path $skillsDir | Where-Object { $_.Name -ne '.git' -and $_.Name -ne '.trash' -and $_.Name -ne 'backups' };
        if ($items) {
          Compress-Archive -Path $items.FullName -DestinationPath $backupZip -Force;
        }
        `
      ]);
      ps.stdin.write(skillsDir + '\n');
      ps.stdin.write(autoBackupPath + '\n');
      ps.stdin.end();
      ps.on('close', async () => {
        await rotateBackups(backupsDir);
        resolve();
      });
    });

    // B. 清理当前工作目录文件
    const items = await fs.readdir(skillsDir);
    for (const item of items) {
      if (item !== '.git' && item !== '.trash' && item !== 'backups') {
        await fs.remove(path.join(skillsDir, item));
      }
    }

    // C. 解压
    const restorePs = spawn('powershell', [
      '-NoProfile',
      '-Command',
      `
      [Console]::InputEncoding = [System.Text.Encoding]::UTF8;
      $backupZip = [Console]::In.ReadLine();
      $targetDir = [Console]::In.ReadLine();
      Expand-Archive -Path $backupZip -DestinationPath $targetDir -Force;
      `
    ]);

    let stderr = '';
    restorePs.stderr.on('data', (data) => stderr += data.toString());

    restorePs.on('close', async (code) => {
      if (code !== 0) {
        console.error(`PowerShell 恢复备份失败 (退出码 ${code}): ${stderr.trim()}`);
        return res.status(500).json({ error: `恢复失败: ${stderr.trim()}` });
      }

      // 自动做 Git 提交
      if (isGitSupported) {
        setTimeout(async () => {
          try {
            spawn('git', ['add', '.'], { cwd: skillsDir }).on('close', () => {
              spawn('git', ['commit', '-m', `restore: restore from backup ${backupName}`], { cwd: skillsDir });
            });
          } catch (e) {}
        }, 500);
      }

      res.json({ success: true });
    });

    restorePs.stdin.write(backupZipPath + '\n');
    restorePs.stdin.write(skillsDir + '\n');
    restorePs.stdin.end();
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// 7. 删除备份
app.delete('/api/backups/:backupName', async (req, res) => {
  const backupName = req.params.backupName;

  try {
    const skillsDir = await getSkillsDir();
    const backupsDir = path.join(skillsDir, 'backups');
    const backupZipPath = path.join(backupsDir, backupName);

    ensureSafePath(skillsDir, backupZipPath);

    if (await fs.pathExists(backupZipPath)) {
      await fs.remove(backupZipPath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '备份文件不存在' });
    }
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 下载 Skill md 文件
app.get('/api/skills/:category/:filename/download', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const filePath = resolveSkillFilePath(skillsDir, category, filename);
      
    ensureSafePath(skillsDir, filePath);
      
    if (await fs.pathExists(filePath)) {
      res.download(filePath, filename);
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 物理媒体资源 Base64 上传
app.post('/api/upload', async (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ error: '文件名和数据不能为空' });
  }

  try {
    const skillsDir = await getSkillsDir();
    const assetsDir = path.join(skillsDir, '.assets');
    await fs.ensureDir(assetsDir);

    const safeFilename = sanitizeFilename(filename);
    const filePath = path.join(assetsDir, safeFilename);

    ensureSafePath(skillsDir, filePath);

    // 将 base64 数据解码并写入文件
    const base64Content = base64Data.includes(';base64,') 
      ? base64Data.split(';base64,')[1] 
      : base64Data;
      
    const buffer = Buffer.from(base64Content, 'base64');
    
    // 原子化写入图片
    await atomicWriteFile(filePath, buffer);
    
    console.log(`[Upload] 媒体资源上传成功: ${safeFilename}`);
    res.json({
      success: true,
      url: `.assets/${safeFilename}`,
      filename: safeFilename
    });
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// API: 获取上传的媒体资源
app.get('/api/assets/:filename', async (req, res) => {
  try {
    const skillsDir = await getSkillsDir();
    const filename = req.params.filename;
    const filePath = path.join(skillsDir, '.assets', filename);

    ensureSafePath(skillsDir, filePath);

    if (await fs.pathExists(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: '资源不存在' });
    }
  } catch (error) {
    if (error.message && error.message.includes('安全校验拦截')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// 局域网 IP 获取方法
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}

// 启动 Express 服务器
const startServer = (host, onSuccess, onError) => {
  const server = app.listen(PORT, host, onSuccess);
  server.on('error', (err) => {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
      onError(err);
    } else {
      console.error('[错误] 后端启动异常:', err.message);
    }
  });
  return server;
};

const runBackend = () => {
  // 首先尝试绑定 0.0.0.0 以支持局域网访问
  const server = startServer('0.0.0.0', async () => {
    const localDir = await getSkillsDir();
    initSkillsDirectory(localDir); // 异步触发 Git 检测、缓存建立与文件监视
    console.log(`==================================================`);
    console.log(`  SkillVault - 后端服务已启动成功 (共享模式)`);
    console.log(`==================================================`);
    console.log(`  本地访问:   http://localhost:${PORT}`);
    
    const localIPs = getLocalIPs();
    localIPs.forEach(ip => {
      console.log(`  局域网访问: http://${ip}:${PORT}`);
    });
    
    console.log(`  当前关联目录: ${localDir}`);
    console.log(`==================================================`);
  }, (err) => {
    console.warn(`[警告] 绑定 0.0.0.0:${PORT} 失败 (${err.code})。正在降级绑定 127.0.0.1:${PORT}...`);
    // 降级尝试绑定 127.0.0.1 本地回环地址
    startServer('127.0.0.1', async () => {
      const localDir = await getSkillsDir();
      initSkillsDirectory(localDir); // 异步触发 Git 检测、缓存建立与文件监视
      console.log(`==================================================`);
      console.log(`  SkillVault - 后端服务已启动成功 (本地模式)`);
      console.log(`==================================================`);
      console.log(`  本地访问:   http://localhost:${PORT}`);
      console.log(`  当前关联目录: ${localDir}`);
      console.log(`==================================================`);
    }, (fallbackErr) => {
      console.error(`[致命错误] 后端服务无法启动。端口 ${PORT} 可能已被占用。`);
      process.exit(1);
    });
  });
};

runBackend();
