# ⚛️ React `useState` 深入浅出

> 从一个「点按钮数字不变」的诡异 bug 出发，讲透 React 的响应式状态、异步更新与性能优化。

---

## 📖 目录

1. [从一个 bug 说起](#1-从一个-bug-说起)
2. [useState：响应式数据的带头大哥](#2-usestate响应式数据的带头大哥)
3. [Fragment：功成身退的空壳容器](#3-fragment功成身退的空壳容器)
4. [异步更新：为什么 +3 变成了 +1](#4-异步更新为什么-3-变成了-1)
5. [函数式更新：拿到「最新」的状态](#5-函数式更新拿到最新的状态)
6. [惰性初始化：让昂贵计算只跑一次](#6-惰性初始化让昂贵计算只跑一次)
7. [一张图总结](#7-一张图总结)

---

## 1. 从一个 bug 说起

想象你写了一个计数器，点一下按钮想让数字 **+3**：

```jsx
function APP() {
  const [count, setCount] = useState(0);

  const addCount = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <>
      <p>当前计数：{count}</p>
      <button onClick={addCount}>+3</button>
    </>
  );
}
```

满怀期待点下按钮，结果屏幕上从 `0` 只变成了 `1`。😱

> 说好的 +3 呢？为什么三连 `setCount` 只加了 1？

这个「诡异现象」背后，藏着 React 最核心的三大设计：**不可变更新**、**异步批处理**、**函数式更新**。读完这篇文章，你不仅能解释清楚为什么，还能闭着眼睛写出正确的 `+3`。

---

## 2. `useState`：响应式数据的带头大哥

React 是 **函数式编程** 的拥趸，而 Hooks 里的带头大哥，就是 `useState`。它让一个普通的函数组件，拥有了「记住状态」并「响应变化」的能力。

### 🔍 参数

```jsx
useState(初始值 | 函数)
```

- 传入 **初始值**：简单场景，比如 `useState(0)`、`useState('')`。
- 传入 **函数**：复杂场景，React 只调用它一次来计算初始值（后面第 6 节细讲）。

### 📦 返回值

```jsx
const [state, setState] = useState(0);
//    ↑ 状态值      ↑ 更新状态函数
```

它返回一个 **二元数组**，用解构语法拆开：

| 元素 | 含义 |
| --- | --- |
| `state` | **当前状态值**（只读，别直接改） |
| `setState` | **更新状态函数**（唯一的「合法」修改通道） |

### ⚠️ 一条铁律：不可直接修改状态值

```jsx
// ❌ 错误：直接改，React 感知不到，界面不会刷新
count = count + 1;

// ✅ 正确：只能通过更新函数
setCount(count + 1);
```

状态更新靠的是 **React 组件函数的重新运行**（重新渲染）来实现，而触发重渲染的唯一钥匙，就是调用 `setState`。你绕过它直接改变量，React 根本不知道发生了什么。

> 💡 状态就像银行账户余额：你只能走「转账接口」（`setState`），不能偷偷篡改账本。

---

## 3. Fragment：功成身退的空壳容器

一个组件只能返回一个根节点。可有时候你就是想并排渲染多个兄弟元素，怎么办？

```jsx
return (
  <>
    <p>当前计数：{count}</p>
    <button onClick={addCount}>+3</button>
  </>
);
```

这里的 `<>...</>` 就是 **Fragment**，一个「空壳容器」：它在内存里承载多个子元素，一次性挂载到 `#root` 后，就 **功成身退**，不会在真实 DOM 里留下任何多余标签。

### 🌉 它其实就是原生 JS 里的 `DocumentFragment`

React 的 Fragment 概念，直接脱胎于原生 DOM 的 **文档碎片**。看看 `text.html` 里的经典写法：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>DocumentFragment 文档碎片</title>
</head>
<body>
  <ul id="list">
    <script>
      const data = ["任务1", "任务2", "任务3"];
      // 查找目标容器
      const olist = document.querySelector('#list');

      // 文档碎片 <></> 标签：没有实体，在内存中先批量挂载一批元素
      const fragment = document.createDocumentFragment();

      for (const task of data) {
        // DOM API 创建元素（JS 运行）
        const item = document.createElement('li');
        item.innerText = task;
        // 先挂到「内存里的碎片」，而不是直接挂到页面
        fragment.appendChild(item);
      }

      // 一次性挂载到页面，性能好（只触发一次渲染）
      olist.appendChild(fragment);
    </script>
  </ul>
</body>
</html>
```

**核心思路**：如果每创建一个 `li` 就 `appendChild` 一次，页面会反复重排、重绘（CSS 绘制开销）。而先把所有 `li` 塞进内存里的 `fragment`，最后 **一次性** 挂载，性能大幅提升。

> 🧩 React 的 `<>...</>` 和 `document.createDocumentFragment()` 是同一个灵魂：**批量 + 一次性**，让容器「用完即走」。

---

## 4. 异步更新：为什么 +3 变成了 +1

现在回到开头那个 bug。答案是：**`setCount` 是异步调度更新，不会立刻修改 `count`。**

```jsx
const addCount = () => {
  setCount(count + 1);  // 调度一次更新，count 此刻还是 0
  console.log(count);   // 打印的仍是旧值 0（同步代码先跑）
  setCount(count + 1);  // 又一次调度，count 依然还是 0
  setCount(count + 1);  // 依然还是 0
};
```

**React 会把这些更新合并（批处理）**：本轮代码全部执行完毕，组件才重新渲染一次，拿到新值。三次 `count + 1` 本质上都是 `0 + 1`，结果相同，于是被 **合并，只执行最后一次** —— 最终 `count` 变成 `1`。

> ⏱️ 为什么 React 要这么做？**性能优化。**
> 一个组件可能有 x、y、z 坐标、移动状态等一大堆状态，如果每个 `setState` 都立刻渲染一次，用户拖一下鼠标就可能触发几十次重渲染。合并成一次，划算得多。

**真相**：更新不是「立刻执行」，而是「放进待办清单，本轮结束后统一处理」。

---

## 5. 函数式更新：拿到「最新」的状态

如果我就是非要 `+3` 呢？答案是：**给 `setState` 传一个函数**。

```jsx
function APP() {
  const [count, setCount] = useState(0);

  const addCount = () => {
    // 传函数：基于「当前状态」返回「全新状态」
    setCount(prevCount => prevCount + 1);
    setCount(prevCount => prevCount + 1);
    setCount(prevCount => prevCount + 1);
  };

  return (
    <>
      <p>当前计数：{count}</p>
      <button onClick={addCount}>+3</button>
    </>
  );
}
```

🔑 **关键区别**：

| 写法 | 读到的值 | 结果 |
| --- | --- | --- |
| `setCount(count + 1)` | 闭包里捕获的**旧值**（都是 0） | 合并成 1 |
| `setCount(prev => prev + 1)` | React 依次传入的**最新值** | 依次 1 → 2 → 3 |

函数式更新里，`prevCount` 是 React 在每次处理时**传入的最新状态值**，不再是闭包里那个过期的引用。三次调用串成一条链：`0 → 1 → 2 → 3`，最终 `+3` 达成。✅

> 💡 记住这条黄金法则：
> **新状态依赖旧状态时，永远用函数式更新。**

---

## 6. 惰性初始化：让昂贵计算只跑一次

有时候，初始值不是随手写个 `0`，而是要经过一场「昂贵计算」——比如生成 10000 个用户、100 个 NPC 的随机逻辑。看看 `App.jsx`：

```jsx
import { useState } from 'react';

// 重的、耗时性计算
function heavyComputation() {
  console.log('开始执行 heavyComputation......');
  // 网页性能优化指标 performance（性能表现 API）
  const startTime = performance.now();
  const result = [];
  for (let i = 0; i < 10000; i++) {
    result.push({ id: i, name: `用户-${i}` });
  }
  const duration = performance.now() - startTime;
  console.log(`heavyComputation 执行耗时：${duration}ms`);
  return result;
}

function APP() {
  // ✅ 正确：传入函数，React 只在「首次挂载」时调用一次（懒执行 / lazy）
  const [users] = useState(() => heavyComputation());

  // ❌ 错误：直接调用，每次组件重渲染都会重新算一遍
  // const [users] = useState(heavyComputation());

  const [filterText, setFilterText] = useState('');

  // 数据状态 state，配合 computed 计算属性（派生数据）
  const filteredUsers = users.filter(user => user.name.includes(filterText));

  return (
    <div style={{ padding: '20px' }}>
      <h2>用户列表</h2>
      <input
        type='text'
        placeholder='输入用户名过滤'
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />
      <p>当前显示 {filteredUsers.length} 个用户</p>
      <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default APP;
```

### 🚀 两者的本质区别

```jsx
// ✅ good：懒执行，React 只在挂载时执行一次；
//    当数据状态改变、函数组件再次运行时，它会忽略这次初始化
const [users] = useState(() => heavyComputation());

// ❌ bad：每次渲染都会执行 heavyComputation()
const [users] = useState(heavyComputation());
```

- **传函数** `() => heavyComputation()`：React 把函数「存起来」，只在 **首次挂载** 时调用一次；后续因为输入框变化导致的重渲染，会直接跳过这个初始化，直接用缓存好的 `users`。
- **直接调用** `heavyComputation()`：这行代码每次组件重渲染都会跑一遍，`10000` 条数据反复生成，白白浪费性能。

> 💡 判断标准很简单：
> **如果「求初始值」本身很贵，就把它包进箭头函数里，交给 React 懒执行。**

---

## 7. 一张图总结

```
useState(初始值 | 函数)
        │
        ├─ 传「值」  → 简单场景，直接作为初始状态
        └─ 传「函数」→ 惰性初始化，只在首次挂载执行一次（懒执行）

返回值：[state, setState]
        │        │
        │        └─ 更新函数（唯一合法修改通道）
        │           ├─ setState(值)          → 异步合并，读到旧值
        │           └─ setState(prev => …)   → 函数式更新，拿到最新值
        └─ 当前状态值（只读，不可直接修改）
```

**四个必背要点**：

1. 🔁 **响应式**：状态一变，组件函数重跑，界面自动刷新。
2. 🚫 **不可变**：改状态只能走 `setState`，不能直接改值。
3. ⏱️ **异步 + 合并**：本轮代码跑完才统一渲染，多次更新会被批处理。
4. 🧮 **依赖旧值用函数**：`setState(prev => prev + 1)` 才能串起连续更新。

---

> 🎯 现在再回头看开头的 bug，你是不是已经能一口气讲出「为什么 +3 变 +1」以及「怎么改才对」了？
> 这，就是 React 状态管理最基础、也最重要的一课。
