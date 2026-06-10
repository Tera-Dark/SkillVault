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
const PORT = 23333;

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
    console.log(`工作目录已切换至: ${absolutePath}`);
    res.json({ success: true, skillsDir: absolutePath });
  } catch (error) {
    res.status(500).json({ error: `无法使用或创建该路径: ${error.message}` });
  }
});

// API: 获取所有 Skill 列表 (元数据)
app.get('/api/skills', async (req, res) => {
  console.log('>>> 收到 /api/skills 请求');
  try {
    const skillsDir = await getSkillsDir();
    const list = [];
    
    // 如果工作目录不存在，返回空
    if (!(await fs.pathExists(skillsDir))) {
      return res.json([]);
    }

    // 扫描一级子目录和根目录下的 md 文件，排除以 . 开头的隐藏文件夹(如 .trash, .git)
    const items = (await fs.readdir(skillsDir, { withFileTypes: true }))
      .filter(item => !item.name.startsWith('.'));
    
    // 递归读取某个分类下的所有 md
    const scanDir = async (dirPath, categoryName) => {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.md')) {
          const filePath = path.join(dirPath, file.name);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // 解析 Front Matter (带有容错防崩溃保护)
          let data = {};
          try {
            const parsed = matter(content);
            data = parsed.data || {};
          } catch (e) {
            console.warn(`[Warning] 解析 YAML 头部失败，已对该文件降级: ${filePath}`, e.message);
            data = {
              title: path.basename(file.name, '.md'),
              description: `⚠️ YAML Front Matter 解析失败，请检查文件头部格式：${e.message}`,
              tags: ['格式错误'],
              star: false
            };
          }
          
          list.push({
            title: data.title || path.basename(file.name, '.md'),
            description: data.description || '',
            tags: data.tags || [],
            category: categoryName,
            filename: file.name,
            updatedAt: stats.mtime,
            createdAt: stats.birthtime,
            star: !!data.star
          });
        }
      }
    };

    // 扫描根目录下的 .md
    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.md')) {
        const filePath = path.join(skillsDir, item.name);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        let data = {};
        try {
          const parsed = matter(content);
          data = parsed.data || {};
        } catch (e) {
          console.warn(`[Warning] 解析 YAML 头部失败，已对该文件降级: ${filePath}`, e.message);
          data = {
            title: path.basename(item.name, '.md'),
            description: `⚠️ YAML Front Matter 解析失败，请检查文件头部格式：${e.message}`,
            tags: ['格式错误'],
            star: false
          };
        }
        
        list.push({
          title: data.title || path.basename(item.name, '.md'),
          description: data.description || '',
          tags: data.tags || [],
          category: '未分类',
          filename: item.name,
          updatedAt: stats.mtime,
          createdAt: stats.birthtime,
          star: !!data.star
        });
      } else if (item.isDirectory()) {
        // 子目录作为分类
        await scanDir(path.join(skillsDir, item.name), item.name);
      }
    }

    // 按更新时间降序排序
    list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(list);
  } catch (error) {
    console.error('扫描 Skills 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/skills/:category/:filename', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const filePath = category === '未分类' 
      ? path.join(skillsDir, filename)
      : path.join(skillsDir, category, filename);
      
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
    
    // 确定写入文件夹
    const targetDir = cleanCategory === '未分类'
      ? skillsDir
      : path.join(skillsDir, cleanCategory);
      
    await fs.ensureDir(targetDir);
    const filePath = path.join(targetDir, filename);
    
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
    
    await fs.writeFile(filePath, fileContent, 'utf-8');
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
    
    const oldFilePath = oldCategory === '未分类'
      ? path.join(skillsDir, oldFilename)
      : path.join(skillsDir, oldCategory, oldFilename);
      
    const newTargetDir = newCategory === '未分类'
      ? skillsDir
      : path.join(skillsDir, newCategory);
      
    const newFilePath = path.join(newTargetDir, newFilename);
    
    ensureSafePath(skillsDir, oldFilePath);
    ensureSafePath(skillsDir, newFilePath);
    
    if (!(await fs.pathExists(oldFilePath))) {
      return res.status(404).json({ error: '原文件不存在' });
    }
    
    // 如果文件名或分类变了，并且新文件已存在，防止冲突
    if ((oldCategory !== newCategory || oldFilename !== newFilename) && (await fs.pathExists(newFilePath))) {
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
    if (oldCategory !== newCategory || oldFilename !== newFilename) {
      await fs.remove(oldFilePath);
      // 如果老文件夹空了，可以顺便清理
      if (oldCategory !== '未分类') {
        const oldDir = path.join(skillsDir, oldCategory);
        if (await fs.pathExists(oldDir) && (await fs.readdir(oldDir)).length === 0) {
          await fs.remove(oldDir);
        }
      }
    }
    
    await fs.ensureDir(newTargetDir);
    await fs.writeFile(newFilePath, fileContent, 'utf-8');
    
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
    const filePath = category === '未分类'
      ? path.join(skillsDir, filename)
      : path.join(skillsDir, category, filename);

    ensureSafePath(skillsDir, filePath);

    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    parsed.data.star = !!star;

    const newContent = matter.stringify(parsed.content, parsed.data);
    await fs.writeFile(filePath, newContent, 'utf-8');

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
    const filePath = category === '未分类'
      ? path.join(skillsDir, filename)
      : path.join(skillsDir, category, filename);
      
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
function moveToWindowsRecycleBin(filePath) {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    
    // 使用 PowerShell Microsoft.VisualBasic.FileIO.FileSystem 移入回收站
    // 通过 stdin 输入路径并使用 [Console]::In.ReadLine() 动态读取，绕过命令行解析，从根本上解决包含单引号、特殊符号等文件名报错的问题
    const ps = spawn('powershell', [
      '-NoProfile',
      '-Command',
      "[Console]::InputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $path = [Console]::In.ReadLine(); Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($path, 'OnlyErrorDialogs', 'SendToRecycleBin')"
    ]);

    let stderr = '';
    ps.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ps.on('close', (code) => {
      if (code !== 0) {
        console.warn(`PowerShell 移送系统回收站失败 (退出码 ${code})，错误信息: ${stderr.trim()}。退回彻底物理删除...`);
        fs.remove(filePath).then(() => resolve(true)).catch(reject);
      } else {
        resolve(true);
      }
    });

    // 写入绝对路径（以换行符结尾）并关闭标准输入，让 ReadLine() 能够读取到
    ps.stdin.write(absolutePath + '\n', 'utf-8');
    ps.stdin.end();
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
    
    await moveToWindowsRecycleBin(trashFilePath);
    
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
            await moveToWindowsRecycleBin(filePath);
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

// API: 下载 Skill md 文件
app.get('/api/skills/:category/:filename/download', async (req, res) => {
  const category = req.params.category;
  const filename = req.params.filename;
  
  try {
    const skillsDir = await getSkillsDir();
    const filePath = category === '未分类'
      ? path.join(skillsDir, filename)
      : path.join(skillsDir, category, filename);
      
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
