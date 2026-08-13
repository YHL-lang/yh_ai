# 🚀 RAG 全流程详解：从「一个 URL」到「一个答案」

> 上一篇（[文档切割详解.md](文档切割详解.md)）只讲了「加载 → 切割 → 向量化」这段**前置链路**。
>
> 这一篇用**一个具体问题**贯穿全程，把 `src/index.mjs` 里**完整八步**从头讲到尾，每一步都告诉你「数据长什么样」。目标是：哪怕第一次接触 RAG，也能照着图、看着例子，一步步走通。
>
> 配套代码：[`src/index.mjs`](src/index.mjs)（生产写法）、[`src/crawl.mjs`](src/crawl.mjs)（手写爬虫原理）。

---

## 🗺️ 零、先看全局：一条流水线，八步走完

先把整条链路摆在眼前，后面每一步都是它的展开：

```
 ① 加载         ② 切割          ③ 向量化         ④ 存储
 URL ────▶ Document ────▶ 小 Document ────▶ 向量 ────▶ 向量数据库
                                                            │
 ⑧ 生成         ⑦ 增强          ⑥ 打分          ⑤ 检索 ◀──┘
 答案 ◀─── LLM ◀─── prompt ◀─── 相似度 ◀─── top-k 片段
```

**贯穿全文的一个具体例子**（就是代码里那个）：

- 目标 URL：`https://juejin.cn/post/7660707431753678854`（一篇讲 Node.js 的技术文章）
- 要问的问题：**「fs 模块有哪些 API」**

下面我们就跟着这个 URL 和这个问题，走完一整圈。

---

## 🧰 一、准备：两个「工具人」

正式开始前，先准备好两个 AI 组件。它们一个负责「生成文字」，一个负责「把文字变成向量」。

```js
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

// 1️⃣ 负责「生成回答」的大模型
const model = new ChatOpenAI({
  temperature: 0,                    // 检索问答要确定性，不要自由发挥
  model: process.env.MODEL_NAME,     // qwen-plus
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,  // dashscope 兼容接口
  },
});

// 2️⃣ 负责「把文字转成向量」的嵌入模型
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,   // text-embedding-v3
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});
```

> 💡 **小知识**：这里用的是**阿里云百炼（dashscope）的 OpenAI 兼容接口**。`ChatOpenAI` / `OpenAIEmbeddings` 是 LangChain 的标准封装，底层换成哪家模型，只需改 `.env`，代码一行不用动。

| 工具 | 作用 | 类比 |
| --- | --- | --- |
| `ChatOpenAI` | 生成文字答案 | 答题的学生 |
| `OpenAIEmbeddings` | 把文字变成数字向量 | 给文字贴「坐标标签」的机器 |

---

## 📥 二、第一步：加载（Loader）—— 把网页变成 `Document`

第一步，把网页抓下来、解析成标准文档。

```js
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';

const cheerioLoader = new CheerioWebBaseLoader(
  'https://juejin.cn/post/7660707431753678854',
  {
    selector: '.main-area p', // 只取「正文段落」，剔除导航、广告、侧栏
  }
);

const documents = await cheerioLoader.load();
```

**这一步之后，数据长这样：**

```js
Document {
  pageContent: "Node.js 的 fs 模块提供了丰富的文件系统 API……", // 📝 正文
  metadata: {
    source: "https://juejin.cn/post/7660707431753678854",  // 🏷️ 从哪来
    title: "……",
  }
}
```

- **`pageContent`** = 文档正文（说了什么）
- **`metadata`** = 元信息（从哪来）

> 🕷️ 背后原理（`crawl.mjs`）：loader 本质是「axios 发请求拿 HTML 字符串 → cheerio 用 CSS 选择器提取正文」，一步到位帮你封装好了。

---

## ✂️ 三、第二步：切割（Splitter）—— 把大文档剪成小卡片

一整篇文章太长，检索时要的是「**一定大小、语义完整**」的小块。所以切。

```js
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,                // 📏 每块目标 400 字符
  separators: ['。', '！', '？'], // ✂️ 优先在句末切
  chunkOverlap: 100,             // 🔁 相邻块重叠 100 字符
});

const splitDocuments = await textSplitter.splitDocuments(documents);
console.log(`文档分割完成，共 ${splitDocuments.length} 个 chunk`);
```

**三个参数一句话讲清：**

| 参数 | 干什么 | 为什么 |
| --- | --- | --- |
| `separators` | 在哪些符号处优先切 | `。！？` 是句子的天然边界，切在句末不碎语义 |
| `chunkSize` | 每块目标大小 | 控制粒度，让向量覆盖足够语义 |
| `chunkOverlap` | 相邻块重叠多少 | 用冗余补救「硬切」带来的语义断裂 |

> 🔁 **为什么叫「递归」**：它会按顺序试 `。` → `！` → `？`，哪个能切出接近 `chunkSize` 的块就用哪个，**始终追求「贴着大小切，但不破坏语义」**。
>
> 🔁 **为什么要 overlap**：被 `chunkSize` 硬切时，上一块最后一句和下一块第一句语义相关性最大，却被迫分开。overlap 让它们各保留一部分对方的内容，检索时不错过跨边界的上下文。

**这一步之后，数据长这样：** 一个 `Document` 变成了若干个带编号的小 `Document`，每个约 400 字。

---

## 🔢 四、第三步：向量化 + 存储 —— 把文字变成「坐标」，放进书架

这是 RAG 的核心转折点：**让文字变得「可计算」**。

> 🎯 **关键理解**：计算机不会「读懂」文字，但会「算距离」。Embedding 把一段文字映射成高维向量（一串数字），**语义相近的文字，向量在空间里距离就近**。

```js
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';

const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocuments,
  embeddings,   // 内部自动把每个 chunk 向量化
);
```

`fromDocuments` 一步干了两件事：**向量化 + 入库**。

**这一步之后，数据长这样：** 每个 chunk 都多了一个「坐标」：

```
chunk "fs 提供了 readFile、writeFile……"  →  [0.013, -0.241, 0.087, …]（几百上千维）
chunk "path 模块用来处理路径……"          →  [0.102, -0.003, -0.156, …]
```

> 📦 **`MemoryVectorStore`** 存在**内存**里，进程结束就没了，适合教学 demo。生产换 `pgvector`、`Milvus`、`Pinecone` 等，接口不变。

---

## 🔍 五、第四步：检索（Retriever）—— 图书管理员帮你找最相关的书

存好了，怎么「取」？靠 **Retriever（检索器）**。

```js
const retriever = vectorStore.asRetriever({ k: 3 });  // 每次返回最相关的 3 个 chunk

const question = "fs 模块有哪些 API";
const docs = await retriever.invoke(question);
```

> 🧠 **`invoke` 内部偷偷做了三件事**（对应代码注释）：
>
> ```
> question ──▶ ① 转成向量 ──▶ ② 在向量库里算距离 ──▶ ③ 返回最近的 k 个 Document
> ```

**这一步之后，数据长这样：** 3 个与「fs API」最相关的 `Document`（已经按相关度排好序）。

---

## 📊 六、第五步：打分 —— 到底有多像？

`retriever` 只给文档，不告诉你「有多相关」。想看数字，用 `similaritySearchWithScore`：

```js
const scoredResults = await vectorStore.similaritySearchWithScore(question, 3);
```

它返回 `[文档, 分数]` 的配对。⚠️ **注意**：这个「分数」是**距离**，**越小越相似**（余弦距离）。所以代码里换算成「相似度」：

```js
const similarity = score != null ? (1 - score).toFixed(4) : "N/A";
```

| 概念 | 含义 | 越大代表 |
| --- | --- | --- |
| `score`（原始分） | 余弦距离 | 越**不**相似 |
| `similarity` | `1 - score` | 越相似 |

这就是代码注释「`1 - 值越大越相似，cosine`」的由来。

**这一步之后，数据长这样：**

```
[文档1] 相似度 0.8732（最相关）
[文档2] 相似度 0.7421
[文档3] 相似度 0.5106
```

> 💡 打分本不是必须的（retriever 已排好序），但它让我们能「**看见**」检索质量，也为后续 rerank（重排）留了接口。

---

## 🧷 七、第六步：增强（Augment）—— 把找到的片段抄进答题纸

「RAG」里的 **A** 就在这里。把检索到的片段拼进 prompt，让模型「照着资料答」。

```js
const context = docs
  .map((doc, i) => `[片段${i}]\n ${doc.pageContent}`)
  .join("\n\n-----\n\n");

const prompt = `你是一个文章辅助阅读助手，根据文章内容来解答：

文章内容:
${context}

问题：${question}

你的回答:`;
```

**这一步之后，数据长这样：** 一个拼好的 prompt 字符串，里面塞满了检索到的相关片段。

---

## 🤖 八、第七步：生成（Generate）—— 让模型照着资料答题

最后，把增强后的 prompt 交给大模型：

```js
const response = await model.invoke(prompt);
console.log(response.content);   // 最终的答案
```

因为前面 `temperature: 0`，模型会**老老实实根据你给的片段回答**，而不是自由发挥、凭空编造。

**到这一步，一次完整的 RAG 问答就走完了。** 🎉

---

## 🧭 九、一张图 + 一张表，回顾全程

```
 URL
  │  ① Loader（加载）
  ▼
 Document
  │  ② Splitter（切割）
  ▼
 小 Document ×N
  │  ③ Embedding（向量化）+ ④ VectorStore（存储）
  ▼
 向量数据库
  │  ⑤ Retriever（检索 k=3）
  ▼
 top-3 片段 ──⑥ 打分（相似度）──▶ ⑧ 生成
  │                                   ▲
  └──────────── ⑦ 拼 context + prompt ─┘
```

**每一阶段的数据形态对照表：**

| 阶段 | 工具 | 输入 → 输出 |
| --- | --- | --- |
| 加载 | `CheerioWebBaseLoader` | URL → `Document`（pageContent + metadata） |
| 切割 | `RecursiveCharacterTextSplitter` | 大 `Document` → 若干小 `Document` |
| 向量化 | `OpenAIEmbeddings` | 文字 → 高维向量 |
| 存储 | `MemoryVectorStore` | 向量 → 可检索的向量库 |
| 检索 | `asRetriever({k:3})` | 问题 → top-k 相关片段 |
| 打分 | `similaritySearchWithScore` | 片段 → 相似度分数 |
| 增强 | 拼字符串 | 片段 → 带上下文的 prompt |
| 生成 | `ChatOpenAI.invoke` | prompt → 最终答案 |

---

## 💡 十、思考：RAG 的本质，与 AI 架构师的价值

### RAG 三个字母到底在干嘛

- **R（Retrieval 检索）**：从你的知识库里，找出和问题最相关的片段；
- **A（Augmented 增强）**：把这些片段作为「参考材料」塞进 prompt；
- **G（Generation 生成）**：让 LLM 基于参考材料作答，而不是凭空编造。

一句话：**「让模型先查资料，再回答问题」**。

### 切割的意义：保持语义完整性

- `separators` 是语义最基本的构成符号 —— `。！？`，而不是 `，`；
- 按 `chunkSize` 切割组装，让向量「大小可控、语义可控」；
- 遇到硬切，用 `overlap` 兜底，用冗余换语义完整。

### AI 时代，程序员的价值在迁移

> 不再是单纯的 **coding**，而是 **Vibe Coding**。

真正值钱的能力变成了：

- 🎤 **问出好问题**（prompt）
- 🧠 **提供丰富准确的上下文**（context）
- 🎛️ **驾驭（Harness）并部署 Agent 产品**
- 🔁 **设计长时间稳定运行的 Loop**
- 🏗️ **快速成长为一名 AI 架构师**

写代码交给 AI 了，但「**为什么这么切**」「**检索完为什么要打分**」「**整套流水线怎么串起来**」—— 这些判断，才是人不可替代的地方。本文这条「加载 → 切割 → 向量化 → 存储 → 检索 → 打分 → 增强 → 生成」的完整链路，正是这种价值的缩影。

---

## 📖 附录：项目结构 + 代码速查

```
rag_splitter/
├── readme.md              # 原始笔记
├── 文档切割详解.md         # 前置链路：加载 → 切割
├── Document切割详解.md    # 本篇：完整八步全流程
├── package.json           # 依赖：langchain、axios、cheerio、dotenv
├── .env                   # 模型与 API 配置
└── src/
    ├── crawl.mjs          # 手工爬虫：axios + cheerio
    └── index.mjs          # 完整 RAG 流水线
```

**`.env` 关键配置：**

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `MODEL_NAME` | `qwen-plus` | 生成用大模型 |
| `EMBEDDINGS_MODEL_NAME` | `text-embedding-v3` | 向量化模型 |
| `OPENAI_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | OpenAI 兼容接口 |

**一条命令串起的完整调用链：**

```js
// 加载 → 切割 → 向量化存储 → 检索 → 打分 → 增强 → 生成
const documents = await cheerioLoader.load();
const splitDocs = await textSplitter.splitDocuments(documents);
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
const docs = await vectorStore.asRetriever({ k: 3 }).invoke(question);
const scored = await vectorStore.similaritySearchWithScore(question, 3);
const context = docs.map((d, i) => `[片段${i}]\n ${d.pageContent}`).join("\n\n");
const answer = await model.invoke(`根据内容回答：\n${context}\n\n问题：${question}`);
```

> ⚠️ **小提醒**：`index.mjs` 打印元数据时用了 `doc.metadata.chapter / character / type`，而 `CheerioWebBaseLoader` 实际只提供 `source`、`title` 等，这几个字段会是 `undefined`（多半是从别的示例复制来的占位）。真正的元数据以 loader 实际返回为准。
