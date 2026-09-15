# 🌐 前端跨域完全指南：从原理到实战

> 跨域是前端开发中绕不开的经典话题。本文将系统梳理常见的跨域解决方案，并重点通过实战代码深入理解 **WebSocket 双工通信** 的原理与应用。

---

## 📑 目录

1. [🔍 什么是跨域？](#-什么是跨域)
2. [📋 常见跨域解决方案一览](#-常见跨域解决方案一览)
3. [🌐 Nginx 反向代理](#-nginx-反向代理)
4. [⚡ Vite + Mock.js 开发模式](#-vite--mockjs-开发模式)
5. [📡 SSE 服务器单向推送](#-sse-服务器单向推送)
6. [📦 JSONP 跨域技巧](#-jsonp-跨域技巧)
7. [🔒 CORS 跨域资源共享](#-cors-跨域资源共享)
8. [💬 postMessage 跨域通信](#-postmessage-跨域通信)
9. [🔥 重点：WebSocket 双工通信](#-重点websocket-双工通信)
10. [🧪 实战 Demo 演示](#-实战-demo-演示)
11. [❓ 为什么 LLM 流式输出不用 WebSocket？](#-为什么-llm-流式输出不用-websocket)

---

## 🔍 什么是跨域？

跨域是指浏览器的 **同源策略（Same-Origin Policy, SOP）** 拦截了不同源之间的请求。

**"同源"意味着三要素必须一致：**

| 要素     | 示例                    |
| -------- | ----------------------- |
| 📌 协议 | `http` vs `https`       |
| 🌍 域名 | `example.com` vs `api.example.com` |
| 🔢 端口 | `3000` vs `8080`        |

只要其中一个不同，浏览器就会拦截请求——这就是"跨域"的根源。

---

## 📋 常见跨域解决方案一览

| 方案 | 通信方式 | 适用场景 | 复杂度 |
|------|---------|---------|--------|
| 🔄 Nginx 反向代理 | 服务端代理 | 生产环境部署 | ⭐⭐ |
| ⚡ Vite + Mock.js | 开发模拟 | 本地开发 | ⭐ |
| 📡 SSE | 服务器 → 客户端（单向流） | 实时推送、AI 流式输出 | ⭐⭐ |
| 📦 JSONP | `<script>` 标签注入 | 老项目兼容 | ⭐ |
| 🔒 CORS | HTTP 响应头控制 | **最主流方案** | ⭐⭐ |
| 💬 postMessage | 跨窗口通信 | iframe 通信 | ⭐⭐ |
| 🔥 WebSocket | 全双工通信 | 实时聊天、弹幕、直播 | ⭐⭐⭐ |

---

## 🌐 Nginx 反向代理

> 核心思路：让浏览器认为请求的是**同源**，由 Nginx 在服务端转发请求。

**工作流程：**

```
浏览器 → Nginx (同源) → 后端 API (跨域)
  ↓           ↓              ↓
index.html   /api/xxx    实际数据来源
```

前端发出 `/api` 请求 → Nginx 拦截 → 转发到 `:3001` 的真实后端服务。

---

## ⚡ Vite + Mock.js 开发模式

在开发阶段，Vite 内置的 dev server 可以配合 Mock.js 直接拦截请求、返回模拟数据，**无需后端参与**，天然不存在跨域问题。

---

## 📡 SSE 服务器单向推送

**SSE（Server-Sent Events）** 是 HTML5 引入的服务器单向流式推送机制。

### 关键响应头

```
Content-Type: text/event-stream;
Cache-Control: no-cache;
Connection: keep-alive;
```

### 特点

- ✅ 服务器 → 客户端 **单向**推送
- ✅ 基于 HTTP 协议，天然支持
- ✅ 适合 AI 大模型的流式输出场景

> ⚠️ **注意**：HTTP 协议本身是"请求-响应"模式，服务器无法主动向客户端发数据。SSE 在此基础上实现了服务器持续推送的能力。

---

## 📦 JSONP 跨域技巧

**JSONP（JSON with Padding）** 利用 `<script>` 标签不受同源策略限制的特性实现跨域：

```html
<script src="https://api.example.com/data?callback=handleData"></script>
<script>
  function handleData(data) {
    console.log(data);
  }
</script>
```

> 💡 只支持 `GET` 请求，是历史方案，现代项目推荐使用 CORS。

---

## 🔒 CORS 跨域资源共享

**CORS（Cross-Origin Resource Sharing）** 是目前**最主流、最推荐**的跨域解决方案。

服务端通过设置 HTTP 响应头来告诉浏览器"允许跨域"：

```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 💬 postMessage 跨域通信

`window.postMessage()` 实现跨窗口/iframe 的单向通信：

```javascript
// 父窗口发送
iframe.contentWindow.postMessage('Hello', 'https://target.com');

// 子窗口接收
window.addEventListener('message', (event) => {
  if (event.origin === 'https://example.com') {
    console.log(event.data);
  }
});
```

---

## 🔥 重点：WebSocket 双工通信

### 🤔 为什么需要 WebSocket？

| 通信模式 | 方向 | 典型场景 |
|---------|------|---------|
| HTTP 请求-响应 | 客户端 → 服务器 | 普通网页浏览 |
| SSE | 服务器 → 客户端 | AI 流式输出、消息推送 |
| **WebSocket** | **双向（双工）** | **聊天、弹幕、直播、游戏** |

### 🔄 WebSocket 连接过程（两步握手）

WebSocket 的连接**分两步**完成：

```
第 1 步：HTTP 连接
浏览器 ──── HTTP GET ────→ Web Server (http://localhost:8080)
浏览器 ←── 101 Switching Protocols ──── 服务器

第 2 步：协议升级为 WebSocket
浏览器 ←─────── 双向通信建立 ───────→ WebSocket Server
           (ws://localhost:8080/ws)
```

> 🔑 **关键**：`101 Switching Protocols` 表示服务器同意从 HTTP 协议切换到 WebSocket 协议。

### 📊 HTTP 状态码速查

| 状态码 | 含义 |
|-------|------|
| `1XX` | 🔄 信息性，通信中 |
| `2XX` | ✅ 成功 |
| `3XX` | ↪️ 重定向 |
| `4XX` | ❌ 客户端错误 |
| `5XX` | 💥 服务器错误 |

### ✨ WebSocket 天然支持跨域

> 💡 **重要结论**：WebSocket 协议**不需要遵守同源策略**，可以直接跨域通信！

但 WebSocket 主要用于实时通信场景，**不建议**用它来解决常规的 API 跨域问题。

---

## 🧪 实战 Demo 演示

### 📁 项目结构

```
cors/demo/
├── server.js       # Node.js WebSocket 服务器
├── index.html      # 浏览器端 WebSocket 客户端
└── package.json    # 依赖配置 (ws 库)
```

### 🖥️ 第 1 步：服务端代码 (`server.js`)

```javascript
const WebSocket = require('ws');
const http = require('http');  // Node.js 内置 http 模块

// ① 创建 HTTP Server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server Running!');
});

// ② 基于 HTTP Server 搭建 WebSocket 服务
const wss = new WebSocket.Server({ server, path: '/ws' });

// ③ 监听客户端连接事件
wss.on('connection', (ws) => {
  console.log('Client Connected');

  // ④ 接收并回复消息
  ws.on('message', (message) => {
    console.log(`Received Message: ${message}`);
    ws.send(`Server received: ${message}`);
  });
});

// ⑤ 启动服务器，监听 8080 端口
server.listen(8080, () => {
  console.log(`listen on http://localhost:8080`);
});
```

**代码逐行解析：**

| 步骤 | 说明 |
|------|------|
| ① 创建 HTTP Server | WebSocket 基于 HTTP 升级，必须先有 HTTP 服务 |
| ② 创建 WebSocket.Server | 在 HTTP 服务上挂载 WebSocket，路径为 `/ws` |
| ③ `connection` 事件 | 当有客户端连接时触发 |
| ④ `message` 事件 | 接收客户端消息并回复 |
| ⑤ `server.listen` | 启动监听，等待连接 |

### 🌐 第 2 步：客户端代码 (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WebSocket Cross-Origin Demo</title>
</head>
<body>
  <h1>WebSocket Client</h1>
  <script>
    // ① 创建 WebSocket 连接（连接到服务端的 /ws 路径）
    const ws = new WebSocket('ws://localhost:8080/ws');

    // ② 监听连接建立事件
    ws.onopen = () => {
      console.log('Connected to Server');
      ws.send('Hello from Client!');  // 发送消息
    };

    // ③ 监听服务端推送的消息
    ws.onmessage = (event) => {
      console.log(`Received Message: ${event.data}`);
    };

    // ④ 监听错误
    ws.onerror = (error) => {
      console.error('Error:', error);
    };

    // ⑤ 监听连接关闭
    ws.onclose = () => {
      console.log('Disconnected from Server');
    };
  </script>
</body>
</html>
```

**WebSocket 四大事件：**

| 事件 | 触发时机 | 典型用途 |
|------|---------|---------|
| 🟢 `onopen` | 连接成功建立 | 发送初始消息、认证 |
| 📨 `onmessage` | 收到服务端消息 | 更新 UI、处理数据 |
| 🔴 `onerror` | 发生错误 | 错误日志、重连逻辑 |
| ⚫ `onclose` | 连接断开 | 清理资源、自动重连 |

### 🚀 第 3 步：启动运行

```bash
# 安装依赖
pnpm install

# 启动服务器
node server.js

# 在浏览器中打开 index.html
```

**运行效果：**

```
🖥️ 服务器端控制台：
   listen on http://localhost:8080
   Client Connected
   Received Message: Hello from Client!

🌐 浏览器控制台：
   Connected to Server
   Received Message: Server received: Hello from Client!
```

---

## ❓ 为什么 LLM 流式输出不用 WebSocket？

这是一个很好的思考题。WebSocket 是**双工通信**，理论上也可以用于 LLM 的流式输出，但实践中通常选择 **SSE**，原因如下：

| 对比维度 | SSE | WebSocket |
|---------|-----|-----------|
| 通信方向 | 服务器 → 客户端（单向） | 双向 |
| 协议 | 基于 HTTP | 独立协议 |
| 自动重连 | ✅ 浏览器内置支持 | ❌ 需手动实现 |
| 数据格式 | 纯文本（EventStream） | 二进制/文本 |
| 复杂度 | ⭐ 低 | ⭐⭐⭐ 高 |
| LLM 适配度 | ⭐⭐⭐ 完美匹配 | ⭐⭐ 过度设计 |

> 💡 **结论**：LLM 流式输出是典型的**服务器单向推送**场景，SSE 更轻量、更简单。WebSocket 的双向能力在这个场景中用不到，属于"杀鸡用牛刀"。

---

## 📌 总结

| 场景 | 推荐方案 |
|------|---------|
| 🏗️ 生产环境 API 跨域 | **Nginx 反向代理** / **CORS** |
| 🛠️ 本地开发 | **Vite + Mock.js** |
| 📡 AI 流式输出 | **SSE** |
| 💬 实时聊天/弹幕/直播 | **WebSocket** |
| 🖼️ iframe 跨域通信 | **postMessage** |
| 📦 老项目兼容 | **JSONP** |

> 🎯 **记住**：没有最好的方案，只有最适合场景的方案。理解每种方案的原理，才能在实际开发中做出正确选择。
