# 从零搭建一个 RESTful Todo 服务 —— Bun + TypeScript 实战

本文通过一个极简的**任务清单（Todos）**项目，一步步理解如何用 **Bun** 和 **TypeScript** 搭建一个 RESTful 风格的后端服务，并配合前端页面完成数据展示。文章按"**建模 → 存储 → 服务 → 路由 → 消费**"的逻辑线展开。

---

## 目录

1. [项目概览](#1-项目概览)
2. [数据建模：用 interface 定义资源](#2-数据建模用-interface-定义资源)
3. [数据存储：内存中的"数据库"](#3-数据存储内存中的数据库)
4. [HTTP 服务：Bun.serve 启动服务器](#4-http-服务bunserve-启动服务器)
5. [RESTful 路由：一切皆资源](#5-restful-路由一切皆资源)
   - [5.1 获取全部任务 `GET /todos`](#51-获取全部任务-get-todos)
   - [5.2 获取单个任务 `GET /todos/:id`](#52-获取单个任务-get-todosid)
6. [CORS 跨域：让前端能访问后端](#6-cors-跨域让前端能访问后端)
7. [前端消费 API](#7-前端消费-api)
   - [7.1 Promise + then 链式调用](#71-promise--then-链式调用)
   - [7.2 async/await 异步语法](#72-asyncawait-异步语法)
8. [运行项目](#8-运行项目)
9. [总结](#9-总结)

---

## 1. 项目概览

整个项目只有 **3 个文件**，结构极其精简：

```
todos/
├── server.ts      # 后端服务（核心）
├── index.html     # 前端页面
└── readme.md      # 概念笔记
```

**数据流**非常简单：

```
浏览器 (index.html)  ──GET /todos──▶  Bun 服务器 (server.ts)  ──查找──▶  todos 数组
                                      ◀──JSON 数据──
```

---

## 2. 数据建模：用 interface 定义资源

在面向对象编程（OOP）中，**接口（interface）** 用于声明一个对象"长什么样"——它必须具备哪些属性和方法。就像给数据签了一份**合同**，确保后续所有操作都遵循同一套结构。

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
```

逐字段解释：

| 字段 | 类型 | 含义 |
|------|------|------|
| `id` | `string` | 任务的唯一标识 |
| `title` | `string` | 任务名称，如"吃饭" |
| `completed` | `boolean` | 是否完成 |
| `createdAt` | `Date` | 创建时间 |

`interface` 只在**编译时**做类型检查，编译后不产生任何 JS 代码——零运行时开销。你获得了类型安全，却不损失性能。

---

## 3. 数据存储：内存中的"数据库"

为了保持示例简单，我们用一个**数组**代替数据库：

```typescript
const todos: Todo[] = [
  {
    id: "1",
    title: "吃饭",
    completed: false,
    createdAt: new Date()
  },
  {
    id: "2",
    title: "睡觉",
    completed: false,
    createdAt: new Date()
  },
  {
    id: "3",
    title: "打豆豆",
    completed: false,
    createdAt: new Date()
  },
];
```

声明 `: Todo[]` 意味着这个数组**只能**存放符合 `Todo` 接口的对象。如果你不小心写了 `{ id: 1, title: "x" }`（缺少 `completed` 或 `createdAt`），TypeScript 会**在编码阶段就报错**，而不是等到运行时才发现问题——这就是类型系统的价值。

---

## 4. HTTP 服务：Bun.serve 启动服务器

下面这行代码是整个后端的心脏：

```typescript
const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    // 所有 HTTP 请求都会进入这个函数
  }
})
```

解释几个关键点：

- **`port: 8080`**：服务器监听 `127.0.0.1:8080`。IP 地址对应一台机器，**端口号**区分同一台机器上的不同服务（HTTP、邮件、音乐服务等）。
- **`fetch(req)`**：这是 Bun.serve 的内置方法，**每一个**到达服务器的 HTTP 请求都会被传入这个函数。`req` 对象包含了请求的所有信息（方法、路径、头信息等）。
- **HTTP 协议的本质**：请求（Request）→ 响应（Response）。浏览器发送一个 Request，服务器处理后返回一个 Response。

> Bun 内置了 TypeScript 支持和 HTTP 服务，不需要安装任何第三方依赖。

---

## 5. RESTful 路由：一切皆资源

**RESTful** 的核心理念是"**一切皆资源**"。URL 路径对应**资源名词**，HTTP 方法对应**操作动词**：

| HTTP 方法 | 含义 | 示例 |
|-----------|------|------|
| `GET` | 读取资源 | `GET /todos` 获取全部任务 |
| `POST` | 创建资源 | `POST /todos` 新建任务 |
| `PUT` | 更新资源 | `PUT /todos/1` 修改任务 1 |
| `DELETE` | 删除资源 | `DELETE /todos/1` 删除任务 1 |

本项目目前实现了两个 `GET` 路由。

### 5.1 获取全部任务 `GET /todos`

```typescript
const url = new URL(req.url);  // 解析用户访问的 URL

if (req.method === 'GET' && url.pathname === "/todos") {
  return Response.json(todos, { headers });
}
```

逻辑拆解：

1. **`new URL(req.url)`**：将浏览器的请求地址（如 `http://127.0.0.1:8080/todos`）解析为一个 URL 对象，方便提取 `pathname`。
2. **条件判断**：同时检查请求方法（`GET`）和路径（`/todos`），精确匹配。
3. **`Response.json(todos)`**：将 TypeScript 数组自动序列化为 JSON 格式返回。

### 5.2 获取单个任务 `GET /todos/:id`

```typescript
if (req.method === 'GET' && url.pathname.startsWith("/todos/")) {
  const id = url.pathname.split("/")[2];
  // "/todos/3" → split("/") → ["", "todos", "3"] → 取 [2] 得 "3"
  const todo = todos.find((t) => t.id === id);
  return Response.json(todo);
}
```

逻辑拆解：

1. **`startsWith("/todos/")`**：用前缀匹配，因为后面跟着动态的 `id`。
2. **`split("/")[2]`**：从路径中提取 `id`。例如 `/todos/2` 分割后得到 `["", "todos", "2"]`，取下标 `[2]`。
3. **`find()`**：在数组中查找匹配项。如果找不到，返回 `undefined`。

---

## 6. CORS 跨域：让前端能访问后端

浏览器的**同源策略**默认禁止不同域名/端口之间的请求。前端页面通常通过 `file://` 协议打开，与 `http://127.0.0.1:8080` 属于不同源，因此需要服务端放行：

```typescript
const headers = {
  'Access-Control-Allow-Origin': "*"
}
```

- **`Access-Control-Allow-Origin: *`**：允许**任何来源**的请求访问该接口。
- 这个 headers 对象被注入到每一个 `Response.json()` 的返回中。

> ⚠️ 星号 `*` 仅适用于开发环境。生产环境中应指定具体的域名。

---

## 7. 前端消费 API

有了后端服务，前端页面通过 **`fetch` API** 获取数据。项目中展示了两种写法：

### 7.1 Promise + then 链式调用

```javascript
fetch("http://127.0.0.1:8080/todos")
  .then(res => res.json())  // 将 Response 转换为 JSON
  .then(data => {           // 拿到真正的数据
    todos.innerHTML = data
      .map(todo => `<li>${todo.title}</li>`)
      .join('');
  });
```

执行流程：

```
fetch()          →  发送 HTTP 请求
  .then(res => res.json())   →  等待响应，将 body 解析为 JSON
  .then(data => ...)          →  拿到解析后的 JS 对象
```

链中的每一步都在**等上一步完成**后才执行——这就是 Promise 的异步模型。

### 7.2 async/await 异步语法

```javascript
async function main() {
  const res = await fetch("http://127.0.0.1:8080/todos");
  const data = await res.json();
  todos.innerHTML = data
    .map(todo => `<li>${todo.title}</li>`)
    .join('');
}
main();
```

对比两种写法：

| 维度 | `.then()` 链 | `async/await` |
|------|-------------|---------------|
| 可读性 | 嵌套较多时易混乱 | 像同步代码，直观 |
| 错误处理 | `.catch()` | `try/catch` |
| 本质 | Promise 的原生方法 | Promise 的**语法糖** |

`await` 后面的表达式必须是一个 **Promise**。`fetch()` 和 `res.json()` 都返回 Promise，所以都可以 `await`。

---

## 8. 运行项目

确保已安装 [Bun](https://bun.sh)，然后执行：

```bash
# 启动后端服务
bun run server.ts

# 服务运行在 http://127.0.0.1:8080
```

然后用浏览器打开 `index.html`，或者直接访问：

- `http://127.0.0.1:8080/todos` — 获取全部任务（JSON）
- `http://127.0.0.1:8080/todos/1` — 获取 id 为 1 的任务（JSON）

---

## 9. 总结

这个不到 70 行的项目，完整串联了以下知识体系：

```
┌─────────────────────────────────────────────────┐
│                  TypeScript                      │
│  interface → 类型约束 → 编译时检查              │
├─────────────────────────────────────────────────┤
│                  OOP 思想                        │
│  "面向接口编程" → 上层不依赖底层实现            │
├─────────────────────────────────────────────────┤
│                  Bun 运行时                      │
│  Bun.serve → 内置 HTTP 服务 → 零依赖             │
├─────────────────────────────────────────────────┤
│                  RESTful 设计                    │
│  资源 URL + HTTP 动词 → 语义化的 API             │
├─────────────────────────────────────────────────┤
│                  前端消费                        │
│  fetch + Promise → async/await 演进              │
└─────────────────────────────────────────────────┘
```

这条链路从**数据建模**开始，到**服务暴露**，再到**前端消费**，构成了一个完整的"全栈最小闭环"。理解了这个例子，你就掌握了现代 Web 开发的骨架。

---

> 📝 *本文基于 [todos 项目](./) 源码撰写，所有代码均可直接运行。*
