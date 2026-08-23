# 🚀 实战 Vibe Coding：用 AI 从零搭一个 React 待办清单

> 想用 AI 写代码，结果不是「幻觉代码」——看着像那么回事，一跑就崩；就是「屎山代码」——能跑，但乱到想改都不知道从哪下手。
>
> 这篇不是教你写代码，而是教你**怎么和 AI 协作，写出靠谱的代码**。
>
> 我们以「React + Tailwind 实现一个待办清单（TodoList）」为实战案例，完整走一遍流程。

---

## 🧭 一个核心认知：把 AI 当「同事」，而不是「代码生成器」

新手用 AI 写代码，最常见的姿势是：

> 💬 *「帮我写一个 React 待办清单页面，支持新增、删除任务。」*

然后 AI 啪一下吐出一大坨代码。你以为省事了，其实埋了一堆坑：

| ❓ 隐患 | 说明 |
| :--- | :--- |
| 🤔 要不要本地存储？ | AI 没问，可能擅自加了 `localStorage` |
| 🤔 要不要远程 API？ | AI 可能凭空造了一个后端接口 |
| 🤔 要不要拖拽排序？ | AI 可能手写一套坐标监听逻辑 |
| 🤔 要不要优先级标签？ | 功能无限膨胀，直接变屎山 |

**问题的根源**：你把 AI 当成了「只会机械输出的代码机器」，而它其实该是你的**伙伴、同事、助手**。

就像你不会让一个刚入职的员工直接上手干活——得先让他读《员工手册》、熟悉业务流程。对 AI 也是同理。

---

## 📋 第一步：规划就是一切

> **不要让 AI 急着写代码，先强制它读懂你的技术栈和项目规划。**

### 先规划，再编码 🎯

给 AI 下达的第一条指令，应该**禁止它写任何代码**，只输出规划：

````text
遵守胶水编程思维：优先使用成熟方案，避免凭空造逻辑。

第一个阶段：只做规划，禁止输出任何代码。

1. 确认技术栈：
   React 19 + Tailwind CSS + useState

2. 梳理功能边界：
   - 新增待办、删除待办、切换完成状态
   - 不做本地持久化、筛选、拖拽功能

3. 拆分模块（乐高组件）：
   输入框组件、待办条目组件、列表容器组件

4. 定义数据流：
   useState 存储 task 数组，数据结构：
   { id, text, completed }

5. 输出这份完整规划，等待我确认无误后，再分段实现代码
````

### 这份规划在防什么？🛡️

| 规划动作 | 背后的逻辑 |
| :--- | :--- |
| 📐 **划定边界** | 防止 AI 擅自多加功能，功能无限膨胀成屎山 |
| 🧱 **强制模块拆分** | 代码好读、好维护，AI 生成的代码我们也要审核 |
| 🧩 **引导复用独立组件** | 每个组件职责单一，像乐高积木一样拼装 |
| 📦 **预定数据结构** | 从根源减少 AI 的「参数/字段幻觉」——字段叫 `text` 就是 `text`，不能让 AI 自己拍脑袋叫 `title` |

**一句话总结**：先生成规划 → 审核规划 → 更新规划。这份规划将**伴随项目开发的整个生命周期**。

---

## 🧩 第二步：胶水编程思维

> **能抄不写，能连不造。**
>
> 轮子别人造好，你只做胶水；胶水不生产零件，只联通零件。

### 胶水是什么？🔗

- ✅ **能抄不写**：去 GitHub 找那些经典、优质、被验证过千万次的代码。
- ✅ **能连不造**：A、B、C 组件之间，用胶水把它们黏合起来。
- ❌ **绝不从零自研底层逻辑**：手写底层 = 高幻觉 + 难维护。

胶水本身**不创造零件**，只负责把现成零件黏在一起。你只负责写**衔接、调用、流转**的粘合代码，把各个模块联通。AI 生成的代码量越少，产生幻觉和屎山的可能性就越低。

### 实战对比：拖拽排序 🖱️

待办清单做完基础功能后，你想加一个「拖拽排序」。两种做法，天差地别：

#### ❌ 错误示范（从零造零件）

> 💬 *「帮我写 React 待办清单的拖拽排序功能」*

AI 很可能凭空手写一套拖拽逻辑：自行实现坐标监听、碰撞检测、排序算法……

**问题**：
- 🐛 手写拖拽的边界 case 极多（边界判断、跨元素位置、动画回弹……），极易出幻觉 bug
- 💩 代码冗长复杂，难以维护

#### ✅ 正确示范（胶水）

````text
遵守胶水编程原则：绝不从零自研底层逻辑，优先选择社区长期验证的成熟开源组件。

当前需求：给待办列表增加拖拽排序。

1. 先调研：React 生态成熟的拖拽库，优先选用 @dnd-kit（业内广泛使用）
2. 不要自己手写拖拽底层代码，只做粘合工作
3. 输出内容顺序：
   - 安装依赖命令
   - 把现有 TodoList 组件和 @dnd-kit 组件进行衔接
   - 只写模块之间适配、数据流转的粘合代码
````

**结果**：AI 只需要把 `@dnd-kit` 这个「现成零件」接进你的组件里，写几行粘合代码就够了。底层拖拽逻辑交给社区验证过的库，稳。

---

## 🧠 第三步：用元方法论让 AI 自我进化

> AI 不只会写代码，还能帮你**不断优化提示词本身**。

- 🔧 利用 `cc` / `codex` 的**记忆模块**和 **harness 架构**
- 📈 它可以持续帮我们打磨提示词
- 🔁 用「阿尔法提示词」定义怎么干活 → 生成结果 → 用「欧米茄提示词」去**打分、判断** → 反过来优化提示词

就这样，AI 系统不断地自我进化——**你越用，它越懂你**。

---

## 🛠️ 实战全景：TodoList 项目拆解

现在回到我们的待办清单。按照规划，项目结构和数据流如下：

```text
todolist/
├── index.html
├── package.json          # React 19 + Vite 6 + Tailwind 4 + @dnd-kit
├── vite.config.js
└── src/
    ├── main.jsx          # 入口
    ├── App.jsx           # 🧠 状态中枢：tasks 数组 + 增删改排
    ├── index.css         # @import "tailwindcss"
    └── components/
        ├── TodoInput.jsx # ⌨️ 输入框组件
        ├── TodoItem.jsx  # 📄 待办条目组件（含拖拽手柄）
        └── TodoList.jsx  # 📋 列表容器组件（拖拽上下文）
```

### 📦 数据结构（严格按规划）

```js
{ id, text, completed }  // 字段名早已定死，AI 不许乱改
```

### 🧠 `App.jsx` —— 状态中枢

所有状态和业务逻辑都收拢在这里，子组件只负责「接收 props + 触发回调」：

```jsx
import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'

export default function App() {
  const [tasks, setTasks] = useState([])

  const addTask = (text) => {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ])
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const reorderTask = (activeId, overId) => {
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId)
      const newIndex = prev.findIndex((t) => t.id === overId)
      return arrayMove(prev, oldIndex, newIndex)  // 🔗 胶水：复用 @dnd-kit 的排序函数
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800">待办清单</h1>
      <TodoInput onAdd={addTask} />
      <TodoList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onReorder={reorderTask}
      />
    </div>
  )
}
```

> 💡 **亮点**：拖拽排序只用了 `arrayMove(prev, oldIndex, newIndex)` 一行胶水代码，底层坐标监听、碰撞检测全部交给 `@dnd-kit`。

### ⌨️ `TodoInput.jsx` —— 输入框组件

```jsx
import { useState } from 'react'

export default function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = value.trim()
    if (!text) return          // 🛡️ 空输入直接拦截，不给脏数据
    onAdd(text)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入待办事项…"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
      >
        添加
      </button>
    </form>
  )
}
```

### 📄 `TodoItem.jsx` —— 待办条目组件（含拖拽手柄）

```jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TodoItem({ task, onToggle, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })   // 🔗 胶水：一行接入拖拽能力

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="拖动排序"
        className="cursor-grab touch-none text-gray-300 transition hover:text-gray-500"
      >
        ⋮⋮
      </button>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 accent-blue-500"
      />
      <span
        className={`flex-1 text-gray-800 ${
          task.completed ? 'text-gray-400 line-through' : ''
        }`}
      >
        {task.text}
      </span>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="text-sm text-red-400 transition hover:text-red-600"
      >
        删除
      </button>
    </li>
  )
}
```

### 📋 `TodoList.jsx` —— 列表容器组件（拖拽上下文）

```jsx
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TodoItem from './TodoItem'

export default function TodoList({ tasks, onToggle, onDelete, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id)   // 🔗 胶水：只把结果回传给 App，不碰底层
    }
  }

  if (tasks.length === 0) {
    return <p className="mt-8 text-center text-gray-400">暂无待办，添加一条吧</p>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex w-full flex-col gap-2">
          {tasks.map((task) => (
            <TodoItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
```

### 🚀 启动与依赖

```bash
# 安装依赖
pnpm i

# 开发模式启动
pnpm dev

# 构建
pnpm build
```

**依赖清单**（全部是成熟方案，没有一个轮子是自己造的）：

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",        // 🖱️ 拖拽核心
    "@dnd-kit/sortable": "^10.0.0",    // 🔀 拖拽排序
    "@dnd-kit/utilities": "^3.2.2",    // 🧰 工具函数
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",     // 🎨 样式
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.0"
  }
}
```

---

## 🧱 组件职责一览

| 组件 | 职责 | 依赖的「胶水」 |
| :--- | :--- | :--- |
| 🧠 `App.jsx` | 状态中枢，持有 `tasks` 数组 | `useState`、`arrayMove` |
| ⌨️ `TodoInput` | 输入 + 新增，自带空值拦截 | — |
| 📄 `TodoItem` | 单条展示 + 勾选/删除 + 拖拽手柄 | `useSortable` |
| 📋 `TodoList` | 列表容器 + 拖拽上下文 | `DndContext`、`SortableContext` |

> 数据流单向清晰：**子组件从不自己改数据**，只通过 props 接收状态、通过回调把意图「上报」给 `App`。这就是「胶水」的哲学——零件各司其职，胶水负责联通。

---

## 🎯 总结：三步法回顾

| 步骤 | 关键词 | 一句话 |
| :--- | :--- | :--- |
| 📋 **第一步** | 规划就是一切 | 先规划后编码，划定边界、拆模块、定结构 |
| 🧩 **第二步** | 胶水编程 | 能抄不写、能连不造，绝不从零造轮子 |
| 🧠 **第三步** | 元方法论 | 让 AI 打分、进化提示词，越用越懂你 |

### ✨ 记住这三句话

> 1. **先规划，再编码** —— 规划是给你的代码「上保险」。
> 2. **胶水不生产零件，只联通零件** —— 现成的轮子，拼就完了。
> 3. **把 AI 当同事，不当工具** —— 教它懂你，比命令它更快。

---

> 📌 *本文基于 `readme.md` 与 `todolist` 项目实战生成。所有代码均可直接运行，动手指令：`pnpm i && pnpm dev`。*
