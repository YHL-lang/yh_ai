# 🤖 Agent 智能体开发实战 · Stream 流式输出 —— AI 产品的核心体验

> **背景**：前几课我们构建了能干活、能查资料的 Agent，但所有 LLM 调用都是一次性等完整响应——复杂推理可能等几十秒，用户盯着白屏干等。
>
> **本课聚焦**：流式输出（Streaming）。让 LLM 像打字机一样逐 token 展示结果，从"等半天然后一下子全出来"变成"边想边写"。这不仅是技术优化，更是 **AI 产品的第一个关键用户体验**。

---

## 📖 本课目录

- [一、为什么需要流式输出](#一为什么需要流式输出)
- [二、流式输出的原理](#二流式输出的原理)
- [三、Vue 组件基础](#三vue-组件基础)
- [四、响应式数据：ref 和 v-model](#四响应式数据ref-和-v-model)
- [五、App.vue 逐层拆解](#五appvue-逐层拆解)
- [六、本课学习总结](#六本课学习总结)

---

## 一、为什么需要流式输出

### 🐢 一次性返回的体验

```
用户发送问题 → [漫长等待 30 秒] → 一次性弹出完整回答

❌ 用户感受：
   "是不是卡住了？"
   "要不要刷新？"
   "算了，换个工具吧……"
```

LLM 的耗时主要来自推理计算（Transformer）和问题复杂度（难度 × 回答长度）。复杂任务等几十秒很正常，但**用户不会等**。

### 🚀 流式输出的体验

```
用户发送问题 → H → He → Hel → Hell → Hello → Hello, → Hello, I → ...

✅ 用户感受：
   "它在写了……继续看……有道理……"  →  边看边理解，沉浸感更强
```

> 🎯 就像打字机 / ChatGPT 的效果——LLM 服务器和客户端之间接一根管子，生成的 token 像水流一样不断流向客户端，实时展示。

---

## 二、流式输出的原理

### 📡 协议约定

流式输出不是客户端单方面能做到的——需要**服务器和客户端双方约定**：

| 角色 | 约定 |
|------|------|
| 📤 **客户端** | 请求体中发送 `stream: true`，告诉服务器"我要流式输出" |
| 📥 **服务器** | 接受 `stream: true` 参数，每生成一个 token 就立即发送，不等全部生成完 |

### 🔧 技术原理

```
┌─────────────────┐                    ┌─────────────────┐
│   Chatbot 客户端  │    HTTP 连接（管子）  │   LLM 服务器      │
│                 │◄═══════════════════│                 │
│   fetch()       │    token 像水流     │   推理引擎        │
│   getReader()   │    不断流向客户端    │   逐 token 产出   │
│   TextDecoder   │                    │   stream: true   │
│   while 拼接    │                    │                 │
└─────────────────┘                    └─────────────────┘
```

> 💡 从计算机网络协议层理解：HTTP Response 的 Body 不是一次性完整返回的，而是以 **ReadableStream** 的形式持续传输。客户端用 `response.body.getReader()` 拿到读取器，`while` 循环逐个读 chunk。

### 📊 非流式 vs 流式

| 维度 | 非流式 | 流式 |
|------|--------|------|
| 请求参数 | `stream: false` | `stream: true` |
| 等待时间 | 等全部生成完 | 生成一个 token 就显示 |
| 数据处理 | `response.json()` 一次性解析 | `reader.read()` 逐块读取 |
| 用户体验 | 🐢 白屏等待 | 🚀 打字机效果 |
| 实现复杂度 | 简单 | 需要 ReadableStream + TextDecoder |

---

## 三、Vue 组件基础

流式输出的 Demo 用 Vite + Vue 搭建。先了解几个 Vue 基础概念。

### 🧩 .vue 单文件组件（SFC）

Vue 是前端第二大框架（React 第一），核心理念是**组件化（Component）**——构成页面的最小单位不再是 HTML 标签，而是组件。一个 `.vue` 文件由三部分组成：

```
┌──────────────────────────────┐
│  <template>                  │
│    HTML 模板，可以绑定数据      │  ← 视图层
│    它不是静态 HTML，是动态模板  │
│  </template>                 │
├──────────────────────────────┤
│  <script setup>              │
│    JS 逻辑                    │  ← 逻辑层
│    数据定义、事件处理、API调用  │
│  </script>                   │
├──────────────────────────────┤
│  <style>                     │
│    CSS 样式                   │  ← 样式层
│  </style>                    │
└──────────────────────────────┘
```

| 部分 | 作用 | 类比 |
|------|------|------|
| `<template>` | HTML 模板，**可以绑定数据、响应式更新** | 相当于 React 的 JSX |
| `<script setup>` | Vue 3 的语法糖，`setup` 里的数据自动暴露给 template | 相当于 React 的 hook 区域 |
| `<style>` | CSS 样式，默认作用于当前组件 | 相当于 CSS Modules |

> 💡 Facebook 网页由超过一万个 Component 组成。组件就像乐高积木——每个积木封装了自己的 HTML + JS + CSS，方便复用和维护。

### 🏗️ 入口文件：`main.js`

```javascript
// 创建一个 App
import { createApp } from 'vue'
// 适合全局 组件共享的样式
import './style.css'
import App from './App.vue'
// App 根组件 会有子组件
// 创建一个 App 挂在 #app 挂载点上
createApp(App).mount('#app')
```

`createApp(App).mount('#app')` —— 创建 Vue 应用实例，把最顶层的 `App` 根组件挂载到 `index.html` 里的 `<div id="app">` 上。整个应用从这里启动。

---

## 四、响应式数据：ref 和 v-model

### 📐 数据驱动（Data Driven）

传统做法（DOM 编程）：`document.getElementById('xxx').innerHTML = data` ——手动操作 DOM。

Vue/React 的做法：**修改数据 → 页面自动更新**。不需要手动 DOM 编程，框架帮你同步。

### 🔄 `ref`：响应式数据

```javascript
import { ref } from 'vue'

const question = ref('讲一个关于中国龙的故事'); // 响应式数据状态
const stream = ref(false);                        // 是否开启流式
const content = ref('');                          // LLM 回复内容
```

| 概念 | 说明 |
|------|------|
| `ref(value)` | 创建一个**响应式数据**——数据变了，页面自动更新 |
| `.value` | JS 里读/写数据用 `content.value` |

### ↔️ `v-model`：双向数据绑定

```html
<input v-model="question">
```

普通的 `{{}}` 是**单向数据流**（数据 → 页面）。但表单元素特殊——用户会输入，需要把修改传回数据。`v-model` 实现**双向绑定**：

```
数据 question.value  ←────→  页面 <input> 显示值
         用户输入自动同步回数据
```

> 🎯 这是 Vue 的核心设计：**保证数据和界面状态的一致性**。你只需要和 `question.value` 打交道，框架负责同步页面。

---

## 五、App.vue 逐层拆解

### 第1步：Template 模板

```html
<template>
  <!-- 会做数据绑定{{}} -->
  <div class="container">
    <div>
      <label>输入：</label>
      <!-- vue 数据双向绑定 -->
      <!-- 属性绑定 :value 绑定到 input 的 value 属性上 -->
      <input type="text" class="input" v-model="question">
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <div>
        <label>Streaming</label>
        <input type="checkbox" v-model="stream" />
        <div v-if="stream">
          <label>Streaming</label>
        </div>
        <div>
          {{ content }}
        </div>
      </div>
    </div>
  </div>
</template>
```

| 模板语法 | 作用 |
|----------|------|
| `{{ content }}` | 数据绑定——把 `content` 的值显示在这里 |
| `v-model="question"` | 双向绑定——输入框和 `question.value` 互相同步 |
| `v-model="stream"` | checkbox 勾选状态绑定 |
| `@click="update"` | 事件绑定——点击按钮触发 `update` 函数 |
| `v-if="stream"` | 条件渲染——`stream` 为 true 时才显示 |

### 第2步：Script Setup 逻辑

```javascript
<script setup>
// vue 前端第二框架  react 第一
// vue & React 都是具有 组件化思想(component)、
//  数据绑定（data binding）响应式（reactive)
//  等的现代前端开发框架
//  组件化思想，构成页面的最小单位不再是html标签，而是组件
//  html标签是元素，太多了，不好作为一个工作的单元
//  css 也一样，css rule
//  js dom
//  将一堆html, css, js 组合在一起，形成一个可复用、好维护的特定业务工作
//  单元  .vue
//  数据绑定思想 template 绑定数据 不需要dom 编程
//  fetch 数据，dom innerHTML 渲染数据
//  响应式数据 数据改变了，页面自动更新 reactive
import { ref } from 'vue'

const question = ref('讲一个关于中国龙的故事');
const stream = ref(false);
const content = ref(''); // llm response 内容 | 开始请求
```

### 第3步：API 调用 + 流式读取

```javascript
const update = async () => {
  if (!question.value) return; // 不能为空
  content.value = '思考中....'

  const endpoint = 'https://api.deepseek.com/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    // apikey 令牌的一种标记 Bearer 开始 token
    Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
  }

  const response = await fetch(endpoint, {
    method: 'POST',// 加密 更安全 请求体
    headers,
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'user',
          content: question.value
        }
      ],
      stream: stream.value // llm 接受参数，是否开启流式输出
    })
  });
```

| 要点 | 说明 |
|------|------|
| `import.meta.env.VITE_DEEPSEEK_API_KEY` | Vite 自动读取 `.env.local` 里的环境变量 |
| `Bearer <token>` | API Key 令牌的标记格式 |
| `stream: stream.value` | 关键：由 checkbox 状态决定是否开启流式 |
| `method: 'POST'` | POST 更安全，请求体加密传输 |

### 第4步：流式输出分支

```javascript
  if (stream.value) {
    content.value = ''; // 流式输出，清空内容
    // 响应体对象，一批批的 token 流式输出
    // 流式读取响应体 读取器 reader
    console.log(response.body);//readableStream
    // 二进制流 可读流 ?.
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    // 解码器 二进制流 转换为文本流
    let done = false; // 是否读取完成
    let buffer = '';

    while (!done) { //不停的读，直到[DONE]
      // 读取到的是二进制流 unit8Array 十进制数
      const { value, done: doneReading } = await reader.read();
    }
  }
```

| 步骤 | API | 说明 |
|------|-----|------|
| ① 获取读取器 | `response.body?.getReader()` | `?.` 可选链，body 可能为 null |
| ② 创建解码器 | `new TextDecoder()` | 二进制 Uint8Array → 文本字符串 |
| ③ 循环读取 | `reader.read()` | 返回 `{ value, done }`，`done: true` 表示读完 |
| ④ 解构 done | `done: doneReading` | 用别名避免覆盖 while 的 `done` 变量 |

> 🎯 核心流程：**getReader → TextDecoder → while 循环 read → 拼 buffer**。像用一个勺子一勺一勺舀水，而不是等整桶水装满再端过来。

### 第5步：非流式分支

```javascript
  } else {
    // 非流式输出
    // 生成完了，直接返回结果
    // 二进制流 json 数据
    const data = await response.json();
    // 不再需要dom编程，修改数据状态
    content.value = data.choices[0].message.content;
  }
}
```

> 💡 非流式：`response.json()` 一下拿到完整数据。流式：`reader.read()` 逐块拿。但修改页面展示的方式一样——**改 `content.value` 的值，页面自动更新**。

### 📊 流式 vs 非流式：代码路径对比

```
                ┌── stream: true ──► 流式路径
                │                   ① response.body.getReader()
  fetch() ──────┤                   ② new TextDecoder()
                │                   ③ while (!done) { reader.read() }
                │                   ④ 逐 chunk 拼接 → content.value
                │
                └── stream: false ─► 非流式路径
                                    ① response.json()
                                    ② 一次性 → content.value
```

---

## 六、本课学习总结

### 🧠 知识点

```
📋 Stream 流式输出 · 知识点
│
├── 🐢 为什么需要流式
│   ├── LLM 推理耗时长（Transformer 计算）
│   ├── 一次性返回让用户干等
│   └── 流式像打字机，边想边写，体验更好
│
├── 📡 协议约定
│   ├── 客户端：请求体 stream: true
│   ├── 服务器：接受参数，逐 token 产出
│   └── 比喻：LLM 和客户端之间接一根管子
│
├── 🔧 技术实现
│   ├── fetch() + body: { stream: true }
│   ├── response.body.getReader()
│   ├── TextDecoder（二进制 → 文本）
│   ├── while (!done) { reader.read() }
│   └── buffer 拼接，content.value 实时更新
│
├── 🧩 Vue 组件基础
│   ├── .vue 单文件组件（SFC）
│   ├── template：动态 HTML 模板
│   ├── script setup：JS 逻辑
│   ├── style：CSS 样式
│   └── 组件化：乐高积木式开发
│
├── 📐 响应式数据
│   ├── ref()：创建响应式数据
│   ├── {{}}：单向数据绑定（数据 → 页面）
│   ├── v-model：双向绑定（输入框 ↔ 数据）
│   ├── @click：事件绑定
│   └── v-if：条件渲染
│
├── 🔑 数据驱动思想
│   ├── 不需要 DOM 编程
│   ├── 修改数据 → 页面自动更新
│   └── 保证数据和界面状态的一致性
│
└── 🛡️ 安全与配置
    ├── Vite 自动读取 .env.local
    ├── import.meta.env.VITE_xxx 访问
    └── Bearer Token 认证格式
```

### ✅ 知识清单

| 编号 | 掌握项 | 核心要点 |
|------|--------|----------|
| 1 | 流式 vs 非流式 | 流式逐 token 实时展示，非流式等待全部生成 |
| 2 | `stream: true` 协议 | 客户端 + 服务器双方约定，服务器逐 token 发送 |
| 3 | ReadableStream | `response.body.getReader()` 获取可读流读取器 |
| 4 | TextDecoder | 二进制 Uint8Array → 文本字符串 |
| 5 | `reader.read()` | 返回 `{ value, done }`，`done: true` 表示流结束 |
| 6 | `.vue` SFC 三件套 | template（模板）+ script setup（逻辑）+ style（样式） |
| 7 | `ref()` 响应式 | 创建响应式数据，`.value` 读写，数据变了页面自动更新 |
| 8 | `v-model` 双向绑定 | 表单元素专用，用户输入自动同步回数据 |
| 9 | `{{}}` 数据绑定 | 将数据显示在页面上，单向绑定 |
| 10 | `import.meta.env` | Vite 读取 `.env.local` 中的环境变量 |

### 📊 能力定位

| 维度 | 之前的课程 | Stream 流式输出 |
|------|-----------|----------------|
| 关注的层 | 后端（Agent 逻辑、Tool、MCP） | **前端（用户体验）** |
| 核心技术 | LangChain、child_process、MCP SDK | **fetch、ReadableStream、Vue** |
| 解决的问题 | LLM 能做什么 | **LLM 的回复怎么展示** |
| 关键指标 | 工具数量、Agent 能力 | **首字延迟、用户等待时长** |

> 🎯 **本课定位**：之前所有课程都在解决"Agent 能做什么"——定义 Tool、构建 Loop、接入 MCP。本课解决的是"用户怎么感受到 Agent 在工作"——**流式输出是 AI 产品的第一个关键体验**。后端能力再强，前端白屏等 30 秒，用户早就走了。

---

*📅 2026-07-20 | 🏷️ Agent · Stream · 流式输出 · Vue · ReadableStream · 用户体验*
