import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';
import html2canvas from 'html2canvas';

// 配置 marked 的基础选项
marked.setOptions({
  gfm: true,
  breaks: true,
});

// 极细 1.5px 线条 SVG 图标组件库
const HomeIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const TagIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);

const PlusIcon = ({ size = 20 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const SettingsIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

const HelpIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const SearchIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const EyeIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EditIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);

const DownloadIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const TrashIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const AlertIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const ArrowUpIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
);

const SunIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);

const MoonIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);

const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8"/><line x1="6" y1="2" x2="6" y2="22"/></svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
);

const CodeBlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="16" y1="3" x2="16" y2="21"/></svg>
);

const StarIcon = ({ filled = false, size = 16 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const RotateCcwIcon = ({ size = 16 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
);

// ==========================================================================
// Environment-Aware Demo Mode (Vercel In-Memory DB Showcase)
// ==========================================================================
const isLocalOrLAN = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     /^192\.168\./.test(window.location.hostname) ||
                     /^10\./.test(window.location.hostname) ||
                     /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname);
const isDemoMode = !isLocalOrLAN;

if (isDemoMode) {
  let mockSkills = [
    {
      title: "SkillVault 简介与 Lovart 极简美学",
      category: "系统介绍",
      description: "欢迎体验 SkillVault，这是专为开发者设计的画廊风本地 Markdown 技能管理平台。本篇为您介绍本系统的视觉理念和核心功能。",
      tags: ["Lovart", "Design", "Minimalist"],
      filename: "SkillVault-简介与-Lovart-极简美学.md",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      star: true,
      content: `# SkillVault 简介与 Lovart 极简美学\n\n欢迎体验 **SkillVault**。这是一款去数据库设计的本地个人技能管理平台。目前您正在查看的是部署在 Vercel 上的**只读交互演示版本 (Showcase)**。\n\n## 🎨 Lovart 视觉美学\n\n本软件的核心视觉风格是“极简画廊黑白风 (Lovart Minimalist)”：\n- **去投影、去渐变**：大面积使用灰白色块，利用物理堆叠与间距传达层次感。\n- **外置排版**：标题、分类和标签一律不在卡片容器内，而是放置于下方，使容器内部极其纯净。\n- **极细线条**：系统全部图标采用 1.5px 极细线条 SVG，摒弃粗重的 Emoji。\n\n## 📂 “文档即数据”\n\n在本地运行时，SkillVault 不需要连接数据库：\n1. 所有技能全部存放在您磁盘里的 \`.md\` 文件夹中；\n2. 星标、标题、标签等元数据直接以 YAML Front Matter 格式写入文件头部；\n3. 通过这种设计，您的知识库是 100% 透明和可移动的。\n\n## 🛡️ 安全双重确认\n\n平台实现了一套完整的安全阻断，防止您在编辑时手抖造成数据丢失：\n- **移入垃圾桶**：剪切移动到隐藏的 \`.trash\` 目录；\n- **彻底删除**：后端直接调用 Windows 系统的 PowerShell COM 组件，将文件原生送进 **Windows 桌面回收站**；\n- **未保存退出拦截**：如果检测到修改，退出编辑器时会进行三合一警告拦截。\n\n> 💡 *提示：在演示模式下，您的所有修改、星标与删除动作仅在浏览器内存中临时生效，刷新后复原，不会修改您的本地磁盘。*`
    },
    {
      title: "React 双栏编辑器同步滚动设计",
      category: "技术架构",
      description: "本篇介绍 SkillVault 的 Markdown 编辑器如何通过计算高度比例实现源码区与实时预览区的 100% 同步滚动设计。",
      tags: ["React", "Vite", "Scroll"],
      filename: "React-双栏编辑器同步滚动设计.md",
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      star: false,
      content: `# React 双栏编辑器同步滚动设计\n\n在 Markdown 编辑器中，实现源码输入框 (\`textarea\`) 和渲染预览区 (\`div.preview-body\`) 的同步滚动是一个提升写作体验的关键痛点。\n\n## 📐 算法原理\n\n传统的同步滚动是通过让双方的 \`scrollTop\` 保持一致来实现的。然而，由于 Markdown 源码段落高度（含大量 YAML 标记）与渲染后的 HTML 真实高度并不相等，单纯的 \`scrollTop\` 对齐会导致严重的滚动错位。\n\nSkillVault 采用了基于**滚动百分比 (Scroll Percentage)** 的同步滚动算法：\n\n\`\`\`javascript\nconst handleEditorScroll = (e) => {\n  const textarea = e.target;\n  const preview = previewBodyRef.current;\n  if (!textarea || !preview) return;\n\n  // 计算源码区当前滚动的百分比\n  const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);\n  \n  // 按比例映射给预览区\n  preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);\n};\n\`\`\`\n\n## ⚡ 优点\n- **零延迟**：不需要监听复杂的 DOM node 高度变化；\n- **简单可靠**：通过比例映射保证了当源码滚动到底部时，预览也完美到底部，消成了截断的烦恼。`
    },
    {
      title: "Windows PowerShell 系统回收站对接细节",
      category: "后端开发",
      description: "探讨在 Node.js Express 后端中执行 native Windows PowerShell COM 命令将物理文件投递到桌面回收站的安全删除逻辑。",
      tags: ["NodeJS", "PowerShell", "Windows"],
      filename: "Windows-PowerShell-系统回收站对接细节.md",
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      star: false,
      content: `# Windows PowerShell 系统回收站对接细节\n\n传统的 Node.js \`fs.unlink\` 删除文件是无法撤销的物理抹除，一旦误删会给用户带来不可挽回的损失。\n\n为了给用户提供媲美 Windows 系统原生的安全感，SkillVault 设计了将彻底删除的文件投递至 Windows 桌面回收站的方案。\n\n## 🛠️ PowerShell Native COM 的调用\n\n在 Windows 系统中，我们可以通过 \`Add-Type -AssemblyName Microsoft.VisualBasic\` 导入 .NET 类库，并调用其中的 \`DeleteFile\` 方法，其第三个参数 \`SendToRecycleBin\` 可以直接将物理路径投递至系统回收站：\n\n\`\`\`javascript\nfunction moveToWindowsRecycleBin(filePath) {\n  return new Promise((resolve, reject) => {\n    const absolutePath = path.resolve(filePath);\n    const cmd = \`powershell -NoProfile -Command \"Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('\${absolutePath}', 'OnlyErrorDialogs', 'SendToRecycleBin')\"\`;\n    \n    exec(cmd, (err, stdout, stderr) => {\n      if (err) {\n        // 降级机制：如果 PowerShell 执行失败，则使用物理 fs.remove\n        console.error('PowerShell 失败，降级物理删除');\n        fs.remove(filePath).then(() => resolve(true)).catch(reject);\n      } else {\n        resolve(true);\n      }\n    });\n  });\n}\n\`\`\`\n\n## 🛡️ 安全降级设计\n如果用户运行在 Linux、macOS 或者是系统没有配置 PowerShell 的精简 Windows 下，系统会在捕获错误后自动降级执行普通的文件彻底删除，确保业务逻辑闭环，安全网非常牢固。`
    }
  ];

  let mockTrash = [
    {
      title: "这是一篇已被软删除的旧草稿",
      category: "未分类",
      description: "此项目当前在垃圾桶中，演示如何在内存中将其恢复或彻底删除。",
      tags: ["Draft", "Trash"],
      filename: "这是一篇已被软删除的旧草稿.md",
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      deletedAt: new Date(Date.now() - 86400000).toISOString(),
      content: `# 这是一篇已被软删除的旧草稿\n\n这是为了向您展示 **SkillVault 垃圾桶功能** 的 Mock 数据。\n\n您可以点击卡片右下角的：\n- **恢复 ↩️** 按钮：将其从垃圾桶原路放回主列表中；\n- **彻底删除 ❌** 按钮：触发带有 🚨 警示的高级二次确认 Modal。`
    }
  ];

  // 备份原生的 fetch
  const originalFetch = window.fetch;

  // 劫持全局 fetch
  window.fetch = function(url, options) {
    const urlStr = url.toString();
    const method = (options && options.method || 'GET').toUpperCase();

    // 辅助返回模拟的 Response 对象
    const jsonResponse = (data, status = 200) => {
      return Promise.resolve(new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
      }));
    };

    // 1. GET /api/config
    if (urlStr.includes('/api/config') && method === 'GET') {
      return jsonResponse({ skillsDir: 'Vercel 云端演示空间', isCustomConfigured: true });
    }

    // 2. POST /api/config
    if (urlStr.includes('/api/config') && method === 'POST') {
      return jsonResponse({ success: true, skillsDir: 'Vercel 云端演示空间' });
    }

    // 3. GET /api/skills
    if (urlStr.includes('/api/skills') && method === 'GET' && !urlStr.includes('/download')) {
      return jsonResponse(mockSkills);
    }

    // 4. GET /api/skills/:category/:filename
    if (urlStr.includes('/api/skills/') && method === 'GET' && !urlStr.includes('/download') && !urlStr.endsWith('/star')) {
      const parts = urlStr.split('/api/skills/');
      if (parts.length > 1) {
        const decoded = decodeURIComponent(parts[1]);
        const fileParts = decoded.split('/');
        const filename = fileParts[fileParts.length - 1];
        const match = mockSkills.find(s => s.filename === filename);
        if (match) {
          return jsonResponse(match);
        }
      }
      return jsonResponse({ error: '文件未找到' }, 404);
    }

    // 5. POST /api/skills
    if (urlStr.includes('/api/skills') && method === 'POST') {
      const body = JSON.parse(options.body);
      const newSkill = {
        title: body.title,
        category: body.category || '未分类',
        description: body.description || '',
        tags: body.tags || [],
        content: body.content || '',
        filename: `${body.title}.md`,
        updatedAt: new Date().toISOString(),
        star: !!body.star
      };
      mockSkills = [newSkill, ...mockSkills];
      return jsonResponse({ success: true, filename: newSkill.filename, category: newSkill.category });
    }

    // 6. PUT /api/skills/:category/:filename
    if (urlStr.includes('/api/skills/') && method === 'PUT') {
      const parts = urlStr.split('/api/skills/');
      if (parts.length > 1) {
        const decoded = decodeURIComponent(parts[1]);
        const fileParts = decoded.split('/');
        const oldFilename = fileParts[fileParts.length - 1];
        
        const body = JSON.parse(options.body);
        const updatedSkill = {
          title: body.title,
          category: body.category || '未分类',
          description: body.description || '',
          tags: body.tags || [],
          content: body.content || '',
          filename: oldFilename,
          updatedAt: new Date().toISOString(),
          star: !!body.star
        };
        mockSkills = mockSkills.map(s => s.filename === oldFilename ? updatedSkill : s);
        return jsonResponse({ success: true, filename: oldFilename, category: updatedSkill.category });
      }
      return jsonResponse({ error: '保存失败' }, 500);
    }

    // 7. POST /api/skills/:category/:filename/star
    if (urlStr.includes('/star') && method === 'POST') {
      const parts = urlStr.split('/api/skills/');
      if (parts.length > 1) {
        const decoded = parts[1].split('/star')[0];
        const fileParts = decodeURIComponent(decoded).split('/');
        const filename = fileParts[fileParts.length - 1];
        const body = JSON.parse(options.body);
        
        mockSkills = mockSkills.map(s => {
          if (s.filename === filename) {
            return { ...s, star: !!body.star };
          }
          return s;
        });
        return jsonResponse({ success: true, star: !!body.star });
      }
      return jsonResponse({ error: '收藏失败' }, 500);
    }

    // 8. DELETE /api/skills/:category/:filename
    if (urlStr.includes('/api/skills/') && method === 'DELETE') {
      const parts = urlStr.split('/api/skills/');
      if (parts.length > 1) {
        const decoded = decodeURIComponent(parts[1]);
        const fileParts = decoded.split('/');
        const filename = fileParts[fileParts.length - 1];
        const match = mockSkills.find(s => s.filename === filename);
        if (match) {
          mockSkills = mockSkills.filter(s => s.filename !== filename);
          mockTrash = [{ ...match, deletedAt: new Date().toISOString() }, ...mockTrash];
          return jsonResponse({ success: true, message: '已移入垃圾桶' });
        }
      }
      return jsonResponse({ error: '删除失败' }, 500);
    }

    // 9. GET /api/trash
    if (urlStr.includes('/api/trash') && method === 'GET') {
      return jsonResponse(mockTrash);
    }

    // 10. POST /api/trash/:category/:filename/restore
    if (urlStr.includes('/restore') && method === 'POST') {
      const parts = urlStr.split('/api/trash/');
      if (parts.length > 1) {
        const decoded = parts[1].split('/restore')[0];
        const fileParts = decodeURIComponent(decoded).split('/');
        const filename = fileParts[fileParts.length - 1];
        const match = mockTrash.find(s => s.filename === filename);
        if (match) {
          mockTrash = mockTrash.filter(s => s.filename !== filename);
          mockSkills = [match, ...mockSkills];
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ error: '恢复失败' }, 500);
    }

    // 11. DELETE /api/trash/:category/:filename/permanent
    if (urlStr.includes('/permanent') && method === 'DELETE') {
      const parts = urlStr.split('/api/trash/');
      if (parts.length > 1) {
        const decoded = parts[1].split('/permanent')[0];
        const fileParts = decodeURIComponent(decoded).split('/');
        const filename = fileParts[fileParts.length - 1];
        mockTrash = mockTrash.filter(s => s.filename !== filename);
        return jsonResponse({ success: true });
      }
      return jsonResponse({ error: '彻底删除失败' }, 500);
    }

    // 12. DELETE /api/trash/empty
    if (urlStr.includes('/api/trash/empty') && method === 'DELETE') {
      mockTrash = [];
      return jsonResponse({ success: true });
    }

    // 13. 下载
    if (urlStr.includes('/download')) {
      alert("演示空间：直接通过浏览器触发 Markdown 二进制流下载。");
      return Promise.resolve(new Response(null, { status: 200 }));
    }

    // 兜底退回原生 fetch
    return originalFetch(url, options);
  };
}

export default function App() {
  // 状态管理
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 配置状态
  const [skillsDir, setSkillsDir] = useState('');
  
  // 过滤状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTags, setSelectedTags] = useState([]); // 数组，支持多选
  const [sortKey, setSortKey] = useState('updatedAt-desc'); // 排序主键
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true); // 侧边过滤器面板状态（默认开启）
  const [theme, setTheme] = useState('light'); // 极简日/夜主题状态
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'
  const [dragOver, setDragOver] = useState(false); // 拖拽状态
  const [isCustomConfiguredServer, setIsCustomConfiguredServer] = useState(true); // 是否自定义配置了物理路径
  const [trashSkills, setTrashSkills] = useState([]); // 垃圾桶数据
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // 彻底删除弹窗
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false); // 清空垃圾桶弹窗
  const [selectedTrashSkill, setSelectedTrashSkill] = useState(null); // 正在操作彻底删除的技能项
  const [isSoftDeleteConfirmOpen, setIsSoftDeleteConfirmOpen] = useState(false); // 软删除移入垃圾桶弹窗
  const [selectedSoftDeleteSkill, setSelectedSoftDeleteSkill] = useState(null); // 正在操作软删除的技能项
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false); // 编辑未保存退出弹窗
  const autoSaveTimerRef = useRef(null); // 自动保存 Timer Ref
  
  // 弹窗控制
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  // 当前正在操作的 Skill 数据
  const [currentSkill, setCurrentSkill] = useState({
    title: '',
    category: '',
    description: '',
    tags: '',
    content: '',
    filename: '',
    isNew: true
  });
  
  // 用于查看弹窗的临时详细数据
  const [viewedSkill, setViewedSkill] = useState(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  
  // 临时设置路径
  const [tempPath, setTempPath] = useState('');
  
  // 用于截图的 Ref
  const shareCardRef = useRef(null);
  const editorTextareaRef = useRef(null); // 编辑器 Textarea Ref
  const previewBodyRef = useRef(null); // 预览面板 Ref

  // Markdown 语法快速插入
  const insertMarkdown = (type) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        replacement = `**${selected || '加粗文本'}**`;
        cursorOffset = selected ? 0 : 2;
        break;
      case 'italic':
        replacement = `*${selected || '斜体文本'}*`;
        cursorOffset = selected ? 0 : 1;
        break;
      case 'code':
        replacement = `\`\`\`javascript\n${selected || '// 在此输入代码'}\n\`\`\``;
        cursorOffset = selected ? 0 : 13;
        break;
      case 'link':
        replacement = `[${selected || '链接文本'}](https://)`;
        cursorOffset = selected ? 11 : 1;
        break;
      case 'table':
        replacement = `\n| 表头1 | 表头2 | 表头3 |\n| --- | --- | --- |\n| 单元格 | 单元格 | 单元格 |\n`;
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setCurrentSkill({ ...currentSkill, content: newValue });

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        const newCursorPos = start + replacement.length - cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // 左右双栏同步滚动
  const handleEditorScroll = (e) => {
    const textarea = e.target;
    const preview = previewBodyRef.current;
    if (!textarea || !preview) return;

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  // 执行自动保存到本地文件
  const performAutoSave = async () => {
    if (!currentSkill.title.trim() || !currentSkill.content.trim() || currentSkill.isNew) {
      return;
    }
    
    setSaveStatus('saving');

    const tagsArray = currentSkill.tags
      ? currentSkill.tags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: currentSkill.title.trim(),
      category: currentSkill.category.trim() || '未分类',
      description: currentSkill.description.trim(),
      tags: tagsArray,
      content: currentSkill.content,
      star: !!currentSkill.star
    };

    const url = `/api/skills/${encodeURIComponent(currentSkill.oldCategory)}/${encodeURIComponent(currentSkill.filename)}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '自动保存失败');

      setCurrentSkill(prev => ({
        ...prev,
        oldCategory: data.category,
        filename: data.filename
      }));
      
      setSaveStatus('saved');
      fetchSkills();
    } catch (err) {
      console.error('自动保存失败:', err.message);
      setSaveStatus('dirty');
    }
  };

  // 拖拽导入逻辑
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.md')) {
      alert('仅支持导入 Markdown 格式的 .md 文件！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      
      let title = file.name.replace(/\.md$/, '');
      let category = '';
      let description = '';
      let tags = '';
      let content = fileContent;

      const fmMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (fmMatch) {
        const yamlStr = fmMatch[1];
        content = fmMatch[2];
        
        const lines = yamlStr.split('\n');
        lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim().toLowerCase();
            const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
            
            if (key === 'title') title = value;
            else if (key === 'category') category = value;
            else if (key === 'description') description = value;
            else if (key === 'tags') {
              try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                  tags = parsed.join(', ');
                } else {
                  tags = value;
                }
              } catch (err) {
                tags = value.replace(/[\[\]]/g, '');
              }
            }
          }
        });
      }

      setCurrentSkill({
        title,
        category: category || '未分类',
        description,
        tags,
        content,
        filename: '',
        isNew: true
      });
      setIsEditOpen(true);
    };
    reader.readAsText(file);
  };

  // 收藏/取消收藏 Skill
  const toggleStar = async (category, filename, currentStar) => {
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star: !currentStar })
      });
      if (!res.ok) throw new Error('星标操作失败');
      const data = await res.json();
      
      setSkills(prev => prev.map(s => {
        if (s.category === category && s.filename === filename) {
          return { ...s, star: data.star };
        }
        return s;
      }));

      if (viewedSkill && viewedSkill.category === category && viewedSkill.filename === filename) {
        setViewedSkill(prev => ({ ...prev, star: data.star }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 获取垃圾桶里的 Skill 列表
  const fetchTrashSkills = async () => {
    try {
      const res = await fetch('/api/trash');
      if (!res.ok) throw new Error('获取垃圾桶数据失败');
      const data = await res.json();
      setTrashSkills(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // 从垃圾桶恢复 Skill
  const handleRestoreSkill = async (category, filename) => {
    try {
      const res = await fetch(`/api/trash/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '恢复失败');
      
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 彻底删除 (移入 Windows 回收站)
  const handlePermanentDelete = async () => {
    if (!selectedTrashSkill) return;
    const { category, filename } = selectedTrashSkill;
    try {
      const res = await fetch(`/api/trash/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/permanent`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '彻底删除失败');
      
      setIsDeleteConfirmOpen(false);
      setSelectedTrashSkill(null);
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 清空垃圾桶 (全部移入 Windows 回收站)
  const handleEmptyTrash = async () => {
    try {
      const res = await fetch('/api/trash/empty', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '清空垃圾桶失败');
      
      setIsEmptyTrashConfirmOpen(false);
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 退出编辑器未保存警告拦截
  const handleCloseEditor = () => {
    if (saveStatus === 'dirty' || saveStatus === 'saving') {
      setIsUnsavedConfirmOpen(true);
    } else {
      setIsEditOpen(false);
    }
  };

  // 监听编辑内容以防抖触发自动保存
  useEffect(() => {
    if (isEditOpen && !currentSkill.isNew) {
      setSaveStatus('dirty');
      
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        performAutoSave();
      }, 5000);
    } else if (isEditOpen && currentSkill.isNew) {
      setSaveStatus('saved');
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentSkill.content, currentSkill.title, currentSkill.category, currentSkill.description, currentSkill.tags]);

  // 初始化获取数据与主题读取
  useEffect(() => {
    fetchConfig(true);
    fetchSkills();
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
  }, []);

  // 切换日夜模式主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
  };

  // 当查看弹窗内容更新时，触发代码高亮
  useEffect(() => {
    if (isViewOpen || isEditOpen) {
      Prism.highlightAll();
    }
  }, [isViewOpen, isEditOpen, viewedSkill, currentSkill.content]);

  // 监听 Ctrl+S 键盘快捷键以在编辑模态框中一键保存
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditOpen) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSaveSkill(e);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditOpen, currentSkill]);

  // 获取后端配置路径
  const fetchConfig = async (autoShow = false) => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('获取配置路径失败');
      const data = await res.json();
      setSkillsDir(data.skillsDir);
      setTempPath(data.skillsDir);
      setIsCustomConfiguredServer(!!data.isCustomConfigured);
      
      if (autoShow && !data.isCustomConfigured && !localStorage.getItem('hasSeenPathSetup')) {
        setIsSettingsOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 获取技能卡片列表
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('获取数据失败');
      const data = await res.json();
      setSkills(data);
      setError(null);
      fetchTrashSkills(); // 静默同步垃圾桶列表计数与状态
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 保存路径设置
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillsDir: tempPath })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存路径失败');
      
      setSkillsDir(data.skillsDir);
      setIsSettingsOpen(false);
      setIsCustomConfiguredServer(true);
      localStorage.setItem('hasSeenPathSetup', 'true');
      // 热切换后重新读取文件列表
      fetchSkills();
    } catch (err) {
      alert(`保存失败: ${err.message}`);
    }
  };

  // 保存 Skill (新建或修改)
  const handleSaveSkill = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!currentSkill.title.trim() || !currentSkill.content.trim()) {
      alert('标题和正文不能为空');
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const tagsArray = currentSkill.tags
      ? currentSkill.tags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: currentSkill.title.trim(),
      category: currentSkill.category.trim() || '未分类',
      description: currentSkill.description.trim(),
      tags: tagsArray,
      content: currentSkill.content,
      star: !!currentSkill.star
    };

    const url = currentSkill.isNew 
      ? '/api/skills' 
      : `/api/skills/${encodeURIComponent(currentSkill.oldCategory)}/${encodeURIComponent(currentSkill.filename)}`;
    
    const method = currentSkill.isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存 Skill 失败');

      setSaveStatus('saved');
      setIsEditOpen(false);
      setIsUnsavedConfirmOpen(false);
      fetchSkills();
      
      // 如果当前正在查看，更新查看数据
      if (isViewOpen && viewedSkill && viewedSkill.filename === currentSkill.filename) {
        handleViewSkill(data.category, data.filename);
      }
    } catch (err) {
      alert(`保存失败: ${err.message}`);
    }
  };

  // 查看单个 Skill 详情
  const handleViewSkill = async (category, filename) => {
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('获取详情失败');
      const data = await res.json();
      setViewedSkill(data);
      setIsViewOpen(true);
      setIsShareMenuOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // 软删除 (移入垃圾桶)
  const handleSoftDelete = async () => {
    if (!selectedSoftDeleteSkill) return;
    const { category, filename } = selectedSoftDeleteSkill;
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '移入垃圾桶失败');
      }
      setIsSoftDeleteConfirmOpen(false);
      setSelectedSoftDeleteSkill(null);
      setIsViewOpen(false);
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 触发新建 Skill 弹窗
  const handleNewSkillClick = () => {
    setCurrentSkill({
      title: '',
      category: (selectedCategory === '全部' || selectedCategory === 'starred') ? '' : selectedCategory,
      description: '',
      tags: '',
      content: '# 新建技能\n\n在此输入你的 Markdown 技能详情。支持代码块、表格、引言等语法！\n\n```javascript\nconsole.log("Hello Skill!");\n```',
      filename: '',
      isNew: true,
      star: false
    });
    setIsEditOpen(true);
  };

  // 触发编辑现有的 Skill 弹窗
  const handleEditSkillClick = (skill) => {
    setCurrentSkill({
      title: skill.title,
      category: skill.category,
      description: skill.description,
      tags: skill.tags.join(', '),
      content: skill.content,
      filename: skill.filename,
      oldCategory: skill.category, // 保存旧的分类用于 PUT 请求
      isNew: false,
      star: !!skill.star
    });
    setIsViewOpen(false);
    setIsEditOpen(true);
  };

  // ----------------- 分享与导出功能 -----------------

  // 导出单文件精美 HTML
  const handleExportHtml = () => {
    if (!viewedSkill) return;
    const contentHtml = marked(viewedSkill.content);
    const htmlTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${viewedSkill.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #ffffff;
      color: #1f2937;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 40px 24px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .header {
      margin-bottom: 30px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 24px;
    }
    .title {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #6b7280;
    }
    .category {
      color: #111827;
      border: 1px solid #e5e7eb;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .tag {
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .desc {
      font-style: italic;
      color: #6b7280;
      margin-top: 16px;
      border-left: 2px solid #e5e7eb;
      padding-left: 10px;
    }
    /* Markdown 元素 */
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; color: #111827; margin-top: 28px; margin-bottom: 14px; }
    h1 { font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h2 { font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    h3 { font-size: 16px; }
    p { margin-bottom: 16px; }
    blockquote {
      border-left: 3px solid #111827;
      background: #f9fafb;
      padding: 12px 20px;
      border-radius: 0 4px 4px 0;
      color: #6b7280;
      margin: 20px 0;
    }
    pre {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 20px 0;
    }
    code { font-family: monospace; font-size: 12px; background: #f3f4f6; padding: 2px 5px; border-radius: 3px; color: #1f2937; }
    pre code { background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; }
    th { background: #f9fafb; text-align: left; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${viewedSkill.title}</div>
    <div class="meta">
      分类：<span class="category">${viewedSkill.category}</span>
      ${viewedSkill.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
    ${viewedSkill.description ? `<div class="desc">${viewedSkill.description}</div>` : ''}
  </div>
  <div class="content">${contentHtml}</div>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${viewedSkill.title}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setIsShareMenuOpen(false);
  };

  // 生成分享卡片图片 (PNG)
  const handleGenerateImage = () => {
    if (!viewedSkill || !shareCardRef.current) return;
    
    // 动态添加 loading 提示以增强交互感
    const originalText = document.getElementById('share-btn-text');
    if (originalText) originalText.innerText = '生成中...';

    html2canvas(shareCardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高导出质量，防止模糊
      useCORS: true,
      logging: false
    }).then(canvas => {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${viewedSkill.title}_分享海报.png`;
      link.click();
      
      if (originalText) originalText.innerText = '生成图片卡片';
      setIsShareMenuOpen(false);
    }).catch(err => {
      alert(`海报生成失败: ${err.message}`);
      if (originalText) originalText.innerText = '生成图片卡片';
    });
  };

  // 一键复制 Markdown 全文本
  const handleCopyMarkdown = () => {
    if (!viewedSkill) return;
    
    // 构建原生的 Markdown + Front Matter
    const yamlString = `---\ntitle: "${viewedSkill.title}"\ncategory: "${viewedSkill.category}"\ndescription: "${viewedSkill.description}"\ntags: ${JSON.stringify(viewedSkill.tags)}\n---\n\n${viewedSkill.content}`;
    
    navigator.clipboard.writeText(yamlString).then(() => {
      alert('Markdown 文本已成功复制到剪贴板！');
      setIsShareMenuOpen(false);
    }).catch(err => {
      alert(`复制失败: ${err.message}`);
    });
  };

  // ----------------- 数据聚合与辅助函数 -----------------

  // 自动提取 Markdown 的 H1, H2, H3 标题作为目录树大纲
  const generateToc = (content) => {
    if (!content) return [];
    const lines = content.split('\n');
    const toc = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        toc.push({ level, text });
      }
    });
    return toc;
  };

  // 点击大纲项实现平滑锚点跳转
  const handleTocClick = (text) => {
    const viewerScroll = document.querySelector('.viewer-scroll-area');
    if (!viewerScroll) return;
    const headers = viewerScroll.querySelectorAll('h1, h2, h3');
    for (const header of headers) {
      if (header.textContent.trim() === text) {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  // 计算分类统计
  const categoriesCount = skills.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  // 计算标签云统计
  const tagsCount = skills.reduce((acc, curr) => {
    curr.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  // 计算相关推荐技能 (3 篇)
  const relatedSkills = React.useMemo(() => {
    if (!viewedSkill) return [];
    
    const otherSkills = skills.filter(s => 
      !(s.filename === viewedSkill.filename && s.category === viewedSkill.category)
    );
    
    const currentTags = viewedSkill.tags || [];
    const scoredSkills = otherSkills.map(s => {
      const sTags = s.tags || [];
      const intersection = sTags.filter(tag => currentTags.includes(tag));
      const categoryScore = s.category === viewedSkill.category ? 0.5 : 0;
      const score = intersection.length + categoryScore;
      return { skill: s, score };
    });
    
    return scoredSkills
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.skill);
  }, [viewedSkill, skills]);

  // 过滤并排序符合条件的卡片列表
  const filteredSkills = skills
    .filter(skill => {
      // 搜索词过滤
      const matchesSearch = 
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        
      // 分类/星标过滤
      const matchesCategory = 
        selectedCategory === '全部' || 
        (selectedCategory === 'starred' ? skill.star : skill.category === selectedCategory);
      
      // 标签多选过滤 (交集过滤)
      const matchesTag = selectedTags.length === 0 || selectedTags.every(tag => skill.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortKey === 'updatedAt-desc') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortKey === 'updatedAt-asc') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      if (sortKey === 'title-asc') {
        return a.title.localeCompare(b.title, 'zh');
      }
      if (sortKey === 'title-desc') {
        return b.title.localeCompare(a.title, 'zh');
      }
      return 0;
    });

  // 过滤并排序垃圾桶卡片列表
  const filteredTrashSkills = React.useMemo(() => {
    return trashSkills.filter(skill => {
      const matchesSearch = 
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [trashSkills, searchQuery]);

  const displaySkills = selectedCategory === 'trash' ? filteredTrashSkills : filteredSkills;

  return (
    <div 
      className="app-container" 
      style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', overflow: 'hidden' }}
      onDragOver={handleDragOver}
    >
      {dragOver && (
        <div 
          className="drag-overlay" 
          onDragLeave={handleDragLeave} 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
        >
          <div className="drag-overlay-box">
            <DownloadIcon />
            <p>放开鼠标，将 Skill 文件导入到 SkillVault</p>
          </div>
        </div>
      )}
      {/* SkillVault 极窄导航栏 (72px) */}
      <aside className="sidebar-narrow">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div 
            className="sidebar-brand" 
            onClick={() => { 
              setSelectedCategory('全部'); 
              setSelectedTags([]); 
              setSearchQuery(''); 
            }}
            title="重置全部筛选"
          >
            SV
          </div>
          
          <div className="sidebar-menu">
            <div 
              className={`sidebar-item ${(selectedCategory === '全部' && selectedTags.length === 0 && !searchQuery) ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('全部');
                setSelectedTags([]);
                setSearchQuery('');
              }}
              data-tooltip="主页"
            >
              <HomeIcon />
            </div>
            <div 
              className={`sidebar-item ${isFilterPanelOpen ? 'active' : ''}`}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              data-tooltip={isFilterPanelOpen ? "收起筛选栏" : "展开筛选栏"}
            >
              <TagIcon />
            </div>
            <div 
              className="sidebar-item"
              onClick={handleNewSkillClick}
              data-tooltip="新建技能"
            >
              <PlusIcon />
            </div>
            <div 
              className="sidebar-item"
              onClick={() => { setIsSettingsOpen(true); fetchConfig(); }}
              data-tooltip="工作路径"
            >
              <SettingsIcon />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div 
            className="sidebar-item"
            onClick={toggleTheme}
            data-tooltip={theme === 'light' ? "深色模式" : "浅色模式"}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </div>

          <div 
            className="sidebar-item"
            onClick={() => alert('SkillVault - 私人技能管理平台\n双击 run.bat 运行，支持热重载和路径热切换。')}
            data-tooltip="关于说明"
          >
            <HelpIcon />
          </div>
        </div>
      </aside>

      {/* 侧边常驻/折叠过滤器面板 */}
      {isFilterPanelOpen && (
        <aside className="sidebar-filter-panel">
          <div className="filter-panel-section">
            <h3 className="filter-section-title">分类目录</h3>
            <ul className="filter-list">
              <li 
                className={`filter-item ${selectedCategory === '全部' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('全部')}
              >
                <span className="filter-item-name">全部技能</span>
                <span className="filter-item-count">{skills.length}</span>
              </li>
              <li 
                className={`filter-item ${selectedCategory === 'starred' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('starred')}
                style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px', marginBottom: '6px' }}
              >
                <span className="filter-item-name">⭐ 我的收藏</span>
                <span className="filter-item-count">{skills.filter(s => s.star).length}</span>
              </li>
              {Object.entries(categoriesCount).map(([name, count]) => (
                <li 
                  key={name}
                  className={`filter-item ${selectedCategory === name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(name)}
                >
                  <span className="filter-item-name">{name}</span>
                  <span className="filter-item-count">{count}</span>
                </li>
              ))}
              <li 
                className={`filter-item ${selectedCategory === 'trash' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('trash')}
                style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '10px' }}
              >
                <span className="filter-item-name">🗑️ 垃圾桶</span>
                <span className="filter-item-count">{trashSkills.length}</span>
              </li>
            </ul>
          </div>

          <div className="filter-panel-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="filter-section-title" style={{ marginBottom: 0 }}>标签过滤</h3>
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => setSelectedTags([])}
                  style={{ fontSize: '11px', color: 'var(--text-weak)', textDecoration: 'underline' }}
                >
                  清除
                </button>
              )}
            </div>
            
            <div className="tag-cloud-sidebar">
              {Object.entries(tagsCount).map(([name, count]) => {
                const isSelected = selectedTags.includes(name);
                return (
                  <span 
                    key={name}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter(t => t !== name));
                      } else {
                        setSelectedTags([...selectedTags, name]);
                      }
                    }}
                    className={`tag-pill-sidebar ${isSelected ? 'active' : ''}`}
                  >
                    #{name} <span className="tag-count-tiny">{count}</span>
                  </span>
                );
              })}
              {Object.keys(tagsCount).length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-weak)' }}>暂无标签</span>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* 主工作区 */}
      <main className="main-content">
        {/* 一体化紧凑顶栏 */}
        <header className="vault-header">
          <div className="vault-brand">
            <div className="vault-logo-icon">SV</div>
            <h1 className="vault-title">SkillVault</h1>
          </div>

          <div className="vault-header-actions">
            {/* 一键清空垃圾桶 (垃圾桶专有) */}
            {selectedCategory === 'trash' && trashSkills.length > 0 && (
              <button 
                onClick={() => setIsEmptyTrashConfirmOpen(true)}
                className="btn btn-danger btn-empty-trash"
                style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}
              >
                🗑️ 清空垃圾桶
              </button>
            )}

            {/* 紧凑型搜索框 */}
            <div className="lovart-search-wrap">
              <span className="lovart-search-icon"><SearchIcon /></span>
              <input 
                type="text" 
                placeholder="查找技能、标签或描述..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="lovart-search-input"
              />
              <div className="lovart-search-actions">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ color: 'var(--text-weak)', fontSize: '13px', padding: '0 8px', display: 'flex', alignItems: 'center' }}
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
                <button className="lovart-search-btn">
                  <ArrowUpIcon />
                </button>
              </div>
            </div>

            {/* 排序选择 */}
            <select 
              className="sort-select-lovart"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="updatedAt-desc">最近修改优先</option>
              <option value="updatedAt-asc">最早修改优先</option>
              <option value="title-asc">标题 A-Z</option>
              <option value="title-desc">标题 Z-A</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
            <p>正在努力扫描并加载本地 Skill 文件...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><AlertIcon /></span>
            <p>加载本地文件出错: {error}</p>
            <button className="btn btn-primary" onClick={fetchSkills}>重新尝试</button>
          </div>
        ) : (
          <>
            {/* 活动过滤器与排序栏 */}
            <div className="active-filters-wrap">
              <div className="filter-badge-list">
                {(selectedCategory !== '全部' || selectedTags.length > 0 || searchQuery) ? (
                  <>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>当前筛选：</span>
                    {selectedCategory !== '全部' && (
                      <span className="filter-badge-item">
                        分类: {selectedCategory}
                        <span className="filter-badge-close" onClick={() => setSelectedCategory('全部')}><CloseIcon size={10} /></span>
                      </span>
                    )}
                    {selectedTags.map(tag => (
                      <span key={tag} className="filter-badge-item">
                        #{tag}
                        <span className="filter-badge-close" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}><CloseIcon size={10} /></span>
                      </span>
                    ))}
                    {searchQuery && (
                      <span className="filter-badge-item">
                        搜索: "{searchQuery}"
                        <span className="filter-badge-close" onClick={() => setSearchQuery('')}><CloseIcon size={10} /></span>
                      </span>
                    )}
                    <span className="clear-all-link" onClick={() => {
                      setSelectedCategory('全部');
                      setSelectedTags([]);
                      setSearchQuery('');
                    }}>
                      清除全部
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-weak)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                    我的技能卡片
                  </span>
                )}
              </div>
            </div>

            {/* 卡片网格 */}
            <h2 className="grid-section-title">
              {selectedCategory === 'trash' ? '垃圾桶项目 (双击恢复或彻底移入系统回收站)' : '最近项目'}
            </h2>
            <div className="lovart-grid">
              {/* 新建项目卡片盒 (在垃圾桶下屏蔽) */}
              {selectedCategory !== 'trash' && (
                <div className="lovart-card-group">
                  <div className="lovart-new-card-box" onClick={handleNewSkillClick}>
                    <span className="lovart-new-icon" style={{ display: 'flex', alignItems: 'center' }}><PlusIcon size={24} /></span>
                    <span className="lovart-new-text">新建项目</span>
                  </div>
                </div>
              )}

              {/* 卡片列表 */}
              {displaySkills.map(skill => {
                const cleanContent = skill.description || (selectedCategory === 'trash'
                  ? '此项目在垃圾桶中。请在卡片右下角点击恢复图标恢复后再阅读。'
                  : '无项目描述。点击标题以进入沉浸式阅读，开始整理并完善此技能包。');
                
                return (
                  <div key={`${skill.category}-${skill.filename}`} className="lovart-card-group">
                    {/* 卡片实体 (大圆角无边框浅灰色块) */}
                    <div 
                      className={`lovart-card-box ${selectedCategory === 'trash' ? 'in-trash' : ''}`} 
                      onClick={() => {
                        if (selectedCategory === 'trash') {
                          alert("此技能包当前在垃圾桶中。请点击卡片右下角恢复图标恢复后再开始阅读！");
                          return;
                        }
                        handleViewSkill(skill.category, skill.filename);
                      }}
                    >
                      <span className="lovart-card-badge">{skill.category}</span>
                      
                      {/* 收藏按钮 (垃圾桶下屏蔽) */}
                      {selectedCategory !== 'trash' && (
                        <button 
                          className={`lovart-card-star ${skill.star ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(skill.category, skill.filename, skill.star);
                          }}
                          title={skill.star ? "取消收藏" : "加入收藏"}
                        >
                          <StarIcon filled={skill.star} />
                        </button>
                      )}

                      {/* 精美纯净内容缩略预览 */}
                      <div className="lovart-card-preview">
                        {cleanContent}
                      </div>

                      {/* 鼠标悬浮才浮现的操作栏 */}
                      <div className="lovart-card-actions" onClick={(e) => e.stopPropagation()}>
                        {selectedCategory === 'trash' ? (
                          <>
                            <button 
                              onClick={() => handleRestoreSkill(skill.category, skill.filename)} 
                              className="lovart-action-icon text-restore"
                              title="恢复到原分类"
                            >
                              <RotateCcwIcon />
                            </button>
                            <button 
                              onClick={() => { setSelectedTrashSkill(skill); setIsDeleteConfirmOpen(true); }} 
                              className="lovart-action-icon text-danger"
                              title="彻底删除"
                            >
                              <TrashIcon />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleViewSkill(skill.category, skill.filename)} 
                              className="lovart-action-icon"
                              title="查看详情"
                            >
                              <EyeIcon />
                            </button>
                            <button 
                              onClick={() => {
                                fetch(`/api/skills/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.filename)}`)
                                  .then(res => res.json())
                                  .then(data => handleEditSkillClick(data));
                              }} 
                              className="lovart-action-icon"
                              title="编辑"
                            >
                              <EditIcon />
                            </button>
                            <a 
                              href={`/api/skills/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.filename)}/download`}
                              className="lovart-action-icon"
                              title="下载"
                              download
                            >
                              <DownloadIcon />
                            </a>
                            <button 
                              onClick={() => { setSelectedSoftDeleteSkill(skill); setIsSoftDeleteConfirmOpen(true); }} 
                              className="lovart-action-icon"
                              title="删除"
                            >
                              <TrashIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 外置的标题与元数据 (画廊版式精髓) */}
                    <div className="lovart-card-meta">
                      <div 
                        className="lovart-card-title"
                        onClick={() => {
                          if (selectedCategory === 'trash') {
                            alert("此技能包当前在垃圾桶中。请点击卡片右下角恢复图标恢复后再开始阅读！");
                            return;
                          }
                          handleViewSkill(skill.category, skill.filename);
                        }}
                      >
                        {skill.title}
                      </div>
                      <div className="lovart-card-desc">
                        {skill.tags.map(t => `#${t}`).join(' ') || '#无标签'}
                      </div>
                      <div className="lovart-card-date">
                        {selectedCategory === 'trash'
                          ? `移入垃圾桶于 ${new Date(skill.updatedAt).toLocaleDateString()}`
                          : `修改于 ${new Date(skill.updatedAt).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>
                );
              })}

              {displaySkills.length === 0 && skills.length > 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>没有找到符合当前过滤条件的 Skill 文件。</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 1. 设置工作路径弹窗 (Settings Modal) */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">系统路径与共享设置</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}><CloseIcon /></button>
            </div>
            <form onSubmit={handleSaveConfig}>
              <div className="modal-body">
                {!isCustomConfiguredServer && (
                  <div className="onboarding-banner">
                    <span className="onboarding-banner-icon">💡</span>
                    <div className="onboarding-banner-text">
                      <strong>首次使用配置引导</strong>：系统当前正在使用默认内置的 <code>skills</code> 目录。建议在此指定您个人常用的本地文档存放路径（如：<code>D:\MySkills</code>），即可立即将已有的 MD 技能卡片同步读取进来！
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>本地 Markdown 文件夹绝对路径</label>
                  <input 
                    type="text" 
                    value={tempPath}
                    onChange={(e) => setTempPath(e.target.value)}
                    className="form-control-full"
                    placeholder="例如: D:\MySkills"
                    required
                  />
                  <p className="setting-tip">
                    * 默认路径为您项目工作区目录下的 <strong>skills</strong> 文件夹。
                    您可在此指定任何电脑里的绝对路径。保存后，系统会热重载并同步读取该文件夹下的所有 markdown。
                  </p>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-active)' }}>📶 局域网分享状态</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    本平台已开启局域网广播。局域网内的其它设备（如同局域网下的手机或平板）可以直接访问您的局域网 IP:3000 进行实时查看与共享。您可以在启动的 CMD 控制台中看到具体的局域网访问地址。
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}>取消</button>
                <button type="submit" className="btn btn-primary">保存并重载目录</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 添加与编辑弹窗 (Modal) */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-immersive">
            <div className="modal-header">
              <h3 className="modal-title">{currentSkill.isNew ? '新增技能包 (Skill)' : '编辑技能包 (Skill)'}</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={handleCloseEditor}><CloseIcon /></button>
            </div>
            
            <div className="editor-immersive-layout">
              {/* 左侧属性配置面板 */}
              <aside className="editor-settings-sidebar">
                <div className="sidebar-form-container">
                  <h4 className="sidebar-section-title">📁 基础配置</h4>
                  
                  <div className="form-group">
                    <label>技能标题</label>
                    <input 
                      type="text" 
                      value={currentSkill.title}
                      onChange={(e) => setCurrentSkill({...currentSkill, title: e.target.value})}
                      placeholder="输入技能标题 (作为文件名)"
                      className="form-control-full"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>分类 (子文件夹)</label>
                    <input 
                      type="text" 
                      value={currentSkill.category}
                      onChange={(e) => setCurrentSkill({...currentSkill, category: e.target.value})}
                      placeholder="例如: 前端、Python、未分类"
                      className="form-control-full"
                      list="categories-datalist"
                    />
                    <datalist id="categories-datalist">
                      {Object.keys(categoriesCount).map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>标签 (空格或逗号分隔)</label>
                    <input 
                      type="text" 
                      value={currentSkill.tags}
                      onChange={(e) => setCurrentSkill({...currentSkill, tags: e.target.value})}
                      placeholder="标签1, 标签2"
                      className="form-control-full"
                    />
                  </div>

                  <div className="form-group">
                    <label>一句话简介 (卡片描述)</label>
                    <textarea 
                      value={currentSkill.description}
                      onChange={(e) => setCurrentSkill({...currentSkill, description: e.target.value})}
                      placeholder="极简描述该技能包，方便在卡片列表中预览"
                      className="form-control-full editor-sidebar-desc"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="sidebar-status-container">
                  {/* 快捷键说明 */}
                  <div className="shortcut-hint-card">
                    <h5 className="hint-card-title">💡 快捷提示</h5>
                    <ul className="hint-list">
                      <li><strong>Ctrl + S</strong>：保存当前修改</li>
                      <li><strong>自动保存</strong>：停止输入5秒后自动同步</li>
                      <li><strong>拖拽导入</strong>：支持拖入.md文件</li>
                    </ul>
                  </div>

                  {/* 状态呼吸灯 */}
                  <div className="editor-status-lamp-wrapper">
                    {!currentSkill.isNew && saveStatus === 'saved' && (
                      <span className="auto-save-indicator saved">
                        <span className="indicator-dot saved-dot"></span>
                        已同步保存到物理 md
                      </span>
                    )}
                    {!currentSkill.isNew && saveStatus === 'dirty' && (
                      <span className="auto-save-indicator dirty">
                        <span className="indicator-dot dirty-dot"></span>
                        检测到修改，5秒后保存
                      </span>
                    )}
                    {!currentSkill.isNew && saveStatus === 'saving' && (
                      <span className="auto-save-indicator saving">
                        <span className="indicator-dot saving-dot"></span>
                        正在无感保存...
                      </span>
                    )}
                    {currentSkill.isNew && (
                      <span className="auto-save-indicator new-mode">
                        ✨ 新建模式 (保存后开启同步)
                      </span>
                    )}
                  </div>
                </div>
              </aside>

              {/* 右侧写作与预览工作区 */}
              <div className="editor-workspace-main">
                <div className="editor-workspace-header">
                  <h4 className="editor-workspace-title">📝 正文编写区</h4>
                  
                  {/* Markdown 格式化工具栏 */}
                  <div className="editor-toolbar">
                    <button className="toolbar-btn" onClick={() => insertMarkdown('bold')} title="加粗" type="button"><BoldIcon /> 加粗</button>
                    <button className="toolbar-btn" onClick={() => insertMarkdown('italic')} title="斜体" type="button"><ItalicIcon /> 斜体</button>
                    <button className="toolbar-btn" onClick={() => insertMarkdown('code')} title="代码块" type="button"><CodeBlockIcon /> 代码块</button>
                    <button className="toolbar-btn" onClick={() => insertMarkdown('link')} title="链接" type="button"><LinkIcon /> 链接</button>
                    <button className="toolbar-btn" onClick={() => insertMarkdown('table')} title="表格" type="button"><TableIcon /> 表格</button>
                  </div>
                </div>

                <div className="editor-wrapper">
                  <div className="editor-pane">
                    <div className="pane-header">
                      <span>MARKDOWN 源码</span>
                    </div>
                    <textarea 
                      ref={editorTextareaRef}
                      onScroll={handleEditorScroll}
                      className="editor-textarea"
                      value={currentSkill.content}
                      onChange={(e) => setCurrentSkill({...currentSkill, content: e.target.value})}
                      placeholder="# 请在此输入 Markdown 格式内容..."
                    />
                  </div>
                  
                  <div className="preview-pane">
                    <div className="pane-header">
                      <span>实时预览</span>
                    </div>
                    <div className="preview-body markdown-body" ref={previewBodyRef}>
                      <div dangerouslySetInnerHTML={{ __html: marked(currentSkill.content) }}></div>
                    </div>
                  </div>
                </div>

                {/* 底部操作区 */}
                <div className="editor-workspace-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseEditor}>取消</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveSkill}>保存修改</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 沉浸式查看弹窗 (Modal) */}
      {isViewOpen && viewedSkill && (
        <div className="modal-overlay" onClick={() => setIsViewOpen(false)}>
          <div className="modal-content modal-immersive" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">阅读技能卡片</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* 收藏按钮 */}
                <button 
                  className={`btn btn-secondary reader-star-btn ${viewedSkill.star ? 'starred' : ''}`}
                  onClick={() => toggleStar(viewedSkill.category, viewedSkill.filename, viewedSkill.star)}
                  title={viewedSkill.star ? "取消收藏" : "加入收藏"}
                >
                  <StarIcon filled={viewedSkill.star} size={14} /> {viewedSkill.star ? '已收藏' : '收藏'}
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleEditSkillClick(viewedSkill)}
                >
                  <EditIcon /> 编辑此篇
                </button>
                
                {/* 分享下拉选项 */}
                <div className="share-dropdown-container">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  >
                    分享 / 导出 ▾
                  </button>
                  {isShareMenuOpen && (
                    <div className="dropdown-menu">
                      <button className="dropdown-item" onClick={handleGenerateImage}>
                        <span id="share-btn-text">生成图片卡片</span>
                      </button>
                      <button className="dropdown-item" onClick={handleExportHtml}>
                        导出独立 HTML
                      </button>
                      <button className="dropdown-item" onClick={handleCopyMarkdown}>
                        复制 MD 源码
                      </button>
                    </div>
                  )}
                </div>

                <a 
                  href={`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}/download`}
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', color: 'var(--text-main)' }}
                  download
                >
                  <DownloadIcon /> 下载 md
                </a>
                
                <button className="modal-close-btn" style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }} onClick={() => setIsViewOpen(false)}><CloseIcon /></button>
              </div>
            </div>
            
            <div className="modal-body">
              {/* 用于导出的完整容器 */}
              <div className="viewer-wrapper">
                {/* 左侧大纲 TOC 导航 */}
                <div className="viewer-toc">
                  <div className="toc-title">目录导航</div>
                  {generateToc(viewedSkill.content).length > 0 ? (
                    <ul className="toc-list">
                      {generateToc(viewedSkill.content).map((item, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => handleTocClick(item.text)}
                          className={`toc-item toc-h${item.level}`}
                        >
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-weak)', fontWeight: 500 }}>无段落标题</span>
                  )}
                </div>

                {/* 右侧正文 */}
                <div className="viewer-main" ref={shareCardRef}>
                  <div className="viewer-header-info">
                    <h1 className="viewer-title">{viewedSkill.title}</h1>
                    <div className="viewer-meta">
                      分类：<span className="card-category" style={{ padding: '4px 10px', fontSize: '12px' }}>{viewedSkill.category}</span>
                      {viewedSkill.tags.map(t => (
                        <span key={t} className="viewer-tag">#{t}</span>
                      ))}
                    </div>
                    {viewedSkill.description && (
                      <p style={{ marginTop: '16px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px', borderLeft: '3px solid var(--border-color)', paddingLeft: '12px' }}>
                        {viewedSkill.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="viewer-scroll-area">
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked(viewedSkill.content) }}></div>
                    
                    {/* 关联技能推荐 */}
                    {relatedSkills.length > 0 && (
                      <div className="related-skills-section">
                        <h3 className="related-title">相关技能推荐</h3>
                        <div className="related-grid">
                          {relatedSkills.map(skill => (
                            <div 
                              key={`${skill.category}-${skill.filename}`} 
                              className="related-card" 
                              onClick={() => handleViewSkill(skill.category, skill.filename)}
                            >
                              <div className="related-card-category">{skill.category}</div>
                              <h4 className="related-card-title">{skill.title}</h4>
                              <p className="related-card-desc">{skill.description || '点击阅读此技能包。'}</p>
                              <div className="related-card-tags">
                                {skill.tags.map(t => (
                                  <span key={t} className="related-tag">#{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 移入垃圾桶（软删除）二次确认弹窗 */}
      {isSoftDeleteConfirmOpen && selectedSoftDeleteSkill && (
        <div className="modal-overlay" onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}>
          <div className="modal-content modal-standard modal-confirm-warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header header-warning">
              <h3 className="modal-title">🗑️ 移入垃圾桶确认</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}><CloseIcon /></button>
            </div>
            <div className="modal-body text-center">
              <div className="warning-icon-box">🗑️</div>
              <h4 className="warning-item-title">确定要将 "{selectedSoftDeleteSkill.title}" 移入垃圾桶吗？</h4>
              <p className="warning-text">
                移入垃圾桶后，该技能包不会被立刻抹除，您随时可以通过左侧栏的 <strong>🗑️ 垃圾桶</strong> 进行恢复。
              </p>
            </div>
            <div className="modal-footer footer-warning">
              <button className="btn btn-secondary" onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}>取消</button>
              <button className="btn btn-primary" onClick={handleSoftDelete}>
                确认移入垃圾桶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 彻底删除二次确认弹窗 (Delete Confirm Modal) */}
      {isDeleteConfirmOpen && selectedTrashSkill && (
        <div className="modal-overlay" onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}>
          <div className="modal-content modal-standard modal-confirm-warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header header-warning">
              <h3 className="modal-title text-danger">⚠️ 安全删除确认</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}><CloseIcon /></button>
            </div>
            <div className="modal-body text-center">
              <div className="warning-icon-box danger-animate">🚨</div>
              <h4 className="warning-item-title">确定要彻底删除 "{selectedTrashSkill.title}" 吗？</h4>
              <p className="warning-text">
                该技能包将被物理移送至 <strong>Windows 系统回收站</strong>。
                您可以随时在电脑桌面的回收站中找到并还原它，但 SkillVault 将无法再检索该技能包。
              </p>
            </div>
            <div className="modal-footer footer-warning">
              <button className="btn btn-secondary" onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}>取消</button>
              <button className="btn btn-danger btn-confirm-delete" onClick={handlePermanentDelete}>
                移至系统回收站
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 清空垃圾桶二次确认弹窗 (Empty Trash Confirm Modal) */}
      {isEmptyTrashConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsEmptyTrashConfirmOpen(false)}>
          <div className="modal-content modal-standard modal-confirm-warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header header-warning">
              <h3 className="modal-title text-danger">⚠️ 警告：清空垃圾桶确认</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => setIsEmptyTrashConfirmOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body text-center">
              <div className="warning-icon-box danger-animate">⚠️</div>
              <h4 className="warning-item-title">确定要清空垃圾桶内所有技能包吗？</h4>
              <p className="warning-text">
                垃圾桶内共有 <strong>{trashSkills.length}</strong> 个技能包。
                一键清空将把所有这些文件批量投入 <strong>Windows 系统回收站</strong>。
                此动作会移出 SkillVault 的暂存空间，请您再次确认是否继续？
              </p>
            </div>
            <div className="modal-footer footer-warning">
              <button className="btn btn-secondary" onClick={() => setIsEmptyTrashConfirmOpen(false)}>取消</button>
              <button className="btn btn-danger btn-confirm-delete" onClick={handleEmptyTrash}>
                确认一键清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 未保存退出二次确认弹窗 (Unsaved Changes Modal) */}
      {isUnsavedConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsUnsavedConfirmOpen(false)}>
          <div className="modal-content modal-standard modal-confirm-warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header header-warning">
              <h3 className="modal-title text-danger">⚠️ 未保存的修改</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => setIsUnsavedConfirmOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body text-center">
              <div className="warning-icon-box">📝</div>
              <h4 className="warning-item-title">您对当前技能包做出了修改，但尚未保存</h4>
              <p className="warning-text">
                退出编辑器将丢失这些未保存的修改。请问您要如何处理？
              </p>
            </div>
            <div className="modal-footer footer-warning" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 24px' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsUnsavedConfirmOpen(false)}>继续编辑</button>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => { setIsUnsavedConfirmOpen(false); setIsEditOpen(false); }}>放弃修改退出</button>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleSaveSkill()}>保存修改并退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
