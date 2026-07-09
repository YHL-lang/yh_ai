# 🌟 面试中的 Promise —— 从入门到精通

> 一份逻辑清晰、代码可运行的 Promise 面试指南，涵盖核心概念、静态方法、async/await 以及高频面试题。

---

## 📌 目录

1. [为什么需要 Promise？](#1-为什么需要-promise)
2. [Promise 的三种状态](#2-promise-的三种状态)
3. [创建一个 Promise](#3-创建一个-promise)
4. [实例方法：then / catch / finally](#4-实例方法then--catch--finally)
5. [静态方法：all / race / allSettled / any](#5-静态方法all--race--allsettled--any)
6. [async / await 语法糖](#6-async--await-语法糖)
7. [错误处理最佳实践](#7-错误处理最佳实践)
8. [高频面试题](#8-高频面试题)

---

## 1. 为什么需要 Promise？

在 Promise 出现之前，JavaScript 异步操作依赖**回调函数**，多层嵌套会形成臭名昭著的「回调地狱」：

```js
// ❌ 回调地狱：层层嵌套，难以阅读和维护
getUser(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetail(orders[0].id, (detail) => {
      // 每多一层，缩进就深一级，错误处理也散落各处
      console.log(detail);
    });
  });
});
```

Promise 将异步操作**从回调中解放出来**，改为链式调用：

```js
// ✅ Promise 链式调用：扁平、可读、统一错误处理
getUser(userId)
  .then((user) => getOrders(user.id))
  .then((orders) => getOrderDetail(orders[0].id))
  .then((detail) => console.log(detail))
  .catch((err) => console.error('任意一环出错都会走到这里：', err));
```

> 💡 **核心思想**：Promise 代表一个**未来会完成（或失败）的异步操作**，它让异步代码写起来像同步代码。

---

## 2. Promise 的三种状态

Promise 是一个**状态机**，只有三种互斥的状态：

```
        ┌──────────────┐
        │   pending    │  ← 初始态：待处理，结果未知
        │   (进行中)    │
        └──────┬───────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────┐    ┌──────────┐
│ fulfilled │    │ rejected │
│  (已成功)  │    │  (已失败)  │
└──────────┘    └──────────┘
```

🔒 **关键特性**：

| 特性 | 说明 |
|------|------|
| **不可逆** | 一旦从 `pending` 变为 `fulfilled` 或 `rejected`，就不能再变 |
| **不可重复** | 同一个 Promise 只能被解决一次，多次调用 `resolve/reject` 只有第一次有效 |
| **终态稳定** | 处于 `fulfilled/rejected` 时称为 **settled（已敲定）** |

```js
// 验证不可变性：第二次 resolve 会被忽略
const p = new Promise((resolve, reject) => {
  resolve('first');   // ✅ 生效
  resolve('second');  // ❌ 被忽略
  reject('error');    // ❌ 也被忽略（状态已锁定为 fulfilled）
});

p.then(console.log); // 输出: first
```

---

## 3. 创建一个 Promise

Promise 构造函数接收一个 **executor（执行器）** 函数，该函数立即同步执行，并接收两个回调参数：

```js
// 📝 基本模板
new Promise((resolve, reject) => {
  // 这里写异步操作（或同步操作）
  // 成功时调用 resolve(value)
  // 失败时调用 reject(reason)
});
```

### 🔧 实战封装

下面是基于文件夹内 [1.html](./1.html) 示例提炼的封装模式：

```js
// 封装一个「一言」API 请求为 Promise（fetch 本身就返回 Promise）
const getStory = async () =>
  fetch('https://v1.hitokoto.cn/?c=i&encode=json');

// 封装一个「必应每日图片」API 请求
const getBingImage = async () =>
  fetch('https://api.1314.cool/bingimg/?type=json&rand=1');
```

### 📦 常用 Promise 化模式

```js
// 1️⃣ 将 setTimeout 包装为 Promise（延迟执行）
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 用法：等 1 秒后执行
delay(1000).then(() => console.log('1秒后执行'));

// 2️⃣ 将回调式 API 包装为 Promise
const readFile = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
```

---

## 4. 实例方法：then / catch / finally

### 🔗 `.then(onFulfilled, onRejected)`

`then` 是 Promise 的灵魂 —— 它**始终返回一个新的 Promise**，因此可以无限链式调用：

```js
// 📝 基本用法
promise
  .then((res) => {
    console.log('成功：', res);
    return res; // 返回值会被包装为新 Promise 的 resolve 值
  })
  .then((res) => {
    console.log('上游返回值：', res);
    // 如果这里抛出异常，会被下游的 catch 捕获
  });
```

### ❌ `.catch(onRejected)`

`catch` 本质上是 `.then(null, onRejected)` 的语法糖，专门用于**错误捕获**：

```js
fetch('/api/data')
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => {
    // 上面任意一个 then 抛出的错误都会流到这里
    console.error('请求失败：', err);
  });
```

### 🧹 `.finally(onFinally)`

无论 Promise 是成功还是失败，`finally` 都会执行（常用于**清理工作**）：

```js
showLoading();

fetchData()
  .then(renderData)
  .catch(showError)
  .finally(() => {
    hideLoading(); // 无论成败，都要隐藏 loading
  });
```

---

## 5. 静态方法：all / race / allSettled / any

这是面试的**绝对高频考点**。以下基于 [1.html](./1.html) 中的并行请求场景展开讲解。

### 📊 对比一览表

| 方法 | 输入 | 返回时机 | 失败策略 | 返回值 |
|------|------|----------|----------|--------|
| `Promise.all` | 可迭代对象 | 全部成功 | **一个失败即整体失败** | 结果数组（按输入顺序） |
| `Promise.race` | 可迭代对象 | 第一个 settled | 跟随第一个 settled | 第一个 settled 的值 |
| `Promise.allSettled` | 可迭代对象 | 全部 settled | 不失败，等全部完成 | `{status, value/reason}[]` |
| `Promise.any` | 可迭代对象 | 第一个 fulfilled | 全部失败才 reject | 第一个成功的值 |

---

### 🟢 Promise.all —— 并发执行，全部成功

**最常用**的并行工具。适用于多个**互不依赖**的异步请求：

```js
// 📝 来自 1.html 的实战示例
async function main() {
  // ✅ getStory 和 getBingImage 没有依赖关系，可以并行
  Promise.all([getStory(), getBingImage()])
    .then((responses) => {
      // responses 的顺序与传入的 Promise 数组顺序一致
      // [getStory的响应, getBingImage的响应]
      return Promise.all(responses.map((res) => res.json()));
    })
    .then(([storyData, imageData]) => {
      console.log('一言数据：', storyData);
      console.log('必应图片：', imageData);
    })
    .catch((err) => {
      // ⚠️ 只要有一个失败，就直接走这里
      // 不会等待其它 Promise 完成
      console.error('某个请求失败了：', err);
    });
}

main();
```

> ⚠️ **面试重点**：`Promise.all` 采用 **fail-fast** 策略 —— 只要有一个 reject，立即 reject，不再等待其它 Promise。但其 reject 的原因**只有第一个失败的错误**，其它 Promise 的结果会丢失。

---

### 🟡 Promise.race —— 竞速，只取最快

谁先 settled（无论成功/失败），就用谁的结果：

```js
// 📝 超时控制 —— 面试最爱考的应用场景
const requestWithTimeout = (url, timeout = 5000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('请求超时')), timeout)
  );

  return Promise.race([fetch(url), timeoutPromise]);
};

// 如果 5 秒内请求未完成，则 timeoutPromise 先 reject
requestWithTimeout('https://api.example.com/slow', 5000)
  .then((res) => res.json())
  .then(console.log)
  .catch((err) => console.error(err.message)); // '请求超时'
```

---

### 🔵 Promise.allSettled —— 等全部结束，无论成败

需要**知道每一个 Promise 的结果**，不管成功还是失败：

```js
// 📝 批量上传文件，每个都想知道结果
const uploadFiles = (files) => {
  const uploadPromises = files.map((file) => uploadFile(file));

  return Promise.allSettled(uploadPromises).then((results) => {
    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    console.log(`✅ 成功 ${succeeded.length} 个，❌ 失败 ${failed.length} 个`);
    return { succeeded, failed };
  });
};

// 每个结果的结构：
// 成功 → { status: 'fulfilled', value: 上传结果 }
// 失败 → { status: 'rejected', reason: 错误原因 }
```

---

### 🟣 Promise.any —— 取第一个成功的

只要有一个成功就算成功，全部失败才 reject：

```js
// 📝 多 CDN 容灾：从最快的源加载资源
const loadFromCDN = () => {
  const cdns = [
    fetch('https://cdn1.example.com/data.json'),
    fetch('https://cdn2.example.com/data.json'),
    fetch('https://cdn3.example.com/data.json'),
  ];

  return Promise.any(cdns)
    .then((response) => response.json())
    .catch((err) => {
      // 全部 CDN 都挂了才会走到这里
      console.error('所有 CDN 都不可用', err);
    });
};
```

---

## 6. async / await 语法糖

`async/await` 是 Promise 的**语法糖**，让异步代码看起来像同步代码。它是现代 JavaScript 的标配写法。

### ✍️ 基本规则

```js
// async 函数一定返回 Promise
async function greet() {
  return 'hello'; // 等价于 Promise.resolve('hello')
}

greet().then(console.log); // 'hello'

// await 只能在 async 函数内部使用
async function main() {
  const story = await getStory();     // 等待 Promise resolve
  const data = await story.json();    // 逐行等待，像同步代码
  console.log(data);
}
```

### 🔄 串行 vs 并行

这是面试中的**隐性考点** —— 很多人写了 async/await 反而让代码变慢了：

```js
// ❌ 串行执行：总耗时 = T1 + T2（两个无依赖的请求白白排队）
async function serial() {
  const story = await getStory();      // 等 T1
  const image = await getBingImage();  // 等 T2
  return [story, image];               // 总耗时: T1 + T2
}

// ✅ 并行执行：总耗时 = max(T1, T2)
async function parallel() {
  const [story, image] = await Promise.all([
    getStory(),
    getBingImage(),
  ]);
  return [story, image];               // 总耗时: max(T1, T2)
}
```

> 💡 **一句话总结**：没有依赖关系的异步操作，用 `Promise.all` 并行；有先后依赖的，用 `await` 串行。

---

## 7. 错误处理最佳实践

### ❌ 常见反模式

```js
// 反模式 1：忘记 catch
async function bad1() {
  const data = await fetch('/api'); // 如果网络错误，异常会冒泡到顶层
}

// 反模式 2：在 async 中混用 then/catch（风格不统一）
async function bad2() {
  fetch('/api').then(console.log); // 这里没有 await，错误不会被 try-catch 捕获
}
```

### ✅ 推荐写法

```js
// 推荐 1：统一 try/catch
async function loadData() {
  try {
    const res = await fetch('/api');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('加载失败：', err.message);
    // 可以返回默认值或重新抛出
    return { error: true, message: err.message };
  }
}

// 推荐 2：顶层兜底（异步 IIFE）
(async () => {
  try {
    const data = await loadData();
    console.log('数据：', data);
  } catch (err) {
    console.error('全局兜底：', err);
  }
})();
```

---

## 8. 高频面试题

### 🎯 Q1：写出 Promise 状态流转

**答案**：`pending` → `fulfilled` 或 `pending` → `rejected`，状态不可逆。

```js
// 口述要点：一个 Promise 只能 settled 一次
const p = new Promise((resolve, reject) => {
  resolve('a');
  reject('b'); // 无效，状态已锁定
});
console.log(p); // Promise {<fulfilled>: 'a'}
```

---

### 🎯 Q2：Promise.all 的 fail-fast 机制

**答案**：`Promise.all` 中只要有一个 reject，整体立即 reject，**不再等待**其它 Promise，但其它 Promise 仍在后台执行（只是不关心结果了）。最终拿到的只是**第一个失败的原因**。

```js
const p1 = Promise.reject('错误1');
const p2 = new Promise(() => {});     // 永远 pending
const p3 = Promise.reject('错误2');

Promise.all([p1, p2, p3])
  .catch((err) => console.log(err));  // '错误1' —— 第一个 reject 的 reason
```

---

### 🎯 Q3：实现一个带超时的 fetch

**答案**：用 `Promise.race` 竞速。

```js
function fetchWithTimeout(url, ms = 5000) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`请求超时: ${ms}ms`)), ms)
  );
  return Promise.race([fetch(url), timer]);
}
```

---

### 🎯 Q4：用 Promise 实现 sleep 函数

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 使用
async function demo() {
  console.log('开始');
  await sleep(2000);
  console.log('2秒后');
}
```

---

### 🎯 Q5：手写 Promise.all

```js
Promise.myAll = function (promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length) return resolve([]);

    const results = [];
    let count = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p) // 兼容非 Promise 值
        .then((value) => {
          results[index] = value; // 按原数组下标存放
          count++;
          if (count === promises.length) resolve(results);
        })
        .catch(reject); // 任一个失败即 reject
    });
  });
};
```

---

### 🎯 Q6：宏任务与微任务执行顺序

```js
console.log(1);

setTimeout(() => console.log(2), 0); // 宏任务

new Promise((resolve) => {
  console.log(3);         // executor 同步执行！
  resolve();
})
  .then(() => console.log(4)); // 微任务

console.log(5);

// 输出顺序：1 → 3 → 5 → 4 → 2
//
// 解释：
//   1 - 同步代码
//   3 - Promise executor 同步执行
//   5 - 同步代码
//   4 - .then 进入微任务队列，在当前宏任务末尾执行
//   2 - setTimeout 进入下一个宏任务
```

---

### 🎯 Q7：`Promise.resolve()` 与 `new Promise(resolve => resolve())` 的区别

```js
// Promise.resolve 对 thenable 对象有特殊处理
const thenable = {
  then(resolve) {
    console.log('thenable 被展开了');
    resolve('done');
  },
};

Promise.resolve(thenable);  // 会递归展开 thenable，输出 'thenable 被展开了'
new Promise((r) => r(thenable)); // 直接把 thenable 当作值传递
```

---

## 📚 总结

| 维度 | 要点 |
|------|------|
| **三种状态** | `pending` → `fulfilled` / `rejected`，不可逆 |
| **链式调用** | `.then()` 始终返回新 Promise，`.catch()` 统一收底 |
| **并行利器** | `Promise.all` 全部成功 / `race` 竞速 / `allSettled` 全等 / `any` 任一成功 |
| **现代写法** | `async/await` + `try/catch`，无依赖并行用 `Promise.all` |
| **事件循环** | Promise executor 同步执行，`.then` 回调是微任务，先于宏任务执行 |

> 🚀 掌握了以上内容，面试中关于 Promise 的问题基本都能从容应对。建议将每个代码块复制到浏览器控制台实际运行一遍，加深理解！
