# SkillVault - 开发者规范与系统速查手册 (CLAUDE.md)

本文件是面向下一次会话 AI 的规范指南，请严格遵守以下开发红线和系统约束。

---

## 🚀 常用指令速查

### 开发与构建
- **前端开发服务 (Vite)**: `npm run dev` (Vite 负责前端调试，并代理接口至后端 23333)
- **后端服务 (Express)**: `node server.js`
- **生产构建**: `npm run build`
- **一键启动脚本**: `run.bat` (一键并发启动后端 Express 并利用 Vite Dev Server 打开浏览器)

### 系统端口
- **前端调试端口**: `http://localhost:5173` (或 Vite 自动分配的其他端口)
- **后端 API 端口**: `http://localhost:23333` (局域网共享模式下绑定 `0.0.0.0`)

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
- **隔离防污染 (软删除)**: 
  - 删除动作不能进行物理擦除，而是将其移入物理工作区下的隐藏目录 `.trash/:category/:filename`；
  - 后端扫描函数 `readdir` 必须排除以 `.` 开头的所有隐藏文件夹，避免垃圾桶污染主列表；
- **系统回收站对接 (彻底删除)**: 
  - 彻底删除和清空垃圾桶时，必须使用更安全的 `child_process.spawn('powershell', [...])` 启动 PowerShell。
  - 必须通过 `param($path)` 参数绑定机制来接收文件路径常量，严禁使用 `exec` 拼接命令行字符串，以彻底杜绝命令注入漏洞。
  - 命令调用 `[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile` 将文件安全移入 Windows 系统回收站。出错时降级为 `fs.remove`。
- **防止路径穿越与越权**:
  - 在所有涉及文件读取和写入的接口中，使用 `path.relative` 计算相对路径来检查路径安全性，阻止前缀和目录穿越绕过。
  - 局域网模式下禁止非 localhost 客户端修改工作区目录（`isLocalRequest` 校验）；禁止将挂载路径指向敏感的系统关键文件夹（`isForbiddenSystemPath` 过滤）。
  - 禁止在后端路由层对 `req.params` 参数进行二次解码（`decodeURIComponent`），避免文件名中包含百分比 `%` 时抛出 malformed 异常导致服务崩溃。
  - 对用户新建和更新分类名进行 `sanitizeFilename` 过滤，禁止其包含斜杠，强制收拢在一级子目录下。

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
| **GET** | `/api/skills` | 扫描并获取所有技能卡片元数据（排除 `.trash`） |
| **GET** | `/api/skills/:category/:filename` | 读取某个技能包的 Front Matter 与 Markdown 源码 |
| **POST** | `/api/skills` | 创建新的技能包 Markdown 文件 |
| **PUT** | `/api/skills/:oldCategory/:oldFilename` | 更新技能包内容、重命名或迁移分类 |
| **POST** | `/api/skills/:category/:filename/star` | 切换技能包的星标状态 (直接读写 YAML FM) |
| **DELETE** | `/api/skills/:category/:filename` | 软删除：移入工作区 `.trash` 目录 |
| **GET** | `/api/trash` | 获取垃圾桶内的技能包列表 |
| **POST** | `/api/trash/:category/:filename/restore` | 从垃圾桶中原路还原技能包文件 |
| **DELETE** | `/api/trash/:category/:filename/permanent` | 物理彻底删除（使用 PowerShell 投递至系统回收站） |
| **DELETE** | `/api/trash/empty` | 清空垃圾桶（批量使用 PowerShell 投递至系统回收站） |
| **GET** | `/api/skills/:category/:filename/download` | 下载技能包的原始 Markdown 文件 |
