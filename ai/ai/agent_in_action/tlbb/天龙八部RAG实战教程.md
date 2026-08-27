# 🐉 天龙八部 RAG 知识库实战：从零构建你的武侠 AI 助手

> **"以彼之道，还施彼身"** —— 用 RAG 技术让 AI 真正读懂金庸武侠世界

---

## 📖 项目简介

本项目以金庸经典武侠小说《天龙八部》为数据源，完整实现了一个 **RAG（Retrieval-Augmented Generation）** 系统。系统能够：

- 📚 加载 EPUB 电子书并按章节拆分
- ✂️ 智能分块文本，保持上下文连贯
- 🧮 将文本向量化并存入 Milvus 向量数据库
- 🔍 基于语义相似度检索相关内容
- 🤖 结合 LLM 生成准确、详细的回答

### 🏗️ 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  main.mjs   │────▶│  query.mjs  │────▶│   rag.mjs   │
│  数据入库    │     │  向量检索    │     │  RAG问答     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ EPUB加载     │     │ Milvus查询   │     │ LLM生成回答  │
│ 文本分块     │     │ 相似度匹配   │     │ 上下文整合   │
│ 向量化存储    │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 🛠️ 技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| **Milvus** | 向量数据库 | 存储和检索高维向量 |
| **LangChain** | AI 框架 | 提供文档加载、文本分割、Embedding 等工具 |
| **OpenAI Embeddings** | 文本向量化 | 将文本转换为 1024 维向量 |
| **ChatOpenAI** | LLM 对话模型 | 基于检索内容生成回答 |

### 📦 依赖安装

```json
{
  "dependencies": {
    "@langchain/community": "^1.1.29",
    "@langchain/core": "^1.2.9",
    "@langchain/openai": "^1.5.10",
    "@langchain/textsplitters": "^1.0.1",
    "@zilliz/milvus2-sdk-node": "^3.0.4",
    "dotenv": "^17.4.2"
  }
}
```

---

## 📁 项目结构

```
tlbb/
├── src/
│   ├── main.mjs      # 📥 数据入库：加载EPUB → 分块 → 向量化 → 存储
│   ├── query.mjs      # 🔍 向量检索：测试相似度搜索
│   └── rag.mjs        # 🤖 RAG问答：检索 + LLM = 智能回答
├── 天龙八部.epub       # 📚 原始数据源
├── .env               # 🔐 环境变量配置
└── package.json
```

---

## 🚀 模块一：main.mjs —— 数据入库流水线

> **核心职责**：将 EPUB 电子书转换为向量数据，存入 Milvus 数据库

### 📋 配置常量

```javascript
const COLLECTION_NAME = 'ebook2';    // 集合名称
const VECTOR_DIM = 1024;             // 向量维度
const CHUNK_SIZE = 500;              // 每个分块的字符数
const EPUB_FILE = './天龙八部.epub'  // 源文件路径
```

**💡 设计思考**：
- `VECTOR_DIM = 1024`：与 Embedding 模型输出维度一致
- `CHUNK_SIZE = 500`：平衡检索精度与上下文完整性

### 🔧 初始化 Embedding 模型

```javascript
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  dimensions: VECTOR_DIM
});

async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}
```

**📌 函数说明**：
- `getEmbedding(text)`：将任意文本转换为 1024 维浮点数组
- 内部调用 OpenAI 的 `embedQuery` 接口
- 返回值：`number[]`（长度 1024 的向量）

### 🗄️ Milvus 集合管理

```javascript
const client = new MilvusClient({
  address: ADDRESS,    // Milvus 服务地址
  token: TOKEN         // 认证令牌
});

async function ensureCollection(bookId) {
  // 检查集合是否存在
  const hasCollection = await client.hasCollection({
    collection_name: COLLECTION_NAME
  });

  if (!hasCollection.value) {
    // 创建集合，定义字段结构
    await client.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        { name: 'id',          data_type: DataType.VarChar, max_length: 100, is_primary_key: true },
        { name: 'book_id',     data_type: DataType.VarChar, max_length: 100 },
        { name: 'book_name',   data_type: DataType.VarChar, max_length: 200 },
        { name: 'chapter_num', data_type: DataType.Int32 },
        { name: 'index',       data_type: DataType.Int32 },
        { name: 'content',     data_type: DataType.VarChar, max_length: 10000 },
        { name: 'vector',      data_type: DataType.FloatVector, dim: VECTOR_DIM }
      ]
    });

    // 创建 IVF_FLAT 索引，使用余弦相似度
    await client.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'vector',
      index_type: IndexType.IVF_FLAT,
      metric_type: MetricType.COSINE,
      params: { nlist: 1024 }
    });
  }

  // 加载集合到内存（每次都需要）
  await client.loadCollection({
    collection_name: COLLECTION_NAME
  });
}
```

**📊 字段设计**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VarChar | 主键，格式：`{bookId}_{chapter}_{index}` |
| `book_id` | VarChar | 书籍编号 |
| `book_name` | VarChar | 书籍名称 |
| `chapter_num` | Int32 | 章节序号 |
| `index` | Int32 | 分块在章节内的序号 |
| `content` | VarChar | 原始文本内容 |
| `vector` | FloatVector | 1024 维向量 |

**🔍 索引类型说明**：
- **IVF_FLAT**：倒排文件索引 + 暴力搜索
- **COSINE**：余弦相似度，适合文本语义匹配
- **nlist = 1024**：聚类簇数，影响检索速度与精度

### 📥 EPUB 加载与分块处理

```javascript
async function loadAndProcessEPubStreaming(bookId) {
  // 1. 加载 EPUB 文件，按章节拆分
  const loader = new EPubLoader(EPUB_FILE, {
    splitChapters: true  // 按章节生成多个 Document
  });
  const documents = await loader.load();

  // 2. 初始化文本分割器
  const textsplitters = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,      // 每块 500 字符
    chunkOverlap: 50            // 重叠 50 字符，保持上下文连贯
  });

  let totalInserted = 0;

  // 3. 逐章节处理
  for (let chapterIndex = 0; chapterIndex < documents.length; chapterIndex++) {
    const chapter = documents[chapterIndex];
    const chunks = await textsplitters.splitText(chapter.pageContent);

    if (chunks.length === 0) continue;  // 跳过空章节

    // 4. 批量插入数据库
    const insertedCount = await insertChunksBatch(chunks, bookId, chapterIndex + 1);
    totalInserted += insertedCount;
  }

  return totalInserted;
}
```

**⚙️ 分块策略**：
- **chunkSize = 500**：每个文本块约 500 字符
- **chunkOverlap = 50**：相邻块重叠 50 字符，避免语义断裂

### 💾 批量插入数据库

```javascript
async function insertChunksBatch(chunks, bookId, chapterNum) {
  // 并行生成所有分块的向量
  const insertData = await Promise.all(
    chunks.map(async (chunk, chunkIndex) => {
      const vector = await getEmbedding(chunk);  // 文本 → 向量
      return {
        id: `${bookId}_${chapterNum}_${chunkIndex}`,
        book_id: bookId,
        book_name: BOOK_NAME,
        chapter_num: chapterNum,
        index: chunkIndex,
        content: chunk,
        vector: vector
      };
    })
  );

  // 批量插入 Milvus
  const insertResult = await client.insert({
    collection_name: COLLECTION_NAME,
    data: insertData
  });

  return Number(insertResult.insert_cnt) || 0;
}
```

**💡 性能优化**：
- 使用 `Promise.all` 并行调用 Embedding API
- 一次性批量插入，减少数据库交互次数

### 🏁 主函数入口

```javascript
const main = async () => {
  console.log('='.repeat(80));
  console.log('电子书处理程序');
  console.log('='.repeat(80));

  // 连接 Milvus
  await client.connectPromise;
  console.log('已连接');

  const bookId = 1;

  // 确保集合已创建并加载
  await ensureCollection(bookId);

  // 加载 EPUB → 分块 → 向量化 → 存储
  await loadAndProcessEPubStreaming(bookId);
};

main().catch(err => console.error(err));
```

**🔄 处理流程**：

```
EPUB文件
   │
   ▼
┌──────────────────┐
│ EPubLoader.load() │  按章节拆分
└──────────────────┘
   │
   ▼
┌──────────────────────────────┐
│ RecursiveCharacterTextSplitter│  每章再分块
└──────────────────────────────┘
   │
   ▼
┌──────────────────┐
│ getEmbedding()   │  文本 → 1024维向量
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ client.insert()  │  存入 Milvus
└──────────────────┘
```

---

## 🔍 模块二：query.mjs —— 向量检索测试

> **核心职责**：验证向量检索功能，测试相似度搜索

### 🔧 初始化配置

```javascript
import { MilvusClient, MetricType, IndexType, DataType } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from '@langchain/openai';

const COLLECTION_NAME = 'ebook2';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
});

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
});

const getEmbedding = async (text) => {
  return await embeddings.embedQuery(text);
};
```

### 🔎 执行向量搜索

```javascript
async function main() {
  // 1. 连接并加载集合
  await client.connectPromise;
  await client.loadCollection({ collection_name: COLLECTION_NAME });

  // 2. 准备查询
  const query = '段誉会什么武功?';
  const queryVector = await getEmbedding(query);  // 查询文本 → 向量

  // 3. 执行向量搜索
  const searchResult = await client.search({
    collection_name: COLLECTION_NAME,
    vector: queryVector,           // 查询向量
    limit: 3,                      // 返回 Top 3 结果
    metric_type: MetricType.COSINE, // 余弦相似度
    output_fields: ["id", "book_id", "chapter_num", "index", "content"]
  });

  // 4. 格式化输出结果
  searchResult.results.forEach((item, index) => {
    console.log(`
    ${index + 1}.[Score:${item.score.toFixed(4)}]
    ID: ${item.id}
    BookId: ${item.book_id}
    Content: ${item.content}
    `);
  });
}
```

**📊 搜索结果示例**：

```
1.[Score:0.8923]
ID: 1_5_12
BookId: 1
Content: 段誉身具"北冥神功"，能够吸取他人内力...

2.[Score:0.8567]
ID: 1_8_3
BookId: 1
Content: 段誉又学会了"凌波微步"，身形飘忽不定...

3.[Score:0.8234]
ID: 1_12_7
BookId: 1
Content: "六脉神剑"乃是大理段氏的至高武学...
```

**🧮 相似度评分说明**：
- **Score 范围**：0 ~ 1（余弦相似度）
- **越接近 1**：语义越相似
- **COSINE 指标**：计算向量夹角的余弦值

---

## 🤖 模块三：rag.mjs —— RAG 智能问答

> **核心职责**：结合检索结果与 LLM，生成准确、详细的回答

### 🔧 完整初始化

```javascript
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

// Embedding 模型
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
});

// LLM 对话模型
const model = new ChatOpenAI({
  temperature: 0.1,           // 低温度，更确定性的回答
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: { baseURL: process.env.OPENAI_BASE_URL }
});

// Milvus 客户端
const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
});
```

**🌡️ temperature 参数**：
- **0.1**：接近确定性输出，适合事实性问答
- **0.7 ~ 1.0**：更有创造性，适合创意写作

### 🔍 核心函数：retrieveRelevantContent

```javascript
/**
 * 从向量数据库中检索相关内容
 * @param {string} question - 用户问题
 * @param {number} k - 返回结果数量（默认 3）
 * @returns {Array} 检索结果列表
 */
async function retrieveRelevantContent(question, k = 3) {
  try {
    // 1. 将问题转换为向量
    const queryVector = await getEmbedding(question);

    // 2. 执行向量搜索
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      metric_type: MetricType.COSINE,
      limit: k,
      output_fields: [
        'id', 'book_id', 'book_name',
        'chapter_num', 'index', 'content'
      ]
    });

    return searchResult.results;
  } catch (err) {
    console.error('检索相关内容时出错');
    return [];
  }
}
```

**📌 函数设计原则**：
- **单一职责**：只负责检索，不处理生成
- **可配置**：`k` 参数控制返回数量
- **健壮性**：异常时返回空数组

### 🤖 核心函数：answerEbookQuestion

```javascript
/**
 * 基于 RAG 回答电子书相关问题
 * @param {string} question - 用户问题
 * @param {number} k - 检索结果数量（默认 3）
 * @returns {string} LLM 生成的回答
 */
async function answerEbookQuestion(question, k = 3) {
  // 1. 检索相关内容
  const retrievedContent = await retrieveRelevantContent(question, k);

  if (retrievedContent.length === 0) {
    return '抱歉,我没有找到相关的《天龙八部》内容。';
  }

  // 2. 构建上下文
  const context = retrievedContent.map((item, i) => `
    [片段${i + 1}]
    章节：第${item.chapter_num}章
    内容：${item.content}
  `).join('\n\n----\n\n');

  // 3. 构建 Prompt
  const prompt = `
    你是一个专业的《天龙八部》小说助手。基于小说回答问题，用准确、详细的语言。
    请根据以下小说片段内容回答问题：
    ${context}
    用户问题：${question}

    回答要求：
    1. 如果片段中有相关信息，请结合小说内容给出详细准确的回答。
    2. 可以综合多个片段的内容，提供完整的答案。
    3. 如果片段中没有相关信息，请如实告知用户。
    4. 回答要准确，符合小说的情节和人物设定
    5. 可以引用原文内容来支持你的回答。
    AI 助手的回答：
  `;

  // 4. 调用 LLM 生成回答
  const response = await model.invoke(prompt);
  return response.content;
}
```

**📝 Prompt 设计要点**：
1. **角色设定**：专业的《天龙八部》小说助手
2. **上下文注入**：将检索结果格式化后嵌入 Prompt
3. **回答规范**：5 条明确的指令约束
4. **引用要求**：鼓励引用原文增强可信度

### 🏁 主函数入口

```javascript
async function main() {
  // 1. 连接 Milvus
  await client.connectPromise;
  console.log('连接成功');

  // 2. 加载集合
  await client.loadCollection({ collection_name: COLLECTION_NAME });
  console.log('集合加载成功');

  // 3. 提问并获取回答
  const result = await answerEbookQuestion('鸠摩智会什么武功？', 5);
  console.log(result);
}

main().catch((err) => console.error('error:', err));
```

**🎯 调用示例**：

```
问题：鸠摩智会什么武功？

回答：鸠摩智是吐蕃国师，精通多种绝学：

1. **火焰刀法**：鸠摩智的成名绝技，以深厚内力催动...
2. **小无相功**：逍遥派绝学，鸠摩智曾偷学...
3. **少林七十二绝技**：鸠摩智凭借小无相功催动...

（根据检索到的片段综合回答）
```

---

## 🔄 完整 RAG 流程图

```
                        ┌─────────────────────────────────────┐
                        │           用户提问                   │
                        │    "鸠摩智会什么武功？"              │
                        └──────────────┬──────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ① 文本向量化 (Embedding)         │
                        │     getEmbedding(question)           │
                        └──────────────┬───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ② 向量相似度检索                  │
                        │     client.search()                  │
                        │     metric: COSINE, limit: k         │
                        └──────────────┬───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ③ 获取 Top-K 相关片段             │
                        │     retrieveRelevantContent()        │
                        └──────────────┬───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ④ 构建 Prompt                    │
                        │     注入上下文 + 用户问题              │
                        └──────────────┬───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ⑤ LLM 生成回答                   │
                        │     model.invoke(prompt)             │
                        └──────────────┬───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────────────┐
                        │     ⑥ 返回最终答案                    │
                        │     "鸠摩智精通火焰刀法..."           │
                        └──────────────────────────────────────┘
```

---

## 🧠 核心概念解析

### 📐 什么是 Embedding？

```
"段誉会什么武功?"
        │
        ▼
┌─────────────────────────────────────┐
│        Embedding Model              │
│    (text-embedding-3-small)         │
└─────────────────────────────────────┘
        │
        ▼
[0.023, -0.156, 0.089, ..., 0.234]   ← 1024 维浮点数组
```

- **输入**：任意长度的文本
- **输出**：固定长度的浮点数组（向量）
- **特性**：语义相似的文本，向量距离更近

### 📏 什么是余弦相似度？

```
向量 A: [0.1, 0.3, 0.5]
向量 B: [0.2, 0.4, 0.6]

余弦相似度 = (A · B) / (|A| × |B|)
         = cos(θ)
         ≈ 0.98 (非常相似)
```

- **范围**：-1 到 1
- **1**：完全相同方向（语义一致）
- **0**：正交（无关）
- **-1**：完全相反

### 🔗 RAG vs 纯 LLM

| 对比项 | 纯 LLM | RAG |
|--------|--------|-----|
| 知识来源 | 训练数据（可能过时） | 实时检索（最新数据） |
| 准确性 | 可能产生幻觉 | 基于真实文档 |
| 可追溯性 | 无法验证 | 可引用原文 |
| 领域知识 | 通用但浅显 | 深度垂直领域 |

---

## ⚙️ 环境配置

### .env 文件

```bash
# Milvus 配置
MILVUS_ADDRESS=https://your-milvus-instance.zillizcloud.com
MILVUS_TOKEN=your-milvus-token

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 模型配置
EMBEDDINGS_MODEL_NAME=text-embedding-3-small
MODEL_NAME=gpt-4o-mini
```

### 🚀 运行步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 数据入库（首次运行）
node src/main.mjs

# 3. 测试检索
node src/query.mjs

# 4. RAG 问答
node src/rag.mjs
```

---

## 💡 最佳实践

### ✅ 代码设计原则

1. **单一职责**：每个函数只做一件事
2. **函数命名可读**：`retrieveRelevantContent` 清晰表达意图
3. **单一返回值**：函数只返回一种类型的数据
4. **错误处理**：try-catch 包裹，返回安全的默认值

### ⚠️ 注意事项

1. **向量维度一致**：Embedding 模型输出维度必须与 Milvus 字段定义匹配
2. **索引创建时机**：必须在插入数据前创建索引
3. **集合加载**：每次查询前需要 `loadCollection`
4. **API 限流**：并行调用 Embedding API 时注意速率限制

---

## 🎯 总结

通过本项目，我们完整实现了 RAG 的三大核心流程：

| 阶段 | 文件 | 功能 |
|------|------|------|
| **数据入库** | `main.mjs` | EPUB → 分块 → 向量化 → Milvus |
| **向量检索** | `query.mjs` | 查询文本 → 向量 → 相似度搜索 |
| **智能问答** | `rag.mjs` | 检索 + Prompt + LLM → 回答 |

> **"侠之大者，为国为民"** —— RAG 技术让 AI 真正成为领域专家的得力助手！

---

*📝 本教程基于 LangChain + Milvus + OpenAI 构建，代码简洁清晰，适合入门学习 RAG 技术。*
