# SkillVault - 开发者规范与系统速查手册 (CLAUDE.md)

本文件是面向下一次会话 AI 的规范指南，请严格遵守以下开发红线和系统约束。

---

## 🚀 常用指令速查

### 开发与构建
- **前端开发服务 (Vite)**: `npm run dev` (Vite 负责前端调试，并代理接口至后端 23335)
- **后端服务 (Express)**: `node server.js`
- **生产构建**: `npm run build`
- **一键启动脚本**: `run.bat` (一键并发启动后端 Express 并利用 Vite Dev Server 打开浏览器)

### 系统端口
- **前端调试端口**: `http://localhost:5173` (或 Vite 自动分配的其他端口)
- **后端 API 端口**: `http://localhost:23335` (局域网共享模式下绑定 `0.0.0.0`)

---

## 🎨 视觉与风格红线 (Lovart Aesthetics)

- **遵循设计系统**: 本项目的所有设计 tokens 和视觉理念都详细定义在根目录的 [DESIGN.md](file:///d:/MyCode/杂七杂八小工具/私定skill管理平台/DESIGN.md) 中。任何 UI 修改必须先对齐此规范并运行 `npx @google/design.md lint DESIGN.md` 进行校验；
- **极简黑白画廊风**: 严格遵守 Brutally Minimal White & Black 设计规范。卡片无边框，采用大圆角 (`16px`) 淡灰色块 (`#f4f4f5`)；
- **外置排版**: 标题、标签和日期不要写在卡片色块里，一律采用外置布局 (`lovart-card-meta`)；
- **日/夜暗黑模式**: 确保任何新增的 UI 组件和弹窗在浅色和暗色主题下均有极细线条和和谐的高对比配色；
- **极细线条**: SVG 图标统一使用 `strokeWidth="1.5"`，不使用 Emoji，统一从极细 SVG 库中选取。

---

## 📂 数据持久化与软删除机制

- **技能包作为物理文件**: 所有技能包都是存储在工作区 `skills` (或用户自定义路径) 下的一级子目录 (作为分类名) 或根目录下的 `.md` 文件；
- **Front Matter 存储**: 收藏状态 `star: true/false`、标题 `title`、分类 `category`、标签 `tags` 等元数据必须持久化在文件的 YAML Front Matter 中；
- **元数据内存缓存与目录监视 (skillsCache & fs.watch)**:
  - 后端在内存中维护全局缓存 `skillsCache` 以加速获取技能列表（`/api/skills`），实现 0 毫秒级的极速检索。
  - 使用 Node.js 的 `fs.watch` 实时监听工作区中 md 文件的外部修改或删除，并在检测到变更时防抖增量同步缓存。
  - **红线**：为保障前、后端数据 100% 同步，在 API 路由层内任何涉及写入卡片文件的代码后，**必须同步调用 `await loadFileToCache(skillsDir, relativePath)` 或在缓存中执行 `delete skillsCache[key]`**，形成双重同步安全网。
- **原子化安全写入 (atomicWriteFile)**:
  - **红线**：为防范断电、崩溃等极端异常导致的文件写损与损坏，所有保存技能、更新内容和切换星标的 API **严禁使用 `fs.writeFile` 直接写盘，必须统一调用 `atomicWriteFile` 异步函数**。
  - 该函数先将数据写入带有 `.tmp` 后缀的临时文件，在写入安全闭环后通过原子操作 `fs.rename` 进行重命名覆盖。
- **隔离防污染 (软删除)**: 
  - 删除动作不能进行物理擦除，而是将其移入物理工作区下的隐藏目录 `.trash/:category/:filename`；
  - 后端扫描函数 `readdir` 必须排除以 `.` 开头的所有隐藏文件夹，避免垃圾桶污染主列表；
- **跨平台系统回收站对接 (彻底删除)**: 
  - 彻底删除和清空垃圾桶时，不再进行普通的物理擦除，而是统一调用 `moveToSystemRecycleBin` 移入操作系统的废纸篓/回收站。
  - **Windows**: 使用 `child_process.spawn('powershell', [...])` 启动 PowerShell 配合 `param($path)` 参数绑定，调用 .NET COM 回收站方法，绝对阻止参数逃逸与命令行注入漏洞。
  - **macOS**: 探测系统并调用 `osascript` 运行 Finder AppleScript 将路径移入 Mac 废纸篓。
  - **Linux/其他**: 自动寻找并移至 XDG 回收站目录（`~/.local/share/Trash/files/`）；在所有系统下若由于权限或环境出错均自动平滑降级为普通的 `fs.remove` 彻底物理删除。
- **Git 版本时光机与串行化提交**:
  - 系统在启动或切换目录时自动检测并静默初始化 Git 仓库，设置局部身份（`user.name: SkillVault` / `user.email: backup@skillvault.local`）以防提交报错。
  - 在卡片创建、更新、重命名、星标及彻底删除/还原时，在后台自动执行 Git 增量提交。
  - **红线**：所有 Git 写操作（`add`、`commit` 等）必须通过 `gitWriteQueue` 串行执行，以防并发文件锁冲突；在 API 路由中必须 `await` 提交完成，以保持前、后端版本历史数据的同步一致。
  - 时光机回滚时运行 `git checkout <commitHash> -- <relativePath>`。
- **PowerShell ZIP 全量备份与防丢失恢复**:
  - 备份逻辑：利用 Windows PowerShell 的 `Compress-Archive`，将除 `.git`、`.trash`、`backups` 以及 `.assets` 外的所有文件打包压缩至 `backups/` 目录下。
  - **自动备份轮转与修剪 (Backup Rotation)**：每次执行全量备份导出（或执行还原前强制紧急自动备份）后，**必须同步调用 `await rotateBackups(backupsDir)`**。若备份包数量超过 **10 个**，按修改时间升序排序并物理删除最老的 zip 包，防止无限备份挤爆磁盘。
  - 还原逻辑：利用 `Expand-Archive` 解压还原备份。还原前**必须强制自动创建一个紧急最新状态备份**（`emergency-auto-backup.zip`）进行防呆降级防护。
- **物理媒体拖拽/粘贴自动上传与预览路径重写 (Media Upload)**:
  - 编辑器支持粘贴截图或拖入本地图片进行直传。前端通过 base64 转化为文件，POST 提交给后端 `/api/upload` 接口。
  - 后端直接解密 base64 图片数据流并使用 `atomicWriteFile` 写入工作区下隐藏的 `.assets/` 目录；
  - **红线**：为了兼容多层级子目录（如分类文件夹下）中 md 的本地预览（如 Obsidian 中可以直接读取），前端编辑器中插入的链接依然必须是相对于 md 文件的物理相对路径（即一级子目录下插入 `../.assets/filename`，根目录下插入 `.assets/filename`）。
  - 为实现前端网页的流畅预览，前端通过 `renderMarkdown` 渲染器在转化为 HTML 前，自动正则匹配重写图片路径为 `/api/assets/:filename` 绝对 API URL 加载图片。
- **自定义卡片拖拽排序与物理持久化 (Card Sorting & Order Persistence)**:
  - 排序配置物理存储于工作区根目录下的 `.skillvault-order.json` 隐藏文件中，格式为分类与文件名的字符串数组（如 `["category/filename.md"]`）。
  - 后端在 `GET /api/skills` 中自动读取该文件，并基于 Map 索引进行高精排序对齐；前端拖拽释放后，通过 `POST /api/skills/order` 进行物理原子写入，并异步发起 Git 增量提交保存版本。
  - **红线**：写入排序文件时，必须通过 `ensureSafePath` 严格防目录穿越，并且对每一项数据执行 `sanitizeFilename` 过滤，剔除包含路径分隔符的恶意注入数据。
  - **红线**：前端对全局 md 文件拖拽导入和卡片内部拖动排序的交互事件进行精准隔离，通过校验 `e.dataTransfer.types.includes('Files')` 来确保拖动卡片内部调序时绝对不触发全屏导入遮罩层。
- **防止路径穿越与越权**:
  - 在所有涉及文件读取和写入的接口中，使用 `path.relative` 计算相对路径来检查路径安全性，阻止前缀和目录穿越绕过。
  - 局域网模式下禁止非 localhost 客户端修改工作区目录（`isLocalRequest` 校验）；禁止将挂载路径指向敏感的系统关键文件夹（`isForbiddenSystemPath` 过滤）。
  - 禁止在后端路由层对 `req.params` 参数进行二次解码（`decodeURIComponent`），避免文件名中包含百分比 `%` 时抛出 malformed 异常导致服务崩溃。
  - 对用户新建和更新分类名进行 `sanitizeFilename` 过滤，禁止其包含斜杠，强制收拢在一级子目录下。
- **批量操作与多维分享**:
  - **批量软删除**：后端在批量软删除多个文件时，必须统一用单 Commit 合并提交 Git 事务，防止瞬间高频写操作引发 Git 的锁文件冲突。
  - **批量打包 ZIP**：利用 Windows 原生 PowerShell 的 `Compress-Archive` 实现零依赖打包，输入路径参数须通过 stdin 安全下发，且在流式下载完成后必须强制自动物理删除临时 ZIP 包，规避脏文件遗留安全隐患。
  - **海报拼装渲染**：前端使用隐藏 Canvas 实现卡片分享海报生成，当多选卡片多于 5 个时需前置灰色禁用并悬浮友好警示，避免因 Canvas 超高导致浏览器内存截断。
  - **多选指针交互**：保证多选状态下常规 Hover 鼠标指针为 `pointer` 点击手型以防视觉混淆，卡片左侧滑入复选框时徽标等元素需动态以偏移动效避让，保证排版完全不遮挡。

---

## 🛡️ 安全确认与拦截规则

- **自定义确认弹窗**: 不得使用系统生硬的原生 `confirm()` 弹窗。所有的删除、清空、移入垃圾桶操作必须触发自定义的精美警告 Modal (`.modal-confirm-warning`)；
- **未保存退出拦截**: 在编辑器被修改为 `dirty` 或 `saving` 状态时，点击取消或关闭编辑，必须唤起 `isUnsavedConfirmOpen` 拦截弹窗，提供“继续编辑”、“放弃修改退出”和“保存修改并退出”三种选项。

---

## 🔌 API 路由清单

| 请求方法 | 路由路径 | 作用描述 |
|:---|:---|:---|
| **GET** | `/api/config` | 获取当前 Markdown 文件夹挂载路径 |
| **POST** | `/api/config` | 切换并保存本地绝对路径（保存至 `config.json`） |
| **GET** | `/api/skills` | 扫描并获取所有技能卡片元数据（包含 `.trash` 排除，自动载入自定义拖拽排序） |
| **POST** | `/api/skills/order` | 保存自定义卡片拖拽排序（物理写入 `.skillvault-order.json` 且安全防爆过滤） |
| **GET** | `/api/skills/:category/:filename` | 读取某个技能包的 Front Matter 与 Markdown 源码 |
| **POST** | `/api/skills` | 创建新的技能包 Markdown 文件 |
| **PUT** | `/api/skills/:oldCategory/:oldFilename` | 更新技能包内容、重命名或迁移分类 |
| **POST** | `/api/skills/:category/:filename/star` | 切换技能包的星标状态 (直接读写 YAML FM) |
| **DELETE** | `/api/skills/:category/:filename` | 软删除：移入工作区 `.trash` 目录 |
| **POST** | `/api/skills/batch-delete` | 批量软删除技能卡片并合并提交 Git 事务 |
| **POST** | `/api/skills/batch-download` | 批量打包导出选中的技能卡片为 ZIP (利用 PowerShell) |
| **GET** | `/api/trash` | 获取垃圾桶内的技能包列表 |
| **POST** | `/api/trash/:category/:filename/restore` | 从垃圾桶中原路还原技能包文件 |
| **DELETE** | `/api/trash/:category/:filename/permanent` | 物理彻底删除（使用 PowerShell 投递至系统回收站） |
| **DELETE** | `/api/trash/empty` | 清空垃圾桶（批量使用 PowerShell 投递至系统回收站） |
| **GET** | `/api/skills/:category/:filename/download` | 下载技能包的原始 Markdown 文件 |
| **GET** | `/api/skills/:category/:filename/history` | 获取文件的 Git 版本历史列表 |
| **GET** | `/api/skills/:category/:filename/history/:commitHash` | 读取历史版本文件快照 |
| **POST** | `/api/skills/:category/:filename/history/:commitHash/rollback` | 一键时光回滚到指定历史版本 |
| **POST** | `/api/backups/export` | 立即创建安全 ZIP 物理全量备份 |
| **GET** | `/api/backups` | 列出所有本地已备份 ZIP 文件列表 |
| **POST** | `/api/backups/:backupName/restore` | 从指定备份恢复（前置强制自动紧急备份） |
| **DELETE** | `/api/backups/:backupName` | 物理彻底删除指定备份文件 |
| **POST** | `/api/upload` | 物理媒体资源 Base64 上传到 `.assets/` |
| **GET** | `/api/assets/:filename` | 静态获取并展示上传的媒体资源图片 |
