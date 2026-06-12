---
version: v2.0
name: SkillVault SaaS Minimal
description: 极简 SaaS 开发者友好设计系统，以实用、快捷、专业为核心，最大宽度 1280px，居中排版
colors:
  primary: "#111827"          # 主要文字（接近纯黑）
  secondary: "#6B7280"        # 辅助文字与次要说明字色
  border: "#E5E7EB"           # 边框与极细分割线色
  background: "#FAFAFA"       # 页面背景淡灰色
  card: "#FFFFFF"             # 卡片实体纯白背景
  accent: "#111111"           # 核心强调色与反色聚焦高亮
  danger: "#EF4444"           # 红色警示警告色（如彻底删除）
typography:
  hero:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.15
  section:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 32px
    fontWeight: 700
  card-title:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 700
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12px
    color: "#6B7280"
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
components:
  card:
    backgroundColor: "{colors.card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: 24px
  button:
    rounded: "{rounded.md}"
    fontSize: 14px
    fontWeight: 600
---

## Overview

SkillVault 前端交互规范遵循以 **“高效、极简、开发者友好 (Developer-Friendly)”** 为导向的现代 SaaS 界面体系。本规范参考了 70% GitHub + 20% Linear + 10% Anthropic Console 的视觉和排版精髓，追求零冗余装饰、高密度信息浏览以及快捷动作响应，让用户能够用最短的时间完成技能检索、一键复制和下载使用。

## Color System

系统限制使用单色极简配色（Monochrome-focused），严禁引入彩虹渐变、霓虹色块、霓虹发光或高饱和度的装饰底色：

- **Background (#FAFAFA)**：纯净、温和的页面背景色，提供宽敞的空气感。
- **Card (#FFFFFF)**：纯白卡片，通过 1px 极细边框 `#E5E7EB` 进行网格切分，在灰底上呈现极佳的几何边界。
- **Primary Text (#111827)**：主要文本字色，保持高对比度和清爽的可读性。
- **Secondary Text (#6B7280)**：用于辅助信息、更新时间、简介描述及副标题。
- **Accent (#111111)**：核心操作高亮、输入框激活、Tab 状态及反色聚焦环。
- **Danger (#EF4444)**：警示红色，仅用于彻底删除、清空垃圾桶或重置等危险确认交互，不得泛滥使用。

*注：暗黑模式采用 GitHub Dark 标志性色调，背景 `#0B0F17`，卡片 `#161B22`，边框 `#30363D`，字色 `#F0F6FC`，辅助字色 `#8B949E`。*

## Typography

字体的层级必须鲜明且富有冲击力：

- **大字号与留白**：巨幕大标题（64-80px Extra Bold）配合充足的留白，形成专业高档的视觉锚点。
- **等宽数字与规范拼写**：在卡片使用次数、更新日期和列表行中应用 `font-variant-numeric: tabular-nums` 防止字符抖动。
- **推荐字体**：优先加载 `Inter` 或者是系统原生的苹果/微软默认 UI 无衬线字体，保持专业、严谨。

## Layout

采用标准 SaaS 居中布局：

- **最大宽度 1280px**：限制页面内容主体区域最大宽度为 1280px，两侧留白，实现完美的阅读和操作流。
- **无两栏侧栏**：取消 Lovart 固有的左右侧边栏和抽屉，转为由置顶导航栏（Navbar）引领的自上而下的流式单页结构。
- **置顶横向过滤**：分类筛选系统横向排开并固定置顶，方便高频高效率的点按筛选。

## Skill Card Redesign

Skill Card 是系统核心的承载实体：

- **结构整合**：不再采用卡片标题外置排版。标题（18-22px Bold）、描述内容（14px 截断）、标签药丸和底部元数据（如 mtime 或是 uses 计数）以及核心操作按钮**必须完全包裹在圆角 16px 的白底卡片容器内**。
- **轻量浮动与阴影**：Hover 时轻微上浮 `translateY(-2px)`，并增加极其淡雅的扩散阴影，拒绝沉重的深色阴影。
- **一键极速动作**：卡片底部必须集成 `View (查看详情)`、`Copy (一键复制 Markdown 源码至剪贴板)` 以及 `Download (下载)` 按钮。让使用者无需打开详情也能够瞬间完成技能的拷贝应用。

## Animation

页面性能与响应速度高于一切。禁止一切与功能无关的全屏转场动画、粒子特效和复杂滚动特效。仅保留：

- **Hover Lift**：卡片或按钮 Hover 时微弱的 2px 上浮。
- **Fade In**：弹窗 Modal 和页面加载时的渐入。
- **Button Feedback**：按钮按压时的轻微缩水或色深变化。
- **Drag Feedback**：被拖拽的卡片 (`.is-dragging`) 呈现 `opacity: 0.4` 半透明与 `dashed` 虚线框边框样式，释放时伴随缓动回弹，以贴合 Linear 精致高级的微动交互体验。

## Mobile Guidelines

- 移动端下，所有 Grid 自动切换为 1 列；
- 顶部大搜索框在窄屏下自动拓宽并固定在顶部；
- 分类标签在窄屏下自动切换为支持左右手势横向滑动的轨道式面板；
- 所有的操作按钮高度必须在 `38px` 以上以利于手指触摸。

## Selection Mode Guidelines

多选模式下需遵循一致的 SaaS 级精修细节：

- **极简单色选框**：采用单色复选框，选中状态为纯黑（浅色模式）或纯白（暗黑模式），以无衬线高对比度为基调，严禁引入圆润彩色复选框。
- **防止遮挡位移**：当多选框滑入时，卡片内的徽标 Badge 及其他靠近边缘的文本需伴随 `transition: margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)` 平滑避让，避免任何视觉重叠。
- **严密指针规范**：常规状态下所有 Hover 元素的鼠标指针必须保持为标准的点击手型 `pointer` 以防看不清指针，仅在真正进行拖拽排序换位时转换为 `grabbing`，确保指针操作的语义和对比度清晰。
- **浮动控制条药丸**：置底的多选操作控制条采用毛玻璃微透面板，边缘有 1px 极细微光，淡入淡出并伴有轻微的物理物理下滑滑出微动动画。

