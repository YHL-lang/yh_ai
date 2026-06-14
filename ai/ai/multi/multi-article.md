# 前端工程化调用 AI 多模态生图模型：Qwen Image Demo 实战

> 本文通过一个完整的 Vite 前端项目，带你一步步理解如何在前端环境中安全地调用大模型 API，实现 AI 图片生成功能。

---

## 一、项目概览：我们做了什么？

本项目是一个基于 **Vite** 脚手架搭建的前端 Demo，核心功能是调用阿里云百炼（DashScope）平台的 **Qwen Image 2.0 Pro** 多模态生图模型，传入参考图片和文字描述，生成一张新的合成图片。

整个项目的文件结构非常精简：

```
multi/
├── readme.md                 # 项目笔记
└── qwen-image-demo/
    ├── .env.local            # ⭐ API Key 存放处（核心安全机制）
    ├── .gitignore
    ├── index.html            # ⭐ 页面入口
    ├── package.json          # 项目配置
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.js           # ⭐ 核心逻辑：调用 API + 渲染结果
        ├── counter.js         # Vite 模板自带的计数器组件
        └── style.css          # 页面样式
```

---

## 二、前置知识：两大核心概念

### 2.1 什么是前端工程化 & Vite？

传统前端开发中，我们直接写 HTML + JS + CSS 文件，浏览器就能运行。但当项目变复杂时，我们会遇到这些问题：

- 代码模块化（import/export）需要浏览器支持 ESM
- 环境变量（API Key 等敏感信息）不能硬编码
- 开发时需要热更新（HMR），不需要手动刷新

**Vite** 就是解决这些问题的"大管家"。它由 Vue.js 作者尤雨溪开发，特点是：

| 特性 | 说明 |
|------|------|
| **极速冷启动** | 基于 ESM，不需要打包即可启动开发服务器 |
| **热模块替换（HMR）** | 修改代码后页面几乎即时更新 |
| **环境变量管理** | 通过 `.env` 文件注入变量，`import.meta.env` 读取 |
| **开箱即用** | 支持 TypeScript、CSS 预处理器等，无需额外配置 |

用 `npm create vite` 一条命令就能生成项目脚手架。本项目正是基于 `npm init vite` 初始化的。

### 2.2 什么是多模态生图模型？

传统的文生图模型只接收文字描述（Prompt），而**多模态生图模型**可以同时接收：

- 🖼️ **参考图片**（例如人物、服装、姿势参考）
- 📝 **文字指令**（例如"图1的女生穿着图2中的黑色裙子按图3的姿势坐下"）

它能综合理解多种输入，生成符合要求的新图片。本项目使用的 **Qwen Image 2.0 Pro** 就是阿里云通义千问团队推出的多模态图像生成模型。

---

## 三、项目入口：`index.html`

这是整个前端的唯一 HTML 文件，非常简洁：

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>qwen-image-demo</title>
</head>

<body>
  <!-- 挂载点 -->
  <div id="app"></div>
  <!-- esm 项目脚手架 手动启动esm -->
  <script type="module" src="/src/main.js"></script>
</body>

</html>
```

这里有两个关键点：

1. **`<div id="app"></div>`**：这是 JavaScript 的"挂载点"。JS 代码通过 `document.querySelector('#app')` 拿到这个 DOM 节点，后续所有动态内容都渲染到这里。

2. **`<script type="module" src="/src/main.js">`**：用 ESM（ES Module）方式加载 JavaScript。`type="module"` 告诉浏览器这个脚本是一个模块，可以使用 `import`/`export` 语法。Vite 在开发模式下原生支持 ESM，不需要打包即可运行。

> **为什么 HTML 这么简洁？** 因为 Vite 把 CSS、JS、图片等资源都交给模块系统管理了。HTML 只负责提供"骨架"，具体内容全部由 JS 动态生成。这就是现代前端工程化的典型做法。

---

## 四、核心逻辑：`src/main.js`

这是整个项目的"大脑"，负责调用 AI API 并将结果渲染到页面：

```js
const apiKey = import.meta.env.VITE_QWEN_API_KEY;
const root = document.querySelector('#app');

const generateImage = async () => {
  const res = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "model": "qwen-image-2.0-pro",
        "input": {
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/thtclx/input1.png"
                },
                {
                  "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/iclsnx/input2.png"
                },
                {
                  "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/gborgw/input3.png"
                },
                {
                  "text": "图1的女生穿着图2中的黑色裙子按图3的姿势坐下"
                }
              ]
            }
          ]
        },
        "parameters": {
          "n": 1,
          "size": "1024*1536"
        }
      })
    }
  )
  const data = await res.json();
  console.log(data);
  return data.output.choices[0].message.content[0].image;
}

const renderImage = (imageUrl) => {
  root.innerHTML = `<img src="${imageUrl}" />`
}

const main = async () => {
  const imageUrl = await generateImage();
  renderImage(imageUrl);
}
main();
```

### 4.1 逐段拆解

#### 第一步：读取 API Key

```js
const apiKey = import.meta.env.VITE_QWEN_API_KEY;
```

这是 **Vite 环境变量机制** 的核心。`import.meta.env` 是 Vite 在编译时注入的特殊对象，它会读取 `.env.local` 文件中以 `VITE_` 为前缀的变量。这样做的好处是：

- ✅ API Key **不会被打包进最终产物**，避免泄露
- ✅ 开发和生产环境可以使用不同的 Key
- ✅ 无需引入 `dotenv` 等 Node.js 库

> 📌 对比：Node.js 后端通常用 `process.env.API_KEY` + `dotenv` 包读取环境变量；而前端 Vite 项目用 `import.meta.env.VITE_XXX`，这是前端工程化独有的方式。

#### 第二步：构造 API 请求

```js
const res = await fetch(
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  { /* ... */ }
)
```

使用浏览器原生的 `fetch` API 发送 HTTP POST 请求到阿里云 DashScope 的多模态生成接口。请求头中携带 `Authorization: Bearer ${apiKey}` 进行身份认证。

#### 第三步：理解请求体（Body）

```js
body: JSON.stringify({ ... })
```

请求体是一个 JSON 对象，通过 `JSON.stringify` 序列化为字符串后在网络中传输。结构解析：

| 字段 | 含义 |
|------|------|
| `model` | 指定使用的模型，这里是 `qwen-image-2.0-pro` |
| `input.messages[0].content` | 多模态输入数组，包含 3 张参考图片 + 1 条文字指令 |
| `input.messages[0].role` | 消息角色，固定为 `"user"` |
| `parameters.n` | 生成图片数量，这里设为 1 |
| `parameters.size` | 输出图片尺寸，`1024*1536`（宽×高） |

多模态输入的设计非常灵活：你可以混合传入图片 URL 和文本，模型会综合理解全部输入，生成一张融合了所有参考信息的新图片。

#### 第四步：解析响应

```js
const data = await res.json();
return data.output.choices[0].message.content[0].image;
```

API 返回的 JSON 结构大致为：

```
{
  output: {
    choices: [
      {
        message: {
          content: [
            { image: "https://生成的图片URL" }
          ]
        }
      }
    ]
  }
}
```

逐层提取直到拿到最终图片的 URL。

#### 第五步：渲染到页面

```js
const renderImage = (imageUrl) => {
  root.innerHTML = `<img src="${imageUrl}" />`
}
```

将图片 URL 拼接到 `<img>` 标签中，替换 `#app` 节点的内容。页面就会显示 AI 生成的图片。

---

## 五、🔐 安全机制：`.env.local` 与 Vite 环境变量

这是整个项目最重要的一环。打开 `.env.local` 文件：

```env
VITE_QWEN_API_KEY=sk-ba872ed49fe44161aeadafc34b9d9271
```

### 5.1 为什么不能把 Key 写在 JS 里？

如果直接把 API Key 硬编码在 `main.js` 中：

```js
// ❌ 危险做法
const apiKey = 'sk-ba872ed49fe44161aeadafc34b9d9271';
```

那么任何人都可以通过浏览器的"查看源代码"或 DevTools 看到这个 Key，导致：
- Key 被恶意盗用，产生巨额费用
- 代码上传到 GitHub 后 Key 就彻底暴露

### 5.2 Vite 的解决方案

```
.env.local → Vite 编译 → import.meta.env.VITE_QWEN_API_KEY → JS 中使用
```

完整流程是：

1. **创建 `.env.local` 文件**，写入 `VITE_QWEN_API_KEY=你的Key`
2. **在 JS 中用 `import.meta.env.VITE_QWEN_API_KEY` 读取**，而不是 `process.env`
3. **`.env.local` 加入 `.gitignore`**，不会被提交到 Git
4. Vite 在编译时会将变量值注入到代码中，但生产打包时可以做替换

> ⚠️ 注意：`import.meta.env` 的值在编译后会被**内联到打包产物中**，所以生产环境仍需配合后端代理等方式才能真正保护 Key。对于纯 Demo/学习项目，`.env.local` 方案已经足够。

### 5.3 对比总结

| 方案 | 环境 | 读取方式 | 适用场景 |
|------|------|----------|----------|
| `dotenv` + `process.env` | Node.js 后端 | `process.env.XXX` | Express/Koa 等后端服务 |
| Vite `import.meta.env` | 前端（Vite） | `import.meta.env.VITE_XXX` | Vite 脚手架项目 |
| 硬编码 | 任何 | 直接写 | ❌ 仅用于 Demo 演示 |

---

## 六、数据流全景图

把整个流程串起来，就是一条清晰的"数据流水线"：

```
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│  .env.local  │    │   main.js    │    │  DashScope API  │
│  (API Key)   │───▶│  fetch()     │───▶│  qwen-image     │
│              │    │  POST 请求    │    │  2.0-pro        │
└──────────────┘    └──────┬───────┘    └────────┬────────┘
                           │                      │
                           │  3张参考图 + 文字指令  │
                           │                      │
                           │              JSON 响应（图片URL）
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐    ┌─────────────────┐
                    │  renderImage │◀───│ 解析响应体       │
                    │  (渲染到页面) │    │ choices[0]...   │
                    └──────────────┘    └─────────────────┘
```

---

## 七、项目启动方式

```bash
# 1. 进入项目目录
cd qwen-image-demo

# 2. 安装依赖
npm install

# 3. 配置 API Key（编辑 .env.local）
# VITE_QWEN_API_KEY=你的Key

# 4. 启动开发服务器
npm run dev
```

执行 `npm run dev` 后，Vite 会：
1. 启动一个本地开发服务器（默认 `http://localhost:5173`）
2. 读取 `.env.local` 注入环境变量
3. 处理 ESM 模块依赖
4. 提供热更新（HMR）能力

---

## 八、总结

这个 Demo 虽小，但串联了现代前端开发中的多个关键知识点：

| 知识点 | 在项目中的体现 |
|--------|---------------|
| **Vite 工程化** | `npm init vite` 脚手架 → `npm run dev` 启动 |
| **ESM 模块化** | `<script type="module">` + `import.meta.env` |
| **环境变量安全** | `.env.local` → `VITE_QWEN_API_KEY` → 不提交 Git |
| **HTTP 调用 AI API** | `fetch()` + `Authorization: Bearer` 认证 |
| **多模态输入** | 图片 URL + 文字指令混合传入 |
| **异步编程** | `async/await` 处理网络请求 |
| **DOM 操作** | `querySelector` + `innerHTML` 动态渲染 |

核心思想是：**利用 Vite 这个大管家，在前端项目中既可以使用 AI 模型能力，又能保证 API Key 不泄露。** 这就是 readme.md 中那句"既可以使用 LLM，还可以保证 Key 不泄露"的含义。
