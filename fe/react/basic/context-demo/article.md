# 🧠 React useContext 深度解析：告别 Props 层层传递的噩梦

> **一句话总结**：`useContext` 让你跨越任意层级直接读取共享数据，再也不用手动"搬运" props 了。

---

## 📖 目录

1. [🤔 为什么需要 Context？](#-为什么需要-context)
2. [🏗️ 项目结构一览](#️-项目结构一览)
3. [🔑 核心三步曲：createContext → Provider → useContext](#-核心三步曲)
4. [📦 Step 1：创建上下文 — createContext](#-step-1创建上下文--createcontext)
5. [🎁 Step 2：提供上下文 — Provider](#-step-2提供上下文--provider)
6. [🎯 Step 3：消费上下文 — useContext](#-step-3消费上下文--usecontext)
7. [🪝 自定义 Hook：useTheme 的封装艺术](#-自定义-hookusetheme-的封装艺术)
8. [🖱️ 进阶：自定义 Hook useMouse — 监听鼠标坐标](#️-进阶自定义-hook-usemouse--监听鼠标坐标)
9. [⚡ Context 的最佳实践与避坑指南](#-context-的最佳实践与避坑指南)
10. [🗺️ 知识图谱总结](#️-知识图谱总结)

---

## 🤔 为什么需要 Context？

### 😩 Props Drilling（属性逐层传递）的痛苦

想象一个场景：你的应用有一个**主题色**，最外层的 `App` 知道当前主题是什么，但真正需要使用主题的组件藏在 **第 4 层、第 5 层** 深处。

```
App (theme = "dark")
 └─ Layout (theme)          ← 不需要，但得接收
      └─ Sidebar (theme)    ← 不需要，但得接收
           └─ Nav (theme)   ← 不需要，但得接收
                └─ Button   ← 终于用到了！✅
```

**没有 Context 之前**，每一层都要 `props.theme` 一路传下来 —— 中间层纯粹是"搬运工"，代码冗余、维护困难、容易出错 😵。

### ✅ Context 的解决方案

```
App (theme = "dark")
 └─ <Provider value={theme}>
      └─ Layout
           └─ Sidebar
                └─ Nav
                     └─ Button → useTheme() → 直接拿到 "dark" 🎉
```

> 🎯 **核心思想**：在顶层"广播"数据，任意深层的子组件都可以直接"收听"，无需中间层转发。

---

## 🏗️ 项目结构一览

```
context-demo/
├── src/
│   ├── ThemeContext.jsx      # 📡 创建上下文（第 1 步）
│   ├── App.jsx               # 🎁 提供上下文（第 2 步）
│   ├── App2.jsx              # 🖱️ useMouse 演示
│   ├── main.jsx              # 🚀 应用入口
│   ├── components/
│   │   ├── Page.jsx          # 📄 中间层组件（消费上下文）
│   │   └── Child.jsx         # 👶 深层子组件（消费上下文）
│   └── hooks/
│       ├── useTheme.js       # 🎨 自定义 Hook — 封装 useContext
│       └── useMouse.js       # 🖱️ 自定义 Hook — 监听鼠标
├── index.html
├── package.json
└── vite.config.js
```

> 💡 **架构提示**：`hooks/` 目录存放自定义 Hook，属于项目的**架构层**；`components/` 存放 UI 组件。这种分层是 React 项目的经典范式。

---

## 🔑 核心三步曲

使用 `useContext` 只需要 **三步**，像搭积木一样简单：

```
┌─────────────────────────────────────────────────┐
│  ① createContext()   → 创建一个"广播频道"        │
│  ② <Provider value>  → 在顶层"发射信号"          │
│  ③ useContext()      → 在任意子组件"接收信号"    │
└─────────────────────────────────────────────────┘
```

---

## 📦 Step 1：创建上下文 — `createContext`

📄 **文件：`ThemeContext.jsx`**

```jsx
// 将创建一个 Theme 上下文，为深层次的组件树提供主题共享数据
import { createContext } from 'react';

export const ThemeContext = createContext("light");
```

### 🔍 逐行解读

| 代码 | 含义 |
|------|------|
| `import { createContext }` | 从 React 中引入 `createContext` 函数 |
| `createContext("light")` | 创建一个上下文对象，默认值为 `"light"` |
| `export const ThemeContext` | 导出这个上下文对象，供其他文件使用 |

### 💡 关键知识点

- **`createContext(defaultValue)`** 接受一个参数作为**默认值**
- 默认值只在**没有匹配到 Provider 时**才会生效（兜底方案）
- 返回的是一个**对象**，包含 `Provider` 和 `Consumer` 两个组件
- 通常**单独建一个文件**来创建和导出 Context，保持模块化

> 🏷️ **命名约定**：Context 对象通常以 `XxxContext` 命名，一眼就能识别它的用途。

---

## 🎁 Step 2：提供上下文 — `Provider`

📄 **文件：`App.jsx`**

```jsx
import { useState } from 'react'
import { ThemeContext } from './ThemeContext.jsx';
import Page from './components/Page.jsx';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    // ✅ 上下文的提供者 — 作为容器包裹子组件树
    // 不一定需要全局，任何组件都可以作为 Provider 容器
    // 默认值是 "light"，通过 value 属性可以动态改变
    <ThemeContext.Provider value={theme}>
      <Page />
      <button onClick={() => setTheme("dark")}>切换主题</button>
    </ThemeContext.Provider>
  )
}

export default App;
```

### 🔍 逐行解读

| 代码 | 含义 |
|------|------|
| `const [theme, setTheme] = useState('light')` | 用 `useState` 管理当前主题状态 |
| `<ThemeContext.Provider>` | 使用 Provider 组件作为"广播站" |
| `value={theme}` | 将当前主题作为信号发射出去 |
| `<Page />` | Page 及其所有子组件都能接收到这个信号 |
| `setTheme("dark")` | 点击按钮后切换主题，所有消费组件**自动更新** |

### 🧩 组件层级关系图

```
App  ← useState 管理 theme
 │
 ├── <ThemeContext.Provider value={theme}>   ← 📡 广播站
 │      │
 │      ├── Page  ← 📄 消费主题
 │      │    │
 │      │    └── Child  ← 👶 消费主题
 │      │
 │      └── <button>切换主题</button>  ← 🔄 触发更新
```

### 💡 关键知识点

- **`<Provider value={xxx}>`** 的 `value` 就是向下传递的数据
- Provider **不是全局的** —— 它可以放在任何组件里，按需使用
- 当 `value` 变化时，**所有消费该 Context 的子组件都会重新渲染** 🔁
- 可以嵌套多个 Provider，内层会覆盖外层的值

---

## 🎯 Step 3：消费上下文 — `useContext`

消费 Context 有两种方式，我们重点看现代的 `useContext` 方式。

### 📄 文件：`components/Page.jsx`

```jsx
import Child from './Child.jsx';
import { useTheme } from '../hooks/useTheme.js';

const Page = () => {
  const theme = useTheme();   // 🎯 直接获取主题值
  console.log(theme);

  return (
    <>
      Page — 当前主题：{theme}
      <br />
      <Child />
    </>
  )
}

export default Page;
```

### 📄 文件：`components/Child.jsx`

```jsx
import { useTheme } from '../hooks/useTheme.js';

function Child() {
  const theme = useTheme();   // 🎯 同样直接获取
  console.log(theme);

  return (
    <>
      Child
      <button className={theme}>按钮 — {theme}</button>
    </>
  )
}

export default Child;
```

### 🔍 消费逻辑

```
Page 组件 ──useTheme()──→ 读取 ThemeContext 的值 ──→ "light"
    │
    └── Child 组件 ──useTheme()──→ 读取 ThemeContext 的值 ──→ "light"
```

**没有 props 传递，没有中间层搬运，直接跨层级获取数据！** 🎉

### 💡 关键知识点

- `useContext(Context)` 接收一个 Context 对象，返回当前的 `value`
- 它会**自动订阅** —— 当 Provider 的 value 变化时，组件自动重新渲染
- `useContext` 必须在**函数组件或自定义 Hook 内部**调用
- 一个组件可以同时消费**多个** Context

---

## 🪝 自定义 Hook：useTheme 的封装艺术

📄 **文件：`hooks/useTheme.js`**

```jsx
// React 全面 hooks 编程：
// 可以使用 React、react-router-dom 等提供的 hooks
// 还可以自定义 hook —— use 开头的函数
// 比普通函数封装多的地方：可以将 React 响应式、副作用业务等封装进去
// 在 Provider 里面任何层级的组件，多个地方消费数据
// 模块化抽离放到 hooks 里面

import { ThemeContext } from '../ThemeContext.jsx';
import { useContext } from 'react';

// ✅ 约定：以 use 开头
export function useTheme() {
  return useContext(ThemeContext);
}
```

### 🤔 为什么多包一层？直接 `useContext` 不行吗？

**当然可以**，但封装自定义 Hook 有 **三大好处**：

```
┌────────────────────────────────────────────────────────────┐
│  ① 📛 语义化    → useTheme() 比 useContext(ThemeContext)    │
│                    更直观，一眼看出用途                       │
│                                                            │
│  ② 🔧 可扩展    → 未来可以加逻辑（格式化、校验、默认值）    │
│                                                            │
│  ③ 🧹 解耦      → 消费方不需要知道 ThemeContext 的存在      │
│                    只需要引入 useTheme 即可                  │
└────────────────────────────────────────────────────────────┘
```

### 📐 对比：封装 vs 不封装

```jsx
// ❌ 直接使用 — 每个文件都要引入两个东西
import { ThemeContext } from '../ThemeContext.jsx';
import { useContext } from 'react';
const theme = useContext(ThemeContext);

// ✅ 封装后 — 一行搞定
import { useTheme } from '../hooks/useTheme.js';
const theme = useTheme();
```

### 💡 自定义 Hook 的规则

| 规则 | 说明 |
|------|------|
| 以 `use` 开头 | 这是 React 的约定，让 ESLint 能检测 Hook 规则 |
| 可以调用其他 Hook | 内部可以使用 `useState`、`useEffect`、`useContext` 等 |
| 返回值灵活 | 可以返回任何值：基本类型、对象、数组、函数 |
| 放在 `hooks/` 目录 | 项目架构约定，方便管理和查找 |

---

## 🖱️ 进阶：自定义 Hook `useMouse` — 监听鼠标坐标

除了 Context，自定义 Hook 还能封装各种**响应式逻辑**。这个例子展示了如何将鼠标坐标追踪封装为一个可复用的 Hook。

📄 **文件：`hooks/useMouse.js`**

```jsx
import { useState, useEffect } from 'react';

export const useMouse = () => {
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      // ⚠️ 函数组件卸载后，不会自动回收
      // 定时器、Worker、事件监听 —— 都需要手动回收
      document.removeEventListener('mousemove', handleMouseMove);
    }

    function handleMouseMove(e) {
      setX(e.clientX);
      setY(e.clientY);
    }
  }, [])    // 空依赖数组 → 只在挂载时执行一次

  return { x, y };
}
```

### 🔍 逐行解读

| 代码 | 含义 |
|------|------|
| `const [x, setX] = useState(null)` | 用状态存储 X 坐标 |
| `const [y, setY] = useState(null)` | 用状态存储 Y 坐标 |
| `useEffect(() => {...}, [])` | 副作用：挂载时注册事件，空依赖 = 只执行一次 |
| `addEventListener('mousemove', ...)` | 监听鼠标移动事件 |
| `return () => removeEventListener(...)` | ⚠️ **清理函数**：卸载时移除监听，防止内存泄漏 |
| `return { x, y }` | 将坐标暴露给消费方 |

### 📄 使用：`App2.jsx`

```jsx
import { useMouse } from "./hooks/useMouse"

function App() {
  const { x, y } = useMouse();   // 🎯 一行代码获取鼠标坐标

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {x && y ? `x: ${x}, y: ${y}` : '鼠标未移动'}
    </div>
  )
}

export default App
```

### 🧩 数据流图

```
浏览器 mousemove 事件
       │
       ▼
  useMouse() Hook
  ┌─────────────┐
  │  useEffect   │  注册事件监听
  │  handleMove  │  → setX / setY（触发 re-render）
  │  cleanup     │  → removeEventListener（卸载时清理）
  └─────────────┘
       │
       ▼
  return { x, y }  →  App 组件解构使用  →  页面显示坐标
```

### 💡 useMouse 中的三大知识点

#### 1️⃣ `useEffect` 的清理机制

```jsx
useEffect(() => {
  // ✅ 挂载时：注册
  document.addEventListener('mousemove', handler);

  return () => {
    // ✅ 卸载时：清理
    document.removeEventListener('mousemove', handler);
  };
}, []);
```

> 🚨 **不清理的后果**：组件卸载后，事件监听器仍然存在 → **内存泄漏**！

#### 2️⃣ 空依赖数组 `[]`

```jsx
useEffect(() => { ... }, [])
//                        ^^
// 空数组 = "只在组件挂载时运行一次"
// 没有数组 = "每次渲染都运行"
// [dep] = "dep 变化时运行"
```

#### 3️⃣ 自定义 Hook 的复用性

`useMouse` 可以在**任何组件**中使用，每个组件独立维护自己的鼠标状态：

```jsx
// 组件 A
const { x: ax, y: ay } = useMouse();

// 组件 B — 完全独立的状态
const { x: bx, y: by } = useMouse();
```

---

## ⚡ Context 的最佳实践与避坑指南

### ✅ 最佳实践

| 实践 | 说明 |
|------|------|
| 🎯 **职责单一** | 一个 Context 只管一类数据（主题、语言、用户信息分开） |
| 📦 **单独文件** | 每个 Context 独立一个文件，便于维护 |
| 🪝 **封装 Hook** | 封装 `useXxx()` 自定义 Hook，解耦消费方 |
| 📍 **就近放置** | Provider 放在**刚好能覆盖所有消费方**的层级，不要无脑放最顶层 |

### ❌ 常见陷阱

#### 1. 不要滥用 Context

```jsx
// ❌ 频繁变化的值不适合用 Context
//    每次 value 变化，所有消费者都会 re-render
<Context.Provider value={{ x: mouseX, y: mouseY }}>
  {/* 每次鼠标移动，所有子组件都重新渲染！💥 */}
</Context.Provider>

// ✅ 频繁变化的值 → 用自定义 Hook 直接管理（如 useMouse）
// ✅ 稳定的全局数据（主题、语言、用户）→ 适合 Context
```

#### 2. 注意 value 的引用稳定性

```jsx
// ❌ 每次渲染都创建新对象 → 所有消费者都会 re-render
<ThemeContext.Provider value={{ theme, toggleTheme }}>

// ✅ 用 useMemo 稳定引用
const value = useMemo(() => ({ theme, toggleTheme }), [theme]);
<ThemeContext.Provider value={value}>
```

#### 3. Provider 找不到时使用默认值

```jsx
const ThemeContext = createContext("light");

// 如果某个组件不在任何 Provider 内部
// useTheme() 会返回默认值 "light"，而不是报错
```

---

## 🗺️ 知识图谱总结

```
                    React Context 知识图谱
                    ═══════════════════════

    ┌──────────────────────────────────────────────┐
    │              createContext()                 │
    │         创建上下文，定义默认值                  │
    └─────────────────┬────────────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────────────┐
    │        <Context.Provider value={}>           │
    │    提供上下文，包裹子组件树                     │
    │    value 变化 → 消费者自动 re-render           │
    └─────────────────┬────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │ useContext│ │ useContext│ │  useContext   │
    │ (直接)   │ │ (直接)   │ │ (自定义Hook)  │
    └──────────┘ └──────────┘ └──────────────┘
                                       │
                              ┌────────┴────────┐
                              │   useTheme()    │
                              │   useUser()     │
                              │   useLang()     │
                              │   ...           │
                              └─────────────────┘

    ┌──────────────────────────────────────────────┐
    │           自定义 Hooks 扩展                   │
    │                                              │
    │  useTheme()  → 封装 useContext               │
    │  useMouse()  → 封装 useState + useEffect     │
    │  useXxx()    → 封装任意响应式逻辑             │
    │                                              │
    │  📌 规则：以 use 开头，可调用其他 hooks       │
    │  📌 位置：hooks/ 目录，属于项目架构层         │
    │  📌 价值：复用、解耦、语义化                  │
    └──────────────────────────────────────────────┘
```

---

## 🎓 一句话记住每个 API

| API | 一句话 |
|-----|--------|
| `createContext(default)` | 📡 创建一个"广播频道"，`default` 是无人接收时的兜底值 |
| `<Provider value={}>` | 📢 在组件树顶端"广播"数据 |
| `useContext(Context)` | 📻 在任意子组件中"收听"广播，获取最新值 |
| 自定义 Hook (`useXxx`) | 📦 将 Context（或其他 Hook）封装成语义化、可复用的模块 |

---

> 🚀 **总结**：React Context + 自定义 Hooks 的组合，是现代 React 应用**状态共享**的基石。理解了这三步曲（创建 → 提供 → 消费），你就掌握了跨层级数据传递的核心武器。配合自定义 Hook 的封装思想，代码既简洁又优雅！
