# 📁 Node.js 核心模块实战：path 与 fs 全解

> 从路径拼接到文件读写，掌握 Node.js 两大核心模块，并理解 JS 异步编程的完整进化链。

---

## 📌 本文结构

```
path 模块（路径处理） → fs 模块（文件系统）→ 同步 vs 异步 → 异步进化史（回调 → Promise → async/await）
```

---

# 一、🧭 path 模块 —— 路径处理利器

`path` 是 Node.js 的**内置模块**，无需安装，专门处理文件路径和目录路径。

## 1.1 path.join vs path.resolve 🔍

这两个 API 都能拼接路径，但行为有**关键区别**：

```js
// 1.mjs — join vs resolve
import path from 'path';

// ─── path.join：单纯拼接 ───
console.log(path.join('a', 'b', 'c'));           // a\b\c
console.log(path.join(process.cwd(), '/hello', 'world'));
// → C:\Users\...\hello\world  （/hello 被当作普通片段拼接）

// ─── path.resolve：解析为绝对路径 ───
console.log(path.resolve('a', 'b', 'c'));         // C:\...\当前目录\a\b\c
console.log(path.resolve('/hello', 'world', './a', 'b'));
// → C:\hello\world\a\b  （遇到 /hello 绝对路径就以此为起点）
console.log(path.resolve('/hello', 'world', '../a', 'b'));
// → C:\hello\a\b  （../ 回退一级目录）
```

### 📊 一张表看懂区别

| | `path.join` | `path.resolve` |
|---|---|---|
| **行为** | 直接拼接成路径 | 解析成**绝对路径** |
| **绝对路径参数** | 被当作普通字符串拼接 | 以最后一个绝对路径为起点 |
| **相对路径** | 直接拼接 | 基于 `cwd`（当前工作目录）拼出绝对路径 |
| **`..` 处理** | ❌ 不解析 | ✅ 解析目录回退 |
| **适用场景** | 拼接已知的安全路径片段 | 需要得到确定的绝对路径 |

```js
// 当第一个参数都是绝对路径时，二者结果相同
path.join('/a', 'b', 'c');    // /a/b/c
path.resolve('/a', 'b', 'c'); // /a/b/c
```

---

## 1.2 path 工具函数全家桶 🧰

```js
// 2.mjs — path 常用工具方法
import path from 'path';

// dirname — 获取目录名
console.log(path.dirname(process.cwd()));   // C:\Users\...（上一级目录）
console.log(path.dirname('/a/b/c'));        // /a/b

// basename — 获取文件名（可去除扩展名）
console.log(path.basename('/a/b/c.js'));        // c.js
console.log(path.basename('/a/b/c.js', '.js')); // c       （去掉 .js）
console.log(path.basename('/a/b/c.js', 'js'));  // c.      （去掉 js）
console.log(path.basename('/a/b/c.js', 's'));   // c.j     （去掉末尾 s）

// extname — 获取扩展名
console.log(path.extname('/a/b/c.js'));    // .js
console.log(path.extname('index.html'));   // .html

// normalize — 规范化路径
console.log(path.normalize('a/b//c/d/e/..'));  // a\b\c\d   （去掉双斜杠，解析 ..）
console.log(path.normalize('/a/b/c.js'));      // \a\b\c.js

// parse — 解析路径为对象
console.log(path.parse('/home/user/dir/file.txt'));
/*
  {
    root:  '/',
    dir:   '/home/user/dir',
    base:  'file.txt',
    ext:   '.txt',
    name:  'file'
  }
*/
```

### 🗺️ path 工具速查表

```
path.parse('/home/user/file.txt')
         └─────┬─────┘ └┬┘ └──┬──┘
              dir      name  ext
              └──────┬──────┘
                    base
```

| API | 功能 | 示例输出 |
|-----|------|---------|
| `path.dirname(p)` | 取目录名 | `/a/b/c.js` → `/a/b` |
| `path.basename(p[, ext])` | 取文件名（可去后缀） | `/a/b/c.js` → `c.js` |
| `path.extname(p)` | 取扩展名 | `/a/b/c.js` → `.js` |
| `path.normalize(p)` | 规范化路径 | `a//b/..` → `a` |
| `path.parse(p)` | 解析为对象 | → `{ root, dir, base, ext, name }` |
| `path.join(...)` | 拼接路径 | `'a','b'` → `a/b` |
| `path.resolve(...)` | 拼接 + 解析绝对路径 | `'a','b'` → `/cwd/a/b` |

---

## 1.3 🏗️ 工程化目录设计

> readme.md 中提到的工程化思维：用 path 模块管理项目目录结构。

```
项目根目录 /
├── src/              ← 开发代码目录
│   ├── assets/       ← 静态资源（图片、字体等）
│   ├── libs/         ← 工具函数目录
│   └── index.js      ← 入口文件
├── dist/             ← 构建输出目录
└── package.json
```

```js
import path from 'path';

// 工程化中常用的路径常量
const ROOT = process.cwd();                              // 项目根目录
const SRC = path.resolve(ROOT, 'src');                   // 源码目录
const ASSETS = path.resolve(SRC, 'assets');              // 静态资源目录
const LIBS = path.resolve(SRC, 'libs');                  // 工具函数目录

console.log(path.join(ROOT, '/hello', 'world'));
// join 遇到 /hello 不会解析为根，直接拼接
```

> 💡 **最佳实践：** 需要确定的绝对路径用 `resolve`，简单拼接已知安全片段用 `join`。

---

# 二、📂 fs 模块 —— 文件系统操作

`fs`（File System）是 Node.js 操作文件和目录的核心模块，底层用 **C++ 实现**，通过 **V8 引擎** 暴露给 JS 代码调用。

## 2.1 同步 vs 异步 —— 核心选择

Node.js 的 fs 模块同时提供了**同步**和**异步**两种 API：

### 🔴 同步读取：简单粗暴，但会阻塞

```js
// 3.mjs — 同步读取，阻塞主线程
import fs from 'fs';

const syncData = fs.readFileSync('./text.txt', 'utf-8');
console.log(syncData);
console.log('111'); // ⚠️ 必须等文件读完才能执行
```

### 🟢 异步读取：不阻塞，高效

```js
// 3.mjs — 异步读取，不阻塞主线程
fs.readFile('./text.txt', 'utf-8', (err, data) => {
  if (!err) {
    console.log(data);
  } else {
    console.log(err);
  }
});
console.log('111'); // ✅ 先输出！不等待文件读取
```

### ⚖️ 为什么 Node.js 偏重异步？

```
JavaScript 是单线程语言
        │
        ▼
  同步 I/O → 阻塞线程 → 服务器"卡住" → 浪费性能
        │
        ▼
  异步 I/O → 不阻塞 → Event Loop 调度 → 省服务器 💰
```

> Node.js 用异步非阻塞模型，用**更少的服务器**支撑**更高的并发**——这就是它的核心竞争力。

---

# 三、🔄 fs 模块中的异步编程进化史

从 fs 模块的 API 演进，可以清晰地看到 JS 异步编程的完整进化链：

```
同步阻塞 → 异步回调 → Promise + .then() → async/await
   │           │              │                │
  read      readFile       fs/promises      fs/promises
  FileSync  + callback     + .then()        + await
```

## 3.1 第一阶段：回调函数（ES5 时代）

```js
// 3.mjs — 异步回调：单文件读取
fs.readFile('./text.txt', 'utf-8', (err, data) => {
  // Node.js 约定：回调第一个参数永远是 err 错误对象
  if (!err) {
    console.log(data);
  } else {
    console.log(err);
  }
});
```

## 3.2 回调地狱 🔥 —— 流程控制的噩梦

当多个文件**有顺序依赖**时（先读 file1 → 再读 file2 → 最后读 file3），回调层层嵌套变成"金字塔"：

```js
// 3.mjs — 回调地狱：依次读取 3 个文件
fs.readFile('./file1.txt', 'utf-8', (err, data) => {
  if (!err) {
    console.log('file1.txt', data);
  } else {
    console.log(err);
  }
  // 😈 第二层
  fs.readFile('./file2.txt', 'utf-8', (err, data) => {
    if (!err) {
      console.log('file2.txt', data);
    } else {
      console.log(err);
    }
    // 👿 第三层
    fs.readFile('./file3.txt', 'utf-8', (err, data) => {
      if (!err) {
        console.log('file3.txt', data);
      } else {
        console.log(err);
      }
    });
  });
});
```

```
回调地狱的三大痛点 💀：
  ├── 层层嵌套，可读性崩坏 📖❌
  ├── 错误处理重复冗余 ⚠️❌
  └── 业务复杂时流程控制难以维护 🔧❌
```

## 3.3 第二阶段：Promise + .then()（ES6）

ES6 带来了 Promise，用**链式调用**替代嵌套。`fs/promises` 模块的 API 返回 Promise：

```js
// 4.mjs — Promise 链式调用
import fs from 'fs/promises';

fs.readFile('./file1.txt', 'utf-8')
  .then((data) => {
    console.log('file1.txt', data);
    // 🔗 then 回调返回 Promise，继续链式调用
    return fs.readFile('./file2.txt', 'utf-8');
  })
  .then((data) => {
    console.log('file2.txt', data);
    return fs.readFile('./file3.txt', 'utf-8');
  })
  .then((data) => {
    console.log('file3.txt', data);
  })
  .catch((err) => {
    // 🎉 一个 .catch() 兜底所有错误！
    console.error('读取失败：', err);
  });
```

### Promise 三种状态

```
┌──────────┐   resolve()   ┌──────────────┐
│ pending  │ ─────────────→ │  fulfilled   │
│  (进行中) │                │   (已成功)     │
└──────────┘                └──────────────┘
     │ reject()
     ▼
┌──────────────┐
│  rejected    │
│  (已失败)     │
└──────────────┘
```

### 📊 对比

| 维度 | 回调方式 | Promise 方式 |
|------|---------|-------------|
| 可读性 | 😱 嵌套金字塔 | 😊 扁平链式 |
| 错误处理 | 🔴 每层单独处理 | 🟢 一个 .catch() |
| 流程控制 | 🔴 手动嵌套 | 🟢 .then() 自然串联 |

> ⚠️ 但 `.then()` 链长了也像"爬楼梯"，略显繁琐……

## 3.4 第三阶段：async/await（ES8 语法糖）✨

async/await 让异步代码**看起来像同步代码**，可读性拉满：

```js
// 4.mjs — async/await：异步代码同步化
import fs from 'fs/promises';

// IIFE（立即执行函数表达式）包裹 async
(async () => {
  try {
    const file1Data = await fs.readFile('./file1.txt', 'utf-8');
    console.log('file1.txt', file1Data);

    const file2Data = await fs.readFile('./file2.txt', 'utf-8');
    console.log('file2.txt', file2Data);

    const file3Data = await fs.readFile('./file3.txt', 'utf-8');
    console.log('file3.txt', file3Data);
  } catch (err) {
    // 🎉 一个 try-catch 搞定所有错误！
    console.error('读取失败：', err);
  }
})();
```

### 🔍 async/await 的本质

```
async/await = Promise + Generator 的语法糖 🍬

  async function → 返回值自动包装成 Promise
  await          → 等待右边的 Promise 完成
                 → 暂停 async 函数内部执行
                 → ⚠️ 不阻塞 Event Loop！
```

### ⚡ 关键误区

```js
// ❌ 错误理解：await 之后代码同步执行
// ✅ 正确理解：await 本质还是 Promise 微任务

console.log('1️⃣ 同步');
await someAsyncTask();
console.log('2️⃣ 微任务后'); // ← 不是立即执行！
```

---

## 3.5 深入底层：Event Loop、微任务、宏任务 🧠

`await` 本质是 **Promise**，属于**微任务（Microtask）**；`setTimeout` 属于**宏任务（Macrotask）**。

### 🔄 Event Loop 运行机制

```
┌─────────────────────────────────┐
│         Call Stack（调用栈）      │
│     同步代码一行行压栈执行          │
└───────────┬─────────────────────┘
            │ 遇到异步 API
            ▼
┌─────────────────────────────────┐
│        libuv 线程池 / OS         │
│   文件 I/O、网络请求、定时器       │
└───────────┬─────────────────────┘
            │ 完成，回调入队
            ▼
┌─────────────────────────────────┐
│          任务队列                  │
│  ┌───────────────────────────┐  │
│  │ 微任务 (Microtask)        │  │  ← Promise.then / await / queueMicrotask
│  │ 优先级：⭐⭐⭐⭐⭐        │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 宏任务 (Macrotask)        │  │  ← setTimeout / setInterval / I/O 回调
│  │ 优先级：⭐⭐⭐            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

> 📌 **铁律：** 执行一个宏任务 → 清空**所有**微任务 → 渲染（浏览器）→ 下一个宏任务

### 🧪 验证：微任务 vs 宏任务执行顺序

```js
console.log('1️⃣ 同步开始');

setTimeout(() => {
  console.log('2️⃣ 宏任务 - setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3️⃣ 微任务 - Promise.then');
});

(async () => {
  await Promise.resolve();
  console.log('4️⃣ 微任务 - await 后');
})();

console.log('5️⃣ 同步结束');

// 输出顺序：
// 1️⃣ → 5️⃣ → 3️⃣ → 4️⃣ → 2️⃣
//        └─── 微任务优先 ──┘   └→ 最后宏任务
```

---

# 四、🗺️ 全景总结

## path 模块 vs fs 模块

```
┌─────────────────────────────────────────────────────────┐
│                     Node.js path_fs                      │
├─────────────────────┬───────────────────────────────────┤
│      path 模块       │           fs 模块                   │
├─────────────────────┼───────────────────────────────────┤
│  处理路径字符串       │  读写文件、操作目录                  │
│  纯字符串运算（同步）  │  I/O 操作（可同步/异步）             │
│  join / resolve     │  readFileSync → 同步阻塞            │
│  dirname / basename │  readFile + callback → 异步回调     │
│  extname / parse    │  fs/promises + .then() → Promise   │
│  normalize          │  fs/promises + await → 语法糖       │
└─────────────────────┴───────────────────────────────────┘
```

## fs 模块异步进化总结

| 方式 | 所属时代 | 写法 | 特点 |
|------|---------|------|------|
| `readFileSync` | 原始 | 同步阻塞 | 简单粗暴，性能差 |
| `readFile` + callback | ES5 | 回调嵌套 | 异步但容易回调地狱 |
| `fs/promises` + `.then()` | ES6 | 链式调用 | 扁平化，统一错误处理 |
| `fs/promises` + `await` | ES8 | 像同步代码 | 🍬 语法糖，本质仍是 Promise + 微任务 |

## 🎯 核心认知

> **async/await 让异步代码拥有了同步代码的书写体验，但本质仍然是 Promise 微任务 —— 它不会阻塞 Event Loop，await 只是让你"等"得更优雅。**

---

> 📁 本文代码全部来自 `1.mjs` ~ `4.mjs`，覆盖了从 `path` 路径处理 → `fs` 文件系统 → 异步编程进化的完整知识链。
