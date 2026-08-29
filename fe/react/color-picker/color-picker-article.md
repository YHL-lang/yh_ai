# 🎨 React + TypeScript 实战：从零构建颜色选择器应用

> 本文将带你从零开始，使用 React 19 + TypeScript + Vite 构建一个功能完整的颜色选择器应用。通过这个实战项目，你将掌握 React 组件化开发、TypeScript 类型系统、以及现代前端工程化的核心概念。

---

## 🖼️ 项目预览

本项目实现了一个带有颜色选择和成员列表功能的 React 应用，主要包含三个核心组件：

- 🔵 **ColorBrowser** - 颜色预览区域
- 🎚️ **ColorPicker** - RGB 滑块控制器
- 👥 **MemberTable** - 成员列表展示

---

## 🚀 一、项目初始化与技术栈

### 📦 1.1 技术栈选择

| 技术 | 版本 | 作用 |
|------|------|------|
| ⚛️ React | 19.x | UI 框架 |
| 🔷 TypeScript | 6.x | 类型系统 |
| ⚡ Vite | 8.x | 构建工具 |

### 🛠️ 1.2 快速创建项目

使用 Vite 脚手架初始化项目：

```bash
npm create vite@latest color-picker -- --template react-ts
cd color-picker
npm install
npm run dev
```

### 📁 1.3 项目目录结构

```
color-picker/
├── src/
│   ├── api/            # 🌐 API 请求层
│   │   └── memberApi.ts
│   ├── assets/         # 📸 静态资源
│   ├── components/     # 🧩 组件目录
│   │   ├── ColorBrowser.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── MemberTable.tsx
│   │   └── Sidebar.tsx
│   ├── model/          # 📋 数据模型/类型定义
│   │   ├── color.ts
│   │   └── member.ts
│   ├── App.tsx         # 🏠 根组件
│   ├── App.css         # 🎨 样式文件
│   ├── index.css       # 🌍 全局样式
│   └── main.tsx        # 🚪 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔷 二、TypeScript 类型定义

TypeScript 的核心价值在于**类型安全**。在项目初期，我们先定义好数据模型，后续开发中就能享受类型推导和代码提示的便利。

### 🎨 2.1 颜色类型 `color.ts`

```typescript
// src/model/color.ts

// 定义 RGB 颜色接口，多处复用
export interface Color {
  red: number;
  green: number;
  blue: number;
}
```

### 👤 2.2 成员类型 `member.ts`

```typescript
// src/model/member.ts

export interface MemberEntity {
  id: number;
  login: string;
  avatar_url: string;
}
```

> 💡 **为什么单独建 model 目录？**
> 将类型定义集中管理，便于多人协作时保持数据结构的一致性，也方便后期维护和修改。

---

## 🧩 三、核心组件开发

### 🔵 3.1 ColorBrowser - 颜色预览组件

这个组件接收 `Color` 对象，动态渲染对应的背景色。

```tsx
// src/components/ColorBrowser.tsx

import * as React from 'react';
import { type Color } from '../model/color';

interface Props {
  color: Color;
}

const ColorBrowser: React.FC<Props> = (props) => {
  const divStyle: React.CSSProperties = {
    width: "11rem",
    height: "7rem",
    backgroundColor: `rgb(${props.color.red}, ${props.color.green}, ${props.color.blue})`
  };

  return <div style={divStyle} />;
};

export default ColorBrowser;
```

📝 **要点解析：**
- 使用 `React.CSSProperties` 类型约束样式对象
- 通过模板字符串动态拼接 `rgb()` 颜色值
- `React.FC<Props>` 是函数组件的标准类型写法

---

### 🎚️ 3.2 ColorPicker - 颜色选择器组件

这是应用的核心交互组件，包含三个 RGB 滑块。

```tsx
// src/components/ColorPicker.tsx

import * as React from 'react';
import { type Color } from '../model/color';

interface Props {
  color: Color;
  onColorUpdate: (color: Color) => void;
}

const ColorPicker: React.FC<Props> = (props) => {
  return (
    <div>
      {/* 🔴 Red 滑块 */}
      <input
        type="range"
        min="0"
        max="255"
        value={props.color.red}
        onChange={(event) =>
          props.onColorUpdate({
            ...props.color,
            red: +event.target.value,
          })
        }
      />
      {props.color.red}

      <br />

      {/* 🟢 Green 滑块 */}
      <input
        type="range"
        min="0"
        max="255"
        value={props.color.green}
        onChange={(event) =>
          props.onColorUpdate({
            ...props.color,
            green: +event.target.value,
          })
        }
      />
      {props.color.green}

      <br />

      {/* 🔵 Blue 滑块 */}
      <input
        type="range"
        min="0"
        max="255"
        value={props.color.blue}
        onChange={(event) =>
          props.onColorUpdate({
            ...props.color,
            blue: +event.target.value,
          })
        }
      />
      {props.color.blue}
    </div>
  );
};

export default ColorPicker;
```

📝 **要点解析：**
- `onColorUpdate` 是从父组件传入的回调函数，实现了**子向父通信** 🔗
- `+event.target.value` 将字符串转换为数字（`+` 是一元运算符）
- `...props.color` 使用展开运算符，只更新变化的属性，保持其他属性不变

---

### 👥 3.3 MemberTable - 成员列表组件

展示从 API 获取的成员数据，演示了数据请求和列表渲染。

```tsx
// src/components/MemberTable.tsx

import * as React from 'react';
import { type MemberEntity } from '../model/member';
import { getMembersCollection } from '../api/memberApi';

// 👤 单行成员组件
interface MemberRowProps {
  member: MemberEntity;
}

const MemberRow = (props: MemberRowProps) => {
  const { member } = props;
  return (
    <tr>
      <td>
        <img src={member.avatar_url} style={{ maxWidth: '10rem' }} />
      </td>
      <td>
        <span>{member.id}</span>
      </td>
      <td>
        <span>{member.login}</span>
      </td>
    </tr>
  );
};

// 📊 成员表格组件
const MemberTable: React.FC = () => {
  const [memberCollection, setMemberCollection] = React.useState<MemberEntity[]>([]);

  React.useEffect(() => {
    // 🚀 组件挂载后请求数据
    (async () => {
      const members = await getMembersCollection();
      setMemberCollection(members);
    })();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>🖼️ Avatar</th>
          <th>🆔 Id</th>
          <th>👤 Name</th>
        </tr>
      </thead>
      <tbody>
        {memberCollection.map((member: MemberEntity) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </tbody>
    </table>
  );
};

export default MemberTable;
```

📝 **要点解析：**
- `useState<MemberEntity[]>([])` 使用泛型指定状态类型
- `useEffect` + 空依赖 `[]` 确保只在组件挂载时执行一次
- 使用 IIFE（立即执行函数）处理 async/await
- `key={member.id}` 是 React 列表渲染的必要属性

---

## 🌐 四、API 层设计

将数据请求逻辑独立到 `api` 目录，实现关注点分离。

```typescript
// src/api/memberApi.ts

import { type MemberEntity } from '../model/member';

export const getMembersCollection = (): Promise<MemberEntity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1457912,
          login: 'brauliodiez',
          avatar_url: 'https://avatars.githubusercontent.com/u/1457912?v=3'
        },
        {
          id: 4374977,
          login: 'Nasdan',
          avatar_url: 'https://avatars.githubusercontent.com/u/4374977?v=3'
        }
      ]);
    }, 5000); // ⏱️ 模拟 5 秒延迟
  });
};
```

> 💡 这里使用 `setTimeout` 模拟异步接口请求。实际项目中替换为 `fetch` 或 `axios` 即可。

---

## 🏠 五、根组件组装

在 `App.tsx` 中将所有组件组合起来，管理共享状态。

```tsx
// src/App.tsx

import { useState } from 'react';
import ColorBrowser from './components/ColorBrowser';
import { type Color } from './model/color';
import ColorPicker from './components/ColorPicker';
import MemberTable from './components/MemberTable';

function App() {
  // 🎯 使用 useState 管理颜色状态
  const [color, setColor] = useState<Color>({
    red: 20,
    green: 40,
    blue: 180,
  });

  return (
    <>
      <ColorBrowser color={color} />
      <ColorPicker color={color} onColorUpdate={setColor} />
      <MemberTable />
    </>
  );
}

export default App;
```

### 📊 数据流向图

```
┌─────────────────────────────────────────┐
│                 App                     │
│          (color state) 🎯               │
│              │                          │
│    ┌─────────┴──────────┐               │
│    ▼                    ▼               │
│ ColorBrowser      ColorPicker           │
│ (只读展示) 👁️     (触发更新) ✏️          │
│                       │                 │
│                       ▼                 │
│              onColorUpdate 🔗           │
│              setColor(color)            │
└─────────────────────────────────────────┘
```

---

## 🚪 六、应用入口

```tsx
// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- 🛡️ `StrictMode` 在开发模式下会额外检查潜在问题
- ❗ `!` 是 TypeScript 的非空断言，告诉编译器 `getElementById` 不会返回 `null`

---

## ⚙️ 七、启动与构建

### 🏃 开发模式

```bash
npm run dev
```

### 📦 生产构建

```bash
npm run build
```

### 👀 预览构建结果

```bash
npm run preview
```

---

## 📚 八、总结

通过这个项目，我们实践了以下核心知识点：

| 🎯 知识点 | 📍 应用场景 |
|--------|----------|
| 🔷 TypeScript 接口 | 定义 `Color`、`MemberEntity` 类型 |
| ⚛️ React 函数组件 | `ColorBrowser`、`ColorPicker`、`MemberTable` |
| 🎣 useState | 管理颜色状态和成员列表 |
| 🔄 useEffect | 组件挂载时请求数据 |
| 📤 Props 传递 | 父子组件通信 |
| 🔔 回调函数 | 子组件通知父组件状态变化 |
| 📋 列表渲染 | `map` + `key` 渲染成员表格 |
| 📁 项目分层 | model / api / components 目录划分 |

> 💡 **TypeScript 适合大型项目开发** — 代码量大、成员多时，类型系统能有效减少运行时错误，提升协作效率。

---

**Happy Coding! 🎨🚀✨**
