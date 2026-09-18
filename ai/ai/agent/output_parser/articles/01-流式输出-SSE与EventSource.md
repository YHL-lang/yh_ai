# 🚰流式输出：把 LLM 的每个字，像水一样送到浏览器

> 目标：把「流式输出」这件事从 HTTP 协议讲到浏览器 API，并亲手跑通一个最小 SSE Demo。


---

## 🤔 为什么需要流式输出

如果没有流式，一次 LLM 调用是这样的：

```
用户提问 ──▶ 服务器 ──▶ LLM ──▶ 生成完整回答（可能要 10 秒）
                                      │
用户 ◀───────── 一次性吐出全部文本 ◀───┘
```

这 10 秒里，用户面对的是一片空白。**用户的焦虑不来自等待本身，而来自"不知道有没有在进行"**。

流式输出解决的就是这个问题：

```
用户提问 ──▶ 服务器 ──▶ LLM ──▶ 我 ─▶ 是 ─▶ 一 ─▶ 个 ─▶ 大 ─▶ 模 ─▶ 型
              （首 token 可能只要几百毫秒）        ↑
                                        每个 token 到达就立刻送达用户
```

在 OpenAI 风格 API 里，只需要一个参数：

```js
{
  stream: true  // 开启流式输出
}
```

readme 里用了一个很贴切的比喻：**这就像一根水管，一头接着 LLM Server，一头接着客户端，不断有 token 流向客户端**。中间还会有 buffer（缓冲区），用来攒够一小段再发。

那么问题来了：这根"水管"在协议层面是怎么实现的？👀

---

## 🚰 从 HTTP 说起：同步响应 vs 流式管道

HTTP 是一个**基于请求-响应的简单协议**，它的默认节奏是：

```
请求 ──▶ 处理完整 ──▶ 响应完整 ──▶ 断开连接
```

但 HTTP 的响应体本质上是一个**可写的流**。也就是说，服务端完全可以"先响应、再慢慢写"：

| 模式 | 行为 | 响应头 |
| --- | --- | --- |
| 同步响应 | 内容准备好后一次性返回 | `Content-Type: text/html` / `text/plain` |
| 流式响应 | 边生成边写，多次 write，最后才结束 | `Content-Type: text/event-stream` |

> 💡 一句话理解：**同步是"打包快递"，流式是"开闸放水"**。协议没变，只是响应体变成了可渐进写入的管道（pipe）。

而浏览器端要"接住"这根水管，标准方案就是 **SSE**。

---

## 📡 SSE：Server-Sent Events

SSE 全称 **Server Sent Events**，直译就是"服务器发送事件"。它的特点：

- 🔌 **长连接**：浏览器和服务器之间建立一条长期不断的连接
- 📤 **单向推送**：只能服务器 ➜ 浏览器（反向要用 WebSocket）
- 🧩 **分块发送**：服务器一点一点地（chunk）往客户端写数据
- ♻️ **不需要轮询**：不是"客户端反复问有没有新数据"，而是服务器主动推

它使用的响应头是关键三件套：

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

- `text/event-stream`：告诉浏览器"这不是一份普通文档，而是一条事件流"，**浏览器会专门用流的方式处理它，而不是等全部结束再渲染**
- `no-cache`：不要缓存，每次推送都是新数据
- `keep-alive`：保持连接不断开

数据本身的格式也有约定 —— 每条消息以 `data:` 开头，以**两个换行**结束：

```
data: 你好\n\n
data: 欢迎\n\n
```

这也是后面服务端 `res.write()` 里必须写 `\n\n` 的原因。

---

## 💻 服务端：20 行搞定一个 SSE 接口

看 `sse-demo/server.js`。它只用 Node 内置模块，不依赖任何框架。

### 1️⃣ 创建服务器

```js
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // 按路由分发
});
```

### 2️⃣ 路由 `/`：返回页面（顺便演示一次"流"）

```js
if (req.url === '/') {
  const readStream = fs.createReadStream('./index.html');
  readStream.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
  res.writeHead(200, { 'Content-Type': 'text/html' });
  readStream.pipe(res); // 文件读取流 -> 响应流
}
```

注意这里的 `readStream.pipe(res)`：**读文件本身也是一种流**。文件流直接"管道"到响应流，不用等整个 HTML 读进内存再返回。这和 LLM 边生成边发，是同一种思路的两个应用场景。

### 3️⃣ 路由 `/stream`：SSE 的核心

```js
} else if (req.url === '/stream') {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream', // 声明这是事件流
    'Cache-control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let words = ["你", "好", ", ", "欢", "迎", "了", "解", "sse"];
  let index = 0;

  const timer = setInterval(() => {
    if (index >= words.length) {
      clearInterval(timer);
      res.end(); // 关闭连接
      return;
    }
    res.write(`data: ${words[index]}\n\n`); // 按 SSE 格式发送
    index++;
  }, 1000);
}
```

**这里面有三个重点：**

1. 🎯 **响应头先声明 `text/event-stream`** —— 没有它，浏览器收到的只是一段"还没结束的 HTML"，不会触发事件
2. 🎯 **`res.write()` 可以调用多次** —— 每次写一个 chunk，相当于 LLM 每吐一个 token 写一次
3. 🎯 **`data: xxx\n\n` 的格式不能省** —— `\n\n` 是消息分隔符，缺了客户端收不到完整事件

> 🧪 这里的 `setInterval` 是**模拟** LLM 逐 token 返回。真实场景中，它会被换成 LLM 流式响应的 chunk 回调。

### 4️⃣ 启动

```js
server.listen(3000, () => {
  console.log('server is running on port 3000');
});
```

---

## 🔌 客户端：EventSource

浏览器提供了一个专门的类来连接 SSE：`EventSource` —— **你只需要给它一个 URL**。

```html
<div id="result"></div>
<script>
  const resultEle = document.getElementById('result');

  // 怎么实现连接 stream sse？答：new EventSource(url)
  const eventSource = new EventSource('http://localhost:3000/stream');

  // 当服务器端有新的数据 chunk 到达后，触发 onmessage
  eventSource.onmessage = (e) => {
    console.log(e.data);        // e.data 就是 data: 后面的内容
    resultEle.innerText += e.data; // 追加渲染，实现"打字机"效果
  };
</script>
```

就这么几行，打字机效果就有了。它的工作方式：

```
new EventSource(url)
      │
      ▼
  建立长连接 ────────┐
      │             │
      ▲  服务器 chunk 到达 → 触发 onmessage
      │             │
      └─────────────┘  直到服务器 res.end()
```

**关键理解**：`onmessage` 是在**每个 chunk 到达时**触发一次，所以我们在回调里做的是 `+=`（追加），而不是 `=`（覆盖）。

> 💡 SSE 不只有大模型在用：股票行情推送、站内通知、构建/部署日志、进度条，都是它的典型场景。

---

## ⚠️ 一个容易被忽略的坑：EventSource 会自动重连

`EventSource` 的设计初衷是"订阅一个长期的、不断的事件源"，所以**当连接断开且没有手动 `close()` 时，浏览器会自动重连**。

这意味着：服务端 `res.end()` 关闭连接后，过几秒你会看到 `/stream` 这个请求**自己又发了一次**，页面从头开始重新打字。

如果业务上是"一次性输出"（比如一次 LLM 回答），需要在结束时主动关闭：

```js
// 服务端：发送一个结束标记
res.write('data: [DONE]\n\n');
res.end();

// 客户端：收到标记后手动关闭，避免自动重连
eventSource.onmessage = (e) => {
  if (e.data === '[DONE]') {
    eventSource.close(); // 主动关闭，不再重连
    return;
  }
  resultEle.innerText += e.data;
};
```

✅ 记住这条规则：**流式输出有明确的"结束"，就一定要 `close()`**。

---

## 🚀 跑起来

```bash
cd sse-demo
node server.js
# 打开 http://localhost:3000
```

你会看到"你好, 欢迎了解sse"一个字一个字地出现。

---

## 📌 小结

| 概念 | 一句话 |
| --- | --- |
| 流式输出 | 不等全部生成完，生成一点发一点，降低首字等待焦虑 |
| HTTP 响应 | 响应体本身就是可写的流，可以多次 `write` |
| SSE | 服务器单向、长连接、分块推送消息，响应头是 `text/event-stream` |
| 消息格式 | `data: 内容\n\n`，两个换行是分隔符 |
| EventSource | 浏览器端连接 SSE 的 API，只需一个 URL，靠 `onmessage` 收数据 |
| 注意点 | 连接断开会自动重连，结束时记得 `close()` |


