# 向量数据库入门（二）：Embedding → 语义搜索 → RAG 日记助手

> 💡 上一篇我们跑通了「连接 → 建集合 → 建索引 → 插入」的最小闭环，但用的是**写死的假向量**（4 个数字）。这一篇升级到**真实场景**：用 Embedding 模型把日记变成真正的向量，再**搜索**最相似的日记，最后串成一个能**回答问题**的 RAG 助手。
>
> 全流程对应 4 个文件：`main.mjs → index.mjs → query.mjs → rag.mjs`，是一条从简到繁、步步进阶的学习路径。

## 📌 这篇文章你会收获什么

- 理解「死向量」和「真 Embedding」的区别，学会用 `text-embedding-v3` 生成 1024 维向量
- 学会给集合定义**显式 Schema**（字段 + 数据类型）
- 掌握 `search()` 语义搜索，看懂 `score` 相似度分数
- 串起完整 RAG 链路：**检索 → 增强 → 生成**

---

## 0. 🗺️ 一张图看懂 4 个文件的关系

```
 main.mjs   热身     假向量，理解「向量库是什么」          → 第一篇已讲
    ↓
 index.mjs  建库入库  真 Embedding：把日记变成 1024 维向量存进去
    ↓
 query.mjs  语义搜索  把问题变成向量，搜出最相似的 Top-K 日记
    ↓
 rag.mjs    RAG      把搜到的日记喂给大模型，让它「有依据地」回答
```

> 🧭 记住这条链路，它其实就是现在最火的 **RAG（检索增强生成）** 的完整骨架。

---

## 1. 🔁 从 main.mjs 说起：上次的「假向量」

第一篇里我们插入的数据是这样的：

```js
const data = [
  { vector: [0.1, 0.2, 0.3, 0.4], content: '这是第一条数据' },
  { vector: [0.5, 0.6, 0.7, 0.8], content: '这是第二条数据' }
];
```

这里的 `vector` 是**随手写的 4 个数字**——它不是任何文字的真实语义，只是「占个位置」让我们跑通流程。

> ⚠️ 假向量只能用来**学 API 怎么用**，做不了真正的语义搜索。要玩真的，必须用 **Embedding 模型**把文字变成**真向量**。

---

## 2. 🧬 index.mjs：真实数据入库

### 2.1 为什么需要「真 Embedding」

真实向量的维度高得多，而且**能反映语义**。我们这次的目标：把 5 篇日记存进一个叫 `ai_dairy` 的集合，每篇日记都要有：

- 一个 `vector` 字段（由日记内容生成的真实向量）
- 还有 `content`、`date`、`mood`、`tags` 这些普通字段

### 2.2 定义显式 Schema（字段 + DataType）

上次我们用 `createCollection({ dimension })` 让 SDK 自动建 schema；这次我们**手动定义每个字段**，精度更高、也更接近真实项目：

```js
import { DataType } from '@zilliz/milvus2-sdk-node';

const VECTOR_DIM = 1024; // 向量维度，和 embedding 模型输出对齐

await client.createCollection({
  collection_name: 'ai_dairy',
  fields: [
    { name: 'id',      data_type: DataType.VarChar,     max_length: 50,  is_primary_key: true },
    { name: 'vector',  data_type: DataType.FloatVector, dim: VECTOR_DIM },
    { name: 'content', data_type: DataType.VarChar,     max_length: 5000 },
    { name: 'date',    data_type: DataType.VarChar,     max_length: 50 },
    { name: 'mood',    data_type: DataType.VarChar,     max_length: 50 },
    { name: 'tags',    data_type: DataType.Array, element_type: DataType.VarChar, max_capacity: 10, max_length: 50 }
  ]
});
```

字段类型一览：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `VarChar` + 主键 | 字符串主键，`diary_001` 这种自定义 ID |
| `vector` | `FloatVector` | 向量字段，`dim` 必须是 1024 |
| `content` | `VarChar` | 日记正文，最长 5000 字 |
| `date` / `mood` | `VarChar` | 日期、心情，普通字符串 |
| `tags` | `Array` | 标签数组，元素是字符串，最多 10 个 |

> 💡 对比第一篇：这次没有开 `auto_id`，而是**自己指定主键 `id`**，并用 `is_primary_key: true` 标记。`DataType` 就是用来**约束每个字段的数据类型**的。

### 2.3 用 text-embedding-v3 生成 1024 维向量

核心来了——用 LangChain 的 `OpenAIEmbeddings` 封装，实际调用阿里云百炼的 `text-embedding-v3`：

```js
import { OpenAIEmbeddings } from '@langchain/openai';

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,   // text-embedding-v3
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL       // DashScope 兼容端点
  },
  dimensions: VECTOR_DIM                       // 固定输出 1024 维
});

const getEmbedding = async (text) => {
  return await embeddings.embedQuery(text);    // 文字 → 1024 维向量
};
```

> 🧠 关键参数 `dimensions: 1024`：`text-embedding-v3` 支持**按需指定输出维度**，这里定成 1024，正好和集合里 `vector` 字段的 `dim` 对齐。**两边必须一致**，否则插入/搜索会报维度不匹配。

### 2.4 建索引 + 加载集合（loadCollection）

```js
await client.createIndex({
  collection_name: 'ai_dairy',
  field_name: 'vector',
  index_type: IndexType.IVF_FLAT,   // 聚簇索引（第一篇讲过）
  metric_type: MetricType.COSINE
});

// ⚠️ 关键：搜索前必须先把集合加载进内存
await client.loadCollection({ collection_name: 'ai_dairy' });
```

> ⚠️ `loadCollection` 很容易被忽略，但**搜索前必须加载**，否则集合里的数据还没进内存，`search` 会查不到或报错。这是 index 阶段最后一步。

### 2.5 批量生成向量并插入

```js
const diaryContents = [
  { id: 'diary_001', content: '今天天气很好，去公园散步了，心情愉快。看到了很多花开了，春天真美好。', date: '2026-01-10', mood: 'happy',    tags: ['生活', '散步'] },
  { id: 'diary_002', content: '今天工作很忙，完成了一个重要的项目里程碑。团队合作很愉快，感觉很有成就感。', date: '2026-01-11', mood: 'excited', tags: ['工作', '成就'] },
  // ... 共 5 篇日记
];

// 给每篇日记并行生成向量，拼成最终要插入的数据
const diaryData = await Promise.all(
  diaryContents.map(async (diary) => ({
    ...diary,
    vector: await getEmbedding(diary.content)  // 内容 → 向量
  }))
);

const insertResult = await client.insert({
  collection_name: 'ai_dairy',
  data: diaryData
});
console.log(insertResult.insert_cnt, '条记录成功插入。');
```

> 🚀 `Promise.all` 让 5 篇日记**并行**生成向量，而不是一篇篇串行等，快得多。

### 2.6 完整 index.mjs

```js
import 'dotenv/config';
import { MilvusClient, MetricType, IndexType, DataType } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from '@langchain/openai';

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN   = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ai_dairy';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
});

const client = new MilvusClient({ address: ADDRESS, token: TOKEN });
const getEmbedding = async (text) => await embeddings.embedQuery(text);

async function main() {
  const checkHealth = await client.checkHealth();
  if (!checkHealth.isHealthy) {
    console.error('连接失败', checkHealth.reasons);
    return;
  }

  await client.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: 'vector',
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE
  });

  await client.loadCollection({ collection_name: COLLECTION_NAME });

  const diaryContents = [
    { id: 'diary_001', content: '今天天气很好，去公园散步了，心情愉快。看到了很多花开了，春天真美好。', date: '2026-01-10', mood: 'happy',    tags: ['生活', '散步'] },
    { id: 'diary_002', content: '今天工作很忙，完成了一个重要的项目里程碑。团队合作很愉快，感觉很有成就感。', date: '2026-01-11', mood: 'excited', tags: ['工作', '成就'] },
    { id: 'diary_003', content: '周末和朋友去爬山，天气很好，心情也很放松。享受大自然的感觉真好。', date: '2026-01-12', mood: 'relaxed', tags: ['户外', '朋友'] },
    { id: 'diary_004', content: '今天学习了 Milvus 向量数据库，感觉很有意思。向量搜索技术真的很强大。', date: '2026-01-12', mood: 'curious', tags: ['学习', '技术'] },
    { id: 'diary_005', content: '晚上做了一顿丰盛的晚餐，尝试了新菜谱。家人都说很好吃，很有成就感。', date: '2026-01-13', mood: 'proud',   tags: ['美食', '家庭'] }
  ];

  const diaryData = await Promise.all(
    diaryContents.map(async (diary) => ({ ...diary, vector: await getEmbedding(diary.content) }))
  );

  const insertResult = await client.insert({ collection_name: COLLECTION_NAME, data: diaryData });
  console.log(insertResult.insert_cnt, '条记录成功插入。');
}
main().catch(console.error);
```

---

## 3. 🔎 query.mjs：语义搜索

数据进库了，现在做**向量数据库最核心的本领**——相似度检索。

### 3.1 把「问题」也变成向量

关键思想：**查询和存储用同一个 Embedding 模型**，这样「问题」和「日记」才在同一个向量空间里，才能比距离。

```js
const query = '我想看看关于户外活动的日记';
const queryVector = await getEmbedding(query);  // 问题 → 1024 维向量
```

### 3.2 search() 详解

```js
await client.connectPromise;  // 先握手，等连接就绪

const searchResult = await client.search({
  collection_name: COLLECTION_NAME,
  vector: queryVector,            // 用问题向量去搜
  limit: 2,                       // Top-K：只要最像的 2 条
  metric_type: MetricType.COSINE, // 用余弦相似度
  output_fields: ['id', 'content', 'date', 'mood', 'tags']  // 返回哪些字段
});
```

参数逐个看：

| 参数 | 作用 |
|---|---|
| `vector` | 查询向量（问题转出来的） |
| `limit` | 返回最相似的 Top-K 条 |
| `metric_type` | 相似度算法，和建索引时一致（COSINE） |
| `output_fields` | 除了 id 外，还想要哪些字段一起返回 |

### 3.3 score 是什么

```js
searchResult.results.forEach((item, index) => {
  console.log(`${index + 1}.[${item.score.toFixed(4)}]`);
  console.log(`ID: ${item.id}; Date: ${item.date}; Mood: ${item.mood};`);
  console.log(`Tags: ${item.tags?.join(",")};`);
  console.log(`Content: ${item.content}`);
});
```

- `item.score` 是**相似度分数**。`COSINE` 下取值范围 `[-1, 1]`，越接近 `1` 越相似
- `item.id / date / mood / tags / content` 就是 `output_fields` 里要回来的字段

> 💡 搜「户外活动的日记」，最像的应该是 `diary_003`（爬山）和 `diary_001`（散步）——虽然它们原文里根本没有「户外活动」这四个字，但语义是相近的。**这就是语义搜索和关键词搜索的本质区别。**

### 3.4 完整 query.mjs

```js
import 'dotenv/config';
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from '@langchain/openai';

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN   = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ai_dairy';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
});

const client = new MilvusClient({ address: ADDRESS, token: TOKEN });
const getEmbedding = async (text) => await embeddings.embedQuery(text);

async function main() {
  await client.connectPromise;

  const query = '我想看看关于户外活动的日记';
  const queryVector = await getEmbedding(query);

  const searchResult = await client.search({
    collection_name: COLLECTION_NAME,
    vector: queryVector,
    limit: 2,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'content', 'date', 'mood', 'tags']
  });

  console.log(`Search ${searchResult.results.length} results`);
  searchResult.results.forEach((item, index) => {
    console.log(`${index + 1}.[${item.score.toFixed(4)}]`);
    console.log(`ID: ${item.id}; Date: ${item.date}; Mood: ${item.mood};`);
    console.log(`Tags: ${item.tags?.join(",")};`);
    console.log(`Content: ${item.content}`);
  });
}
main().catch(console.error);
```

---

## 4. 🤖 rag.mjs：检索增强生成（RAG）

前面只会「找到」相关日记。但用户真正想要的是**直接得到答案**，比如「我最近做了什么让我快乐的事？」。这就轮到 RAG 登场了。

### 4.1 什么是 RAG

**RAG = Retrieval-Augmented Generation（检索增强生成）**，三步：

```
 📖 检索 Retrieve    用向量搜索从库里捞出相关日记
    ↓
 🧩 增强 Augment     把捞到的日记拼进 Prompt，作为「参考资料」
    ↓
 ✍️ 生成 Generate    大模型基于这些资料，生成有依据的回答
```

> 🎯 好处：大模型**不用背下你的日记**，每次现查现答，回答有出处、不瞎编（减少幻觉），而且资料更新了回答也跟着变。

### 4.2 检索（Retrieve）：复用 query 的能力

把「搜日记」抽成一个函数：

```js
async function retrieveDiaries(question, k = 1) {
  const queryVector = await getEmbedding(question);
  const searchResult = await client.search({
    collection_name: COLLECTION_NAME,
    vector: queryVector,
    limit: k,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'content', 'date', 'mood', 'tags']
  });
  return searchResult.results;  // 返回最相似的 k 条日记
}
```

### 4.3 增强（Augment）：把日记拼进 Prompt

```js
const content = retrievedDiaries
  .map((diary, i) => `
   [日记${i + 1}]
   日期: ${diary.date}
   心情: ${diary.mood}
   标签: ${diary.tags?.join(', ')}
   内容: ${diary.content}
  `)
  .join('\n\n----\n\n');

const prompt = `你是一个温暖贴心的AI 日记助手。基于用户的日记内容回答问题，用亲切自然的语言。
  请根据以下日记内容回答问题：
  ${content}

   用户问题: ${question}
   回答要求：
   1. 如果日记中有相关信息，请结合日记内容给出详细、温暖的回答。
   2. 可以总结多篇日记的内容，找出共同点或趋势。
   3. 如果日记中没有相关信息，请温和告知用户。
   4. 用第一人称"你"来称呼日记的作者。
   5. 回答要有同理心，让用户感到被理解和关心。
   AI助手回答：`;
```

> 💡 这段 Prompt 是 RAG 的灵魂：**把检索结果塞进上下文 + 给大模型立规矩**（要温暖、有同理心、没找到就直说）。写得越好，回答质量越高。

### 4.4 生成（Generate）：大模型来回答

```js
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  temperature: 0.1,              // 低温度，回答更稳定
  model: process.env.MODEL_NAME, // qwen-plus
  apiKey: process.env.OPENAI_API_KEY,
  configuration: { baseURL: process.env.OPENAI_BASE_URL }
});

const response = await model.invoke(prompt);
console.log(response.content);   // 最终答案
```

### 4.5 完整 rag.mjs

```js
import 'dotenv/config';
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN   = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ai_dairy';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
});

const model = new ChatOpenAI({
  temperature: 0.1,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: { baseURL: process.env.OPENAI_BASE_URL }
});

const client = new MilvusClient({ address: ADDRESS, token: TOKEN });
const getEmbedding = async (text) => await embeddings.embedQuery(text);

async function retrieveDiaries(question, k = 1) {
  const queryVector = await getEmbedding(question);
  const searchResult = await client.search({
    collection_name: COLLECTION_NAME,
    vector: queryVector,
    limit: k,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'content', 'date', 'mood', 'tags']
  });
  return searchResult.results;
}

async function answerDiaryQuestion(question, k = 2) {
  const retrievedDiaries = await retrieveDiaries(question, k);
  if (retrievedDiaries.length === 0) {
    console.log('没有找到相关日记');
    return;
  }

  const content = retrievedDiaries
    .map((diary, i) => `[日记${i + 1}]\n日期: ${diary.date}\n心情: ${diary.mood}\n标签: ${diary.tags?.join(', ')}\n内容: ${diary.content}`)
    .join('\n\n----\n\n');

  const prompt = `你是一个温暖贴心的AI 日记助手。基于用户的日记内容回答问题，用亲切自然的语言。
  请根据以下日记内容回答问题：
  ${content}

  用户问题: ${question}
  回答要求：
  1. 如果日记中有相关信息，请结合日记内容给出详细、温暖的回答。
  2. 可以总结多篇日记的内容，找出共同点或趋势。
  3. 如果日记中没有相关信息，请温和告知用户。
  4. 用第一人称"你"来称呼日记的作者。
  5. 回答要有同理心，让用户感到被理解和关心。
  AI助手回答：`;

  const response = await model.invoke(prompt);
  console.log(response.content);
}

async function main() {
  await client.connectPromise;
  await answerDiaryQuestion('我最近做了什么让我感到快乐的事情？', 2);
}
main().catch(console.error);
```

运行：

```bash
node src/rag.mjs
```

---

## 5. 🧭 总结 & 环境配置

这一篇的 4 个文件，串起了一条完整的 **RAG 链路**：

| 文件 | 阶段 | 核心动作 |
|---|---|---|
| `main.mjs` | 热身 | 假向量跑通流程 |
| `index.mjs` | 建库入库 | 显式 Schema + 真 Embedding + `loadCollection` |
| `query.mjs` | 语义搜索 | 问题 → 向量 → `search` → Top-K + `score` |
| `rag.mjs` | RAG | 检索 + 增强 Prompt + `qwen-plus` 生成回答 |

配套的 `.env` 需要这些变量（密钥请填你自己的真实值）：

```env
# Milvus 向量库
MILVUS_ADDRESS=https://你的集群地址.cloud.zilliz.com.cn
MILVUS_TOKEN=你的API-KEY

# OpenAI 兼容接口（阿里云百炼 DashScope）
OPENAI_API_KEY=你的百炼API-KEY
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 模型
EMBEDDINGS_MODEL_NAME=text-embedding-v3   # 生成向量
MODEL_NAME=qwen-plus                      # 对话大模型
```

依赖：

```json
{
  "dependencies": {
    "@langchain/openai": "^1.5.10",
    "@zilliz/milvus2-sdk-node": "^3.0.4",
    "dotenv": "^17.4.2"
  }
}
```

> 🔭 **下一篇预告**：RAG 还能做得更「工程化」——用 LangChain 的 `Retriever`/`VectorStore` 把散装代码抽象成组件，加入对话历史、流式输出、引用溯源。我们下篇见。
