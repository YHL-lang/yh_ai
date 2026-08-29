# 🚀 从 JSX 到 TypeScript：React 开发的进化之路

> 本文基于两个实战项目——**Todo List（React + JSX）** 和 **TS-Demo（React + TypeScript）**，带你从零理解 React 组件设计、状态管理、useEffect 副作用机制与浏览器本地存储，感受 TypeScript 为 React 带来的类型安全感。

---

## 📖 目录

1. [🧩 组件化思维：一切皆组件](#-组件化思维一切皆组件)
2. [🔗 父子组件通信：props 与自定义事件](#-父子组件通信props-与自定义事件)
3. [⚡ useEffect：React 的副作用引擎](#-useeffectreact-的副作用引擎)
4. [💾 浏览器本地存储：让数据持久化](#-浏览器本地存储让数据持久化)
5. [🛡️ TypeScript 入场：从"裸奔"到"全副武装"](#️-typescript-入场从裸奔到全副武装)
6. [🔄 状态管理的两种流派](#-状态管理的两种流派)
7. [🎯 总结：一张图看清全貌](#-总结一张图看清全貌)

---

## 🧩 组件化思维：一切皆组件

React 的核心哲学可以用一个公式概括：

```
UI = f(state, props)
```

界面是状态和属性的函数。在 Todo List 项目中，我们把整个应用拆成了 **4 个组件**，每个组件只关心自己的事：

```
App (状态中心)
├── TodoInput    → 输入框 + 提交按钮
├── TodoList     → 列表渲染 + 勾选/删除
└── TodoStats    → 统计信息 + 清除已完成
```

### 🏗️ 入口文件：从 StrictMode 说起

**JSX 版本（todos）：**

```jsx
// todos/src/main.jsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode 被注释掉了——开发时组件会渲染两次，方便发现副作用问题
  <App />
)
```

**TypeScript 版本（ts-demo）：**

```tsx
// ts-demo/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

> 💡 **小细节：** `document.getElementById('root')!` 中的 `!` 是 TypeScript 的**非空断言**，告诉编译器："我保证这个元素一定存在，别报错。"

---

## 🔗 父子组件通信：props 与自定义事件

React 中，数据永远是**单向流**：从父到子通过 `props`，从子到父通过**回调函数**。子组件不能直接修改父组件的状态——它只能"通知"父组件："嘿，该改数据了！"

### 📥 TodoInput：子组件通知父组件

```jsx
// todos/src/components/Todoinput.jsx
import { useState } from "react";

const TodoInput = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState("");  // 私有状态

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(inputValue);    // 通过回调通知父组件
    setInputValue("");    // 清空输入框
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />
      <button type="submit">Add</button>
    </form>
  )
}
```

### 📋 TodoList：纯展示组件，只管渲染

```jsx
// todos/src/components/TodoList.jsx
const TodoList = ({ todos, onToggle, onDelete }) => {
  return (
    <ul className="todo-list">
      {todos.length === 0 ? (
        <li className="empty">No todos yet!</li>
      ) : (
        todos.map(todo => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
              />
              <span>{todo.text}</span>
            </label>
            <button onClick={() => onDelete(todo.id)}>删除</button>
          </li>
        ))
      )}
    </ul>
  )
}
```

### 📊 TodoStats：条件渲染

```jsx
// todos/src/components/TodoStats.jsx
const TodoStats = ({ total, active, completed, onClearCompleted }) => {
  return (
    <div className="todo-stats">
      <p>Total:{total} Active:{active} Completed:{completed}</p>
      {completed > 0 && (
        <button onClick={onClearCompleted} className="clear-completed">
          Clear Completed
        </button>
      )}
    </div>
  )
}
```

> 🎯 **设计原则：** `inputValue` 是 TodoInput 的**私有状态**，只有 `todos` 才是父组件管理的**共享状态**。所有子组件通过 props 接收数据，通过回调函数上报变更——这就是 React 的**单向数据流**。

---

## ⚡ useEffect：React 的副作用引擎

`useEffect` 是 React 中最容易被误解的 Hook。它不是"生命周期方法"的替代品，而是一种**同步机制**：让你的组件与外部系统（DOM、网络、定时器、本地存储）保持同步。

### 🧪 四种依赖模式，一次讲透

Todo List 项目中演示了 `useEffect` 的全部四种用法：

```jsx
// todos/src/App.jsx —— useEffect 全家福

// ① 依赖 [count]：挂载时 + count 变化时执行
useEffect(() => {
  console.log('挂载后执行');
  console.log('count改变也会执行');
}, [count]);

// ② 依赖 []：只在挂载时执行一次
useEffect(() => {
  console.log('只会在挂载后执行');
}, []);

// ③ 依赖 [todos]：挂载时 + todos 变化时执行（用于同步到 localStorage）
useEffect(() => {
  console.log('挂载后执行');
  console.log('todos更新后执行');
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);

// ④ 无依赖：每次渲染都执行（慎用！）
useEffect(() => {
  console.log('挂载后执行');
  console.log('每次都执行');
});
```

用一张表总结：

| 模式 | 依赖数组 | 执行时机 | 典型场景 |
|------|----------|----------|----------|
| `[count]` | 指定依赖 | 挂载 + count 变化 | 响应特定状态变化 |
| `[]` | 空数组 | 仅挂载一次 | 初始化、订阅、请求 |
| `[todos]` | 指定依赖 | 挂载 + todos 变化 | 数据同步、持久化 |
| 无 | 不传 | 每次渲染 | ⚠️ 几乎不用，容易死循环 |

### 🧹 清理函数：组件卸载前的"善后工作"

`useEffect` 可以返回一个**清理函数**，在组件卸载前或下一次 effect 执行前运行。这在定时器、事件监听等场景中至关重要：

```jsx
// todos/src/App.jsx —— Demo 组件
const Demo = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('interval, is here');
    }, 1000);

    // 🧹 清理函数：组件卸载前清除定时器
    return () => {
      console.log('组件卸载前执行, 做什么内存清理工作');
      clearInterval(interval);
    }
  }, []);

  return <>Demo</>
}
```

这个 `Demo` 组件还是**条件渲染**的——只有当 `count` 为偶数时才挂载：

```jsx
// 父组件中
{count % 2 === 0 && <Demo />}
```

当 count 从偶数变成奇数时，`Demo` 组件被卸载，清理函数自动执行，定时器被清除。

> ⚠️ **如果不清理定时器会怎样？** 内存泄漏！定时器会一直运行，即使组件已经从 DOM 中消失，它仍然占用内存，而且可能尝试更新已卸载的组件状态，导致报错。

---

## 💾 浏览器本地存储：让数据持久化

刷新页面后 Todo 列表消失？用 `localStorage` 解决。

### 🗄️ localStorage 基础

```
┌─────────────────────────────────────────┐
│           浏览器存储一览                   │
├─────────────────────────────────────────┤
│  缓存    │ 静态资源（JS/CSS/图片）        │
│  cookie  │ 小数据，自动随请求发送（4KB）   │
│  localStorage │ 键值对，持久化（~5MB）    │
│  sessionStorage │ 键值对，标签页关闭即失效 │
│  IndexedDB │ 前端数据库，存大量结构化数据   │
└─────────────────────────────────────────┘
```

### 🔗 useEffect + localStorage = 自动持久化

Todo List 项目中，数据持久化分两步：

**第一步：初始化时从 localStorage 读取（懒加载）**

```jsx
const [todos, setTodos] = useState(
  () => {
    // 懒执行：只在首次渲染时调用，而不是每次渲染都解析 JSON
    return JSON.parse(localStorage.getItem('todos')) || [];
  }
);
```

> 💡 **为什么用函数形式 `() => {...}` 而不是直接写 `JSON.parse(...)`？**
>
> 直接写的话，每次组件渲染都会执行 `JSON.parse`，即使结果根本没用到。函数形式是**懒初始化**——只在第一次渲染时执行一次，后续渲染直接使用缓存的值。

**第二步：todos 变化时自动写入 localStorage**

```jsx
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);  // todos 一变，就同步到 localStorage
```

这就是 `useEffect` 最经典的用法之一：**状态与外部存储的同步**。每当你添加、删除、勾选一个 todo，`todos` 状态变化 → effect 触发 → localStorage 更新。下次打开页面，`useState` 的懒初始化又从 localStorage 把数据读回来。

```
用户操作 → setTodos() → todos 状态更新
                            ↓
                     useEffect 触发
                            ↓
                  localStorage.setItem()
                            ↓
                     页面刷新后
                            ↓
                  useState 懒初始化读取
                            ↓
                     数据完美恢复 ✅
```

---

## 🛡️ TypeScript 入场：从"裸奔"到"全副武装"

JSX 版本的组件写起来很爽，但有一个致命问题：**props 全靠自觉**。传错类型、漏传属性，只有运行到那一行才会报错。TypeScript 在**编译阶段**就能拦截这些错误。

### 📝 接口约束：给 props 立规矩

**JSX 版本——props 类型全靠猜：**

```jsx
// 没有任何类型约束，传什么都可以
const TodoList = ({ todos, onToggle, onDelete }) => {
  // todos 是数组吗？onToggle 是函数吗？天知道
}
```

**TypeScript 版本——interface 定义契约：**

```tsx
// ts-demo/src/components/Hello.tsx
interface Props {
  userName: string
}

const HelloComponent: React.FC<Props> = (props) => {
  return <h2>Hello {props.userName}</h2>
}
```

> 📌 **interface vs type：** 两者都能定义对象类型。`interface` 更适合定义 props（可以被 `extends` 继承），`type` 更适合联合类型、工具类型。在 React 中，两者都很常见。

### 🎛️ 可选属性与事件类型

```tsx
// ts-demo/src/components/NameEditingComponent.tsx
interface Props {
  editingName: string;
  onNameUpdated: () => void;
  onEditingNameUpdated: (newEditingName: string) => void;
  disabled?: boolean;   // ? 表示可选
}

const NameEditingComponent: React.FC<Props> = (props) => {
  const { editingName, onNameUpdated, onEditingNameUpdated, disabled } = props;

  // React.ChangeEvent<HTMLInputElement> —— 精确描述事件类型
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditingNameUpdated(e.target.value);
  }

  const onNameSubmit = () => {
    onNameUpdated();
  }

  return (
    <>
      <label>Update name:</label>
      <input value={editingName} onChange={onChange} />
      <button disabled={disabled} onClick={onNameSubmit}>Change</button>
    </>
  )
}
```

**TypeScript 给你的好处：**

- 🚫 传了 `onNameUpdated` 但忘了传 `editingName`？**编译报错**
- 🚫 把 `number` 传给了期望 `string` 的 `userName`？**编译报错**
- ✅ 在编辑器里输入 `props.`，自动弹出所有可用属性的提示

### 🔄 泛型：`useState<T>` 的精确控制

```tsx
// ts-demo/src/App.tsx
const [name, setName] = React.useState<string>('defaultUserName');
//                                        ^^^^^^^^ 泛型参数
```

`useState<string>` 告诉 TypeScript：这个状态**永远是字符串**。之后如果你不小心 `setName(123)`，编译器会立刻报错。不传泛型时，TypeScript 会根据初始值自动推断类型。

---

## 🔄 状态管理的两种流派

TS-Demo 项目中有两个版本的名称编辑组件，展示了 React 中状态管理的两种经典模式：

### 🏠 流派一：父组件包办（NameEditingComponent）

所有状态都由父组件管理，子组件只是一个"遥控器"：

```tsx
// 父组件 App.tsx
const App = () => {
  const [name, setName] = React.useState<string>('defaultUserName');
  const [editingName, setEditingName] = React.useState("defaultUserNameEditing");

  const loadUserName = () => {
    setTimeout(() => {
      setName("name from async call");
      setEditingName("name from async call");
    }, 2000)
  }

  React.useEffect(() => { loadUserName(); }, []);

  const setUserNameState = () => { setName(editingName); }

  return (
    <>
      名字：{name}
      <HelloComponent userName={name} />
      <NameEditComponent
        editingName={editingName}           // 状态由父组件传入
        onNameUpdated={setUserNameState}    // 提交通知父组件
        onEditingNameUpdated={setEditingName} // 输入变化也通知父组件
        disabled={editingName === "" || editingName === name}
      />
    </>
  )
}
```

**特点：** 子组件完全没有自己的状态，所有数据流都在父组件中。适合需要在父组件中做复杂逻辑判断的场景。

### 🏡 流派二：子组件自治（NameEditComponent2）

子组件自己管理临时状态，只在最终提交时通知父组件：

```tsx
// ts-demo/src/components/NameEditComponent2.tsx
interface Props {
  initialUserName: string;
  disabled?: boolean;
  onNameUpdated: (newName: string) => void;
}

const NameEditComponent: React.FC<Props> = (props) => {
  // 🔑 子组件拥有自己的状态
  const [editingName, setEditingName] = React.useState(props.initialUserName);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);  // 本地处理，不打扰父组件
  }

  const onNameSubmit = () => {
    props.onNameUpdated(editingName);  // 只在提交时通知父组件
  }

  return (
    <>
      <label>Update name:</label>
      <input value={editingName} onChange={onChange} />
      <button onClick={onNameSubmit} disabled={props.disabled}>Change</button>
    </>
  )
}
```

**特点：** 子组件自己管理输入状态，减少与父组件的通信频率。适合表单场景——用户输入时不打扰父组件，只在"确认"时才上报。

### 📊 两种流派对比

```
流派一（父组件包办）           流派二（子组件自治）

  父组件                        父组件
   │  editingName                 │  name
   │  setEditingName              │  setName
   │                              │
   ↓                              ↓
  子组件                        子组件
   │  (无状态)                    │  editingName (私有)
   │  每次输入都通知父组件          │  本地处理输入
   │                              │  只在提交时通知
   ↓                              ↓
  优点：状态集中管理              优点：减少通信，封装性好
  缺点：通信频繁                  缺点：状态分散
```

> 🎯 **选择建议：** 如果父组件需要实时感知输入变化（比如实时验证、动态禁用按钮），用**流派一**。如果子组件是独立的表单单元，用**流派二**更清爽。

---

## 🎯 总结：一张图看清全貌

```
┌──────────────────────────────────────────────────────┐
│                    React 应用架构                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  main.tsx ──→ App.tsx (状态中心)                      │
│                   │                                  │
│         ┌─────────┼─────────┐                        │
│         ↓         ↓         ↓                        │
│     TodoInput  TodoList  TodoStats                   │
│     (输入)     (列表)     (统计)                      │
│                                                      │
│  ┌─────────────────────────────────────┐             │
│  │         数据流                        │             │
│  │  state ──props──→ 子组件              │             │
│  │  子组件 ──callback──→ setState        │             │
│  │  setState ──→ useEffect ──→ localStorage           │
│  └─────────────────────────────────────┘             │
│                                                      │
│  ┌─────────────────────────────────────┐             │
│  │         TypeScript 价值              │             │
│  │  interface  → props 契约             │             │
│  │  泛型       → 精确类型控制            │             │
│  │  编译检查   → 运行前发现错误          │             │
│  └─────────────────────────────────────┘             │
└──────────────────────────────────────────────────────┘
```

### 🧠 核心要点回顾

| 知识点 | 关键概念 | 项目中的体现 |
|--------|----------|-------------|
| 组件化 | UI = f(state, props) | Todo 项目拆分为 4 个组件 |
| 父子通信 | props 下行，callback 上行 | onAdd / onToggle / onDelete |
| useEffect | 同步机制，非生命周期 | 四种依赖模式 + 清理函数 |
| localStorage | 浏览器持久化存储 | 懒初始化读 + effect 写入 |
| TypeScript | 编译时类型检查 | interface / React.FC / 泛型 |
| 状态管理 | 父组件包办 vs 子组件自治 | NameEditing vs NameEditComponent2 |

---

> 📝 **写在最后：** 从 JSX 到 TypeScript，不是简单的"加类型注解"，而是思维方式的升级——**先定义契约，再写实现**。当你习惯了 `interface` 先行的开发方式，你会发现：代码更少了（因为编辑器帮你补全了），bug 更少了（因为编译器帮你检查了），协作更顺畅了（因为接口就是最好的文档）。

> 用 React 的话说：**TypeScript 让你的代码从"运行时才暴雷"变成了"编译时就排雷"** 💣→✅
