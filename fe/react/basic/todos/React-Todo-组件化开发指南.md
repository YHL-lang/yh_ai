# 🚀 用 React 打造你的第一个 Todo List

> **从「组件化思维」到「单向数据流」，一文吃透 React 入门核心**
>
> 🧰 技术栈：`React 19` · `Vite` · `JavaScript (JSX)`
> 🎯 目标：通过一个 Todo List 应用，理解 React 最重要的几个心智模型

---

## 📖 目录

- [🧱 一、组件化思维：把界面拆成积木](#-一组件化思维把界面拆成积木)
- [🌳 二、先画组件树，再写代码](#-二先画组件树再写代码)
- [⚛️ 三、JSX：用 JavaScript 写界面](#-三jsx用-javascript-写界面)
- [🪝 四、useState：让组件「记住」状态](#-四usestate让组件记住状态)
- [🔄 五、单向数据流：props 向下，事件向上](#-五单向数据流props-向下事件向上)
- [🛠️ 六、从零搭建项目](#-六从零搭建项目)
- [📦 七、完整代码逐行拆解](#-七完整代码逐行拆解)
- [🧭 八、数据流全景图](#-八数据流全景图)
- [🔑 九、三条必须刻进脑子里的规则](#-九三条必须刻进脑子里的规则)

---

## 🧱 一、组件化思维：把界面拆成积木

写 React 的第一步，**不是打开编辑器敲代码，而是把界面拆成一块块积木**。

看看我们的 Todo 应用，它长这样：

```
┌───────────────────────────────────────┐
│         My Todo List          ← 标题    │
├───────────────────────────────────────┤
│  [ 输入框............ ] [Add] ← 输入区  │
├───────────────────────────────────────┤
│  ☑ 吃饭                              │
│  ☐ 睡觉                              │
│  ☑ 打豆豆  [删除]           ← 列表区  │
├───────────────────────────────────────┤
│  Total:3 Active:1 Completed:2        │
│  [Clear Completed]           ← 统计区  │
└───────────────────────────────────────┘
```

肉眼可见地能拆成 **4 块独立零件**：

| 零件 | 职责 | 对应文件 |
|------|------|----------|
| 🧩 `App` | 顶层容器，**持有所有数据** | `App.jsx` |
| ⌨️ `TodoInput` | 输入框 + 添加按钮 | `TodoInput.jsx` |
| 📋 `TodoList` | 渲染列表、勾选、删除 | `TodoList.jsx` |
| 📊 `TodoStats` | 统计数字 + 清除已完成 | `TodoStats.jsx` |

> 💡 **组件化的本质**：每个组件只关心自己那一亩三分地，像搭乐高一样组合起来。好处是——**可复用、可测试、可维护**，还特别适合 **Vibe Coding**（你告诉 AI 要哪些积木，它帮你拼）。

---

## 🌳 二、先画组件树，再写代码

组件之间不是平铺的，而是**一棵树**。画清楚这棵树，代码结构就出来了：

```text
                    ┌──────────┐
                    │   App    │  ← 树根：唯一持有 todos 数据
                    └────┬─────┘
          ┌──────────────┼────────────────┐
          ▼              ▼                ▼
   ┌────────────┐ ┌────────────┐  ┌────────────┐
   │ TodoInput  │ │  TodoList  │  │ TodoStats  │
   │  子组件①   │ │  子组件②   │  │  子组件③   │
   └────────────┘ └────────────┘  └────────────┘
```

这棵树决定了项目的**目录结构**：

```text
todos/
├── index.html              # 页面骨架，只有 <div id="root">
├── package.json            # 依赖清单
├── vite.config.js          # Vite 配置
└── src/
    ├── main.jsx            # 入口：把 App 挂到 #root
    ├── App.jsx             # 根组件（父组件）
    ├── App.css             # 全局样式
    ├── index.css           # 设计变量（CSS 变量 + 主题）
    └── components/
        ├── Todoinput.jsx   # 输入组件
        ├── TodoList.jsx    # 列表组件
        └── TodoStats.jsx   # 统计组件
```

> 💡 **先规划组件树，再动手**，是高效开发的秘诀。组件树的形状，直接决定了「数据该放哪、怎么流动」。

---

## ⚛️ 三、JSX：用 JavaScript 写界面

React 里写界面用的是 **JSX**——一种「看起来像 HTML，其实是 JavaScript」的语法糖。

```jsx
// 这就是 JSX：HTML 直接写在 JS 里，还可以内嵌表达式
const name = "打豆豆";

const el = <h1>今天要{name} 👊</h1>;  // {} 里可以塞任何 JS 表达式
```

JSX 的几条小规则：

- 🏷️ **标签必须闭合**：`<input />`、`<img />` 这类自闭合标签也要写斜杠。
- 🧬 **必须有唯一根节点**：返回多个兄弟节点时，用 `<>...</>` 这种 **Fragment（片段）** 包起来（不生成多余 DOM）。
- 🎨 **属性改用驼峰**：`class` → `className`，`onclick` → `onClick`。
- 📝 **注释写法不同**：`{/* 这是 JSX 注释 */}`。

---

## 🪝 四、useState：让组件「记住」状态

React 的 **响应式**，靠的是「状态」（state）。而 `useState` 就是 React 官方给的「记忆钩子」。

```jsx
import { useState } from "react";

// 解构出两个东西：[当前值, 修改函数]
const [inputValue, setInputValue] = useState("");
//      ↑ 读            ↑ 写            ↑ 初始值
```

**两条铁律**：

1. 🔒 **永远不要直接改状态** —— `inputValue = "xxx"` 是无效的，必须调用 `setInputValue("xxx")`。
2. 🔄 **永远返回全新的数据** —— React 靠「新旧引用是否变化」来判断要不要重新渲染，所以要 `map`/`filter`/展开运算符造一份新数组，而不是原地 `push`。

看 `App.jsx` 里的例子：

```jsx
const toggleTodo = (id) => {
  // ✅ 用 map 生成一个「全新的数组」，返回新对象，绝不原地修改
  setTodos(todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
};
```

> 💡 README 里提到的「**懒执行**」和 `useEffect`，是 useState 的进阶用法：
> - **懒执行（懒初始化）**：`useState(expensiveCalc)` 每次都算，而 `useState(() => expensiveCalc())` 只在首次渲染算一次，适合昂贵计算。
> - **useEffect**：处理「副作用」（如请求数据、操作 DOM、订阅），在渲染后执行。

---

## 🔄 五、单向数据流：props 向下，事件向上

这是本文**最重要**的概念。React 数据流是**单向**的：

```text
      数据（props）向下 👇 传递
     ┌──────────────────────┐
     │        App 父组件      │   ← 唯一的「数据源」 todos
     └──────────────────────┘
         ↑             ↑
   修改请求（事件）👇    修改请求（事件）
   ┌──────────┐   ┌──────────┐
   │ 子组件①  │   │ 子组件②  │   ← 只读 props，不碰父组件数据
   └──────────┘   └──────────┘
```

**核心规则**（这条必须背下来）：

> 🚫 **子组件不可以直接修改父组件的数据状态。**
>
> ✅ 只能通过 **props 传入的自定义事件**「通知」父组件，父组件修改后，子组件**自动更新**。

这就是 README 里写的「**props 向父组件申请修改状态**」——子组件「打报告」，父组件「做决定」。

### 拆解一个完整的往返 🎬

**① 父组件把数据和「操作函数」一起传下去：**

```jsx
<TodoList
  todos={todos}            // 👇 传数据
  onToggle={toggleTodo}    // 👇 传「事件回调」
  onDelete={deleteTodo}
/>
```

**② 子组件只读数据，用户操作时调用回调：**

```jsx
// TodoList.jsx
const TodoList = ({ todos, onToggle, onDelete }) => (
  <ul>
    {todos.map(todo => (
      <li key={todo.id} className={todo.completed ? "completed" : ""}>
        {/* 勾选：不自己改，而是通知父组件 */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}   // 👈 打报告
        />
        <span>{todo.text}</span>
        {/* 删除：同样打报告 */}
        <button onClick={() => onDelete(todo.id)}>删除</button>
      </li>
    ))}
  </ul>
);
```

**③ 父组件收到报告，修改自己的状态，子组件自动刷新。**

> 💡 **为什么要这么绕？** 因为「**数据和界面是统一的**」——所有数据只在父组件这一处存，谁改都必须走同一扇门，界面才不会出现「数据对不上」的诡异 bug。这就是**单一数据源**（Single Source of Truth）。

---

## 🛠️ 六、从零搭建项目

用 Vite 一键创建，秒级启动：

```bash
# 1. 创建项目（Vite 脚手架）
npm create vite@latest todos -- --template react

# 2. 进入目录、装依赖
cd todos
npm install

# 3. 启动开发服务器 🚀
npm run dev
```

`package.json` 里的关键脚本：

```json
{
  "scripts": {
    "dev": "vite",        // 🟢 开发：热更新
    "build": "vite build",// 📦 打包：产出可部署的静态文件
    "preview": "vite preview", // 👀 预览打包结果
    "lint": "eslint ."    // 🧹 代码规范检查
  }
}
```

入口文件 `main.jsx` —— 一切的起点：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 把 <App /> 挂载到 index.html 里的 <div id="root">
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

> 💡 `StrictMode` 是 React 的「严格模式」，开发时帮你发现潜在问题（比如不纯的渲染），生产环境无影响。

---

## 📦 七、完整代码逐行拆解

### 1️⃣ App.jsx —— 大脑 🧠

```jsx
import { useState } from "react";
import TodoInput from "./components/Todoinput";
import TodoList from "./components/TodoList";
import TodoStats from "./components/TodoStats";
import "./App.css";

const App = () => {
  // 🧠 唯一的「数据源」：todos 数组，父组件独占
  const [todos, setTodos] = useState([
    { id: 1, text: "吃饭", completed: false },
    { id: 2, text: "睡觉", completed: false },
    { id: 3, text: "打豆豆", completed: true },
  ]);

  // ➕ 添加：新项放最前面（用展开运算符生成全新数组）
  const addTodo = (text) => {
    if (text.trim() === "") return; // 空内容直接忽略
    setTodos([
      { id: +Date.now(), text, completed: false }, // id 用时间戳保证唯一
      ...todos,
    ]);
  };

  // ☑️ 切换完成状态：map 出一个新数组，只改目标项
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 🗑️ 删除：filter 保留非目标项
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 🧹 清除已完成
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // 📊 派生数据：不需要 useState，直接从 todos 算出来
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div>
      <h1>My Todo List</h1>
      {/* ⬇️ 数据 & 回调一起传给子组件 */}
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
      <TodoStats
        total={todos.length}
        active={activeCount}
        completed={completedCount}
        onClearCompleted={clearCompleted}
      />
    </div>
  );
};
export default App;
```

> 💡 **派生数据**是 React 的重要技巧：`activeCount`/`completedCount` 不用额外 `useState` 存，直接从 `todos` 计算即可——**单一数据源，永远不冗余**。

### 2️⃣ TodoInput.jsx —— 输入组件 ⌨️

```jsx
import { useState } from "react";

// 接收父组件传来的 onAdd 回调
const TodoInput = ({ onAdd }) => {
  // 🔒 私有状态：输入框的文字只属于这个组件自己
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();        // 阻止表单默认刷新页面
    onAdd(inputValue);         // 📤 把文字「报告」给父组件
    setInputValue("");         // 清空输入框
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      {/* 受控组件：value 绑 state，onChange 同步 state */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />
      <button type="submit">Add</button>
    </form>
  );
};
export default TodoInput;
```

> 💡 这个输入框是典型的**「受控组件」（Controlled Component）**：`value` 由 state 决定，`onChange` 更新 state，形成一个闭环。输入框的「私有状态」和父组件的「共享状态」泾渭分明——**共享状态只有父组件持有**。

### 3️⃣ TodoList.jsx —— 列表组件 📋

```jsx
// 纯展示组件：只读 props，所有修改都通过回调上报
const TodoList = ({ todos, onToggle, onDelete }) => {
  return (
    <ul className="todo-list">
      {todos.length === 0 ? (
        <li className="empty">No todos yet!</li>   // 空状态兜底
      ) : (
        todos.map(todo => (
          <li
            key={todo.id}                               // ⚠️ 列表必须给 key
            className={todo.completed ? "completed" : ""}
          >
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}      // 📤 上报切换
              />
              <span>{todo.text}</span>
            </label>
            <button onClick={() => onDelete(todo.id)}>删除</button>
          </li>
        ))
      )}
    </ul>
  );
};
export default TodoList;
```

> ⚠️ **`key` 是列表渲染的必需品**：React 靠它区分每一项，缺少或用下标（index）会导致错乱。这里用唯一的 `id`，正确 ✅。

### 4️⃣ TodoStats.jsx —— 统计组件 📊

```jsx
// 接收统计数字 + 清除回调
const TodoStats = ({ total, active, completed, onClearCompleted }) => {
  return (
    <div className="todo-stats">
      <p>
        Total:{total} Active:{active} Completed:{completed}
      </p>
      {/* 条件渲染：只有存在已完成项时才显示按钮 */}
      {completed > 0 && (
        <button
          onClick={onClearCompleted}          // 📤 上报清除
          className="clear-completed"
        >
          Clear Completed
        </button>
      )}
    </div>
  );
};
export default TodoStats;
```

> 💡 `{completed > 0 && <button/>}` 是 React 最常用的**条件渲染**写法：`&&` 左边为真才渲染右边。

### 5️⃣ 样式 —— 让完成项「划掉」🎨

```css
/* App.css */
* {
  margin: 0;
  padding: 0;
}

/* 已完成的 todo 加删除线 */
.completed {
  text-decoration: line-through;
}
```

`index.css` 用 **CSS 变量 + 深色模式** 做了一套设计系统：

```css
:root {
  --text: #6b6375;
  --bg: #fff;
  --accent: #aa3bff;              /* 主题紫色 💜 */
  --border: #e5e4e7;
  /* ... 更多变量 */
  color-scheme: light dark;       /* 声明支持明暗主题 */
}

/* 🌙 跟随系统深色模式自动切换 */
@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --bg: #16171d;
    --accent: #c084fc;
    /* ... */
  }
}
```

---

## 🧭 八、数据流全景图

把整件事串起来，一个 Todo 的「一生」是这样的：

```text
用户输入 "学习 React" → 敲回车
        │
        ▼
TodoInput：onAdd("学习 React")   📤 子组件打报告
        │
        ▼
App.addTodo：setTodos([新项, ...旧项])   🔄 父组件更新状态（唯一数据源）
        │
        ▼
React 检测到状态变化 → 重新渲染 App 及其子树
        │
        ├─▶ TodoList 收到新 todos → 列表多了一项  ✅
        └─▶ TodoStats 收到新 total → 数字 +1      ✅
```

**一句话总结**：`状态在父组件，事件往上走，数据往下流，改动永远走 setXxx`。

---

## 🔑 九、三条必须刻进脑子里的规则

1. 🚫 **子组件不改父组件状态** —— 只能通过 props 里的回调函数「申请」，由父组件执行。
2. 🔄 **状态不可变更新** —— 永远用 `map` / `filter` / `...` 造新数据，绝不原地改。
3. 🧠 **单一数据源** —— 共享数据只存一份在父组件，派生数据直接算，不额外复制。

---

## 🎉 结语

一个看似简单的 Todo List，其实浓缩了 React 最核心的心智模型：

- 🧱 **组件化** —— 拆积木
- 🌳 **组件树** —— 先规划后编码
- ⚛️ **JSX** —— 用 JS 写界面
- 🪝 **useState** —— 状态即记忆
- 🔄 **单向数据流** —— props 向下、事件向上

掌握了这些，你已经拿到了进入 React 世界的钥匙 🗝️。下一步，可以试着给这个应用加上 **`useEffect` 把 todos 存进 localStorage**（实现刷新不丢数据），或者用 **`useReducer`** 把四个操作函数收敛成一个 reducer——那又是另一段精彩的旅程了。🚀

---

> 📄 本文代码来自本项目源码，核心概念参考项目 `README.md` 的梳理。
