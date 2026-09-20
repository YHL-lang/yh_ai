# 🚀 从零理解 Ajax：一次「请求—响应」的完整旅程

> 以 `backend/index.js`、`frontend/index.html`、`frontend/fetch.html` 三个文件为线索，讲清楚「前端怎么拿到后端数据」这件事。

## 🗺️ 一、先看全貌：一个小小项目的地图

```
ajax/
├── backend/            # 后端：数据的提供方
│   ├── index.js        # Node http 服务器
│   └── package.json    # 项目配置（含启动脚本）
└── frontend/           # 前端：数据的消费方
    ├── index.html      # 传统写法：XMLHttpRequest
    └── fetch.html      # 现代写法：fetch + async/await
```

整个项目只有一个核心目标：**页面不刷新，也能拿到服务器上的任务列表（todo）**。这就是 Ajax 的本质。

## 🖥️ 二、后端：用最原始的 Node 模块撑起一个服务器

### 1️⃣ 模块化：`require` 是怎么来的

```js
const http = require('http');
```

这一行背后其实有一段历史——早期 JS 没有模块化体系，Node 为了工程化，采用了 **CommonJS** 方案：`require` 引入 + `module.exports` 导出。而 ES Module（`import` / `export default`）是后来浏览器和 Node 都支持的升级版。

> 📌 重点：`require` 是「前辈」，`import` 是「新标准」，两者解决的是同一个问题——**把代码拆成可复用的模块**。

### 2️⃣ 创建服务器：请求到来 → 执行回调

```js
http.createServer((req, res) => {
  // req：用户的请求对象
  // res：服务器的响应对象
}).listen(3000, () => {
  console.log('server is running on 3000 port');
});
```

- `createServer` 接收一个**回调函数**，HTTP 是「请求—响应」模型：**每来一次请求，就执行一次这个函数**。
- `listen(3000)` 让服务器监听 3000 端口，准备就绪后打印日志。

### 3️⃣ 分路由：根据 URL 返回不同内容

```js
if (req.url === '/') {
  res.end('hello world')
}

if (req.url === '/todo') {
  res.end(JSON.stringify(todo))
}
```

- 访问 `/` → 返回一句 `hello world`。
- 访问 `/todo` → 返回任务列表。
- `req.url` 就是**路由的钥匙**，不同路径给不同响应。

### 4️⃣ 两个关键响应头：跨域 + 编码

```js
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Content-Type', 'application/json;charset=utf-8')
```

| 头部 | 作用 | 不加会怎样 |
|------|------|-----------|
| `Access-Control-Allow-Origin: *` | 允许任意来源跨域访问 | 前端报 **CORS 跨域错误** ❌ |
| `Content-Type: application/json;charset=utf-8` | 告诉浏览器这是 JSON 且用 UTF-8 | 中文可能乱码、解析方式错误 ⚠️ |

> 💡 前端页面是 `file://` 或另一个端口打开的，与后端 `localhost:3000` **不同源**。这个头部就是打通两端的「通行证」。

### 5️⃣ JSON.stringify：对象 → 字符串的桥

网络只能传输文本，不能直接传 JS 对象，所以要序列化：

```js
res.end(JSON.stringify(todo))
```

`JSON.stringify(value, replace?, space?)` 有三个参数：

- `value`：要序列化的对象 ✅ 必填
- `replace`：取舍/转换函数，传 `null` 表示原样序列化
- `space`：缩进空格数，例如传 `2` 生成可读的格式化 JSON（团队规范、日志调试很常用）

## 🎨 三、前端：同一件事的两种写法

### 🧓 方式一：XMLHttpRequest（fetch 的前辈）

`frontend/index.html` 用的是最经典的 XHR：

```js
const xhr = new XMLHttpRequest();              // 1. 实例化
xhr.open('GET', 'http://localhost:3000/todo', true); // 2. 打开通道（true=异步）
xhr.onreadystatechange = function () {          // 3. 监听状态变化
  if (xhr.readyState === 4 && xhr.status === 200) {
    const todo = JSON.parse(xhr.responseText);  // 4. 解析字符串
    document.getElementById('todo').innerHTML =
      todo.map(todo => `<li>${todo.title}</li>`).join('');
  }
}
xhr.send();                                    // 5. 真正发送
```

要点拆解：

- `readyState === 4` 表示**请求完成**，`status === 200` 表示**成功**，两者必须同时满足。
- `JSON.parse` 把后端传来的字符串**还原成 JS 对象**（与 `stringify` 互为逆操作）。
- `.map(...).join('')` 把数组拼成一段 HTML 字符串，一次性塞进页面。

⚠️ **痛点**：代码是「状态机式」的，回调里嵌逻辑，可读性一般。

### 🚀 方式二：fetch + async/await（现代写法）

`frontend/fetch.html` 用同一需求写出了更干净的版本：

```js
document.getElementById('btn')
  .addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/todo'); // 等请求完成
      const todos = await response.json();                        // 自动解析 JSON
      document.getElementById('todo').innerHTML =
        todos.map(todo => `<li>${todo.title}</li>`).join('');
    } catch (error) {
      console.error('请求失败:', error);
    }
  });
```

亮点：

- ✅ `fetch` 直接返回 Promise，`await` 之后就能拿到结果，**写法像同步代码**。
- ✅ `response.json()` 自动解析，省掉了手动 `JSON.parse`。
- ✅ `try / catch` 统一捕获错误——优雅处理「后端没启动」这类故障。
- ✅ 相比 XHR，**代码量少了近一半，逻辑更线性**。

## ⚙️ 四、为什么 async/await 最优雅？——JS 的异步真相

理解 Ajax 必须理解 JS 的异步模型：

```
JS 是单线程
   │
   ├─ 遇到同步任务 → 立即执行
   │
   └─ 遇到异步任务 → 丢进 Event Loop（事件循环），跳过继续往下执行
                          │
                          └─ 时机到了，再从队列中取出回调执行 ✅
```

异步处理的三个进化阶段：

| 阶段 | 方案 | 特点 |
|------|------|------|
| ① 回调 | `callback` | 直观，但多层嵌套会形成「回调地狱」😵 |
| ② Promise | `Promise` + `.then()` | 链式调用，解决了嵌套问题 |
| ③ 终极 | `async / await` | **最推荐**，写法上和同步代码几乎一样 ✨ |

> 🎯 一句话总结：`async` 函数会「暂停」在 `await` 处，等异步结果回来再继续——**用同步的写法，写异步的逻辑**。

## 🧩 五、把碎片拼起来：一次完整请求的生命周期

```
👤 用户点击按钮
      ↓
🖱️ addEventListener 触发
      ↓
🌐 fetch 发起 HTTP 请求 → http://localhost:3000/todo
      ↓
🖥️ 后端 createServer 回调执行
      ↓
🔀 req.url === '/todo' 命中路由
      ↓
🧱 JSON.stringify(todo) 序列化
      ↓
📤 携带 CORS + Content-Type 头部返回
      ↓
📥 前端 response.json() 解析
      ↓
🖌️ 动态渲染 <li> 列表，页面局部更新（不刷新）
```

## 📊 附页：XHR vs fetch 逐行对比

| 对比项 | 🧓 XMLHttpRequest | 🚀 fetch + async/await |
|--------|------------------|------------------------|
| 实例化 | `new XMLHttpRequest()` | 直接用 `fetch(url)`，内置 Promise |
| 配置请求 | `xhr.open('GET', url, true)` | URL 与方法写进 `fetch` 参数 |
| 发送请求 | `xhr.send()` | `await fetch(...)` |
| 接收响应 | `xhr.onreadystatechange` 回调 | `await` 后顺序取结果 |
| 判断成功 | 手动判 `readyState === 4 && status === 200` | 用 `try / catch` + 检查 `response.ok` |
| 解析 JSON | `JSON.parse(xhr.responseText)` | `await response.json()` 自动解析 |
| 错误处理 | 分散在回调与状态判断中 | 集中 `try / catch`，一目了然 |
| 代码可读性 | 状态机式，嵌套回调 ⚠️ | 线性书写，接近同步 ✅ |
| 推荐程度 | 了解原理即可 | **新项目首选** ✨ |

## 💎 结语：Ajax 改变了什么？

这个项目虽小，却完整还原了 **Web 2.0 的核心思想**：

> **当前页面还在，JS 主动发起 HTTP 请求，动态更新页面内容** —— 这正是 Ajax 带来的繁荣。

三句话记住本篇：

1. 🖥️ **后端**：`http.createServer` 监听请求，靠 `req.url` 分路由，用 `JSON.stringify` 出数据，靠 CORS 头部放行。
2. 🎨 **前端**：XHR 能用但啰嗦，**fetch + async/await 是首选**。
3. ⚙️ **原理**：单线程 + Event Loop，`async/await` 让异步代码像同步一样直观。
