# 🌊 Vue 3 流式输出实战：从零掌握 LLM Streaming 与 SSE 协议

> **TL;DR** — 本文将带你从零搭建一个 Vue 3 + Vite 的流式输出 Demo，通过调用 DeepSeek API，深入理解 **SSE（Server-Sent Events）** 协议、**ReadableStream** API、**TextDecoder** 编解码机制，以及 **Vue 3 Composition API** 的响应式数据驱动视图更新的完整链路。

---

## 📦 一、项目结构总览

```
stream-demo/
├── index.html              # HTML 入口
├── package.json            # 依赖 & 脚本
├── vite.config.js          # Vite 构建配置
└── src/
    ├── main.js             # 应用入口
    ├── App.vue             # 核心组件（流式输出逻辑）
    ├── style.css           # 全局样式
    └── components/
        └── HelloWorld.vue   # 示例组件
```

这是一个标准的 **Vue 3 + Vite** 单页应用，核心依赖只有一个：

| 依赖 | 版本 | 角色 |
|------|------|------|
| `vue` | `^3.5.39` | 前端框架 |
| `vite` | `^8.1.1` | 构建工具 |
| `@vitejs/plugin-vue` | `^6.0.7` | Vite Vue 插件 |

---

## 🔧 二、工程配置文件一览

### `package.json` — 项目骨架

```json
{
  "name": "stream-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.39"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.7",
    "vite": "^8.1.1"
  }
}
```

📌 **要点解析**：
- `"type": "module"` — 启用 ES Module，允许在 `vite.config.js` 中使用 `import` / `export` 语法
- 三个脚本覆盖了完整的**开发 → 构建 → 预览**生命周期

### `vite.config.js` — 构建配置

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
})
```

📌 只需要一行 `plugins: [vue()]` 就能让 Vite 识别 `.vue` 单文件组件（SFC）。Vite 内部使用 Rolldown 作为打包引擎，借助 `@vitejs/plugin-vue` 在构建时完成 Vue SFC 的编译。

### `index.html` — 应用入口

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>stream-demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

📌 Vite 的入口 HTML 不需要手动引入任何构建产物 —— `type="module"` 的 `<script>` 标签会被 Vite 在开发模式下拦截并处理为 ESM 模块依赖图，从而实现**极速热更新（HMR）**。

### `src/main.js` — Vue 应用入口

```js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

📌 经典的 Vue 3 启动流程：`createApp(App).mount('#app')`，把 Vue 根组件挂载到 `index.html` 中的 `#app` 容器上。

### `src/style.css` — 全局样式

```css
* {
  margin: 0;
  padding: 0;
}
```

📌 全局 CSS Reset，消除浏览器默认边距。

---

## 🚀 三、核心战场：`App.vue` 流式输出全解析

这是整个项目的灵魂 —— 它将 **输入问题 → 调用 LLM → 流式接收 → 实时渲染** 这条完整链路串联在一起。

### 3.1 🧩 模板层：数据绑定 & 事件绑定

```html
<template>
  <div class="container">
    <div>
      <label>输入：</label>
      <input class="input" v-model="question" />
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

📌 **关键知识点**：

| 指令 | 作用 | 说明 |
|------|------|------|
| `v-model="question"` | **双向数据绑定** | 输入框内容 ↔ `question.value` 实时同步 |
| `@click="update"` | **事件绑定** | 点击按钮触发 `update()` 发起 API 请求 |
| `v-model="stream"` | **复选框绑定** | 切换流式 / 非流式模式 |
| `{{ content }}` | **插值表达式** | 将 `content.value` 渲染到页面 |

> 💡 **核心思想**：Vue 3 的响应式数据一旦变化，绑定它的 DOM 节点会**自动局部更新**，无需手动操作 DOM。这就是"数据驱动视图"。

### 3.2 🧠 脚本层：响应式状态 & API 调用

```js
import { ref } from 'vue'

// 响应式数据 —— 数据的任何变化都会自动反映到页面上
const question = ref('将一个中国龙的故事')
const stream = ref(true)
const content = ref('')

const update = async () => {
  if (!question.value) {
    return
  }
  content.value = '思考中....'  // 加载态提示

  const endpoint = 'https://api.deepseek.com/chat/completions'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'user',
          content: question.value
        }
      ],
      stream: stream.value  // 🔑 关键参数：开启/关闭流式输出
    })
  })
  // ... 后续流式处理（见下文）
}
```

📌 **关键知识点**：

| 概念 | 说明 |
|------|------|
| `ref()` | Vue 3 的响应式包装器，返回一个 `RefImpl` 对象，通过 `.value` 读写值 |
| `ref(true)` | 创建一个值为 `true` 的响应式引用 |
| `import.meta.env.VITE_DEEPSEEK_API_KEY` | Vite 的环境变量读取方式，环境变量需以 `VITE_` 为前缀 |
| `stream: stream.value` | 请求体中的 `stream` 参数控制 API 返回完整 JSON 还是 SSE 流 |

---

### 3.3 🌊 流式分支：`stream === true` 的核心逻辑

当 `stream: true` 时，DeepSeek API 不会一次性返回完整响应，而是通过 **SSE（Server-Sent Events）** 协议，持续向客户端推送 token 级别的增量数据。

#### 📡 SSE 数据流全景图

```
┌─────────────┐     HTTP POST (stream:true)     ┌──────────────┐
│             │ ──────────────────────────────▶  │              │
│   浏览器     │                                  │  DeepSeek API │
│  (Vue 3)    │ ◀──────────────────────────────  │              │
│             │    SSE 流 (data: {...}\n\n)      └──────────────┘
└─────────────┘
       │
       ▼
  ReadableStream
       │
       ▼
  TextDecoder (Uint8Array → 字符串)
       │
       ▼
  按行分割 + 过滤 "data:" 前缀
       │
       ▼
  提取 choices[0].delta.content
       │
       ▼
  content.value 累加 → 页面自动更新
```

#### 🔍 逐行拆解

##### Step 1：清空内容 & 获取 `ReadableStream`

```js
if (stream.value) {
  content.value = ''  // 清空旧内容，准备接收新流

  // response.body 是 ReadableStream<Uint8Array> —— 服务器响应的二进制流
  // 就像一根水管，数据从服务器端源源不断地流向浏览器
  console.log(response.body)

  // getReader() 获取一个读取器 —— 相当于在水管上装了个"水龙头"
  // 每次调用 read() 就"喝一口水"（读取一段数据块）
  const reader = response.body?.getReader()
  console.log(reader)
```

📌 `response.body` 是一个 **`ReadableStream`** 对象。JS 原生提供了这个 API 来处理**大文件上传/下载、流媒体**等场景 —— 不必等整个响应完成就能消费数据。

##### Step 2：准备解码器 & 循环变量

```js
  // TextDecoder: Uint8Array → 字符串（解码）
  // 和 TextEncoder（字符串 → Uint8Array 编码）正好相反
  const decoder = new TextDecoder()

  let done = false       // 开关变量 —— 收到 [DONE] 时为 true
  let buffer = ''        // 缓存 —— 存放上一轮未处理完的残片
```

📌 **为什么要用 `TextDecoder`？**

`reader.read()` 返回的 `value` 是 **`Uint8Array`**（二进制字节数组），而 SSE 协议的数据是**纯文本**格式。`TextDecoder` 负责将二进制字节流按 UTF-8 编码解码为可读的字符串。

> 📐 **编解码对照**：
> - `TextEncoder.encode("你好")` → `Uint8Array([228, 189, 160, 229, 165, 189])`
> - `TextDecoder.decode(Uint8Array)` → `"你好"`

##### Step 3：主循环 —— 逐块读取 SSE 数据

```js
  while (!done) {
    const { value, done: doneReading } = await reader?.read()
    done = doneReading

    // 🔑 关键：把上一轮的"残片"（buffer）和本轮数据拼接在一起
    const chunkValue = buffer + decoder.decode(value)
    buffer = ''  // 用完清空

    // 按行分割，只保留以 "data:" 开头的行
    const lines = chunkValue.split('\n')
      .filter((line) => line.startsWith('data:'))
  }
```

📌 **为什么需要 `buffer`？**

网络传输中，一个完整的 JSON 行可能被**截断成两个 chunk**：

```
Chunk 1:  'data: {"id":"chatcmpl-xxx","choices":[{"d'
Chunk 2:  'elta":{"content":"龙"}}],"finish_reason":null}\n\n'
```

如果不拼接，第一段 `JSON.parse` 会报错。`buffer` 缓存上一轮的残片，等下一轮数据到达后拼接完整再解析。

##### SSE 数据格式详解

DeepSeek API 返回的 SSE 流格式如下：

```
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"龙"}}],"finish_reason":null}

data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"的"}}],"finish_reason":null}

...

data: [DONE]
```

每一行以 `data:` 开头，后跟 JSON 对象。关键字段：
- **`choices[0].delta.content`** — 增量 token 文本
- **`finish_reason`** — `null` 表示还在生成，`"stop"` 表示生成结束
- **`[DONE]`** — 特殊标记，表示整个流结束

> ⚠️ 注意：App.vue 中的代码在这一步只做了**过滤行**的处理，你还需要在此处补充 JSON 解析和内容累加的逻辑，完整代码见下文 [3.4 节](#34---完整的流式处理逻辑)。

### 3.4 🧩 完整的流式处理逻辑

以下是将过滤出的 SSE 行进一步解析并累加 `content` 的完整实现：

```js
while (!done) {
  const { value, done: doneReading } = await reader?.read()
  done = doneReading

  const chunkValue = buffer + decoder.decode(value)
  buffer = ''

  const lines = chunkValue.split('\n')
    .filter((line) => line.startsWith('data:'))

  // --- 以下为补充的解析逻辑 ---
  for (const line of lines) {
    const jsonStr = line.replace('data:', '').trim()

    if (jsonStr === '[DONE]') {
      done = true
      break
    }

    try {
      const chunkData = JSON.parse(jsonStr)
      // 🔥 关键：提取增量内容并累加到响应式变量
      const deltaContent = chunkData?.choices?.[0]?.delta?.content
      if (deltaContent) {
        content.value += deltaContent  // 每次累加，页面自动更新
      }
    } catch (e) {
      // JSON 解析失败 —— 可能被截断了，放入 buffer 下一轮再拼
      buffer += line + '\n'
    }
  }
  // --- 补充逻辑结束 ---
}
```

📌 **核心流程总结**：

```
1. reader.read()  →  读取一个二进制块（Uint8Array）
2. decoder.decode()  →  二进制解码为 UTF-8 字符串
3. buffer + newChunk  →  拼接残片
4. split('\n') + filter('data:')  →  提取 SSE 行
5. JSON.parse()  →  解析单行 JSON
6. choices[0].delta.content  →  提取增量 token
7. content.value += token  →  更新响应式数据 → Vue 自动 DOM diff 更新页面
```

### 3.5 📥 非流式分支：`stream === false`

```js
} else {
  const data = await response.json()
  // 响应式数据直接赋值，页面自动更新
  content.value = data.choices[0].message.content
}
```

📌 非流式模式下，API 一次性返回完整 JSON，不需要 `ReadableStream` 和 buffer 拼接，直接 `response.json()` 即可。适用于**短文本生成**或不需要实时反馈的场景。

### 3.6 🎨 样式层：Flexbox 布局

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  height: 100vh;
  font-size: 0.85rem;
}

.input {
  width: 200px;
}

.output {
  margin-top: 10px;
  min-height: 300px;
  width: 100%;
  text-align: left;
}

button {
  padding: 0 10px;
  margin-left: 6px;
}
```

📌 使用 **Flexbox 纵向布局**，简洁的移动端适配风格。`0.85rem` 的字体大小配合 `100vh` 高度，确保在不同屏幕上等比例缩放。

---

## 🔄 四、数据流全景：从用户输入到页面渲染

```
┌──────────────────────────────────────────────────────────────┐
│                         M V V M 架构                         │
│                                                              │
│   View（模板）           ViewModel（脚本）        Model（数据） │
│  ┌─────────────┐       ┌──────────────┐      ┌────────────┐ │
│  │ <input      │◀─────▶│ question.ref │      │            │ │
│  │ v-model=    │ 双向绑定│              │      │            │ │
│  │ "question"  │       └──────────────┘      │            │ │
│  └─────────────┘                              │ DeepSeek   │ │
│  ┌─────────────┐       ┌──────────────┐      │   API      │ │
│  │ <div>       │◀──────│ content.ref  │◀─────│            │ │
│  │ {{content}} │ 单向绑定│              │ SSE流 │            │ │
│  └─────────────┘       └──────────────┘      └────────────┘ │
│                                                              │
│  ┌─────────────┐       ┌──────────────┐                      │
│  │ <button     │──────▶│ update()     │──────────────────────│
│  │ @click=     │ 事件触发│               │     fetch() POST    │
│  │ "update"    │       └──────────────┘                      │
│  └─────────────┘                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 五、关键技术点总结

| 层级 | 技术 | 作用 |
|------|------|------|
| 🖼️ **视图层** | `v-model` / `{{ }}` / `@click` | 声明式绑定，数据驱动 DOM |
| 🔗 **响应式** | `ref()` | 创建响应式引用，`.value` 变化自动触发重新渲染 |
| 🌐 **网络层** | `fetch()` + `stream: true` | 请求 LLM 以 SSE 格式返回流式响应 |
| 📡 **传输层** | `ReadableStream` + `reader.read()` | 逐块消费服务器推送的二进制数据流 |
| 🔤 **编码层** | `TextDecoder` | 将 `Uint8Array` 二进制解码为可读的 UTF-8 字符串 |
| 📋 **协议层** | SSE `data:` 行解析 | 按 `\n` 分割 + `data:` 前缀过滤 + JSON 解析 |
| 🧩 **增量层** | `choices[0].delta.content` | 提取每个 token，累加到响应式变量 |
| ⏳ **异步层** | `async/await` + `while (!done)` | 循环等待流结束标记 `[DONE]` |
| 🔒 **安全层** | `import.meta.env` | 通过 Vite 环境变量管理 API Key |

---

## 📝 六、扩展思考

1. **错误处理**：当前代码缺少 `try-catch`，实际项目中应对网络异常、API 限流、JSON 解析错误做全面兜底
2. **中断请求**：可结合 `AbortController` 实现用户中途取消生成
3. **打字机效果**：当前直接累加 `content.value` 已经天然实现了打字机效果 —— 每个 token 到达即渲染
4. **Token 计数**：可在每次 `content.value += deltaContent` 时顺便统计已接收的 token 数量
5. **Markdown 渲染**：LLM 返回的内容可能包含 Markdown 格式，可结合 `marked` 等库渲染富文本

---

> 🏁 **总结**：这 100 多行代码串联了现代前端开发中最重要的几个概念 —— **响应式数据驱动**、**流式传输协议（SSE）**、**二进制编解码**、**异步循环控制**。理解了这个 Demo，你就掌握了构建 ChatGPT 风格的 AI 聊天应用的核心技术栈！
