import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';
import html2canvas from 'html2canvas';

// 配置 marked 的基础选项
marked.setOptions({
  gfm: true,
  breaks: true,
});

// 自定义 Markdown 渲染器，支持将 md 或 HTML 图片路径中的 .assets 映射为后台 API 路径
const renderMarkdown = (content) => {
  if (!content) return '';
  let replaced = content.replace(/(!\[.*?\]\()(?:\.\.\/)?\.assets\/(.+?\))/g, '$1/api/assets/$2');
  replaced = replaced.replace(/(<img\s+[^>]*src=["'])(?:\.\.\/)?\.assets\/(.+?["'])/g, '$1/api/assets/$2');
  return marked(replaced);
};

// 极细 1.5px 线条 SVG 图标组件库
const PlusIcon = ({ size = 16 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const SettingsIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

const SearchIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const DownloadIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const TrashIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const SunIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);

const MoonIcon = () => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);

const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8"/><line x1="6" y1="2" x2="6" y2="22"/></svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
);

const CodeBlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="16" y1="3" x2="16" y2="21"/></svg>
);

const StarIcon = ({ filled = false, size = 14 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const RotateCcwIcon = ({ size = 12 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
);

const GridIcon = ({ size = 14 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
);

const ListIcon = ({ size = 14 }) => (
  <svg className="svg-icon" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
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
      title: "SkillVault 简介与 SaaS Minimal 极简美学",
      category: "系统介绍",
      description: "欢迎体验 SkillVault，这是专为开发者设计的 SaaS 风本地 Markdown 技能管理平台。本篇为您介绍本系统的视觉理念和核心功能。",
      tags: ["SaaS", "Design", "Minimalist"],
      filename: "SkillVault-简介与-SaaS-Minimal-极简美学.md",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      star: true,
      content: `# SkillVault 简介与 SaaS Minimal 极简美学\n\n欢迎体验 **SkillVault**。这是一款去数据库设计的本地个人技能管理平台。目前您正在查看的是部署在 GitHub Pages 上的**只读交互演示版本 (Showcase)**。\n\n> ⚠️ **运行限制警告：真实使用必须在本地部署**\n> 由于 SkillVault 的核心功能需要读写您电脑本地磁盘的 \`.md\` 文件夹进行知识持久化，并且彻底删除时对接了 Windows 原生 .NET API 以将文件移入 **Windows 系统回收站**，因此云端网页端**无法直接完成真正的磁盘写入与物理删除**。此线上版本仅作为界面和基本功能的 Mock 演示，您的所有新建、修改、星标与删除动作仅在浏览器内存中临时生效，刷新后复原。本地真实运行只需在项目目录下双击 \`run.bat\` 即可！\n\n## 🎨 SaaS Minimal 视觉美学\n\n本软件的核心视觉风格参考：**GitHub + Linear + Anthropic Console**：\n- **单色极简设计**：浅色背景 \`#FAFAFA\`，卡片白色 \`#FFFFFF\`，边框 \`#E5E7EB\`，主文本 \`#111827\`，副文本 \`#6B7280\`。\n- **1280px 居中对齐**：水平居中单页布局，顶置扁平 Navbar，告别繁重侧边栏，大大提升核心内容的高密度检索与浏览效率。\n- **微浮动与阴影**：卡片圆角固定 \`16px\`，拥有微弱高质感阴影，Hover 上浮 \`2px\`，交互平滑而克制。\n- **高效操作**：卡片上直出 [Copy] (一键复制 Markdown 源码) 与 [Download] (下载) 按钮，响应极速。\n\n## 📂 “文档即数据”\n\n在本地运行时，SkillVault 不需要连接数据库：\n1. 所有技能全部存放在您磁盘里的 \`.md\` 文件夹中；\n2. 星标、标题、标签等元数据直接以 YAML Front Matter 格式写入文件头部；\n3. 通过这种设计，您的知识库是 100% 透明和可移动的。\n\n## 🛡️ 安全双重确认\n\n平台实现了一套完整的安全阻断，防止您在编辑时手抖造成数据丢失：\n- **移入垃圾桶**：剪切移动到隐藏的 \`.trash\` 目录；\n- **彻底删除**：后端直接调用 Windows 系统的 PowerShell COM 组件，将文件原生送进 **Windows 桌面回收站**；\n- **未保存退出拦截**：如果检测到修改，退出编辑器时会进行三合一警告拦截。\n\n> 💡 *提示：在演示模式下，您的所有修改、星标与删除动作仅在浏览器内存中临时生效，刷新后复原，不会修改您的本地磁盘。*`
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
      content: `# Windows PowerShell 系统回收站对接细节\n\n传统的 Node.js \`fs.unlink\` 删除文件是无法撤销的物理抹除，一旦误删会给用户带来不可挽回的损失。\n\n为了给用户提供媲美 Windows 系统原生的安全感，SkillVault 设计了将彻底删除的文件投递至 Windows 桌面回收站的方案。\n\n## 🛠️ PowerShell Native COM 的调用\n\n在 Windows 系统中，我们可以通过 \`Add-Type -AssemblyName Microsoft.VisualBasic\` 导入 .NET 类库，并调用其中的 \`DeleteFile\` 方法，其静态参数 \`SendToRecycleBin\` 可以直接将物理路径投递至系统回收站。\n\n后端使用安全加固的 \`spawn\` 命令，通过 PowerShell 原生参数传递绑定，从根本上防范了命令注入风险。`
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
      content: `# 这是一篇已被软删除的旧草稿\n\n这是为了向您展示 **SkillVault 垃圾桶功能** 的 Mock 数据。\n\n您可以点击右侧的：\n- **还原 ↩️** 按钮：将其从垃圾桶原路放回主列表中；\n- **彻底删除 ❌** 按钮：触发带有 🚨 警示的高级二次确认 Modal。`
    }
  ];

  const originalFetch = window.fetch;

  window.fetch = function(url, options) {
    const urlStr = url.toString();
    const method = (options && options.method || 'GET').toUpperCase();

    const jsonResponse = (data, status = 200) => {
      return Promise.resolve(new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
      }));
    };

    if (urlStr.includes('/api/config') && method === 'GET') {
      return jsonResponse({ skillsDir: 'Vercel 云端演示空间', isCustomConfigured: true });
    }

    if (urlStr.includes('/api/config') && method === 'POST') {
      return jsonResponse({ success: true, skillsDir: 'Vercel 云端演示空间' });
    }

    if (urlStr.includes('/api/skills') && method === 'GET' && !urlStr.includes('/download')) {
      return jsonResponse(mockSkills);
    }

    if (urlStr.includes('/api/skills/') && method === 'GET' && !urlStr.includes('/download') && !urlStr.endsWith('/star') && !urlStr.endsWith('/history')) {
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

    if (urlStr.includes('/api/trash') && method === 'GET') {
      return jsonResponse(mockTrash);
    }

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

    if (urlStr.includes('/api/trash/empty') && method === 'DELETE') {
      mockTrash = [];
      return jsonResponse({ success: true });
    }

    if (urlStr.includes('/download')) {
      alert("演示空间：直接通过浏览器触发 Markdown 下载。");
      return Promise.resolve(new Response(null, { status: 200 }));
    }

    if (urlStr.includes('/history') && method === 'GET') {
      return jsonResponse({ supported: true, history: [] });
    }

    if (urlStr.includes('/api/skills/order') && method === 'POST') {
      const body = JSON.parse(options.body);
      const order = body.order;
      const orderMap = new Map();
      order.forEach((key, idx) => orderMap.set(key, idx));
      mockSkills.sort((a, b) => {
        const keyA = `${a.category}/${a.filename}`;
        const keyB = `${b.category}/${b.filename}`;
        const hasA = orderMap.has(keyA);
        const hasB = orderMap.has(keyB);
        if (hasA && hasB) return orderMap.get(keyA) - orderMap.get(keyB);
        if (hasA) return -1;
        if (hasB) return 1;
        return 0;
      });
      return jsonResponse({ success: true });
    }

    if (urlStr.includes('/api/skills/batch-delete') && method === 'POST') {
      const body = JSON.parse(options.body);
      const items = body.items || [];
      const itemKeys = new Set(items.map(item => `${item.category}/${item.filename}`));
      
      const toTrash = mockSkills.filter(s => itemKeys.has(`${s.category}/${s.filename}`));
      mockSkills = mockSkills.filter(s => !itemKeys.has(`${s.category}/${s.filename}`));
      
      const trashItems = toTrash.map(item => ({
        ...item,
        deletedAt: new Date().toISOString()
      }));
      mockTrash = [...trashItems, ...mockTrash];
      
      return jsonResponse({ success: true, count: items.length });
    }

    if (urlStr.includes('/api/skills/batch-download') && method === 'POST') {
      alert("演示空间限制：已模拟批量 ZIP 导出请求！在真实本地运行中，后端将打包所有物理 .md 文件为 ZIP 流进行流式下载。");
      return Promise.resolve(new Response(null, { status: 200 }));
    }

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
  const [selectedTags, setSelectedTags] = useState([]); 
  const [sortKey, setSortKey] = useState('updatedAt-desc'); 
  const [theme, setTheme] = useState('light'); 
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [dragOver, setDragOver] = useState(false); 
  const [isCustomConfiguredServer, setIsCustomConfiguredServer] = useState(true); 
  const [trashSkills, setTrashSkills] = useState([]); 
  
  // 批量操作状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]); // 存储 "category/filename"
  const [isBatchShareOpen, setIsBatchShareOpen] = useState(false);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  
  // 二次确认 Modals
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); 
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false); 
  const [selectedTrashSkill, setSelectedTrashSkill] = useState(null); 
  const [isSoftDeleteConfirmOpen, setIsSoftDeleteConfirmOpen] = useState(false); 
  const [selectedSoftDeleteSkill, setSelectedSoftDeleteSkill] = useState(null); 
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false); 
  const autoSaveTimerRef = useRef(null); 
  
  // Modals 控制
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
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
  const [activeTocHeader, setActiveTocHeader] = useState('');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // 临时设置路径
  const [tempPath, setTempPath] = useState('');
  
  // Git 版本时光机与备份
  const [backups, setBackups] = useState([]); 
  const [backupLoading, setBackupLoading] = useState(false); 
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false); 
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState(null); 
  
  const [historyList, setHistoryList] = useState([]); 
  const [isHistorySupported, setIsHistorySupported] = useState(true); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
  const [selectedHistoryCommit, setSelectedHistoryCommit] = useState(null); 
  const [historySkillDetail, setHistorySkillDetail] = useState(null); 
  const [isRollbackConfirmOpen, setIsRollbackConfirmOpen] = useState(false); 
  const [rollbackCommitHash, setRollbackCommitHash] = useState(''); 
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('skillvault_view_mode') || 'grid'; 
  });

  const [visibleCount, setVisibleCount] = useState(18);

  useEffect(() => {
    setVisibleCount(18);
  }, [selectedCategory, selectedTags, searchQuery, sortKey]);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('skillvault_view_mode', mode);
  };
  
  // Toast 提示框方法
  const showToast = (msg) => {
    setToastMsg(msg);
  };
  
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);
  
  const shareCardRef = useRef(null);
  const editorTextareaRef = useRef(null); 
  const previewBodyRef = useRef(null); 

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

  // 左右同步滚动
  const handleEditorScroll = (e) => {
    const textarea = e.target;
    const preview = previewBodyRef.current;
    if (!textarea || !preview) return;

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  // 统一 base64 上传与 Markdown 链接插值
  const uploadEditorImage = async (file) => {
    const ext = file.name && file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '.png';
    const baseName = file.name && file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : 'pasted-image';
    const cleanBaseName = baseName.replace(/[\\/:*?"<>|]/g, '-').trim();
    const timestamp = Date.now();
    const uniqueFilename = `${cleanBaseName || 'image'}-${timestamp}${ext}`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uniqueFilename,
            base64Data: base64Data
          })
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '上传图片失败');
        }
        
        const data = await res.json();
        
        const textarea = editorTextareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          
          const isCategorySubdir = currentSkill.category && currentSkill.category !== '未分类';
          const relativeMarkdownPath = isCategorySubdir 
            ? `../.assets/${data.filename}` 
            : `.assets/${data.filename}`;
            
          const imageLink = `![image](${relativeMarkdownPath})`;
          
          const newValue = text.substring(0, start) + imageLink + text.substring(end);
          setCurrentSkill(prev => ({ ...prev, content: newValue }));
          
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageLink.length, start + imageLink.length);
          }, 0);
        }
        setSaveStatus('saved');
        showToast('图片上传成功');
      } catch (err) {
        alert(`媒体上传失败: ${err.message}`);
        setSaveStatus('dirty');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditorDrop = async (e) => {
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    await uploadEditorImage(file);
  };

  const handleEditorPaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let imageFile = null;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        imageFile = item.getAsFile();
        break;
      }
    }
    
    if (imageFile) {
      e.preventDefault();
      await uploadEditorImage(imageFile);
    }
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
    if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!e.dataTransfer || !e.dataTransfer.types || !e.dataTransfer.types.includes('Files')) {
      return;
    }
    
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

  // 收藏/取消收藏
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
      showToast(data.star ? '已加入收藏' : '已取消收藏');
    } catch (err) {
      alert(err.message);
    }
  };

  // 获取垃圾桶数据
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

  // 从垃圾桶还原
  const handleRestoreSkill = async (category, filename) => {
    try {
      const res = await fetch(`/api/trash/${encodeURIComponent(category)}/${encodeURIComponent(filename)}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '恢复失败');
      
      showToast('还原成功！');
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 彻底删除
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
      showToast('该技能已安全移送至 Windows 系统回收站');
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // 清空垃圾桶
  const handleEmptyTrash = async () => {
    try {
      const res = await fetch('/api/trash/empty', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '清空垃圾桶失败');
      
      setIsEmptyTrashConfirmOpen(false);
      showToast('垃圾桶已全部移入 Windows 回收站');
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCloseEditor = () => {
    if (saveStatus === 'dirty' || saveStatus === 'saving') {
      setIsUnsavedConfirmOpen(true);
    } else {
      setIsEditOpen(false);
    }
  };

  // 5秒防抖
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

  // 初始化及 SSE 实时事件热同步
  useEffect(() => {
    fetchConfig(true);
    fetchSkills();
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';

    // 建立 SSE (Server-Sent Events) 长连接监听外部物理文件变更
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'skills_updated') {
          console.log('[SSE] 检测到外部文件修改，正在自动重载数据...');
          fetchSkills();
        }
      } catch (err) {
        console.error('[SSE] 消息解析错误:', err);
      }
    };

    // 页面销毁或重载时关闭连接，释放网络端口资源
    return () => {
      eventSource.close();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
    showToast(newTheme === 'dark' ? '已开启暗黑模式' : '已开启浅色模式');
  };

  // 渲染高亮
  useEffect(() => {
    if (isViewOpen || isEditOpen) {
      Prism.highlightAll();
    }
  }, [isViewOpen, isEditOpen, viewedSkill, currentSkill.content]);

  // Ctrl+S 保存
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

  // Git 历史和备份逻辑
  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      console.error('获取备份列表失败:', e);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch('/api/backups/export', { method: 'POST' });
      if (res.ok) {
        await fetchBackups();
        showToast('备份成功创建');
      } else {
        const err = await res.json();
        alert(`备份打包失败: ${err.error}`);
      }
    } catch (e) {
      alert('备份打包请求出错');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDeleteBackup = async (backupName) => {
    if (!confirm(`您确定要彻底删除备份 ${backupName} 吗？此操作无法恢复！`)) return;
    try {
      const res = await fetch(`/api/backups/${encodeURIComponent(backupName)}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchBackups();
        showToast('备份已彻底删除');
      } else {
        const err = await res.json();
        alert(`删除备份失败: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedRestoreBackup) return;
    setBackupLoading(true);
    setIsRestoreConfirmOpen(false);
    try {
      const res = await fetch(`/api/backups/${encodeURIComponent(selectedRestoreBackup)}/restore`, { method: 'POST' });
      if (res.ok) {
        alert('🎉 备份恢复成功！工作目录已同步还原重载。');
        setIsSettingsOpen(false);
        fetchConfig();
        fetchSkills();
      } else {
        const err = await res.json();
        alert(`恢复备份失败: ${err.error}`);
      }
    } catch (e) {
      alert('恢复备份出错，请重试');
    } finally {
      setBackupLoading(false);
      setSelectedRestoreBackup(null);
    }
  };

  const fetchHistory = async () => {
    if (!viewedSkill) return;
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}/history`);
      if (res.ok) {
        const data = await res.json();
        setIsHistorySupported(!!data.supported);
        setHistoryList(data.history || []);
      }
    } catch (e) {
      console.error('获取历史版本失败:', e);
    }
  };

  const previewHistoryVersion = async (commitHash) => {
    if (!viewedSkill) return;
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}/history/${commitHash}`);
      if (res.ok) {
        const data = await res.json();
        setHistorySkillDetail(data);
        setSelectedHistoryCommit(commitHash);
      } else {
        const err = await res.json();
        alert(`加载历史快照失败: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRollback = async () => {
    if (!viewedSkill || !rollbackCommitHash) return;
    setIsRollbackConfirmOpen(false);
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}/history/${rollbackCommitHash}/rollback`, { method: 'POST' });
      if (res.ok) {
        showToast('时光回退成功！');
        setIsHistoryOpen(false);
        setSelectedHistoryCommit(null);
        setHistorySkillDetail(null);
        
        const detailRes = await fetch(`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          setViewedSkill(detail);
        }
        fetchSkills(); 
      } else {
        const err = await res.json();
        alert(`时光机回退失败: ${err.error}`);
      }
    } catch (e) {
      alert('回滚请求出错，请重试');
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      fetchBackups();
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (isHistoryOpen && viewedSkill) {
      fetchHistory();
    }
  }, [isHistoryOpen, viewedSkill]);

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

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('获取数据失败');
      const data = await res.json();
      setSkills(data);
      setError(null);
      fetchTrashSkills(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      showToast('工作路径已保存重载');
      fetchSkills();
    } catch (err) {
      alert(`保存失败: ${err.message}`);
    }
  };

  // 批量多选操作函数
  const toggleSelectKey = (category, filename) => {
    const key = `${category}/${filename}`;
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllSkills = () => {
    const allKeys = displaySkills.map(s => `${s.category}/${s.filename}`);
    setSelectedKeys(allKeys);
  };

  const clearSelection = () => {
    setSelectedKeys([]);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedKeys([]);
  };

  const handleBatchDelete = async () => {
    if (selectedKeys.length === 0) return;
    try {
      const items = selectedKeys.map(key => {
        const [category, filename] = key.split('/');
        return { category, filename };
      });

      const res = await fetch('/api/skills/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '批量删除失败');

      showToast(`成功将 ${data.count} 个技能包移入垃圾桶`);
      setIsBatchDeleteConfirmOpen(false);
      exitSelectionMode();
      fetchSkills();
    } catch (err) {
      alert(`批量删除失败: ${err.message}`);
    }
  };

  const handleBatchDownload = async () => {
    if (selectedKeys.length === 0) return;
    
    if (isDemoMode) {
      // Demo 模式下纯前端生成并导出合并文件，用于演示
      try {
        showToast('演示模式：正在导出合并 Markdown 附件...');
        const contents = selectedKeys.map(key => {
          const [category, filename] = key.split('/');
          const match = mockSkills.find(s => s.category === category && s.filename === filename);
          return match ? `# ${match.title}\n\n${match.content}` : '';
        }).filter(Boolean).join('\n\n---\n\n');
        
        const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skills-combined-export.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsBatchShareOpen(false);
      } catch (e) {
        alert(`导出失败: ${e.message}`);
      }
      return;
    }

    try {
      const items = selectedKeys.map(key => {
        const [category, filename] = key.split('/');
        return { category, filename };
      });

      showToast('正在生成压缩包，请稍候...');
      const res = await fetch('/api/skills/batch-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '打包下载失败');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skills-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('打包下载成功');
      setIsBatchShareOpen(false);
    } catch (err) {
      alert(`导出失败: ${err.message}`);
    }
  };

  const handleBatchCopyMarkdown = async () => {
    if (selectedKeys.length === 0) return;
    try {
      showToast('正在读取并合并文档...');
      const contents = await Promise.all(selectedKeys.map(async (key) => {
        const [category, filename] = key.split('/');
        
        if (isDemoMode) {
          const match = mockSkills.find(s => s.category === category && s.filename === filename);
          if (match) {
            return `---\ntitle: ${match.title}\ncategory: ${match.category}\ndescription: ${match.description}\ntags: ${JSON.stringify(match.tags)}\nstar: ${match.star}\n---\n\n${match.content}`;
          }
          return '';
        }

        const res = await fetch(`/api/skills/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`);
        if (!res.ok) throw new Error(`读取 ${filename} 失败`);
        const data = await res.json();
        return `---\ntitle: ${data.title}\ncategory: ${data.category}\ndescription: ${data.description}\ntags:\n${(data.tags || []).map(t => `  - ${t}`).join('\n')}\nstar: ${data.star}\n---\n\n${data.content}`;
      }));

      const mergedText = contents.filter(Boolean).join('\n\n---\n\n');
      await navigator.clipboard.writeText(mergedText);
      showToast('合并 Markdown 已复制到剪贴板');
      setIsBatchShareOpen(false);
    } catch (err) {
      alert(`合并复制失败: ${err.message}`);
    }
  };

  const handleBatchExportPoster = async () => {
    if (selectedKeys.length === 0) return;
    if (selectedKeys.length > 5) {
      alert('合并海报最多支持选择 5 个项目！');
      return;
    }

    const posterDOM = document.getElementById('batch-share-poster-canvas');
    if (!posterDOM) return;

    const originalBtnText = document.getElementById('batch-poster-btn-text');
    if (originalBtnText) originalBtnText.innerText = '正在生成图片...';

    try {
      // 延迟确保 DOM 样式生效
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(posterDOM, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: theme === 'light' ? '#FAFAFA' : '#0B0F17'
      });

      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `skills-combined-poster-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('合并海报已成功导出');
      setIsBatchShareOpen(false);
    } catch (err) {
      alert(`海报生成失败: ${err.message}`);
    } finally {
      if (originalBtnText) originalBtnText.innerText = `生成合并海报图片 (${selectedKeys.length}/5)`;
    }
  };

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
      showToast('技能包已成功物理保存！');
      fetchSkills();
      
      if (isViewOpen && viewedSkill && viewedSkill.filename === currentSkill.filename) {
        handleViewSkill(data.category, data.filename);
      }
    } catch (err) {
      alert(`保存失败: ${err.message}`);
    }
  };

  const handleViewSkill = async (category, filename) => {
    try {
      const res = await fetch(`/api/skills/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('获取详情失败');
      const data = await res.json();
      setViewedSkill(data);
      setIsViewOpen(true);
      setIsShareMenuOpen(false);

      const toc = generateToc(data.content);
      if (toc.length > 0) {
        setActiveTocHeader(toc[0].text);
      } else {
        setActiveTocHeader('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

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
      showToast('技能已成功移入垃圾桶');
      fetchSkills();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // 自定义拖拽排序相关逻辑
  // ==========================================
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverCard = (e) => {
    e.preventDefault();
  };

  const handleDragEnterCard = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    setSkills(prev => {
      const next = [...prev];
      const itemA = displaySkills[draggedIndex];
      const itemB = displaySkills[index];

      const idxA = next.findIndex(s => s.category === itemA.category && s.filename === itemA.filename);
      const idxB = next.findIndex(s => s.category === itemB.category && s.filename === itemB.filename);

      if (idxA !== -1 && idxB !== -1) {
        const [temp] = next.splice(idxA, 1);
        next.splice(idxB, 0, temp);
      }
      return next;
    });

    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setSortKey('custom'); 
    await saveCustomOrder();
  };

  const saveCustomOrder = async () => {
    const orderKeys = skills.map(s => s.key || `${s.category}/${s.filename}`);
    try {
      const res = await fetch('/api/skills/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderKeys })
      });
      if (!res.ok) throw new Error('保存自定义排序配置失败');
      showToast('自定义排序已成功保存');
    } catch (err) {
      console.error('保存排序失败:', err);
    }
  };

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

  const handleEditSkillClick = (skill) => {
    setCurrentSkill({
      title: skill.title,
      category: skill.category,
      description: skill.description,
      tags: skill.tags.join(', '),
      content: skill.content,
      filename: skill.filename,
      oldCategory: skill.category, 
      isNew: false,
      star: !!skill.star
    });
    setIsViewOpen(false);
    setIsEditOpen(true);
  };

  const handleExportHtml = () => {
    if (!viewedSkill) return;
    const contentHtml = renderMarkdown(viewedSkill.content);
    const htmlTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${viewedSkill.title}</title>
  <style>
    body {
      background-color: #ffffff;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    h1, h2, h3, h4 { color: #111827; margin-top: 28px; margin-bottom: 14px; }
    h1 { font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h2 { font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    p { margin-bottom: 16px; }
    pre {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 20px 0;
    }
    code { font-family: monospace; font-size: 12px; background: #f3f4f6; padding: 2px 5px; border-radius: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; }
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

  const handleGenerateImage = () => {
    if (!viewedSkill || !shareCardRef.current) return;
    
    const originalText = document.getElementById('share-btn-text');
    if (originalText) originalText.innerText = '生成中…';

    html2canvas(shareCardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, 
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

  const handleCopyMarkdown = () => {
    if (!viewedSkill) return;
    const yamlString = `---\ntitle: "${viewedSkill.title}"\ncategory: "${viewedSkill.category}"\ndescription: "${viewedSkill.description}"\ntags: ${JSON.stringify(viewedSkill.tags)}\n---\n\n${viewedSkill.content}`;
    
    navigator.clipboard.writeText(yamlString).then(() => {
      showToast('Markdown 源码已复制到剪贴板！');
      setIsShareMenuOpen(false);
    }).catch(err => {
      alert(`复制失败: ${err.message}`);
    });
  };

  // 卡片内嵌一键复制 Markdown 源码
  const handleCopySkillContent = (skill) => {
    const yamlString = `---\ntitle: "${skill.title}"\ncategory: "${skill.category}"\ndescription: "${skill.description || ''}"\ntags: ${JSON.stringify(skill.tags)}\n---\n\n${skill.content}`;
    
    navigator.clipboard.writeText(yamlString).then(() => {
      showToast('已复制 Markdown 源码！');
    }).catch(err => {
      alert(`复制失败: ${err.message}`);
    });
  };

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

  const handleTocClick = (text) => {
    const viewerScroll = document.querySelector('.viewer-scroll-area');
    if (!viewerScroll) return;
    const headers = viewerScroll.querySelectorAll('h1, h2, h3');
    for (const header of headers) {
      if (header.textContent.trim() === text) {
        setActiveTocHeader(text);
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  const handleViewerScroll = (e) => {
    const scrollContainer = e.target;
    if (!scrollContainer) return;

    const headers = scrollContainer.querySelectorAll('h1, h2, h3');
    if (headers.length === 0) return;

    const containerTop = scrollContainer.getBoundingClientRect().top;
    let currentActive = '';
    let minDistance = Infinity;

    headers.forEach((header) => {
      const rect = header.getBoundingClientRect();
      const relativeTop = rect.top - containerTop;

      if (relativeTop <= 30) {
        const dist = Math.abs(relativeTop - 10);
        if (dist < minDistance) {
          minDistance = dist;
          currentActive = header.textContent.trim();
        }
      }
    });

    if (!currentActive && headers.length > 0) {
      currentActive = headers[0].textContent.trim();
    }

    if (currentActive && currentActive !== activeTocHeader) {
      setActiveTocHeader(currentActive);
    }
  };

  const categoriesCount = skills.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const tagsCount = skills.reduce((acc, curr) => {
    curr.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

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

  const filteredSkills = skills
    .filter(skill => {
      const matchesSearch = 
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesCategory = 
        selectedCategory === '全部' || 
        (selectedCategory === 'starred' ? skill.star : skill.category === selectedCategory);
      
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

  const filteredTrashSkills = React.useMemo(() => {
    return trashSkills.filter(skill => {
      const matchesSearch = 
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [trashSkills, searchQuery]);

  const displaySkills = filteredSkills;
  const slicedSkills = displaySkills.slice(0, visibleCount);

  return (
    <div 
      className="app-container" 
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

      {/* 置顶 Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div 
            className="navbar-brand" 
            onClick={() => { 
              setSelectedCategory('全部'); 
              setSelectedTags([]); 
              setSearchQuery(''); 
            }}
          >
            <div className="navbar-logo">SV</div>
            <span>SkillVault</span>
          </div>
          
          <div className="navbar-actions">
            <button 
              className={`btn-saas ${isSelectionMode ? 'active' : ''}`} 
              onClick={() => {
                if (isSelectionMode) {
                  exitSelectionMode();
                } else {
                  setIsSelectionMode(true);
                }
              }}
              style={{
                background: isSelectionMode ? 'var(--text-main)' : 'transparent',
                color: isSelectionMode ? 'var(--bg-card)' : 'var(--text-main)',
                borderColor: 'var(--border-color)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon" style={{ marginRight: '4px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
              {isSelectionMode ? '退出多选' : '批量操作'}
            </button>

            <button className="btn-saas btn-saas-primary" onClick={handleNewSkillClick}>
              <PlusIcon size={14} /> 新建技能
            </button>
            
            <button 
              className="btn-icon-only" 
              onClick={() => { setIsTrashOpen(true); fetchTrashSkills(); }} 
              title="垃圾桶"
              style={{ position: 'relative' }}
            >
              <TrashIcon />
              {trashSkills.length > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-2px', 
                  background: 'var(--danger-color)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '14px', 
                  height: '14px', 
                  fontSize: '9px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }} className="tabular-nums">
                  {trashSkills.length}
                </span>
              )}
            </button>

            <button 
              className="btn-icon-only" 
              onClick={() => { setIsSettingsOpen(true); fetchConfig(); }} 
              title="设置"
            >
              <SettingsIcon />
            </button>

            <button 
              className="btn-icon-only" 
              onClick={toggleTheme}
              title={theme === 'light' ? "深色模式" : "浅色模式"}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* 主工作区 */}
      <main className="main-content">
        
        {/* Hero 区域 */}
        <div className="hero-section">
          <h1 className="hero-title">SkillVault</h1>
        </div>

        {/* 居中大搜索框 */}
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="查找技能、标签或描述…" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-saas"
              spellCheck={false}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="清除搜索词"
              >
                <CloseIcon size={14} />
              </button>
            )}
            <span className="search-icon-saas"><SearchIcon /></span>
          </div>
        </div>

        {/* 横向滚动分类药丸 */}
        <div className="category-filter-bar">
          <div 
            className={`category-pill ${selectedCategory === '全部' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('全部')}
          >
            全部技能 <span className="category-pill-count tabular-nums">{skills.length}</span>
          </div>
          <div 
            className={`category-pill ${selectedCategory === 'starred' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('starred')}
          >
            ⭐ 我的收藏 <span className="category-pill-count tabular-nums">{skills.filter(s => s.star).length}</span>
          </div>
          {Object.entries(categoriesCount).map(([name, count]) => (
            <div 
              key={name}
              className={`category-pill ${selectedCategory === name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(name)}
            >
              {name} <span className="category-pill-count tabular-nums">{count}</span>
            </div>
          ))}
        </div>

        {/* 标签多选气泡 */}
        {Object.keys(tagsCount).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '32px', maxWidth: '800px', margin: '0 auto 32px auto' }}>
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
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: isSelected ? 'var(--text-main)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--bg-card)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  #{name} <span style={{ opacity: 0.6 }} className="tabular-nums">{count}</span>
                </span>
              );
            })}
            {selectedTags.length > 0 && (
              <span 
                onClick={() => setSelectedTags([])}
                style={{ fontSize: '11px', color: 'var(--text-weak)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                清除选择
              </span>
            )}
          </div>
        )}

        {/* 网格区头部 */}
        <div className="section-header">
          <h2 className="section-title">
            {selectedCategory === 'starred' ? '⭐ 我的收藏' : selectedCategory === '全部' ? '全部项目' : `分类: ${selectedCategory}`}
            {selectedTags.length > 0 && ` (标签: ${selectedTags.map(t => `#${t}`).join(', ')})`}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '12px', fontWeight: 'normal' }}>
              共 {filteredSkills.length} 个技能包
            </span>
          </h2>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="sort-select-saas"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              aria-label="排序规则"
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="custom">自定义拖拽排序</option>
              <option value="updatedAt-desc">最近修改优先</option>
              <option value="updatedAt-asc">最早修改优先</option>
              <option value="title-asc">标题 A-Z</option>
              <option value="title-desc">标题 Z-A</option>
            </select>
            
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                className={`btn-toggle-view ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('grid')}
                title="网格视图"
                style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', border: 'none', background: viewMode === 'grid' ? 'var(--text-main)' : 'transparent', color: viewMode === 'grid' ? 'var(--bg-card)' : 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
              >
                <GridIcon size={12} />
              </button>
              <button 
                type="button"
                className={`btn-toggle-view ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('list')}
                title="列表视图"
                style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', border: 'none', background: viewMode === 'list' ? 'var(--text-main)' : 'transparent', color: viewMode === 'list' ? 'var(--bg-card)' : 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}
              >
                <ListIcon size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* 项目加载状态 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>正在努力扫描并加载本地 Skill 文件…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--danger-color)' }}>加载本地文件出错: {error}</p>
            <button className="btn-saas btn-saas-primary" onClick={fetchSkills} style={{ marginTop: '12px' }}>重新尝试</button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="skill-grid">
                {/* 新建占位卡片 */}
                <div className="new-card-placeholder" onClick={handleNewSkillClick}>
                  <div className="new-card-icon">
                    <PlusIcon size={20} />
                  </div>
                  <div className="new-card-text">新建技能包</div>
                </div>

                {slicedSkills.map((skill, index) => {
                  const cleanDesc = skill.description || '暂无简介描述。点击查看详情。';
                  const isChecked = selectedKeys.includes(`${skill.category}/${skill.filename}`);
                  return (
                    <div 
                      key={`${skill.category}-${skill.filename}`} 
                      className={`skill-card ${draggedIndex === index ? 'is-dragging' : ''} ${isSelectionMode ? 'in-selection-mode' : ''} ${isChecked ? 'is-selected' : ''}`} 
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleSelectKey(skill.category, skill.filename);
                        } else {
                          handleViewSkill(skill.category, skill.filename);
                        }
                      }}
                      draggable={!isSelectionMode}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOverCard}
                      onDragEnter={() => handleDragEnterCard(index)}
                      onDragEnd={handleDragEnd}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {isSelectionMode && (
                        <div 
                          className={`card-checkbox ${isChecked ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectKey(skill.category, skill.filename);
                          }}
                        >
                          {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="card-header-row">
                          <span className="card-category-badge">{skill.category}</span>
                          <button 
                            className={`card-star-btn ${skill.star ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(skill.category, skill.filename, skill.star);
                            }}
                          >
                            <StarIcon filled={skill.star} size={14} />
                          </button>
                        </div>
                        <h3 className="card-title-text" title={skill.title}>{skill.title}</h3>
                        <div className="card-body-area">
                          <p className="card-description-text">{cleanDesc}</p>
                          <div className="card-tags-cloud">
                            {skill.tags.map(tag => (
                              <span key={tag} className="card-tag-pill">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer-row" onClick={(e) => e.stopPropagation()}>
                        <span className="card-meta-info">
                          {new Date(skill.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="card-actions-group">
                          <button className="btn-card-action" onClick={() => handleViewSkill(skill.category, skill.filename)}>查看</button>
                          <button className="btn-card-action" onClick={() => handleCopySkillContent(skill)}>复制</button>
                          <a 
                            href={`/api/skills/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.filename)}/download`}
                            className="btn-card-action"
                            download
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                          >
                            下载
                          </a>
                          <button 
                            className="btn-card-action btn-card-action-danger" 
                            onClick={() => { setSelectedSoftDeleteSkill(skill); setIsSoftDeleteConfirmOpen(true); }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* 列表模式 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-card)' }}
                  onClick={handleNewSkillClick}
                >
                  <PlusIcon size={14} />
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>新建技能卡片项目</span>
                </div>

                {slicedSkills.map((skill, index) => {
                  const cleanDesc = skill.description || '暂无简介描述。';
                  const isChecked = selectedKeys.includes(`${skill.category}/${skill.filename}`);
                  return (
                    <div 
                      key={`${skill.category}-${skill.filename}`} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '12px 16px', 
                        background: 'var(--bg-card)', 
                        cursor: 'pointer',
                        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s ease',
                        position: 'relative'
                      }}
                      className={`skill-card-list-row ${draggedIndex === index ? 'is-dragging' : ''} ${isChecked ? 'is-selected' : ''}`}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleSelectKey(skill.category, skill.filename);
                        } else {
                          handleViewSkill(skill.category, skill.filename);
                        }
                      }}
                      draggable={!isSelectionMode}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOverCard}
                      onDragEnter={() => handleDragEnterCard(index)}
                      onDragEnd={handleDragEnd}
                    >
                      {isSelectionMode && (
                        <div 
                          className={`card-checkbox ${isChecked ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectKey(skill.category, skill.filename);
                          }}
                          style={{ marginRight: '12px', flexShrink: 0 }}
                        >
                          {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                        <button 
                          className={`card-star-btn ${skill.star ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(skill.category, skill.filename, skill.star);
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <StarIcon filled={skill.star} size={14} />
                        </button>
                        <span className="card-category-badge" style={{ flexShrink: 0 }}>{skill.category}</span>
                        <strong style={{ fontSize: '15px', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }} title={skill.title}>{skill.title}</strong>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, marginLeft: '12px' }} title={cleanDesc}>{cleanDesc}</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap', overflow: 'hidden', marginLeft: '12px' }}>
                          {skill.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="card-tag-pill" style={{ whiteSpace: 'nowrap' }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ fontSize: '12px', color: 'var(--text-weak)', fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(skill.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="card-actions-group">
                          <button className="btn-card-action" onClick={() => handleViewSkill(skill.category, skill.filename)}>查看</button>
                          <button className="btn-card-action" onClick={() => handleCopySkillContent(skill)}>复制</button>
                          <a 
                            href={`/api/skills/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.filename)}/download`}
                            className="btn-card-action"
                            download
                          >
                            下载
                          </a>
                          <button 
                            className="btn-card-action btn-card-action-danger" 
                            onClick={() => { setSelectedSoftDeleteSkill(skill); setIsSoftDeleteConfirmOpen(true); }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 加载更多 */}
            {displaySkills.length > visibleCount && (
              <div className="load-more-container" style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '40px 0 20px 0' }}>
                <button 
                  className="btn-saas" 
                  onClick={() => setVisibleCount(prev => prev + 18)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                >
                  加载更多技能 / Load More
                </button>
              </div>
            )}

            {displaySkills.length === 0 && skills.length > 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                没有找到符合当前过滤条件的 Skill 文件。
              </div>
            )}
          </>
        )}
      </main>

      {/* ---------------- Modals ---------------- */}

      {/* 1. 全局 Toast 提示框 */}
      {toastMsg && <div className="toast-msg">{toastMsg}</div>}

      {/* 2. 独立垃圾桶 Modal */}
      {isTrashOpen && (
        <div className="modal-overlay" onClick={() => setIsTrashOpen(false)}>
          <div className="modal-content modal-standard" style={{ width: '600px', height: '60vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🗑️ 垃圾桶管理</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {trashSkills.length > 0 && (
                  <button 
                    onClick={() => setIsEmptyTrashConfirmOpen(true)}
                    className="btn-card-action btn-card-action-danger"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    清空垃圾桶
                  </button>
                )}
                <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => setIsTrashOpen(false)}><CloseIcon /></button>
              </div>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              <div className="trash-list-container">
                {trashSkills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-weak)', fontSize: '13px' }}>
                    垃圾桶空空如也，暂无已删除的文件。
                  </div>
                ) : (
                  filteredTrashSkills.map(skill => (
                    <div key={`${skill.category}-${skill.filename}`} className="trash-row">
                      <div className="trash-info">
                        <div className="trash-title">{skill.title}</div>
                        <div className="trash-meta" style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px' }}>
                          分类: {skill.category} | 移入: {new Date(skill.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="trash-actions">
                        <button 
                          onClick={() => { handleRestoreSkill(skill.category, skill.filename); }} 
                          className="btn-card-action"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCcwIcon size={12} /> 还原
                        </button>
                        <button 
                          onClick={() => { setSelectedTrashSkill(skill); setIsDeleteConfirmOpen(true); }} 
                          className="btn-card-action btn-card-action-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <TrashIcon size={12} /> 彻底删除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => setIsTrashOpen(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 设置工作路径弹窗 (Settings Modal) */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}>
          <div className="modal-content modal-standard" style={{ width: '560px', height: '70vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">系统路径与共享设置</h3>
              <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}><CloseIcon /></button>
            </div>
            
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                {!isCustomConfiguredServer && (
                  <div className="onboarding-banner" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                    💡 <strong>配置引导</strong>：系统当前正在使用默认内置的 <code>skills</code> 目录。建议在此指定您个人常用的本地文档存放路径（如：<code>D:\MySkills</code>），即可立即将已有的 MD 技能卡片同步读取进来！
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>本地 Markdown 文件夹绝对路径</label>
                  <input 
                    type="text" 
                    value={tempPath}
                    onChange={(e) => setTempPath(e.target.value)}
                    placeholder="例如: D:\MySkills"
                    required
                    style={{ width: '100%' }}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-weak)', marginTop: '4px', lineHeight: '1.4' }}>
                    * 默认路径为项目目录下的 <strong>skills</strong> 文件夹。
                    您可指定任何绝对路径。保存后，系统会热重载并同步读取该文件夹。
                  </p>
                </div>
                
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', background: 'var(--bg-main)' }}>
                  <h4 style={{ fontSize: '13px', marginBottom: '6px', color: 'var(--text-main)', fontWeight: 'bold' }}>📶 局域网分享状态</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    本平台已开启局域网广播。其它设备可以直接访问您的局域网地址进行查看共享（端口详见控制台输出）。
                  </p>
                </div>

                {/* 安全备份中心 */}
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, fontWeight: 'bold' }}>📦 安全数据备份</h4>
                    <button 
                      type="button" 
                      onClick={handleCreateBackup}
                      disabled={backupLoading}
                      className="btn-saas"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {backupLoading ? '打包中...' : '创建备份'}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>
                    基于 Windows 原生模块将工作区 Markdown 技能包打包归档。最多保留 10 个物理归档文件。
                  </p>

                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-card)' }}>
                    {backups.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-weak)' }}>
                        暂无历史备份，点击上方按钮立即创建。
                      </div>
                    ) : (
                      backups.map((bk) => {
                        const isEmergency = bk.name.includes('emergency');
                        const sizeStr = bk.size < 1024 * 1024 
                          ? (bk.size / 1024).toFixed(1) + ' KB'
                          : (bk.size / (1024 * 1024)).toFixed(1) + ' MB';
                        
                        return (
                          <div 
                            key={bk.name}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '8px 10px', 
                              borderBottom: '1px solid var(--border-color)',
                              fontSize: '11.5px'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '70%' }}>
                              <span style={{ 
                                textOverflow: 'ellipsis', 
                                overflow: 'hidden', 
                                whiteSpace: 'nowrap',
                                color: isEmergency ? '#d97706' : 'var(--text-main)',
                                fontWeight: isEmergency ? 'bold' : 'normal'
                              }} title={bk.name}>
                                {isEmergency ? '⚠️ 紧急备份' : '💾'} {bk.name}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-weak)' }} className="tabular-nums">
                                {sizeStr} | {new Date(bk.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => { setSelectedRestoreBackup(bk.name); setIsRestoreConfirmOpen(true); }}
                                className="btn-card-action"
                                style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                              >
                                还原
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBackup(bk.name)}
                                className="btn-card-action btn-card-action-danger"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-saas" onClick={() => { setIsSettingsOpen(false); localStorage.setItem('hasSeenPathSetup', 'true'); }}>取消</button>
                <button type="submit" className="btn-saas btn-saas-primary">保存并重载目录</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. 双栏编辑器弹窗 (Modal) */}
      {isEditOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-immersive" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{currentSkill.isNew ? '新增技能包' : '编辑技能包'}</h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="save-indicator-row">
                  <span className={`status-dot ${currentSkill.isNew ? 'dirty' : saveStatus}`}></span>
                  <span style={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                    {currentSkill.isNew ? '未激活自动保存' : saveStatus === 'saved' ? '已自动保存' : saveStatus === 'saving' ? '正在保存...' : '检测到修改...'}
                  </span>
                </div>
                <button className="modal-close-btn" style={{ display: 'flex', alignItems: 'center' }} onClick={handleCloseEditor}><CloseIcon /></button>
              </div>
            </div>
            
            <div className="modal-body" style={{ overflow: 'hidden' }}>
              <div className="editor-layout-immersive">
                <div className="editor-meta-fields">
                  <div className="field-group">
                    <label className="field-label">技能标题</label>
                    <input 
                      type="text" 
                      value={currentSkill.title}
                      onChange={(e) => setCurrentSkill({...currentSkill, title: e.target.value})}
                      placeholder="输入技能标题 (即文件名)"
                      required
                      spellCheck={false}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">分类 (子文件夹)</label>
                    <input 
                      type="text" 
                      value={currentSkill.category}
                      onChange={(e) => setCurrentSkill({...currentSkill, category: e.target.value})}
                      placeholder="例如: 前端、Python、数据库"
                      list="editor-categories-list"
                      spellCheck={false}
                    />
                    <datalist id="editor-categories-list">
                      {Object.keys(categoriesCount).map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="field-label">标签 (空格或逗号分隔)</label>
                    <input 
                      type="text" 
                      value={currentSkill.tags}
                      onChange={(e) => setCurrentSkill({...currentSkill, tags: e.target.value})}
                      placeholder="如: React, Hooks, Router"
                      spellCheck={false}
                    />
                  </div>
                  <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="field-label">一句话简介 (卡片描述)</label>
                    <input 
                      type="text" 
                      value={currentSkill.description}
                      onChange={(e) => setCurrentSkill({...currentSkill, description: e.target.value})}
                      placeholder="输入技能一句话描述，展示在卡片缩略图上"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="editor-toolbar-saas">
                  <button className="btn-saas" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => insertMarkdown('bold')} title="加粗" type="button"><BoldIcon /> 加粗</button>
                  <button className="btn-saas" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => insertMarkdown('italic')} title="斜体" type="button"><ItalicIcon /> 斜体</button>
                  <button className="btn-saas" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => insertMarkdown('code')} title="代码块" type="button"><CodeBlockIcon /> 代码块</button>
                  <button className="btn-saas" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => insertMarkdown('link')} title="链接" type="button"><LinkIcon /> 链接</button>
                  <button className="btn-saas" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => insertMarkdown('table')} title="表格" type="button"><TableIcon /> 表格</button>
                  <span style={{ fontSize: '11px', color: 'var(--text-weak)', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    💡 支持拖放图片或粘贴截图自动上传
                  </span>
                </div>

                <div className="editor-split-workspace">
                  <div className="editor-pane-saas">
                    <div className="pane-title">MARKDOWN 源码</div>
                    <textarea 
                      ref={editorTextareaRef}
                      onScroll={handleEditorScroll}
                      onPaste={handleEditorPaste}
                      onDrop={handleEditorDrop}
                      className="editor-textarea-saas"
                      value={currentSkill.content}
                      onChange={(e) => setCurrentSkill({...currentSkill, content: e.target.value})}
                      placeholder="# 在此输入 Markdown 格式内容… 支持拖拽图片或截图粘贴自动上传"
                      spellCheck={false}
                    />
                  </div>
                  
                  <div className="editor-pane-saas">
                    <div className="pane-title">实时预览</div>
                    <div className="editor-preview-saas markdown-body" ref={previewBodyRef}>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(currentSkill.content) }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ marginRight: 'auto', fontSize: '12px', color: 'var(--text-weak)' }}>
                Ctrl + S 保存技能包
              </span>
              <button type="button" className="btn-saas" onClick={handleCloseEditor}>取消</button>
              <button type="button" className="btn-saas btn-saas-primary" onClick={handleSaveSkill}>保存技能</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 极简沉浸式查看详情弹窗 (Modal) */}
      {isViewOpen && viewedSkill && (
        <div className="modal-overlay" onClick={() => setIsViewOpen(false)}>
          <div className="modal-content modal-immersive" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">阅读技能包</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  className={`btn-saas ${viewedSkill.star ? 'btn-saas-primary' : ''}`}
                  onClick={() => toggleStar(viewedSkill.category, viewedSkill.filename, viewedSkill.star)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <StarIcon filled={viewedSkill.star} size={13} /> {viewedSkill.star ? '已收藏' : '收藏'}
                </button>

                <button className="btn-saas" onClick={() => handleEditSkillClick(viewedSkill)}>
                  编辑技能
                </button>
                
                <div style={{ position: 'relative' }}>
                  <button className="btn-saas" onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}>
                    分享导出 ▾
                  </button>
                  {isShareMenuOpen && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 0, 
                      marginTop: '4px',
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px', 
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      width: '140px',
                      padding: '4px'
                    }}>
                      <button 
                        style={{ border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }} 
                        onClick={handleGenerateImage}
                      >
                        <span id="share-btn-text">生成海报图片</span>
                      </button>
                      <button 
                        style={{ border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }} 
                        onClick={handleExportHtml}
                      >
                        导出为 HTML
                      </button>
                      <button 
                        style={{ border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }} 
                        onClick={handleCopyMarkdown}
                      >
                        复制 MD 源码
                      </button>
                    </div>
                  )}
                </div>

                <a 
                  href={`/api/skills/${encodeURIComponent(viewedSkill.category)}/${encodeURIComponent(viewedSkill.filename)}/download`}
                  className="btn-saas"
                  style={{ textDecoration: 'none' }}
                  download
                >
                  <DownloadIcon /> 下载
                </a>

                {/* Git 历史时光机 */}
                <button 
                  className={`btn-saas ${isHistoryOpen ? 'btn-saas-primary' : ''}`}
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ⏳ 历史版本
                </button>
                
                <button className="modal-close-btn" style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }} onClick={() => setIsViewOpen(false)}><CloseIcon /></button>
              </div>
            </div>
            
            <div className="modal-body" style={{ padding: 0 }}>
              <div className="viewer-wrapper" style={{ display: 'flex', height: '100%' }}>
                {/* 目录导航 */}
                <div className="viewer-toc" style={{ width: '200px', borderRight: '1px solid var(--border-color)', padding: '20px', overflowY: 'auto' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>目录大纲</div>
                  {generateToc(viewedSkill.content).length > 0 ? (
                    <ul className="toc-list" style={{ listStyle: 'none', padding: 0 }}>
                      {generateToc(viewedSkill.content).map((item, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => handleTocClick(item.text)}
                          className={`toc-item toc-h${item.level} ${activeTocHeader === item.text ? 'active' : ''}`}
                          style={{
                            cursor: 'pointer',
                            fontSize: item.level === 1 ? '12.5px' : '11.5px',
                            fontWeight: item.level === 1 ? '700' : 'normal',
                            padding: '4px 0',
                            paddingLeft: `${(item.level - 1) * 8}px`,
                            color: activeTocHeader === item.text ? 'var(--text-main)' : 'var(--text-muted)'
                          }}
                        >
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-weak)' }}>无段落标题</span>
                  )}
                </div>

                {/* 正文内容区 */}
                <div className="viewer-main" ref={shareCardRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                  <div className="viewer-header-info" style={{ padding: '24px 32px 16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                    <h1 className="viewer-title" style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{viewedSkill.title}</h1>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                      <span className="viewer-category-tag">{viewedSkill.category}</span>
                      {viewedSkill.tags.map(t => (
                        <span key={t} className="card-tag-pill" style={{ background: 'var(--bg-card)' }}>#{t}</span>
                      ))}
                    </div>
                    {viewedSkill.description && (
                      <p className="viewer-desc-text">{viewedSkill.description}</p>
                    )}
                  </div>
                  
                  <div className="viewer-scroll-area" onScroll={handleViewerScroll} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(viewedSkill.content) }}></div>
                    
                    {/* 关联技能推荐 */}
                    {relatedSkills.length > 0 && (
                      <div className="related-skills-section" style={{ borderTop: '1px solid var(--border-color)', marginTop: '40px', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>相关技能推荐</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                          {relatedSkills.map(skill => (
                            <div 
                              key={`${skill.category}-${skill.filename}`} 
                              className="skill-card"
                              onClick={() => handleViewSkill(skill.category, skill.filename)}
                              style={{ padding: '16px', minHeight: '130px', cursor: 'pointer' }}
                            >
                              <span className="card-category-badge">{skill.category}</span>
                              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0 8px 0', lineStyle: 1.3 }} title={skill.title}>{skill.title}</h4>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{skill.description || '点击阅读该技能。'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Git 历史侧边线 */}
                {isHistoryOpen && (
                  <div style={{ width: '260px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>⏳ Git 时光机</span>
                      <button className="modal-close-btn" style={{ fontSize: '11px' }} onClick={() => setIsHistoryOpen(false)}><CloseIcon /></button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                      {!isHistorySupported ? (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-weak)', textAlign: 'center', marginTop: '20px' }}>
                          ⚠️ 本地未检测到可用 Git 仓储
                        </div>
                      ) : historyList.length === 0 ? (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-weak)', textAlign: 'center', marginTop: '20px' }}>
                          暂无提交记录，编辑或星标后自动生成。
                        </div>
                      ) : (
                        <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '6px', paddingLeft: '14px' }}>
                          {historyList.map((hist, idx) => (
                            <div key={hist.hash} style={{ position: 'relative', paddingBottom: '20px' }}>
                              <div style={{ 
                                position: 'absolute', 
                                left: '-18.5px', 
                                top: '4px', 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: idx === 0 ? '#10b981' : 'var(--text-weak)',
                                border: '2px solid var(--bg-main)',
                                zIndex: 2
                              }} />
                              
                              <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2px' }}>
                                {hist.message}
                              </div>
                              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '8px' }} className="tabular-nums">
                                Hash: {hist.hash.substring(0, 7)} <br />
                                {new Date(hist.date).toLocaleString()}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  type="button"
                                  className="btn-card-action" 
                                  onClick={() => previewHistoryVersion(hist.hash)}
                                >
                                  对比
                                </button>
                                <button 
                                  type="button"
                                  className="btn-card-action btn-card-action-danger" 
                                  onClick={() => { setRollbackCommitHash(hist.hash); setIsRollbackConfirmOpen(true); }}
                                >
                                  回退
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 移入垃圾桶确认 */}
      {isSoftDeleteConfirmOpen && selectedSoftDeleteSkill && (
        <div className="modal-overlay" onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🗑️ 移入垃圾桶</h3>
              <button className="modal-close-btn" onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>确定将 "{selectedSoftDeleteSkill.title}" 放入垃圾桶？</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                放入垃圾桶后，该技能将移动到垃圾桶中，主页不再展示。您随时可以在右上角垃圾桶菜单中将其还原。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => { setIsSoftDeleteConfirmOpen(false); setSelectedSoftDeleteSkill(null); }}>取消</button>
              <button className="btn-saas btn-saas-primary" style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)', color: 'white' }} onClick={handleSoftDelete}>确认移入</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 彻底删除确认 */}
      {isDeleteConfirmOpen && selectedTrashSkill && (
        <div className="modal-overlay" onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger-color)' }}>🚨 彻底删除</h3>
              <button className="modal-close-btn" onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚨</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>彻底删除 "{selectedTrashSkill.title}"？</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                系统将直接调用 PowerShell API 将文件彻底投递送进 **Windows 桌面回收站**。
                您可在回收站找回，但此操作无法在 SkillVault 中撤销。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => { setIsDeleteConfirmOpen(false); setSelectedTrashSkill(null); }}>取消</button>
              <button className="btn-saas btn-saas-primary" style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)', color: 'white' }} onClick={handlePermanentDelete}>彻底删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. 一键清空垃圾桶确认 */}
      {isEmptyTrashConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsEmptyTrashConfirmOpen(false)}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger-color)' }}>🚨 清空垃圾桶</h3>
              <button className="modal-close-btn" onClick={() => setIsEmptyTrashConfirmOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚨</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>清空垃圾桶内所有技能包？</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                此操作将垃圾桶内全部 <strong>{trashSkills.length}</strong> 个文件批量移送至 **Windows 原生系统回收站**。是否确认操作？
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => setIsEmptyTrashConfirmOpen(false)}>取消</button>
              <button className="btn-saas btn-saas-primary" style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)', color: 'white' }} onClick={handleEmptyTrash}>确认清空</button>
            </div>
          </div>
        </div>
      )}

      {/* 9. 编辑器未保存退出拦截 */}
      {isUnsavedConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsUnsavedConfirmOpen(false)}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger-color)' }}>⚠️ 未保存的修改</h3>
              <button className="modal-close-btn" onClick={() => setIsUnsavedConfirmOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>退出编辑？</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                检测到未保存的修改，直接退出将丢失这些进度。
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="btn-saas" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsUnsavedConfirmOpen(false)}>继续编辑</button>
                <button className="btn-saas" style={{ flex: 1, justifyContent: 'center', color: 'var(--danger-color)' }} onClick={() => { setIsUnsavedConfirmOpen(false); setIsEditOpen(false); }}>放弃并退出</button>
              </div>
              <button className="btn-saas btn-saas-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleSaveSkill()}>保存修改并退出</button>
            </div>
          </div>
        </div>
      )}

      {/* 10. 时光机版本快照对比弹窗 */}
      {selectedHistoryCommit && historySkillDetail && viewedSkill && (
        <div className="modal-overlay" onClick={() => { setSelectedHistoryCommit(null); setHistorySkillDetail(null); }}>
          <div className="modal-content modal-immersive" style={{ width: '90vw', height: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">快照对比：{selectedHistoryCommit.substring(0, 7)}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  className="btn-saas"
                  style={{ color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={() => { setRollbackCommitHash(selectedHistoryCommit); setIsRollbackConfirmOpen(true); }}
                >
                  回退到此快照
                </button>
                <button className="modal-close-btn" onClick={() => { setSelectedHistoryCommit(null); setHistorySkillDetail(null); }}><CloseIcon /></button>
              </div>
            </div>
            
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: 'calc(100% - 60px)', overflow: 'hidden', padding: '20px' }}>
              {/* 历史版本 */}
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: 'var(--danger-color)', fontSize: '13px' }}>⏳ 历史快照 ({selectedHistoryCommit.substring(0, 7)})</h4>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }} className="markdown-body">
                  <h1>{historySkillDetail.title}</h1>
                  <div style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
                    <span className="viewer-category-tag">{historySkillDetail.category}</span>
                    {historySkillDetail.tags.map(t => <span key={t} className="card-tag-pill">#{t}</span>)}
                  </div>
                  {historySkillDetail.description && <p style={{ fontStyle: 'italic', opacity: 0.7 }} className="viewer-desc-text">{historySkillDetail.description}</p>}
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(historySkillDetail.content) }}></div>
                </div>
              </div>
              
              {/* 当前版本 */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#10b981', fontSize: '13px' }}>🟢 当前最新版本</h4>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }} className="markdown-body">
                  <h1>{viewedSkill.title}</h1>
                  <div style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
                    <span className="viewer-category-tag">{viewedSkill.category}</span>
                    {viewedSkill.tags.map(t => <span key={t} className="card-tag-pill">#{t}</span>)}
                  </div>
                  {viewedSkill.description && <p style={{ fontStyle: 'italic', opacity: 0.7 }} className="viewer-desc-text">{viewedSkill.description}</p>}
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(viewedSkill.content) }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. 时光机回滚二次确认 */}
      {isRollbackConfirmOpen && rollbackCommitHash && (
        <div className="modal-overlay" onClick={() => setIsRollbackConfirmOpen(false)}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">时光回退</h3>
              <button className="modal-close-btn" onClick={() => setIsRollbackConfirmOpen(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>将此技能包回退到版本 "{rollbackCommitHash.substring(0, 7)}"？</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                回退将用历史版本覆盖本地当前文件。Git 历史中会自动保留当前最新状态，您可以再次撤回。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => setIsRollbackConfirmOpen(false)}>取消</button>
              <button className="btn-saas btn-saas-primary" onClick={handleRollback}>确认回退</button>
            </div>
          </div>
        </div>
      )}

      {/* 12. 恢复备份二次确认 */}
      {isRestoreConfirmOpen && selectedRestoreBackup && (
        <div className="modal-overlay" onClick={() => { setIsRestoreConfirmOpen(false); setSelectedRestoreBackup(null); }}>
          <div className="modal-content modal-standard" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger-color)' }}>🚨 恢复工作区</h3>
              <button className="modal-close-btn" onClick={() => { setIsRestoreConfirmOpen(false); setSelectedRestoreBackup(null); }}><CloseIcon /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚨</div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>从备份 "{selectedRestoreBackup}" 恢复？</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--danger-color)', fontWeight: 'bold', margin: '8px 0' }}>
                此操作将完全擦除当前工作区（除 .git、.trash、backups 外）所有的 Markdown 文件，并替换为备份中的内容！
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-weak)' }}>
                * 为了数据安全，系统在恢复前会自动为您创建当前最新状态的紧急自动备份 (emergency-auto-backup.zip)。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-saas" onClick={() => { setIsRestoreConfirmOpen(false); setSelectedRestoreBackup(null); }}>取消</button>
              <button className="btn-saas btn-saas-primary" style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)', color: 'white' }} onClick={handleRestoreBackup}>确认覆盖恢复</button>
            </div>
          </div>
        </div>
      )}

      {/* 13. 批量操作置底控制条 */}
      {isSelectionMode && (
        <div className="batch-control-bar">
          <div className="batch-control-content">
            <span className="batch-selected-count">
              已选择 <strong className="tabular-nums" style={{ color: 'var(--text-main)', fontSize: '15px' }}>{selectedKeys.length}</strong> 项技能
            </span>
            <div className="batch-actions-group">
              {selectedKeys.length === displaySkills.length ? (
                <button className="btn-saas" style={{ background: 'transparent', border: 'none', textDecoration: 'underline' }} onClick={clearSelection}>取消全选</button>
              ) : (
                <button className="btn-saas" style={{ background: 'transparent', border: 'none', textDecoration: 'underline' }} onClick={selectAllSkills}>选择全部</button>
              )}
              <span className="batch-divider" style={{ color: 'var(--border-color)', margin: '0 8px' }}>|</span>
              <button 
                className="btn-saas" 
                onClick={() => setIsBatchShareOpen(true)}
                disabled={selectedKeys.length === 0}
                style={{ opacity: selectedKeys.length === 0 ? 0.5 : 1, cursor: selectedKeys.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                批量分享
              </button>
              <button 
                className="btn-saas" 
                onClick={() => setIsBatchDeleteConfirmOpen(true)}
                disabled={selectedKeys.length === 0}
                style={{ 
                  opacity: selectedKeys.length === 0 ? 0.5 : 1, 
                  cursor: selectedKeys.length === 0 ? 'not-allowed' : 'pointer',
                  background: 'var(--danger-color)',
                  color: 'white',
                  borderColor: 'var(--danger-color)'
                }}
              >
                批量删除
              </button>
            </div>
            <button className="btn-saas" onClick={exitSelectionMode}>取消多选</button>
          </div>
        </div>
      )}

      {/* 14. 批量分享控制中心 Modal */}
      {isBatchShareOpen && (
        <div className="modal-overlay" onClick={() => setIsBatchShareOpen(false)}>
          <div className="modal-content modal-standard" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">批量分享控制中心</h3>
              <button className="modal-close-btn" onClick={() => setIsBatchShareOpen(false)} aria-label="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                您已选中了 <strong className="tabular-nums" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedKeys.length}</strong> 项技能，请选择您的批量导出/分享方式：
              </p>

              <button className="btn-saas" onClick={handleBatchCopyMarkdown} style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 'bold' }}>
                🔗 合并复制 Markdown 源码至剪贴板
              </button>
              
              <button className="btn-saas" onClick={handleBatchDownload} style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 'bold' }}>
                📦 打包导出所选物理 MD 为 ZIP 压缩包
              </button>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                {selectedKeys.length > 5 ? (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-weak)', textAlign: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '6px', lineHeight: 1.4 }}>
                    ⚠️ 合并海报长图受浏览器 Canvas 渲染高度限制，最多只支持选择 5 个项目进行合并生成（当前已选择 {selectedKeys.length} 个）。请缩减选择项目后重新导出。
                  </div>
                ) : (
                  <button 
                    className="btn-saas btn-saas-primary" 
                    onClick={handleBatchExportPoster} 
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 'bold' }}
                  >
                    🖼️ <span id="batch-poster-btn-text">生成合并海报图片 ({selectedKeys.length}/5)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. 批量软删除二次确认 Modal */}
      {isBatchDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsBatchDeleteConfirmOpen(false)}>
          <div className="modal-content modal-standard" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <button className="modal-close-btn" onClick={() => setIsBatchDeleteConfirmOpen(false)} aria-label="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '12px 24px 24px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚨</div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>确认批量移入垃圾桶？</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                确定要将选中的 <strong className="tabular-nums" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedKeys.length}</strong> 个技能包移入垃圾桶吗？您可以在垃圾桶中随时原路还原。
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'center', gap: '12px', paddingBottom: '24px' }}>
              <button className="btn-saas" onClick={() => setIsBatchDeleteConfirmOpen(false)}>取消</button>
              <button 
                className="btn-saas btn-saas-primary" 
                onClick={handleBatchDelete}
                style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)', color: 'white' }}
              >
                确定移入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16. 隐藏的批量海报生成容器（由 html2canvas 渲染） */}
      <div 
        id="batch-share-poster-canvas" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '600px', 
          background: theme === 'light' ? '#FAFAFA' : '#0B0F17',
          padding: '40px',
          color: theme === 'light' ? '#111827' : '#F0F6FC',
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>SkillVault</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>合并技能包海报分享 • 生成时间 {new Date().toLocaleDateString()}</p>
        </div>
        {selectedKeys.map((key) => {
          const [category, filename] = key.split('/');
          const skill = skills.find(s => s.category === category && s.filename === filename);
          if (!skill) return null;
          return (
            <div 
              key={key} 
              style={{ 
                background: theme === 'light' ? '#FFFFFF' : '#161B22',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-category-badge" style={{ margin: 0 }}>{skill.category}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-weak)' }}>
                  {new Date(skill.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{skill.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {skill.description || '暂无简介描述。'}
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {skill.tags.map(tag => (
                  <span key={tag} className="card-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-weak)' }}>
          由 SkillVault 本地技能卡片管理器生成
        </div>
      </div>
    </div>
  );
}
