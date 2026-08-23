# 🚀 端侧 AI DEEPSEEK-R1-WEPGPU 项目实战（一）：搭建项目，认识第一个 React 组件

> 系列定位：从零开始，在浏览器里用 **WebGPU** 跑通一个 **DeepSeek-R1 蒸馏模型**。
> 这是第一篇，我们先搭好项目骨架，写第一个组件，把 React 最核心的几个概念吃透。

---

## 📌 一、这个项目要做什么？

在动手写代码之前，先搞清楚我们为什么做它。

### 1. 云端 API 的三个痛点

我们熟悉的 ChatGPT、DeepSeek，本质都是「云端大模型」：模型跑在服务器上，客户端把请求发过去，再把结果传回来。这种方式有三点不爽：

| 痛点 | 说明 |
|------|------|
| 💰 **贵** | 每次调用都按 token 计费，量大之后成本不低 |
| 🔒 **不安全** | 你的 `context`（上下文/对话历史）会随着请求一起发到服务器，数据不在自己手里 |
| 🌐 **依赖网络** | 没网就完全用不了 |

### 2. 端侧模型：把模型搬到用户端

与之相对的就是 **端侧模型（On-device Model）**——把模型下载到本地，在用户自己的设备上推理：

- 🖥️ **ollama** 这类工具，让你在本地跑开源小模型；
- 📱 手机端、🚗 汽车端的 Agent 任务，也越来越多地跑在端侧；
- 🧩 开源的小参数模型，就能胜任很多轻量任务。

### 3. 浏览器 + WebGPU：随时随地，即开即用

而我们的项目更进一步：**模型直接跑在浏览器里**。

- 🌍 打开网页就能用，随时下载、随时推理；
- ⚡ 用 **WebGPU** 调用 GPU 加速推理，速度不再是瓶颈；
- 🔌 甚至加载一次之后可以**离线使用**。

我们选用的模型是 `DeepSeek-R1-Distill-Qwen-1.5B`：

> 🧠 **DeepSeek-R1** 的 **15 亿（1.5B）参数蒸馏版**，基于 **Qwen（通义千问）架构**，专门为本地轻量推理优化。
> 「蒸馏」的意思是：用一个更大的、更强的模型（老师）去训练一个更小的模型（学生），让小模型也能具备大模型的部分推理能力。

---

## 🧰 二、技术栈

| 技术 | 作用 | 为什么选它 |
|------|------|-----------|
| ⚛️ **React** | 前端框架，搭积木式构建界面 | AI 时代大型项目的首选前端技术，生态最丰富 |
| 🔷 **TypeScript** | 给 JS 加类型约束 | 大型项目必备，代码更可靠、更好维护 |
| ⚡ **Vite** | 构建工具 / 开发服务器 | 启动快、热更新快，现代前端标配 |
| 🎨 **TailwindCSS** | 原子类 CSS 框架 | 几乎不用再手写 CSS，用类名拼样式 |

> 💡 **为什么 React 比 Vue 难入门？**
> Vue 一个文件（`.vue`）里用 `template / script / style` 三明治结构，模板、逻辑、样式各管各的，对新手更友好。
> React 更「自由」——一个组件就是一个函数，把 HTML、CSS、JS 全揉在一个函数里，上手门槛更高，但大型项目里组织能力更强，AI 训练代码里 React 也更多。

---

## 🗂️ 三、项目结构

先看一眼整体目录，心里有个地图：

```
deepseek-r1-webgpu/
├── webgpu-demo/               # 真正的 React 工程（在这下面开发）
│   ├── index.html             # HTML 入口，只有一个 <div id="root">
│   ├── package.json           # 依赖 + 脚本（dev / build / lint）
│   ├── vite.config.ts         # Vite 配置，挂载 react 和 tailwind 插件
│   ├── tsconfig*.json         # TypeScript 配置
│   └── src/
│       ├── main.tsx           # JS 入口，把 App 挂载到 #root
│       ├── App.tsx            # 第一个组件（本篇文章的主角）
│       ├── App.css            # 全局样式
│       └── index.css          # 引入 tailwindcss
├── package.json               # 根目录（只是装了 tailwind 依赖，没有脚本）
└── readme.md
```

> ⚠️ **注意**：启动脚本在 `webgpu-demo` 子目录里，不在根目录。所以要在子目录下跑：
>
> ```bash
> cd webgpu-demo
> npm run dev      # 启动开发服务器
> ```

---

## 🚪 四、入口：从 HTML 到 React

### 1. `index.html` —— 一切开始的地方

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webgpu-demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

这里最关键的只有两行：

- `<div id="root"></div>` —— 一个**空容器**，React 渲染的所有内容都会塞进这个 div；
- `<script type="module" src="/src/main.tsx">` —— 加载 JS 入口，整个应用从这里启动。

### 2. `main.tsx` —— 把 React 挂上去

```tsx
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

流程：`createRoot` 找到 `#root` 这个容器 → `.render()` 把 `<App />` 组件渲染进去。

> 💡 **`StrictMode`** 是 React 的「严格模式」，开发环境下会多做一次渲染来帮你暴露潜在问题，生产环境无影响。

> 💡 `getElementById('root')!` 结尾的 `!` 是 TypeScript 的非空断言，告诉编译器「这个元素一定存在，别报 `可能为 null` 的错」。

---

## ⚛️ 五、第一个组件：`App.tsx`

这是本篇文章的重头戏。我们先建立一个核心认知：

> 🧩 **在 React 里，组件就是一个函数。** 函数返回 HTML（JSX），这段 HTML 就是组件渲染出来的界面。

对比一下 Vue 和 React 的「组件」：

- Vue：`template`（结构） + `script`（逻辑） + `style`（样式），三个区块拼成一个 `.vue` 文件；
- React：**一个函数**，函数里 `return` 之前的代码是 JS 逻辑，`return` 出来的 JSX 是界面，样式用 `import` 引入。

下面我们把 `App.tsx` 拆开，一段段吃透。

### 5.1 引入依赖

```tsx
import {
  useState,   // React 函数式思想的钩子：用来声明「数据状态」
  useEffect,  // 生命周期钩子：组件挂载时执行
} from 'react';
import './App.css';
```

`useState`、`useEffect` 这类以 `use` 开头的函数，统称为 **Hooks（钩子）**——它们让你在函数组件里「钩」住 React 的各种能力。

### 5.2 `useState`：响应式数据状态

```tsx
// useState 返回两个东西：状态值 + 修改它的函数
// null 是初始值：loading 表示加载中，ready 表示 llm 已准备好
const [status, setStatus] = useState(null);
const [error, setError] = useState(null);           // 错误对象状态
const [loadingMessage, setLoadingMessage] = useState(''); // 加载中消息
const [progressItems, setProgressItems] = useState([{
  file: 'model.onnx',
  progress: 0,
  total: 342525191189,
}]);
```

这是 React 最核心的思想——**数据驱动界面（Data Driving）**：

> 🪝 以前写页面，要手动操作 DOM（`document.getElementById().innerText = ...`）去改界面；
> React 里你只需要**改数据状态**，界面会**自动**跟着变。这就是「响应式」。

用一个比喻来理解：

> 🎭 **川剧变脸**：数据状态是那张「脸」，界面是观众看到的「表情」。状态一变（换脸），界面就自动换一张脸。你只需要关心「现在是什么状态」，不用关心「怎么把界面画出来」。

`useState` 返回一个数组 `[值, 改值函数]`，这是「数组解构」的写法：

```tsx
const [count, setCount] = useState(0); // count 是状态，setCount 用来改它
// 等价于：
// const stateArray = useState(0);
// const count = stateArray[0];
// const setCount = stateArray[1];
```

> 💡 关于**数据的状态**：`null`（还没开始）、`loading`（加载中）、`ready`（模型就绪）……不同的状态对应界面不同的表现，这就是「状态机」的雏形。

### 5.3 `useEffect`：组件生命周期 / 副作用

```tsx
useEffect(() => {
  console.log('组件已经挂载完成');
  setStatus('ready');
}, [])   // 空数组 = 只在「组件挂载」时执行一次
```

`useEffect` 处理的是「**副作用**」——组件渲染之外还要额外做的事，比如：

- 🌐 发网络请求；
- 🎬 订阅事件 / 开定时器；
- 🧹 清理资源。

> 🪝 **生命周期钩子**：组件从「创建 → 挂载到页面 → 更新 → 卸载」有自己的一生，`useEffect` 让你在某个时间点插一脚。
> 第二个参数 `[]`（空依赖数组）表示「只在挂载时执行一次」；如果里面填了变量，那个变量一变它就会重新执行。

### 5.4 判断浏览器是否支持 WebGPU

```tsx
const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
```

这一行很巧，拆开看：

- 🖥️ `navigator` 是浏览器对象，`navigator.gpu` 在**支持 WebGPU 的浏览器**里是一个对象，在**不支持的浏览器**里是 `undefined`；
- ❗ `!` 是取反：`!undefined` → `true`，`!对象` → `false`；
- ❗❗ 再来一个 `!` 再取反一次，就把结果规整成干净的 `true` / `false`：

| 浏览器 | `navigator.gpu` | `!gpu` | `!!gpu` |
|--------|-----------------|--------|---------|
| 支持 WebGPU | 对象 | `false` | ✅ `true` |
| 不支持 | `undefined` | `true` | ❌ `false` |

> 💡 **双重否定 = 肯定**，这是把任意值强制转成布尔值的惯用写法，等价于 `Boolean(navigator.gpu)`。

> ⚠️ 一个小坑：TypeScript 内置的 `Navigator` 类型里**没有 `gpu` 这个属性**（WebGPU 类型定义在单独的 `@webgpu/types` 包里）。所以直接写会报 `类型"Navigator"上不存在属性"gpu"` 的错，需要 `npm i -D @webgpu/types` 并在 `tsconfig.app.json` 里引入。

### 5.5 JSX：在 JS 里写 HTML

`return` 出来的这一大段，就是 **JSX**：

```tsx
return (
  IS_WEBGPU_AVAILABLE ? (
    <div className='flex flex-col h-screen mx-auto items-center justify-end text-gray-800 bg-white'>
      {/* ... */}
    </div>
  ) : (
    <div>您的浏览器还不支持 WebGPU</div>
  )
)
```

> 📝 **JSX = JavaScript + XML**，是 React 专用语法，让你能在 JS 代码里直接写「像 HTML 一样」的标签，编译后会被转成原生的 DOM 操作。这是 React 最骄傲的特性之一——非常直观地表达界面。

这里还有一个**条件渲染**的写法：`condition ? A : B` 是三元表达式，`IS_WEBGPU_AVAILABLE` 为真就渲染支持页，为假就渲染提示页。

### 5.6 为什么是 `className` 而不是 `class`？

注意到上面用的是 `className` 而不是 `class`：

```tsx
<div className='flex flex-col ...'>
```

> ⚠️ **因为 `class` 是 JavaScript 的保留关键字**（OOP 里声明类的关键字）。在 JSX 里写 `class` 会被当成「声明一个 JS 类」，产生歧义，所以 React 规定用 `className`。

### 5.7 TailwindCSS：原子类拼界面

`className` 里那一串 `flex flex-col h-screen mx-auto ...`，就是 **TailwindCSS 的原子类**：

- 🎨 **原子类** = 每个类名只干一件事、只对应一条 CSS 规则，像乐高积木一样组合出完整样式；
- ✍️ 你不用再写选择器、写 `key: value` 的 CSS rule，直接「拼单词」就行，特别适合自然语义化编程；
- ⚙️ Vite 插件会扫描你代码里用到的类名，把对应的样式提取出来注入页面（不是预置一堆没用到的 CSS）。

几个常用类名含义：

| 类名 | 含义 |
|------|------|
| `flex` | 启用 flex 布局 |
| `flex-col` | 主轴方向改为垂直（`flex-direction: column`） |
| `h-screen` | 高度 = 一屏（`100vh`） |
| `mx-auto` | 水平方向外边距自动（水平居中，`margin-inline: auto`） |
| `items-center` | 交叉轴居中 |
| `justify-end` | 主轴靠下对齐 |

> 💡 **尺寸单位小知识**：Tailwind 里 `1` 单位 = `4px`（`1rem = 16px` 的 1/4）。比如 `mb-1` 就是 `margin-bottom: 4px`。
> 如果想要非默认值，可以用**方括号**「就地指定」：`max-w-[400px]` = `max-width: 400px`，`max-w-[510px]` = `max-width: 510px`。

> 🐛 顺带一提：`mx-w-[510px]` 是个拼写笔误，`mx-` 是水平外边距、`max-w-` 才是最大宽度，写错就没有「限宽」的效果了。这类「类名写错但不报错」的 bug 是 Tailwind 项目里最容易踩的坑。

### 5.8 错误状态：响应式渲染

```tsx
{
  error && (
    <div className='text-red-500 text-center mb-2'>
      <p className='mb-1'>Unable to load model due to the following error:</p>
      <p className='text-sm'>{error}</p>
    </div>
  )
}
```

- `error && (...)`：`&&` 是「短路与」——`error` 为空（`null`）时直接跳过不渲染，有值时才渲染后面的错误框；
- 这又是一个**响应式**的例子：后续推理出错了，只要 `setError('...')`，这个红色错误框就会自动冒出来。

### 5.9 组件里的其它小知识点

- 🤗 **HuggingFace（抱抱脸）**：全球最大的开源模型社区，模型就托管在这里；
- 🧩 **Transformers.js**：HuggingFace 推出的 JS 库，用于在浏览器里加载和推理模型；
- 📦 **ONNX Runtime Web**：`ONNX` 全称 **Open Neural Network Exchange（开放神经网络交换格式）**，是一种跨框架的模型格式，配合 Runtime Web 在浏览器里跑模型推理。

---

## 🔍 六、小结

这一篇我们完成了两件事：

1. ✅ **搭好了项目骨架**：React + TypeScript + Vite + Tailwind，理解了 `index.html → main.tsx → App.tsx` 的启动链路；
2. ✅ **吃透了第一个组件**：掌握了 React 最核心的几个概念——

| 概念 | 一句话理解 |
|------|-----------|
| 🧩 组件 | 一个返回 JSX 的函数 |
| 🪝 `useState` | 声明「响应式数据状态」，改状态界面自动变 |
| 🪝 `useEffect` | 生命周期钩子，挂载时执行副作用 |
| 📝 JSX | 在 JS 里写 HTML 的语法 |
| `className` | JSX 里用 `class` 会撞关键字，改叫 `className` |
| 🎨 Tailwind | 用原子类拼样式，几乎不写 CSS |
| ⚡ `navigator.gpu` | 判断浏览器是否支持 WebGPU |

---


