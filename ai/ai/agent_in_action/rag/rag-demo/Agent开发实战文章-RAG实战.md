# 🤖 Agent 智能体开发实战 · RAG 实战 —— 从零搭建检索增强生成系统

> **上篇回顾**：RAG 入门篇讲了幻觉问题、Embedding 原理、向量语义搜索、Document 切分等理论基础。
>
> **本课聚焦**：用一个完整的 `index.mjs`，把 RAG 理论落地为可运行的代码——从文档向量化存入 `MemoryVectorStore`，到创建检索器 `retriever`，再到拼 Prompt 让 LLM 回答，**一步步拆解全套 RAG 工作流**。

---

## 📖 本课目录

- [一、依赖全景：三类核心组件](#一依赖全景三类核心组件)
- [二、模型初始化：生成模型 + 嵌入模型](#二模型初始化生成模型--嵌入模型)
- [三、构建知识库：Document → Embedding → VectorStore](#三构建知识库document--embedding--vectorstore)
- [四、检索器：语义搜索的入口](#四检索器语义搜索的入口)
- [五、Augmented + Generation：拼接 Prompt + LLM 回答](#五augmented--generation拼接-prompt--llm-回答)
- [六、完整流程复盘](#六完整流程复盘)
- [七、本课学习总结](#七本课学习总结)

---

## 一、依赖全景：三类核心组件

```javascript
import 'dotenv/config';
import {
  ChatOpenAI,         // llm generate
  OpenAIEmbeddings,   // 嵌入模型
} from '@langchain/openai';
// 内存向量存储 rag 学习，或轻量
// psql
// 帮我安装postgreSQL root 密码设置为123456 开启向量存储扩展
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Document } from '@langchain/core/documents';
```

| 依赖 | 来源 | 职责 |
|------|------|------|
| `ChatOpenAI` | `@langchain/openai` | 生成模型——根据增强后的 Prompt 生成最终回答 |
| `OpenAIEmbeddings` | `@langchain/openai` | 嵌入模型——把文本转成向量 |
| `MemoryVectorStore` | `@langchain/classic/vectorstores/memory` | 内存向量存储——学习/轻量场景，向量 + 原文一起存内存里 |
| `Document` | `@langchain/core/documents` | 知识库的最小单元（`pageContent` + `metadata`） |

> 💡 `@langchain/classic` 是 LangChain 经典常用模块。`MemoryVectorStore` 把向量数据存内存里，适合 RAG 学习和轻量场景。生产环境会换 PostgreSQL + pgvector 或 Pinecone 等持久化向量数据库。

---

## 二、模型初始化：生成模型 + 嵌入模型

```javascript
// 生成模型 —— 负责回答问题（贵）
const model = new ChatOpenAI({
  temperature: 0,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
})

// 嵌入模型 —— 负责把文本转成向量（便宜）
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  baseURL: process.env.OPENAI_BASE_URL
})
```

| 模型 | 类 | 用途 | 何时调用 |
|------|-----|------|----------|
| 生成模型 | `ChatOpenAI` | 生成文本回答 | 最后一步（Generation） |
| 嵌入模型 | `OpenAIEmbeddings` | 文本 → 向量 | 建库时 + 查询时 |

> 🎯 两个模型各司其职。嵌入模型轻量便宜，专做"文本转数字"这件事；生成模型重且贵，只在最终回答时调用一次。

---

## 三、构建知识库：Document → Embedding → VectorStore

### 第1步：准备 Document 数组

```javascript
const documents = [
  new Document({
    pageContent: `光光是一个活泼开朗的小男孩，他有一双明亮的大眼睛，总是带着灿烂的笑容。光光最喜欢的事情就是和朋友们一起玩耍，他特别擅长踢足球，每次在球场上奔跑时，就像一道阳光一样充满活力。`,
    // metadata 用于后续过滤或溯源，不参与向量化计算，但非常有用
    metadata: {
      chapter: 1,
      character: "光光",
      type: "角色介绍",
      mood: "活泼"
    },
  }),
  new Document({
    pageContent: `东东是光光最好的朋友，他是一个安静而聪明的男孩……和光光从幼儿园就认识了……`,
    metadata: {
      chapter: 2,
      character: "东东",
      type: "角色介绍",
      mood: "温馨"
    },
  }),
  // ... 共 7 个 Document，涵盖完整故事线
];
```

7 个 Document 构成一个儿童故事知识库（光光和东东的友谊故事），每个都标注了 `chapter`、`character`、`type`、`mood` 元数据。

### 第2步：一键向量化 + 存入内存

```javascript
// 把一堆的documents 用 embeddings 模型向量化
// 存入到内存中
// 抽象 业务太好了
// 将上述documents 数组中的所有文本
// 通过 embeddings 转换成向量，并存入内存
// 可以拥有一个语义搜索的知识库
const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
```

这一行干了三件事：

```
documents（7 个 Document 对象）
    │
    ▼
① 遍历每个 Document，取 pageContent
    │
    ▼
② 用 embeddings 把每个 pageContent 转成向量 [0.12, -0.34, 0.78, ...]
    │
    ▼
③ 把 { 向量, pageContent, metadata } 存入 MemoryVectorStore
```

| 参数 | 说明 |
|------|------|
| `documents` | 7 个 Document 的数组 |
| `embeddings` | 嵌入模型实例，负责把文本转成向量 |
| 返回值 | `MemoryVectorStore` 实例，已包含全部文档的向量索引 |

> 🎯 `MemoryVectorStore.fromDocuments()` 是一个高度抽象的方法——一行代码完成"遍历→向量化→建索引→存入"。AI 发展太快，LangChain 版本更新也快，**关键是理解抽象背后的原理**。

---

## 四、检索器：语义搜索的入口

### 🔍 从 VectorStore 到 Retriever

```javascript
// prompt 去语义匹配
// 提供检索器 不用去手工的prompt embedding
// 将向量数据库转换成检索器
// 是一个标准入口，输入问题，检索器输出最相关的文档列表
const retriever = vectorStore.asRetriever({
  k: 3 // 最相似的3个文档
});
```

| 概念 | 说明 |
|------|------|
| `asRetriever()` | 把 VectorStore 包装成**检索器**——RAG 系统的标准入口 |
| `k: 3` | Top-K 参数：只返回最相似的 3 个文档 |

> 💡 有了 Retriever 就不用手工做 Prompt Embedding 了——它是一个标准接口：**输入问题，输出最相关的文档列表**。背后自动做"问题向量化 → 相似度计算 → 排序 → 返回 top-K"。

### 📊 Retriever vs 原始向量查询

```javascript
// 方式1：retriever.invoke() —— 标准检索入口
// invoke 执行
// 内部逻辑，将question 转为向量
// 在向量数据库中计算距离 返回K个最相关的文档 Document 对象
// 工作流编排
const docs = await retriever.invoke(question);

// 方式2：similaritySearchWithScore() —— 原始向量查询 + 打分
// 还想要打分，返回每个文档的相似度
// 向量的距离 越小，相似度越高
// 1-距离 = 相似度
const scoredResults = await vectorStore.similaritySearchWithScore(question, 3);
```

| 对比维度 | `retriever.invoke()` | `vectorStore.similaritySearchWithScore()` |
|----------|---------------------|----------------------------------------|
| 返回内容 | Document 列表 | `[Document, score]` 元组列表 |
| 处理能力 | 检索 + 去重 + 过滤 + **rerank** | 纯向量相似度查询 |
| score 含义 | 无（由 retriever 内部处理） | 向量距离（越小越相似） |
| 适用场景 | Agent 工作流编排 ✅ | 需要看打分/调试/评估质量 |

### 📐 相似度打分解读

```javascript
console.log("/n [检索到的文档及相似度评分]");
docs.forEach((doc, i) => {
  const scoredResult = scoredResults.find(([sorceDoc]) =>
    sorceDoc.pageContent === doc.pageContent
  )
  // retriever 过滤，rerank
  // 1-值越大越相似，cosine
  const score = scoredResult ? scoredResult[1] : null;
  const similarity = score != null ? (1 - score).toFixed(4) : "N/A";
  console.log(`\n[文档 ${i + 1}] 相似度指标: ${similarity} (原始分: ${score})`);
  console.log(`内容: ${doc.pageContent.substring(0, 50)}...`);
  console.log(`元数据：章节=${doc.metadata.chapter}, 角色=${doc.metadata.character}, 类型=${doc.metadata.type}`);
})
```

| 数值 | 含义 |
|------|------|
| `score`（原始分） | 向量间的**余弦距离**，越小越相似 |
| `similarity`（相似度） | `1 - score`，越大越相似，范围 0~1 |
| `metadata` | 溯源信息——告诉用户"这个信息来自第几章、关于哪个角色" |

> 🎯 retriever 在相似度查询的基础上**额外做了去重、过滤、rerank**，返回的结果更干净。如果调试阶段想看"为什么返回这个文档"，用 `similaritySearchWithScore` 看原始打分。

---

## 五、Augmented + Generation：拼接 Prompt + LLM 回答

### 📝 Augmented：拼接增强 Prompt

```javascript
// Augmented
const context = docs
  .map((doc, i) => `[片段${i}]\n ${doc.pageContent}`)
  .join("\n\n-----\n\n");

const prompt = `你是一个讲友情故事的老师。基于以下故事片段回答问题，用温暖生动的语言。如果故事中没有提到，就说"这个故事里还没有提到这个细节"。

故事片段:
${context}

问题：${question}

老师的回答:`;
```

| 组成部分 | 说明 |
|----------|------|
| 角色设定 | "你是一个讲友情故事的老师"——给 LLM 定人设 |
| 故事片段 | 检索到的 top-3 文档，用 `-----` 分隔 |
| 问题 | 用户原始问题 |
| 防幻觉指令 | "如果故事中没有提到就说没提到"——很关键 |

> 💡 **防幻觉指令**是 Prompt Engineering 的重要技巧。不写这句的话，LLM 被问到知识库没有的内容时，可能又开始编造。

### 🤖 Generation：LLM 生成回答

```javascript
const response = await model.invoke(prompt);
console.log(response.content);
```

RAG 的整个流程到这里就走完了。LLM 拿到的不是一个孤立的问题，而是一个**包含了相关背景知识的增强 Prompt**——它不需要"记住"这些知识，只需要读懂上下文然后组织语言回答。

---

## 六、完整流程复盘

### 🔄 从代码看 RAG 流水线

```
═══════════════════ 准备阶段 ═══════════════════

  documents（7个Document）
    │
    ▼
  MemoryVectorStore.fromDocuments(documents, embeddings)
    │  ① 遍历 documents
    │  ② 每个 pageContent 用 embeddings 转向量
    │  ③ 存入内存向量存储
    ▼
  vectorStore.asRetriever({ k: 3 })
    │  包装成标准检索器接口
    ▼
  retriever（就绪，等待查询）

═══════════════════ 查询阶段 ═══════════════════

  question = "光光和东东是怎么成为朋友的？"
    │
    ▼
  retriever.invoke(question)
    │  ① 把 question 用 embeddings 转向量
    │  ② 在 VectorStore 中计算余弦距离
    │  ③ 排序 + 去重 + rerank
    │  ④ 返回 Top-3 Document
    ▼
  docs（3个最相关的故事片段）

    ├──► similaritySearchWithScore(question, 3)
    │     获取原始相似度分数（调试/评估用）

    ▼
  Augmented: 拼接 context + question → Prompt
    ▼
  model.invoke(prompt) → LLM 基于事实回答
```

### 📦 整个流程只用了一个文件

```
rag-demo/
└── index.mjs  ←  200行不到，包含完整的 RAG 流程
    ├── import 依赖
    ├── 初始化模型（ChatOpenAI + OpenAIEmbeddings）
    ├── 构建 Document[]（7 章故事）
    ├── MemoryVectorStore.fromDocuments()
    ├── asRetriever() + invoke() 检索
    ├── similaritySearchWithScore() 打分
    └── Augmented Prompt + model.invoke() 生成
```

---

## 七、本课学习总结

### 🧠 知识点

```
📋 RAG 实战 · 知识点
│
├── 🧩 三类核心依赖
│   ├── ChatOpenAI：生成模型（回答问题）
│   ├── OpenAIEmbeddings：嵌入模型（文本→向量）
│   └── MemoryVectorStore：内存向量存储
│
├── 📚 构建知识库（一行代码）
│   ├── MemoryVectorStore.fromDocuments(docs, embeddings)
│   ├── 遍历 → Embedding → 建索引 → 存入
│   └── 抽象层次高，理解原理更重要
│
├── 🔍 检索器 Retriever
│   ├── vectorStore.asRetriever({ k: 3 })
│   ├── 标准入口：输入问题 → 输出相关文档
│   ├── invoke()：内部自动问题向量化 + 相似度计算
│   └── retriever 会做去重、过滤、rerank
│
├── 📊 相似度打分
│   ├── vectorStore.similaritySearchWithScore(question, k)
│   ├── score = 余弦距离（越小越相似）
│   ├── similarity = 1 - score（越大越相似）
│   └── 调试用，retriever 内部也会用到
│
├── 📝 Augmented 增强
│   ├── 检索到的文档 → 拼接成 context
│   ├── 角色设定 + context + 问题 → Prompt
│   └── 防幻觉指令：知识库没有就说没提到
│
└── 🤖 Generation 生成
    ├── model.invoke(prompt)
    ├── LLM 基于增强后的 Prompt 回答
    └── 不需要记住知识，读懂上下文即可
```

### ✅ 知识清单

| 编号 | 掌握项 | 核心要点 |
|------|--------|----------|
| 1 | 双模型架构 | 生成模型（回答）+ 嵌入模型（转向量），各司其职 |
| 2 | `MemoryVectorStore` | 内存向量存储，`fromDocuments()` 一行建库 |
| 3 | `fromDocuments()` | 遍历文档 → 向量化 → 建索引 → 存入，三步合一 |
| 4 | `asRetriever({ k })` | 把 VectorStore 包装成标准检索器，k 控制返回数量 |
| 5 | `retriever.invoke()` | 输入问题，自动转向量 → 查相似度 → 返回 top-K 文档 |
| 6 | `similaritySearchWithScore()` | 原始向量查询 + 相似度打分，用于调试评估 |
| 7 | score 含义 | 余弦距离（越小越相似），`1 - score` = 相似度 |
| 8 | retriever vs 原始查询 | retriever 多做去重+过滤+rerank，原始查询只做向量匹配 |
| 9 | Augmented Prompt 拼接 | context（检索结果）+ question → 增强 Prompt |
| 10 | 防幻觉指令 | "知识库没有的内容就说没提到"——关键的 Prompt Engineering |

### 📊 RAG 入门 vs RAG 实战

| 维度 | 入门篇 | 本课实战 |
|------|--------|----------|
| 内容 | 概念 + Document 定义 | **完整可运行的 RAG 流水线** |
| 向量存储 | 理论介绍 | **MemoryVectorStore.fromDocuments()** |
| 检索 | 概念 | **retriever.invoke() + similaritySearchWithScore()** |
| Augmented | 概念 | **代码拼接 context → Prompt** |
| Generation | 概念 | **model.invoke(prompt)** |
| 产出 | 理解 RAG 原理 | **能直接运行的 index.mjs** |

> 🎯 **本课定位**：入门篇讲"RAG 是什么"，本课讲"RAG 怎么做"。200 行不到的代码，一条完整的流水线：Document → Embedding → VectorStore → Retriever → Augmented Prompt → LLM 生成。理解了这六步，就掌握了 RAG 的核心实战能力。

---

*📅 2026-07-25 | 🏷️ Agent · RAG · MemoryVectorStore · Retriever · Embedding · 实战*
