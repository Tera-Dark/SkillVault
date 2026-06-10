# SkillVault - 本地个人技能卡片管理平台

[🚀 在线只读交互演示 (GitHub Pages Showcase)](https://tera-dark.github.io/SkillVault/) *(注：云端部署为 Demo 演示版，所有操作仅在浏览器内存中生效；本地双击 run.bat 运行依然读取本地磁盘)*

**SkillVault** 是一款面向开发者、技术写作人及知识整理爱好者的本地 Markdown 知识库管理平台。它秉持 **“文档即数据”** 的去数据库化设计理念，将您的技能积累与文档以纯物理 Markdown 文件形式存放在本地磁盘。平台采用画廊级的 **Lovart 极简黑白视觉美学**（完美支持日/夜间暗黑模式），提供严密的**防丢失安全确认机制**，打造极速、纯粹、沉浸的知识整理环境。

---

## 🎨 1. 核心特性

### 1.1 极简黑白画廊美学 (Lovart Design System)
*   **Brutally Minimalist 设计**：采用大圆角 (`16px`) 淡灰色块卡片容器，搭配 Outfit 和 Plus Jakarta Sans 现代字族。
*   **外置排版设计**：标题、标签、更新时间一律外置于卡片容器下方，使主格栅区域呈现极富呼吸感的视觉流动。
*   **🌓 极简日夜主题热切换**：支持浅色模式与暗黑高对比度石墨灰模式的一键热切换，SVG 图标统一使用 `1.5px` 极细线条。

### 1.2 复合双栏过滤器侧边栏
*   **分类统计目录**：动态分析本地子文件夹名称并映射为分类，平铺在侧边栏并实时同步每个分类下的文档总数。
*   **多选标签交集过滤 (AND Filter)**：标签云支持多选，通过并集与交集逻辑快速锁定复合条件的技能卡片。
*   **一键收起**：点击最窄侧栏的 Tag 图标，可瞬间收起/展开该面板，腾出 100% 的宽度用于写作与阅读。

### 1.3 沉浸式左右分栏 Markdown 编辑器
*   **属性与正文分离**：左侧 320px 属性配置侧栏（负责标题、分类、标签、简介录入）；右侧 100% 高度的工作区用于 Markdown 正文编写与实时预览。
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

### 1.6 垃圾桶机制与 Windows 系统回收站对接
*   **隔离软删除**：删除卡片时，文件被剪切至隐藏的 `skills/.trash/:category/:filename` 下，后端扫描时自动屏蔽以 `.` 开头的所有文件，杜绝污染。
*   **移送系统回收站**：在彻底删除或清空垃圾桶时，后端通过 native Windows PowerShell 的 .NET COM 直接将文件投递到 **Windows 系统回收站**，防止物理误删。
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

---

## 🛠️ 2. 技术栈 (Technology Stack)

### 2.1 前端 (Client)
*   **框架**: React 18.x (纯 JS，无 TS) + Vite 5.x
*   **样式**: Vanilla CSS (极简 Lovart 主题，包含 CSS Variables 自定义配置)
*   **Markdown 解析**: `marked` 渲染引擎
*   **代码高亮**: `prismjs` 语法高亮
*   **海报生成**: `html2canvas` 导出分享海报

### 2.2 后端 (Server)
*   **运行环境**: Node.js (Express 4.x)
*   **物理文件处理**: `fs-extra`（高级文件操作） + `gray-matter`（YAML Front Matter 解析器）
*   **系统交互**: `child_process`（用于调用 Windows PowerShell 移送回收站）

---

## 📂 3. 项目结构与目录说明

```
私定skill管理平台/
├── dist/                 # 前端打包输出产物
├── skills/               # 默认 Markdown 存储目录
│   └── .trash/           # [隐藏] 虚拟垃圾桶暂存区
├── src/
│   ├── assets/
│   │   └── logo.png      # 专属黑白设计系统 Logo 图标
│   ├── components/       # (未来规划组件目录)
│   ├── App.jsx           # 核心 React 业务与 UI 代码 (包含 4 套确认 Modal)
│   ├── index.css         # Lovart 设计系统、日夜主题及垃圾桶动画样式
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
*   **操作系统**: Windows 环境（若在 Linux/macOS 下彻底删除，系统回收站动作将自动安全降级为普通的物理 `fs.remove`）。

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
1.  **后端 Express 服务器**（监听 `23333` 端口，自动寻找可用局域网 IP 进行广播）；
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
    开发模式下同局域网下的手机、平板或其他电脑可直接通过 Vite Dev Server 的局域网地址 `http://<局域网IP>:5173` 进行实时的文档编写和跨端查看（接口自动反向代理至后端 `23333`）；
2.  **端口冲突降级 (EACCES)**:
    如果系统局域网广播端口（`23333`）冲突或无权限绑定，后端 `server.js` 会自动降级绑定到本地回环地址 `127.0.0.1:23333`，并在控制台给出明确警告，确保单机开发模式稳定运行。

---

## 🔌 7. 后端 API 路由清单 (RESTful API)

| 请求方法 | 路由地址 | 请求体 (JSON) | 响应数据 (JSON) | 描述 |
|:---|:---|:---|:---|:---|
| **GET** | `/api/config` | 无 | `{ skillsDir, isCustomConfigured }` | 获取当前挂载路径及配置状态 |
| **POST** | `/api/config` | `{ skillsDir }` | `{ success, skillsDir }` | 保存自定义路径并热创建 |
| **GET** | `/api/skills` | 无 | `Array<SkillMetadata>` | 扫描并列出所有卡片元数据 |
| **GET** | `/api/skills/:category/:filename` | 无 | `SkillFullDetails` | 读取特定技能包的 FM 与正文 |
| **POST** | `/api/skills` | `SkillFullDetails` | `{ success, filename, category }` | 创建新的 Markdown 文件 |
| **PUT** | `/api/skills/:oldCategory/:oldFilename` | `SkillFullDetails` | `{ success, filename, category }` | 更新已有文件、重命名或重分类 |
| **POST** | `/api/skills/:category/:filename/star` | `{ star: boolean }` | `{ success, star }` | 星标持久化切换 |
| **DELETE** | `/api/skills/:category/:filename` | 无 | `{ success, message }` | **软删除**：剪切至 `.trash/` 目录 |
| **GET** | `/api/trash` | 无 | `Array<TrashSkillMetadata>` | 获取垃圾桶内的暂存文件列表 |
| **POST** | `/api/trash/:category/:filename/restore` | 无 | `{ success }` | 将垃圾桶文件原路还原归位 |
| **DELETE** | `/api/trash/:category/:filename/permanent`| 无 | `{ success }` | **物理删除**：通过 PowerShell 投递至系统回收站 |
| **DELETE** | `/api/trash/empty` | 无 | `{ success }` | **一键清空**：批量通过 PowerShell 投递至系统回收站 |
| **GET** | `/api/skills/:category/:filename/download` | 无 | 物理二进制流 | 下载原始 Markdown 文档 |
