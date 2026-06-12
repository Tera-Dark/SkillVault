# SkillVault - 本地个人技能卡片管理平台

[🚀 在线只读交互演示 (GitHub Pages Showcase)](https://tera-dark.github.io/SkillVault/) *(注：云端部署为 Demo 演示版，所有操作仅在浏览器内存中生效；本地双击 run.bat 运行依然读取本地磁盘)*

**SkillVault** 是一款面向开发者、技术写作人及知识整理爱好者的本地 Markdown 知识库管理平台。它秉持 **“文档即数据”** 的去数据库化设计理念，将您的技能积累与文档以纯物理 Markdown 文件形式存放在本地磁盘。平台采用以 **GitHub + Linear + Anthropic Console** 为视觉标杆的 **SaaS 极简黑白视觉美学**（完美支持日/夜间暗黑模式），提供严密的**防丢失安全确认机制**，打造极速、纯粹、沉浸的知识整理环境。

---

## 🎨 1. 核心特性

### 1.1 极简黑白画廊美学 (SaaS Minimal Design System)
*   **Brutally Minimalist 设计**：采用大圆角 (`16px`) 淡灰色块卡片容器，搭配 Outfit 和 Plus Jakarta Sans 现代字族，以实用、快捷、专业为核心。
*   **组件完全收拢**：所有信息与一键复制、下载按钮完全收拢包覆在卡片实体容器中，Hover 时微上浮 2px 伴以精美弥散微弱阴影，提供极佳的几何边界与极高的浏览效率。
*   **🌓 极简日夜主题热切换**：支持浅色模式与暗黑高对比度 GitHub Dark 标志性色调模式的一键热切换，SVG 图标统一使用 `1.5px` 极细线条。

### 1.2 扁平横向分类过滤条 (Flat Filters)
*   **置顶横向过滤**：分类筛选系统横向排开并固定置顶在导航栏下方，实现高频高效率的点按筛选。
*   **多选标签交集过滤 (AND Filter)**：标签云支持多选，通过并集与交集逻辑快速锁定复合条件的技能卡片，提供高密度、零晃动的极速过滤体验。

### 1.3 沉浸式左右分栏编辑器 (Immersive Editor Modal)
*   **属性与正文分离**：编辑模态框内采用 320px 左侧属性配置栏（负责标题、分类、标签、简介录入与快捷键指南）与 100% 宽度右侧 Markdown 编辑器构成的左右分栏布局。
*   **同步滚动 (Sync Scroll)**：利用高度比率计算，实现源码区与 Markdown 预览区完全同步比例滚动。
*   **常用格式化工具栏**：支持加粗、斜体、代码块、超链接和表格的快捷键一键插入并自动定位光标。
*   **💾 5秒无感自动保存 (Auto-Save)**：已有卡片修改时，停止输入 5 秒后前端自动防抖提交，并在编辑器底部配有呼吸指示灯（`已保存`、`正在保存`、`检测到修改`）。
*   **键盘快捷键**：支持全局键盘监听，在编辑器内按下 **`Ctrl + S`** (Windows) 或 **`Cmd + S`** (Mac) 即可秒级强制保存。

### 1.4 全局拖拽 md 自动解析导入
*   拖拽任何本地 `.md` 文件进入平台主界面，即可唤起高斯模糊的导入遮罩层。
*   前端利用正则引擎自动提取 YAML Front Matter 元数据（标题、分类、简介、标签）并解析正文载入编辑器，实现零摩擦极速导入。

### 1.5 沉浸式阅读器与关联推荐
*   **目录大纲 TOC 跳转**：自动提取 Markdown 的 `h1 ~ h3` 段落标题生成大纲，点击即可平滑跳转定位。
*   **星标收藏夹**：在卡片右上角和阅读器顶部可一键星标。收藏状态直接写入物理 md 文件的 Front Matter 中。
*   **🔗 关联技能推荐**：阅读器底部基于多维标签交集度并附带分类权重，自动关联推荐 3 篇其他高相关度的技能卡片，打造知识闭环。

### 1.6 垃圾桶机制与跨平台系统回收站适配
*   **隔离软删除**：删除卡片时，文件被剪切至隐藏的 `skills/.trash/:category/:filename` 下，后端扫描时自动屏蔽以 `.` 开头的所有文件，杜绝污染。
*   **跨平台回收站移送**：彻底删除或清空垃圾桶时，后端根据操作系统自动适配：Windows 下使用安全 PowerShell 参数化 COM 组件直接送入**系统回收站**；macOS 下使用 AppleScript Finder 移送至**废纸篓**；Linux 下移动至 XDG `~/.local/share/Trash/files/` 回收站规范目录，实现跨平台无感安全操作。
*   **🛡️ 四套安全警告 Modal**：全面移除浏览器生硬的原生 alert/confirm。
    *   **移入垃圾桶（软删除）确认 Modal**；
    *   **彻底删除二次确认 Modal**；
    *   **一键清空垃圾桶确认 Modal**（带 ⚠️ 呼吸警示动画）；
    *   **未保存修改退出强拦截 Modal**（提供“继续编辑”、“放弃退出”以及“保存修改并退出”三合一选项）。

### 1.7 🛡️ 深度安全加固与鲁棒解析体系
*   **🚫 终极防目录穿越 (Directory Traversal Defense)**：后端文件读写全面采用 Node.js 官方建议的 `path.relative` 相对路径校验方案，彻底杜绝了任何形式的前缀匹配绕过与跨工作区越界读取，确保数据绝对隔离。
*   **🔒 彻底阻断 PowerShell 命令注入 (Command Injection Defense)**：移送系统回收站改用底层的 `child_process.spawn` 启动并配合 `param($path)` 传参绑定机制。路径常量不经过 shell 字符串解释，哪怕文件名带有多重引号、分号、特殊变量符号也 100% 无法发生命令逃逸与执行注入。
*   **📡 局域网配置越权拦截 (API Access Control)**：在局域网共享模式下启动时，增加了本地回环 IP 验证。只有来自 `localhost` 或 `127.0.0.1` 的本地客户端才被允许修改本地挂载工作目录，防范了局域网其他客户端越权篡改。
*   **🧱 系统敏感目录隔离**：增加了 `isForbiddenSystemPath` 路径黑名单。禁止用户将工作目录设为系统驱动器根目录（如 `C:\`, `D:\`）或关键系统目录（如 `C:\Windows`, `C:\Program Files`），防止由于失误导致系统瘫痪或核心文件受损。
*   **🩹 二次解码崩溃隐患清除 (Robust URI Decoding)**：后端全面移除了冗余的 `decodeURIComponent` 手动解析。完美解决了当文件名包含 `%` 字符（如 `50%优惠.md`）时，后端二次解码会抛出 `URIError: URI malformed` 导致 500 后端崩溃的隐患，提升了系统的运行鲁棒性。

### 1.8 🚀 系统深度优化与防断电写入 (System Optimization)
*   **⚡ 零延迟内存缓存与目录监听**：后端引入全局内存缓存，获取技能卡片列表接近 0 延迟响应。基于 `fs.watch` 开发了防抖文件监控器，直接在外部修改 md 卡片时，后端能自适应秒级同步感知并热重建缓存。
*   **📐 客户端卡片分页加载**：前端卡片限制首屏渲染 18 个卡片以防止 DOM 节点过多造成卡顿，并在列表/卡片下方提供极其精美的画廊反色“加载更多”按钮。
*   **🖼️ 编辑器图片粘贴/拖拽直传**：支持在正文编辑器内粘贴截图或拖入本地图片，后端免依赖 base64 解码直接原子存入 `.assets/` 文件夹下，且完美重写预览路径，实现本地 Obsidian 等第三方编辑器和网页端预览的无感图片渲染。
*   **🩹 原子化安全写入**：所有技能保存修改动作使用写临时文件完全成功后再重命名的原子写技术（`atomicWriteFile`），彻底杜绝由于断电或进程强退造成的文件内容写损丢失隐患。
*   **📦 备份自动轮转限额**：全量 ZIP 备份和紧急还原备份生成后自动进行轮转修剪，最多只保留最新的 10 个备份，保护磁盘容量。

### 1.9 🎴 自定义卡片拖拽排序与交互隔离 (Drag & Drop Sorting)
*   **无感物理调序**：在卡片网格和列表行元素上支持 HTML5 原生拖拽，利用 React State 差值计算进行流畅避让排版，拖拽释放后，异步向后端发送 `/api/skills/order` 进行物理原子写入配置文件，同步发起 Git 版本增量提交。
*   **拖放源事件隔离**：通过严格验证 `e.dataTransfer.types.includes('Files')` 来隔离全局 md 文件导入和卡片内部拖动排序，完美杜绝因内部调序导致误触发全屏高斯模糊导入遮罩的交互冲突。

### 1.10 📦 批量操作与多维分享 (Batch Operations & Sharing)
*   **批量软删除与 Git 合并提交**：支持多选卡片进行批量移入垃圾桶操作。后端配备串行事务队列锁，在单次批量删除时仅触发 **一次** Git 合并提交，防止瞬间高频并发写盘导致 Git 索引锁冲突。
*   **免依赖批量打包 ZIP**：利用 Windows PowerShell 原生 `Compress-Archive` 实现零 npm 库依赖的物理卡片打包导出，流式下载传输结束后，服务器强制自动执行临时物理 ZIP 文件的物理删除，规避文件泄露。
*   **合并分享海报与 Markdown 复制**：支持一键将所选卡片的 YAML 与正文合并拼接复制到剪贴板，以及通过 `html2canvas` 自动拼接并渲染生成高分辨率卡片拼接海报。为防范超大图截断，设置了多选卡片数大于 5 个时海报变灰禁用并悬浮友好警示的防呆逻辑。
*   **高清晰交互指针与防遮挡排版**：多选模式下复选框采用单色高对比度极简设计，Hover 指针保持高清晰度的 pointer 点击手型。卡片左侧滑入复选框时，Badge 徽标等布局动态以过渡动画偏移避让，防止任何重叠遮挡。

---

## 🛠️ 2. 技术栈 (Technology Stack)

### 2.1 前端 (Client)
*   **框架**: React 18.x (纯 JS，无 TS) + Vite 5.x
*   **样式**: Vanilla CSS (SaaS 极简设计系统，包含日/夜间暗黑模式变量配置)
*   **Markdown 解析**: `marked` 渲染引擎（含 `.assets` 相对路径向绝对 API 路由地址重写）
*   **代码高亮**: `prismjs` 语法高亮
*   **海报生成**: `html2canvas` 导出分享海报
*   **富媒体操作**: 正文编辑器内支持 Paste（粘贴截图）与 Drop（拖拽图片）事件拦截，实现媒体直传

### 2.2 后端 (Server)
*   **运行环境**: Node.js (Express 4.x)
*   **物理文件处理**: `fs-extra`（高级文件操作） + `gray-matter`（YAML Front Matter 解析器）
*   **系统交互**: `child_process`（用于适配跨平台系统回收站，支持 Windows PowerShell、macOS osascript AppleScript 及 Linux 移动）
*   **缓存与监听**: Node.js 原生 `fs.watch` 目录递归监控 + 扁平内存缓存 `skillsCache`，支持高精防抖同步
*   **原子写入**: 封装 `atomicWriteFile`（写临时文件再 rename）避免断电或崩溃写损卡片

---

## 📂 3. 项目结构与目录说明

```
私定skill管理平台/
├── dist/                 # 前端打包输出产物
├── skills/               # 默认 Markdown 存储目录
│   ├── .trash/           # [隐藏] 虚拟垃圾桶暂存区
│   ├── .assets/          # [隐藏] 物理图片等多媒体直传存储目录
│   └── .skillvault-order.json # [隐藏] 自定义卡片拖拽排序物理存储配置文件
├── src/
│   ├── assets/
│   │   └── logo.png      # 专属黑白设计系统 Logo 图标
│   ├── components/       # (未来规划组件目录)
│   ├── App.jsx           # 核心 React 业务与 UI 代码 (包含 4 套确认 Modal 与拖拽机制)
│   ├── index.css         # SaaS 极简设计系统、日夜主题、拖拽样式及垃圾桶动画
│   └── main.jsx          # React 入口
├── CLAUDE.md             # 面向 AI 开发者的开发红线与路由速查表
├── DESIGN.md             # 设计系统 tokens 与 UI 规范
├── index.html            # 挂载 Favicon 图标与 Google 字体
├── package.json          # 依赖配置与并发启动脚本
├── run.bat               # Windows 一键启动脚本
├── server.js             # Express 后端服务 (EACCES 降级、PowerShell 交互)
└── vite.config.js        # Vite 反向代理配置
```

---

## 🚀 4. 快速入门 (Getting Started)

### 4.1 运行前提 (Requirements)
*   **Node.js**: 安装 v16.x 及以上版本。
*   **操作系统**: 跨平台支持（Windows / macOS / Linux）。彻底删除动作均已实现原生系统回收站/废纸篓适配，遇到环境限制或权限不足时自动安全降级为彻底物理删除。

### 4.2 安装依赖
在项目根目录下，使用终端运行以下指令下载依赖：
```bash
npm install
```

### 4.3 启动开发环境
双击运行项目根目录下的 **`run.bat`**。该脚本会自动在后台执行并发命令：
```bash
npm run dev
```
此命令使用 `concurrently` 同时启动：
1.  **后端 Express 服务器**（监听 `23335` 端口，自动寻找可用局域网 IP 进行广播）；
2.  **前端 Vite 开发服务**（代理所有 `/api` 接口至后端，自动在您的默认浏览器打开调试页面 `http://localhost:5173`）。

---

## 💾 5. 核心数据格式与存储

SkillVault 所有的技能卡片都包含一个标准的 YAML Front Matter 头部，其数据格式模板如下：

```markdown
---
title: 技能标题
category: 前端开发
description: 这是展示在卡片上的描述预览文本，限字数以便展示。
tags:
  - React
  - CSS
star: true
---

# 技能正文

在此编写您的 Markdown 正文。
```

---

## 📶 6. 局域网分享状态与端口降级

1.  **局域网共享**:
    开发模式下同局域网下的手机、平板或其他电脑可直接通过 Vite Dev Server 的局域网地址 `http://<局域网IP>:5173` 进行实时的文档编写和跨端查看（接口自动反向代理至后端 `23335`）；
2.  **端口冲突降级 (EACCES)**:
    如果系统局域网广播端口（`23335`）冲突或无权限绑定，后端 `server.js` 会自动降级绑定到本地回环地址 `127.0.0.1:23335`，并在控制台给出明确警告，确保单机开发模式稳定运行。

---

## 🔌 7. 后端 API 路由清单 (RESTful API)

| 请求方法 | 路由地址 | 请求体 (JSON) | 响应数据 (JSON) | 描述 |
|:---|:---|:---|:---|:---|
| **GET** | `/api/config` | 无 | `{ skillsDir, isCustomConfigured }` | 获取当前挂载路径及配置状态 |
| **POST** | `/api/config` | `{ skillsDir }` | `{ success, skillsDir }` | 保存自定义路径并热创建 |
| **GET** | `/api/skills` | 无 | `Array<SkillMetadata>` | 扫描并列出所有卡片元数据（自动应用拖拽排序） |
| **POST** | `/api/skills/order` | `{ order: Array }` | `{ success }` | 保存自定义卡片拖拽排序（物理写入 `.skillvault-order.json`） |
| **GET** | `/api/skills/:category/:filename` | 无 | `SkillFullDetails` | 读取特定技能包的 FM 与正文 |
| **POST** | `/api/skills` | `SkillFullDetails` | `{ success, filename, category }` | 创建新的 Markdown 文件 |
| **PUT** | `/api/skills/:oldCategory/:oldFilename` | `SkillFullDetails` | `{ success, filename, category }` | 更新已有文件、重命名或重分类 |
| **POST** | `/api/skills/:category/:filename/star` | `{ star: boolean }` | `{ success, star }` | 星标持久化切换 (YAML Front Matter) |
| **DELETE** | `/api/skills/:category/:filename` | 无 | `{ success, message }` | **软删除**：剪切至 `.trash/` 目录 |
| **POST** | `/api/skills/batch-delete` | `{ items: Array }` | `{ success, count }` | **批量软删除**：移入垃圾桶并合并提交 Git 事务 |
| **POST** | `/api/skills/batch-download` | `{ items: Array }` | 物理二进制流 | **批量打包导出**：选中项打包导出为 ZIP |
| **GET** | `/api/trash` | 无 | `Array<TrashSkillMetadata>` | 获取垃圾桶内的暂存文件列表 |
| **POST** | `/api/trash/:category/:filename/restore` | 无 | `{ success }` | 将垃圾桶文件原路还原归位 |
| **DELETE** | `/api/trash/:category/:filename/permanent`| 无 | `{ success }` | **物理彻底删除**：移送至系统回收站/废纸篓 |
| **DELETE** | `/api/trash/empty` | 无 | `{ success }` | **一键清空垃圾桶**：批量移送至系统回收站/废纸篓 |
| **GET** | `/api/skills/:category/:filename/download` | 无 | 物理二进制流 | 下载原始 Markdown 文档 |
| **GET** | `/api/skills/:category/:filename/history` | 无 | `{ supported: boolean, history: Array }` | 获取文件的 Git 版本历史版本列表 |
| **GET** | `/api/skills/:category/:filename/history/:commitHash` | 无 | `SkillFullDetails` | 读取特定 Git 历史版本快照 |
| **POST** | `/api/skills/:category/:filename/history/:commitHash/rollback` | 无 | `{ success, title }` | 一键时光回滚到指定历史版本 |
| **POST** | `/api/backups/export` | 无 | `{ success, backup: { name, size, createdAt } }` | 立即创建安全 ZIP 物理全量备份 |
| **GET** | `/api/backups` | 无 | `Array<{ name, size, createdAt }>` | 列出所有本地已备份 ZIP 文件列表 |
| **POST** | `/api/backups/:backupName/restore` | 无 | `{ success }` | 从指定备份恢复（前置强制自动紧急备份） |
| **DELETE** | `/api/backups/:backupName` | 无 | `{ success }` | 物理彻底删除指定备份文件 |
| **POST** | `/api/upload` | `{ filename, base64Data }` | `{ success, url, filename }` | 物理媒体资源 Base64 上传到 `.assets/` |
| **GET** | `/api/assets/:filename` | 无 | 物理二进制流 | 静态获取并展示上传的媒体图片 |
