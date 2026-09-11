# 🚀 基于 Next.js 16 + Redis 的全栈笔记博客系统

## 📖 项目概述

这是一个使用 **Next.js 16** 构建的全栈笔记博客系统，支持 Markdown 格式的笔记 CRUD 操作。项目采用 **React Server Component (RSC)** 架构，结合 **Redis** 内存数据库，实现了高性能的笔记管理功能。

---

## 🛠️ 技术栈一览

| 技术 | 版本 | 用途 |
|------|------|------|
| ⚛️ Next.js | 16.3.4 | 全栈框架，支持 SSR/SEO |
| ⚛️ React | 19.2.8 | UI 渲染引擎 |
| 🔴 Redis (ioredis) | 6.0.0 | 内存数据库存储 |
| 📅 dayjs | 1.11.23 | 日期格式化 |
| 📦 npx | - | 包运行工具，无需全局安装 |

---

## 🎯 项目需求分析

### 核心功能
1. **两栏布局**：左侧笔记列表，右侧笔记内容
2. **笔记 CRUD**：创建、查看、编辑、删除笔记
3. **Markdown 支持**：数据库存储 Markdown，页面渲染 HTML
4. **搜索功能**：快速查找笔记（规划中）
5. **SEO 优化**：服务器端渲染，良好的搜索引擎支持

---

## 🏗️ 项目架构设计

### 📁 目录结构

```
next-blog/
├── app/                    # 页面主目录 (App Router)
│   ├── layout.js          # 根布局组件
│   ├── page.js            # 首页
│   ├── style.css          # 全局样式
│   └── note/
│       ├── [id]/page.js   # 笔记详情页 (动态路由)
│       └── edit/
│           ├── page.js    # 新增笔记
│           └── [id]/page.js # 编辑笔记
├── components/             # 组件目录
│   ├── Sidebar.js         # 侧边栏组件
│   ├── SidebarNoteList.js # 笔记列表
│   ├── SidebarNoteItem.js # 笔记项
│   └── SidebarNoteItemContent.js # 笔记内容
├── lib/                    # 数据库操作
│   └── redis.js           # Redis 连接和操作
└── public/                 # 静态资源
    └── logo.svg           # Logo
```

### 🔗 路由设计

采用 **App Router** 文件即路由的方式：

| 路由 | 方法 | 功能 |
|------|------|------|
| `/` | GET | 首页，显示笔记列表 |
| `/note/[id]` | GET | 查看笔记详情 |
| `/note/edit` | POST | 新增笔记 |
| `/note/edit/[id]` | PUT | 编辑笔记 |

---

## 🧩 组件设计与拆分

### 📐 组件层级结构

```
Sidebar (RSC)
├── SidebarSearchField (未来实现)
└── SidebarNoteList (RSC)
    └── SidebarNoteItem (CSR - 客户端交互)
        └── SidebarNoteItemContent (CSR)

Note
├── NoteEditor (编辑模式)
└── NotePreview (预览模式)
```

### 💡 关键设计思想

**RSC 与 CSR 的结合使用**：
- **RSC (React Server Component)**：用于数据获取和 SEO 优化，如 `Sidebar`、`SidebarNoteList`
- **CSR (Client Side Rendering)**：用于交互逻辑，如 `SidebarNoteItemContent` 使用 `"use client"` 指令

```javascript
// SidebarNoteItemContent.js - 客户端组件
"use client"
import { useState, useEffect } from 'react'

export default function SidebarNoteItemContent({ id, title, children, expandChildren }) {
  return (
    <>
      {children}
    </>
  )
}
```

---

## 🔴 Redis 数据服务

### 为什么选择 Redis？

| 特性 | 优势 |
|------|------|
| ⚡ 高性能 | 内存数据库，读写速度极快 |
| 📊 灵活存储 | 支持多种数据类型（字符串、哈希等） |
| 🔑 Key-Value 模式 | 类似 localStorage，使用简单 |
| 🏆 适用场景 | 缓存、计数器、排行榜等 |

### 🗄️ 数据模型设计

采用 Redis 的 **Hash** 类型存储笔记：

```javascript
// lib/redis.js
import Redis from 'ioredis'
const redis = new Redis();

// 初始数据
const initialData = {
  "1702459181837": '{"title":"sunt aut","content":"quia et suscipit","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum tempore","updateTime":"2023-12-13T09:19:48.837Z"}',
}

export async function getAllNote() {
  const data = await redis.hgetall('notes');
  // 如果没有数据，初始化
  if (Object.keys(data).length == 0) {
    await redis.hset("notes", initialData);
  }
  return await redis.hgetall("notes");
}
```

**数据结构说明**：
- **Key**: `notes` (Hash 类型)
- **Field**: 时间戳 ID (如 `1702459181837`)
- **Value**: JSON 字符串，包含 `title`、`content`、`updateTime`

---

## ⚙️ 配置优化

### 路径别名配置

避免深层相对路径引用，使用 `@` 别名：

```javascript
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

**使用对比**：
```javascript
// ❌ 相对路径（难以维护）
import { getAllNote } from '../../../lib/redis.js'

// ✅ 别名路径（清晰简洁）
import { getAllNote } from '@/lib/redis.js'
```

---

## 🎨 样式设计

### BEM 命名规范

项目采用 **BEM** (Block Element Modifier) 命名规范：

```css
/* Block - 块 */
.sidebar { }

/* Element - 元素（用单下划线连接） */
.sidebar-header { }
.sidebar-menu { }

/* Modifier - 修饰符（用双下划线连接） */
.edit-button--solid { }
.edit-button--outline { }
```

### CSS 变量定义

```css
:root {
  --primary-blue: #037dba;
  --secondary-blue: #0396df;
  --gray-20: #404346;
  --gray-95: #f0f2f5;
  --white: #fff;
  /* ... */
}
```

---

## 🚀 快速开始

### 1️⃣ 创建项目

```bash
npx create-next-app@latest next-blog
```

> 💡 **npx 优势**：无需全局安装 `create-next-app`，直接运行

### 2️⃣ 安装依赖

```bash
cd next-blog
npm install ioredis dayjs
```

### 3️⃣ 启动 Redis

确保 Redis 服务运行在默认端口 `6379`

### 4️⃣ 运行项目

```bash
npm run dev
```

访问 `http://localhost:3000` 查看效果

---

## 📝 开发规范

### 1. 注释大法

```javascript
// Sidebar
// 区块 电商网站，商品介绍，商品评论，图片，售价....
// 语义是独立的一块内容区域
<section className='col sidebar'>
  {/* SideSearchField  未来干*/}
  {/* SidebarNodeList */}
</section>
```

**好处**：
- 📌 标记未来要做的功能
- 🤝 有利于团队协作
- 🧠 帮助记忆和维护

### 2. 语义化标签

```html
<nav>     <!-- 导航栏 -->
<section> <!-- 区块 -->
<header>  <!-- 头部 -->
<footer>  <!-- 底部 -->
```

### 3. 组件拆分原则

- 每个组件是一个**工作单元**
- 开发前先分析需求，规划组件结构
- RSC 负责数据获取，CSR 负责交互

---

## 🔮 未来规划

| 功能 | 状态 | 说明 |
|------|------|------|
| 🔍 搜索功能 | 待开发 | `SidebarSearchField` 组件 |
| ✏️ Markdown 编辑器 | 待开发 | 支持实时预览 |
| 📄 分页功能 | 待开发 | 大量笔记时的性能优化 |
| 🔐 用户认证 | 待开发 | 多用户支持 |

---

## 💡 核心知识点总结

1. **Next.js App Router**：文件即路由，支持动态路由 `[id]`
2. **RSC + CSR 混合架构**：服务端组件负责 SEO 和数据获取，客户端组件负责交互
3. **Redis Hash 存储**：高效的键值对存储方案
4. **路径别名**：`@/` 简化导入路径
5. **BEM 命名规范**：可维护的 CSS 类名命名方式

---

## 📚 参考资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Redis 命令参考](https://redis.io/commands)
- [BEM 命名规范](https://getbem.com/)

---

> 🎉 **总结**：这个项目展示了如何使用 Next.js 16 构建一个现代化的全栈应用，通过 RSC 架构实现高性能渲染，结合 Redis 实现快速数据存取。项目结构清晰，组件划分合理，是一个很好的学习案例。
