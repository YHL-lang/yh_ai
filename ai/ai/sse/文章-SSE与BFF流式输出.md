# 🚀 SSE 服务器发送事件与 BFF 层实战

> 从零理解「服务器主动推送」，并动手在 Vue 项目中搭一个 Node BFF 层，把 LLM 的流式输出优雅地送到前端。

---

## 📖 目录

1. [什么是 SSE](#一什么是-sseserver-sent-events)
2. [什么是 BFF](#二什么是-bffbackend-for-frontend)
3. [为什么流式输出要放在 BFF 层](#三为什么流式输出要放在-bff-层)
4. [整体架构设计](#四整体架构设计)
5. [用 Express 搭建 BFF 服务](#五用-express-搭建-bff-服务)
6. [跨域问题与 Vite 代理](#六跨域问题与-vite-代理)
7. [API Key 的安全存放](#七api-key-的安全存放)
8. [完整代码](#八完整代码)
9. [总结](#九总结)

---

## 一、什么是 SSE（Server-Sent Events）

**SSE（Server-Sent Events，服务器发送事件）** 是一种让服务器可以**主动向浏览器推送数据**的技术。

在传统的 HTTP 请求中，通信模式是「一问一答」：

```text
浏览器：我要数据！
服务器：给你（一次性返回，连接关闭）
```

而 SSE 模式下，服务器可以持续、单向地把数据「流」给客户端：

```text
浏览器：我要听你直播！
服务器：好，我一句一句说给你听……
        → 数据块 1
        → 数据块 2
        → 数据块 3
        → ……（连接保持打开，直到结束）
```

### 🆚 SSE vs WebSocket

| 特性 | SSE | WebSocket |
| --- | --- | --- |
| 方向 | 单向（服务器 → 客户端） | 双向 |
| 底层协议 | HTTP（更简单） | 独立协议 |
| 自动重连 | ✅ 内置 | ❌ 需手写 |
| 适用场景 | 流式输出、消息推送 | 聊天、实时协作 |

对于 LLM 流式回答这种「服务器不断吐字」的场景，**SSE 是最轻量的选择**。

---

## 二、什么是 BFF（Backend For Frontend）

**BFF（Backend For Frontend）** 直译就是「**为前端服务的后端**」。

### 传统后端

传统后端（Backend）是一个纯后端 Server，比如用 Java / Go / Node 做 MVC 开发：

```text
Model（模型） — View（视图） — Controller（控制器）
```

它关注的是 CRUD 接口、Restful 规范、稳定性、并发、安全等。

### 问题来了

前端的需求五花八门：接口格式要改、字段要裁剪、数据要聚合……如果每次都让后端同学改，沟通成本高、响应慢。

于是诞生了「**大前端**」的思路：前端工程师自己写一个 Node 服务，来满足自己的需求。这个夹在中间的轻量服务，就是 **BFF 层**：

```text
前端（Vue/React） → Node（BFF） → 后端（Java）
```

> 💡 BFF 的本质：**把「面向页面」的定制逻辑，从通用后端里剥离出来，交给前端自己掌控。**

---

## 三、为什么流式输出要放在 BFF 层

当 LLM 以流式返回时，前端要做的事情非常麻烦：

```text
⚠️ 前端直接对接 LLM 流式输出的痛苦：
- 拿到的是一个二进制流对象（ReadableStream）
- 要手动解码（TextDecoder）
- 要手动解析 "data:" 前缀和各种分隔符
- 要处理 [DONE] 结束标记
- 各种边界情况（断流、半包、乱码）……
```

这些脏活累活，如果每次都在前端 Vue 组件里写一遍，代码会又乱又难维护。

**解决方案：把这些复杂性抽象到 BFF 层（Node），让前端只拿到干净、简单的数据。**

```text
前端 fetch  →  Node（BFF）  →  LLM 服务器
  （简单）      （处理流、解码）   （deepseek 等）
```

> 🎯 核心思想：**复杂留给 BFF，简单留给前端。**

---

## 四、整体架构设计

本项目的目录结构如下：

```text
stream-bff/
├── server.mjs          ← BFF 层（Express 后端服务，监听 3000 端口）
├── vite.config.js      ← Vite 配置（含 proxy 代理）
├── package.json        ← 项目描述文件（依赖、脚本）
├── .env.local          ← 环境变量（存放 API Key）
├── index.html          ← 页面入口
└── src/
    ├── main.js         ← Vue 应用入口
    └── App.vue         ← 前端页面
```

### 数据流图

```text
┌─────────┐  fetch  ┌──────────┐  fetch  ┌─────────────┐
│  前端    │ ──────→ │ Node BFF  │ ──────→ │  LLM 服务器   │
│ Vue App │         │ (Express) │         │  (DeepSeek)  │
│  :5173  │         │   :3000   │         │              │
└─────────┘         └──────────┘         └─────────────┘
                          ↑
                     API Key 藏在这里
```

三个关键点：

1. **前端跑在 Vite 的 5173 端口**
2. **BFF 跑在 Node 的 3000 端口**
3. **API Key 只存在 BFF 层**，前端不接触

---

## 五、用 Express 搭建 BFF 服务

### 为什么选 Vite 项目当 BFF？

Vite 工程化本身就是 Node 后端服务，方便顺势开发 BFF。开发 Node 服务只需要三步：

1. ✅ 安装并引入后端框架（express）
2. ✅ 实例化一个 `app`，并监听 3000 端口
3. ✅ 定义路由

### 安装依赖

```bash
npm install express dotenv
npm install -D nodemon
```

- `express`：后端开发框架
- `dotenv`：读取 `.env` 环境变量
- `nodemon`：热更新，改代码自动重启服务

### 最小可运行示例

```js
// server.mjs
import express from 'express';

const app = express();   // 实例化 server app
const port = 3000;       // 监听端口

// 定义路由
app.get('/', (req, res) => {
  // req：请求对象  res：响应对象
  res.send('Hello World!'); // 一次性发送
});

// 监听端口
app.listen(port, () => {
  console.log(`服务器在端口 ${port} 启动了`);
});
```

> 🖥️ `res.send()` 是一次性发送，把整段内容一次性返回给客户端。**而流式输出，则是「不断的」发送**，这正是 SSE 的核心。

---

## 六、跨域问题与 Vite 代理

### 🚧 什么是跨域？

只要 **域名、端口、协议（http/https）** 三者中有一个不同，`fetch` 请求时就会触发浏览器的 **同源策略（Same-Origin Policy）**，被拦截。

我们的场景：

```text
前端  :5173
后端  :3000
       ↑ 端口不同 → 跨域！
```

### 🔧 Vite 的解决方案：proxy 代理

**第一步**：把前端请求地址改成 `/api/stream`。

```text
/api 是一个「标志」，代表「我要请求后端 API」。
```

此时请求地址变成 `:5173/api/stream`——和前端同源，**不跨域了**，但因为前端并没有这个路由，所以会返回 **502**。

**第二步**：在 `vite.config.js` 里配置代理，让 Vite 拦截所有 `/api` 开头的请求，转发给真正的后端：

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 前端请求以 /api 开头时，交给代理处理
      '/api': {
        target: 'http://localhost:3000',  // 转发到后端 BFF
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
      }
    }
  }
})
```

### 完整流转过程

```text
前端 fetch('/api/stream?prompt=hello')
        ↓
Vite 拦截（发现以 /api 开头）
        ↓
rewrite：去掉 /api  → 变成 /stream
        ↓
转发到 http://localhost:3000/stream
        ↓
BFF 处理，返回结果
```

```text
:5173/api/stream  ──(不跨域但 502)──▶  Vite proxy  ──▶  :3000/stream
```

> 🎯 一句话：**前端只认 `/api` 标志，跨域、改写、转发的脏活全部交给 Vite 代理。**

---

## 七、API Key 的安全存放

### ⚠️ 为什么不能放前端？

如果 API Key 写在纯前端代码里，任何人**右键「查看源代码」**就能看到你的密钥，等于把钱包密码贴在门上。

### ✅ 正确姿势：放在 BFF 层 + dotenv

```text
fetch（不带 Key）→ BFF（持有 apikey）→ LLM 服务器
```

把 Key 写进 `.env.local` 文件（已在 `.gitignore` 中，不会提交到仓库）：

```bash
# .env.local
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

在 `server.mjs` 中用 `dotenv` 读取：

```js
import * as dotenv from 'dotenv';

dotenv.config({
  path: ['.env.local', '.env']   // 优先读 .env.local，找不到再读 .env
});

// 之后通过 process.env 访问
const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
```

---

## 八、完整代码

### 🖥️ BFF 层 `server.mjs`

```js
import * as dotenv from 'dotenv';
import express from 'express';

// 加载环境变量，让 Key 更安全（前端看不到）
dotenv.config({
  path: ['.env.local', '.env']
});

const app = express();
const port = 3000;

// 普通路由：一次性响应
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 流式输出路由：给前端调用
app.get('/stream', async (req, res) => {
  const { prompt } = req.query;                 // 解析前端传来的 prompt
  const endpoint = 'https://api.deepseek.com/v1/chat/completions';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        stream: true,                            // 🔑 开启流式输出
        messages: [{ role: 'user', content: prompt }]
      })
    });
    console.log(response.body);                  // ReadableStream 二进制流对象
    // TODO：把 response.body 逐块转发给前端（SSE 的核心）
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`服务器在端口 ${port} 启动了`);
});
```

> 📝 关键：`stream: true` 让 LLM 以流式返回，`response.body` 是一个 **ReadableStream**。后续只需把这个流逐块 `pipe` 给前端的 `res` 即可完成 SSE 转发。

### 🎨 前端 `src/App.vue`

```vue
<script setup>
// 一次性 → 流式：前端 → BFF → LLM 请求
fetch('/api/stream?prompt=hello')
  .then(res => res.json())
  .then(data => {
    console.log(data)
  })
</script>

<template>
  <div class="container">
    <div>
      <label>输入：</label><input class="input" v-model="question" />
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <div>
        <label>Streaming</label>
        <input type="checkbox" v-model="stream" />
      </div>
      <div>{{ content }}</div>
    </div>
  </div>
</template>
```

### ⚙️ `package.json`（依赖一览）

```json
{
  "name": "stream-bff",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "vue": "^3.5.34"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.6",
    "nodemon": "^3.1.14",
    "vite": "^8.0.12"
  }
}
```

### 🚦 启动方式

需要同时启动两个进程：

```bash
# 终端 1：启动前端（Vite，:5173）
npm run dev

# 终端 2：启动 BFF（Node，:3000）
node server.mjs
```

---

## 九、总结

| 概念 | 一句话理解 |
| --- | --- |
| 🌊 **SSE** | 服务器单向、持续地向客户端推送数据的 HTTP 技术 |
| 🧱 **BFF** | 为前端服务的轻量后端层，由前端自己掌控 |
| 🔀 **流式输出** | LLM 以 `stream: true` 逐块吐字，而非一次性返回 |
| 🚧 **跨域** | 域名/端口/协议不同即触发，用 Vite proxy 代理解决 |
| 🔐 **API Key 安全** | 藏在 BFF 层 + `.env.local`，前端不暴露 |

### 核心设计哲学

```text
前端只做「简单的事」：发起请求、展示结果
BFF 承担「复杂的事」：流解码、Key 管理、数据聚合
```

把复杂性下沉到 BFF，让前端保持简洁，这是大前端时代非常实用的工程实践。💪

---

> 📚 本文基于 `stream-bff` 示例项目整理，覆盖 SSE、BFF、Express、Vite 代理、跨域与 Key 安全等核心知识点。
