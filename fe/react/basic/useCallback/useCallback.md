# 🎣 React useCallback 深度解析：告别不必要的重渲染

> 本文基于一个 Vite + React 19 实战项目，带你从零理解 `useCallback` 的核心原理与使用场景。

---

## 📖 目录

- [一、为什么需要 useCallback？](#一为什么需要-usecallback)
- [二、核心概念速览](#二核心概念速览)
- [三、实战代码演示](#三实战代码演示)
- [四、没有 useCallback 时发生了什么？](#四没有-usecallback-时发生了什么)
- [五、用 useCallback 优化](#五用-usecallback-优化)
- [六、useCallback 与 memo 的黄金搭档](#六usecallback-与-memo-的黄金搭档)
- [七、使用注意事项](#七使用注意事项)
- [八、总结](#八总结)

---

## 一、为什么需要 useCallback？

在 React 中，**每次组件重新渲染，内部定义的函数都会被重新创建**。这意味着即使函数的逻辑完全没变，它在内存中也是一个全新的引用。

```
🔄 组件重渲染 → 函数重新创建 → 引用地址变化 → 子组件认为 props 变了 → 子组件也重渲染
```

> 💡 **关键洞察**：如果子组件使用了 `React.memo` 进行性能优化，但传入的回调函数每次都是新引用，那么 `memo` 就形同虚设！

`useCallback` 就是为了解决这个问题而生的——**它能缓存函数引用，只有依赖项变化时才重新创建函数**。

---

## 二、核心概念速览

| 特性 | 说明 |
|------|------|
| 📦 **作用** | 缓存函数引用，避免不必要的重渲染 |
| 🔑 **语法** | `useCallback(fn, deps)` |
| 🔄 **返回值** | 返回一个 memoized 回调函数 |
| ⏰ **更新时机** | 仅当 `deps` 数组中的值发生变化时，才会返回新的函数引用 |
| 🤝 **最佳搭档** | 通常与 `React.memo` 配合使用 |

> ⚠️ **注意**：`useCallback` **不会**阻止函数内部的执行，它只是缓存了函数的引用地址。

---

## 三、实战代码演示

### 🏗️ 项目结构

```
callback-demo/
├── src/
│   ├── main.jsx        # 入口文件
│   ├── App.jsx         # 核心演示组件
│   ├── App.css         # 样式文件
│   └── index.css       # 全局样式
├── package.json
└── vite.config.js
```

### 📄 入口文件 `main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

> 🔍 **知识点**：`StrictMode` 在开发模式下会让组件渲染两次，方便发现副作用问题，不会影响生产环境。

---

## 四、没有 useCallback 时发生了什么？

### 📄 `App.jsx` — 未优化版本

```jsx
import { useState, memo } from 'react';

// 🔴 普通子组件：每次父组件渲染都会重新渲染
function RegularChild({ name }) {
  console.log(' 渲染了RegularChild');
  return (
    <>
      <h1>当前姓名：{name}</h1>
    </>
  )
}

// 🟢 使用 memo 包裹的子组件：只有 props 变化时才会重新渲染
const MemoChild = memo(({ name }) => {
  console.log(' 渲染了MemoChild');
  return (
    <div>Hello,{name}</div>
  )
});

function App() {
  const [count, setCount] = useState(0);
  console.log('APP 渲染');
  const [name, setName] = useState('少林队');

  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      <button onClick={() => setName("峨眉队")}>改变姓名</button>
      <RegularChild name={name} />
      <MemoChild name={name} />
    </>
  )
}

export default App;
```

### 🔬 渲染行为分析

当你点击 **"点击计数"** 按钮时：

```
┌─────────────────────────────────────────────────────┐
│  点击 "点击计数" → count 变化 → App 重渲染           │
│                                                     │
│  ✅ RegularChild：会被重新渲染（没有优化）            │
│  ✅ MemoChild：   不会重新渲染（name 没变，memo 生效）│
└─────────────────────────────────────────────────────┘
```

```
控制台输出：
APP 渲染
 渲染了RegularChild
```

> ✅ **好消息**：`MemoChild` 因为使用了 `memo`，并且 `name` prop 没有变化，所以不会被重新渲染。

### 🧐 那问题出在哪？

当传给子组件的 prop 是一个 **函数** 时，问题就来了：

```jsx
function App() {
  const [count, setCount] = useState(0);

  // 🔴 每次渲染都会创建一个全新的函数引用
  const handleClick = () => {
    console.log('点击了');
  };

  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      {/* 即使 memo 包裹，handleClick 每次都是新引用，MemoChild 仍会重渲染 */}
      <MemoChild onClick={handleClick} />
    </>
  )
}
```

```
┌──────────────────────────────────────────────────────────┐
│  count 变化 → App 重渲染 → handleClick 是新引用          │
│  → MemoChild 的 onClick prop "变了" → MemoChild 也重渲染 │
│                                                          │
│  💥 memo 优化失效！                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 五、用 useCallback 优化

### ✅ 优化后的代码

```jsx
import { useState, useCallback, memo } from 'react';

const MemoChild = memo(({ name, onClick }) => {
  console.log(' 渲染了MemoChild');
  return (
    <div>
      <span>Hello,{name}</span>
      <button onClick={onClick}>子组件按钮</button>
    </div>
  )
});

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('少林队');

  // ✅ 使用 useCallback 缓存函数引用
  // 只有 count 变化时，才会创建新的 handleClick
  const handleClick = useCallback(() => {
    console.log('当前计数：', count);
  }, [count]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      <button onClick={() => setName("峨眉队")}>改变姓名</button>
      <MemoChild name={name} onClick={handleClick} />
    </>
  )
}
```

### 📊 优化效果对比

| 操作 | 无 useCallback | 有 useCallback |
|------|---------------|---------------|
| 点击 "点击计数" | MemoChild 重渲染 ❌ | MemoChild 重渲染 ✅（count 变了，合理） |
| 点击 "改变姓名" | MemoChild 重渲染 ❌ | MemoChild **不**重渲染 ✅ |

> 🎯 **核心收益**：当 `name` 变化时，`handleClick` 的引用不变（因为 `count` 没变），`memo` 生效，`MemoChild` 不会重渲染。

---

## 六、useCallback 与 memo 的黄金搭档

```
┌──────────────────────────────────────────────────────┐
│              useCallback + memo 工作原理              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  父组件                                               │
│  ├── useCallback(fn, [dep])                          │
│  │   └── 缓存函数引用，dep 不变 → 返回同一个函数      │
│  │                                                    │
│  └── 传递 memoized 函数给子组件                        │
│      ↓                                                │
│  子组件 (memo 包裹)                                    │
│  ├── 对比 props                                      │
│  │   ├── 引用相同 → 跳过渲染 ✅                       │
│  │   └── 引用不同 → 重新渲染                          │
│      ↓                                                │
│  结果：避免不必要的渲染 🚀                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 🔑 两者缺一不可

| 组件 | 作用 | 缺少后果 |
|------|------|---------|
| `memo` | 让组件只在 props 变化时重渲染 | 子组件每次父组件渲染都会重渲染 |
| `useCallback` | 缓存函数引用 | 函数每次都是新引用，memo 判定 props "变了" |

> 💡 **一句话记忆**：`memo` 是门卫，`useCallback` 是通行证。没有通行证，门卫拦不住人。

---

## 七、使用注意事项

### 1️⃣ 不要过度使用

```jsx
// ❌ 错误示范：没有性能问题却滥用 useCallback
function App() {
  const [text, setText] = useState('');

  // 这个组件没有任何子组件优化，useCallback 毫无意义
  const handleChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  return <input value={text} onChange={handleChange} />;
}
```

> ⚠️ `useCallback` 本身也有开销（维护依赖数组、缓存函数）。**只在配合 `memo` 子组件或作为其他 Hook 依赖时使用**。

### 2️⃣ 依赖数组要写完整

```jsx
// ❌ 错误：缺少依赖
const handleClick = useCallback(() => {
  console.log(count);  // 使用了 count 但没放入依赖
}, []);

// ✅ 正确：依赖完整
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

> 🔍 **ESLint 插件**：`eslint-plugin-react-hooks` 会自动检查依赖完整性，强烈建议开启。

### 3️⃣ 空依赖数组 = 永不更新

```jsx
// ⚠️ 这个函数永远不会感知 count 的变化
const handleClick = useCallback(() => {
  console.log(count);
}, []);

// ✅ 如果确实不依赖任何值，空数组是合理的
const handleMount = useCallback(() => {
  console.log('组件挂载');
}, []);
```

### 4️⃣ useCallback vs useMemo

```jsx
// useCallback 缓存函数本身
const fn = useCallback(() => doSomething(a, b), [a, b]);
// 等价于
const fn = useMemo(() => () => doSomething(a, b), [a, b]);

// useMemo 缓存函数的返回值
const value = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

| Hook | 缓存的是 | 返回值 |
|------|---------|--------|
| `useCallback` | 函数引用 | 函数 |
| `useMemo` | 计算结果 | 任意值 |

---

## 八、总结

### 🎯 何时使用 useCallback？

```
需要传回调函数给 memo 子组件？
├── 是 → 使用 useCallback ✅
└── 否 → 普通函数即可，无需优化
```

### 📝 核心要点速查

| 序号 | 要点 | 说明 |
|------|------|------|
| 1 | 🎣 **缓存函数引用** | `useCallback(fn, deps)` 返回 memoized 函数 |
| 2 | 🤝 **配合 memo 使用** | 单独使用 useCallback 没有意义 |
| 3 | 📋 **依赖要完整** | 缺少依赖会导致闭包陷阱 |
| 4 | ⚖️ **不要滥用** | 只在有性能问题时使用 |
| 5 | 🔀 **vs useMemo** | `useCallback` 缓存函数，`useMemo` 缓存值 |

### 🚀 一句话总结

> **`useCallback` 是 React 性能优化工具箱中的重要工具，它通过缓存函数引用，让 `React.memo` 的优化真正生效。但记住：不要为了优化而优化，只在真正需要时使用它。**

---

*📝 本文示例项目基于 React 19 + Vite 8，完整代码见 `callback-demo/` 目录。*
