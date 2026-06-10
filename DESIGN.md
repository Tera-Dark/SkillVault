---
version: alpha
name: SkillVault Lovart Minimal
description: 极简画廊黑白美学设计系统，外置排版与大圆角模块
colors:
  primary: "#18181b"          # 主文字与主按钮背景
  secondary: "#71717a"        # 辅助次要字色
  weak: "#a1a1aa"             # 弱文字与未激活图标色
  neutral: "#ffffff"          # 纯白底色
  card: "#f4f4f5"             # 卡片块灰色背景
  card-hover: "#e4e4e7"       # 卡片悬浮色
  border: "#e4e4e7"           # 边框与极细分割线
  accent: "#ef4444"           # 强调危险色（如删除、清空）
typography:
  h1:
    fontFamily: Outfit, Plus Jakarta Sans, sans-serif
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.5px
  body:
    fontFamily: Plus Jakarta Sans, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
components:
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
  button-danger:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
---

## Overview

SkillVault 秉持“Architectural Minimalism meets Gallery Aesthetics”的视觉理念。界面应当呈现出极具秩序感的黑白二色，类似于现代画廊展签或高端报刊。页面不采用繁复的装饰性投影或斑斓的渐变色，而是通过**大面积低饱和度灰色色块的物理堆叠**和**极具易读性的高对比排版**来唤起清澈、平静的交互体验。

## Colors

本设计系统基于纯黑、纯白和中性灰，配以极具克制的警示红：

- **Primary (#18181b)**: 极深墨黑，用于核心文字、H1/H2 标题、主按钮背景。
- **Secondary (#71717a)**: 优雅中性灰，用于描述文本、次要信息。
- **Weak (#a1a1aa)**: 浅灰，用于占位符、未激活的微小图标。
- **Neutral (#ffffff)**: Limestone 纯白基底。
- **Card (#f4f4f5)**: 浅灰扁平色块，在暗黑模式下热切换为石墨深灰，用于承载卡片物理形状。
- **Accent (#ef4444)**: 醒目红色，仅作为终极危险确认、一键清空和删除时的警示色，不得泛滥使用。

## Typography

排版是本界面的视觉骨架：

- **标题字体 (Outfit)**: 选用几何感极强的 Outfit 字体。在大标题和卡片外部标题上采用超重字重 (`800`) 和负字符间距 (`-0.5px`)，凸显力量感与结构感。
- **正文字体 (Plus Jakarta Sans)**: 选用宽扁、易读性极佳的 Plus Jakarta Sans 字体。中文部分降级到系统默认的 `-apple-system` 族群，确保行高充足 (`1.6`)。

## Layout

布局采用严谨的双栏非对称网格：

- **左侧窄导航栏 (72px)**: 极简流线型控制塔，仅用极细分割线 (`1px`) 隔离。
- **过滤器侧边栏 (240px)**: 常驻/可折叠的筛选区域。
- **卡片网格**: 响应式栅格，卡片列宽限制为最小 `320px`，防止过度拉伸而失去画廊长宽比。

## Elevation & Depth

界面呈现纯平面 (Flat) 堆叠，通常不使用 `box-shadow`。
仅在卡片悬停 (`hover`) 时，小幅上浮并投出极其细腻、弥散的边缘阴影 (`rgba(0, 0, 0, 0.04)`)，以此展现物理层级的微弱变化。

## Shapes

圆角是界面的温和调节器：

- 卡片采用大圆角 (`lg: 16px`)，凸显模块整体的实体存在感。
- 按钮和输入框采用中圆角 (`md: 8px`)，保持利落。
- 药丸搜索框、药丸过滤标签、星标等交互组件采用全圆角 (`full: 9999px`)。

## Components

- **Card (卡片)**: 采用 `Card` 灰色色块作为容器，内容预览限制在 5 行内，所有关键的标题和标签均在容器外侧下方排布（即外置排版），使得色块内部极其纯净。
- **Button (按钮)**: 
  - 主按钮为纯黑底白字；
  - 危险按钮（如彻底删除）为白底红字配红细虚线边框；
  - 暗黑模式下，所有按钮的背景与字色会自动做高对比反转。

## Do's and Don'ts

- **Do**: 保持卡片内部的纯净度，让文本自然截断，任何元数据都置于卡片底部外部；
- **Do**: 使用极细线条图标 (stroke: 1.5px)；
- **Don't**: 禁止在页面中引入任何硬编码的“魔术数值”（如引入未经定义的渐变色或非标圆角）；
- **Don't**: 严禁在非警示区域滥用 `Accent` 红色。
