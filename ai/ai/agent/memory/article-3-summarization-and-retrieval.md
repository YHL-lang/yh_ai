# 🧠 Agent 记忆进阶：总结压缩与向量检索 —— 从截断到 Milvus 长期记忆

> 前两篇我们实现了 **内存记忆**、**文件持久化** 和 **上下文截断**。但截断有个致命问题 —— 直接丢掉老消息，重要的上下文可能就这样"失忆"了。
>
> 本文将带你实现两条进阶路线：用 **LLM 总结** 保留关键信息，用 **Milvus 向量数据库** 实现语义级别的长期记忆 —— 让 Agent 从"选择性失忆"进化到"过目不忘"。

---

## 📌 本文你将学到

- ✅ 总结压缩（Summarization）的两种触发策略：按消息数量 & 按 Token 数量
- ✅ `getBufferString` 将消息数组转为字符串用于总结
- ✅ Milvus 向量数据库的 Docker 部署与核心概念
- ✅ 用 Embedding 将对话向量化并存入 Milvus
- ✅ 基于语义相似度检索历史对话，实现"长期记忆"

---

## 🗺️ 全景知识地图

```
┌────────────────────────────────────────────────────────────────┐
│                    Agent Memory 管理策略                         │
│                                                                │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│   │  截断     │   │  总结     │   │  文件     │   │  向量检索  │  │
│   │Truncation│   │Summarize │   │  File    │   │ Retrieval │  │
│   │          │   │          │   │          │   │           │  │
│   │ slice(-4)│   │ LLM 摘要  │   │ JSON 落盘│   │ Embedding │  │
│   │trimMsg   │   │ getBuffer│   │ 持久化   │   │ + Milvus  │  │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘   └─────┬─────┘  │
│        │              │              │               │         │
│        └────── 丢弃老消息 ──── 保留关键信息 ────── 语义召回 ──┘   │
│                                                                │
│  本文重点 ▲▲▲                    本文重点 ▲▲▲                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 项目结构

```
demo/
├── .env
├── package.json
└── src/
    ├── history-test.mjs              # ① 内存记忆
    ├── history-test2.mjs             # ② 文件记忆
    ├── history-test3.mjs             # ③ 文件记忆恢复
    └── memory/
        ├── truncation-memory.mjs     # ④ 上下文截断（上篇）
        ├── summarization-memory.mjs  # ⑤ 总结压缩（按消息数）  ⬅️ 本文
        ├── summarization-memory2.mjs # ⑥ 总结压缩（按Token数） ⬅️ 本文
        ├── insert-conversations.mjs  # ⑦ 向Milvus写入对话     ⬅️ 本文
        └── retrieval-memory.mjs      # ⑧ 从Milvus检索记忆     ⬅️ 本文

milvus/
└── milvus-standalone-docker-compose.yml  # Milvus Docker 部署 ⬅️ 本文
```

**新增依赖：**

```json
{
  "@zilliz/milvus2-sdk-node": "^2.x",   // Milvus Node.js SDK
  "@langchain/openai": "^1.5.11",        // OpenAI Embeddings
  "js-tiktoken": "^1.0.21"               // Token 精确计算
}
```

---

## 一、🗜️ 总结压缩（Summarization）：让老消息"浓缩"而不是"消失"

### 截断的问题

上一篇的截断策略用 `slice(-4)` 直接丢掉老消息，简单粗暴但有副作用：

```
原始 8 条消息：
  [1] 我叫李四          ← 被丢弃 ❌  （名字没了...）
  [2] 你好李四...        ← 被丢弃 ❌
  [3] 我是一名设计师      ← 被丢弃 ❌  （职业没了...）
  [4] 设计师很有创造力...  ← 被丢弃 ❌
  [5] 我喜欢艺术和音乐    ← 保留 ✅
  [6] 艺术和音乐...      ← 保留 ✅
  [7] 我擅长 UI/UX 设计   ← 保留 ✅
  [8] UI/UX 设计非常重要！ ← 保留 ✅

结果：模型不记得用户叫"李四"、是"设计师"了 😵
```

### 总结的思路

> 💡 **核心思想**：不直接丢弃老消息，而是用 LLM 把它们 **压缩成一段摘要**，再和最近的消息组合在一起。

```
原始 8 条消息
    │
    ├── 最近 2 条 → 直接保留
    │
    └── 较早 6 条 → LLM 总结压缩 → 1 条摘要消息

最终上下文 = [摘要] + [最近2条]  → 既省 token，又不丢关键信息 ✅
```

---

## 二、📝 策略一：按消息数量触发总结

> 消息数超过阈值 → 分离老消息和新消息 → LLM 总结老消息 → 清空历史 → 重新组装

### 核心流程

```
                    ┌─ allMessages.length > maxMessages?
                    │
                    │  YES                          NO
                    ↓                               ↓
        ┌───────────────────────┐          正常对话，不总结
        │ messagesToSummarize   │
        │ = allMessages.slice(  │
        │     0, -keepRecent)  │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  getBufferString()    │  ← 消息数组 → 字符串
        │  → LLM 总结           │  ← 调用模型生成摘要
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  history.clear()      │  ← 清空旧历史
        │  + RecentMessages     │  ← 加回最近消息
        │  + Summary(AIMessage) │  ← 加入摘要
        └───────────────────────┘
```

### 代码实现

**第一步：搭建总结函数**

```js
import { getBufferString } from '@langchain/core/messages'
import { SystemMessage } from '@langchain/core/messages'

async function summarizeHistory(messages) {
  if (messages.length === 0) return ''

  // ✅ 关键工具：将消息对象数组转为可读的字符串
  const conversationText = getBufferString(messages, "用户", "助手")

  const summaryPrompt = `请总结以下对话的核心内容，保留重要信息：
  ${conversationText}
  总结：`

  const summaryResponse = await model.invoke([new SystemMessage(summaryPrompt)])
  return summaryResponse.content
}
```

> 🔑 **`getBufferString`** 是 LangChain 提供的工具函数，将 `Message` 对象数组转成格式化的字符串，比如：
>
> ```
> 用户: 我叫李四
> 助手: 你好李四，很高兴认识你！
> 用户: 我是一名设计师
> ```
>
> 这样 LLM 才能读懂并总结。

**第二步：触发总结并重组历史**

```js
async function summarizationDemo() {
  const history = new InMemoryChatMessageHistory()
  const maxMessages = 6     // 超过 6 条就触发总结
  const keepRecent = 2      // 保留最近 2 条原始消息

  // ... 先添加 8 条消息（省略）...

  let allMessages = await history.getMessages()

  if (allMessages.length > maxMessages) {
    // ① 分离：哪些要总结，哪些要保留
    const recentMessages = allMessages.slice(-keepRecent)       // 最后 2 条
    const messagesToSummarize = allMessages.slice(0, -keepRecent) // 前 6 条

    // ② 用 LLM 总结老消息
    const summary = await summarizeHistory(messagesToSummarize)

    // ③ 清空历史，重新组装
    await history.clear()
    for (const msg of recentMessages) {
      await history.addMessage(msg)     // 加回最近消息
    }
    await history.addMessage(new AIMessage(summary))  // 加入摘要

    // ④ 查看结果
    const newMessages = await history.getMessages()
    for (let msg of newMessages) {
      console.log(`${msg.constructor.name}: ${msg.content}`)
    }
  }
}
```

### 输出效果

```
原始消息数量：8
原始信息：
  HumanMessage: 我叫李四
  AIMessage: 你好李四，很高兴认识你！
  HumanMessage: 我是一名设计师
  AIMessage: 设计师是个很有创造力的职业！...
  HumanMessage: 我喜欢艺术和音乐
  AIMessage: 艺术和音乐都是很好的爱好...
  HumanMessage: 我擅长 UI/UX 设计
  AIMessage: UI/UX 设计非常重要...

历史消息过多，开始总结...
将被总结的消息数量：6

总结结果：用户叫李四，是一名设计师，主要做UI/UX设计，喜欢艺术和音乐。

重组后的 3 条消息：
  HumanMessage: 我擅长 UI/UX 设计
  AIMessage: UI/UX 设计非常重要...
  AIMessage: 用户叫李四，是一名设计师，主要做UI/UX设计，喜欢艺术和音乐。  ← 摘要
```

> 🎉 8 条消息压缩成了 3 条，但"李四"、"设计师"、"UI/UX"这些关键信息都保住了！

---

## 三、📊 策略二：按 Token 数量触发总结（生产推荐）

> 按消息数量触发不够精确 —— 一条消息可能只有 5 个 token，也可能有 500 个。**生产环境应该按 Token 预算来控制。**

### 和策略一的核心区别

| 维度 | 按消息数量 | 按 Token 数量 |
|:---:|:---:|:---:|
| 触发条件 | `messages.length > N` | `totalTokens > maxTokens` |
| 保留方式 | 保留最近 N 条消息 | 保留最近 N 个 token 的消息 |
| 精确度 | ⭐ 粗略 | ⭐⭐⭐ 精确 |
| 适用场景 | 快速原型 | 生产环境 |

### Token 精确计算

```js
import { getEncoding } from 'js-tiktoken'

function countTokens(messages, encoder) {
  let total = 0
  for (const msg of messages) {
    const content = typeof msg.content === 'string'
      ? msg.content
      : JSON.stringify(msg.content)
    total += encoder.encode(content).length
  }
  return total
}
```

> 💡 `cl100k_base` 是 GPT 系列模型使用的 BPE 编码器，一个汉字大约 1~2 个 token。

### 保留最近消息的 Token 预算算法

关键区别在这里 —— 不能简单 `slice(-2)`，要 **从后往前累加 token**，直到达到预算上限：

```js
const maxTokens = 200           // 总 token 阈值：超过就触发总结
const keepRecentTokens = 80     // 保留最近消息的 token 预算

if (totalTokens >= maxTokens) {
  // ✅ 从后往前累加，保留尽可能多的"新鲜"消息
  const recentMessages = []
  let recentTokens = 0

  for (let i = allMessages.length - 1; i >= 0; i--) {
    const msg = allMessages[i]
    const content = typeof msg.content === 'string'
      ? msg.content : JSON.stringify(msg.content)
    const msgTokens = encoder.encode(content).length

    if (recentTokens + msgTokens <= keepRecentTokens) {
      recentMessages.unshift(msg)    // 插入到数组头部（保持时间顺序）
      recentTokens += msgTokens
    } else {
      break   // 超出预算，停止
    }
  }

  // 剩余的消息交给 LLM 总结
  const messagesToSummarize = allMessages.slice(
    0, allMessages.length - recentMessages.length
  )
  const summary = await summarizeHistory(messagesToSummarize)

  // 重组
  await history.clear()
  for (const msg of recentMessages) {
    await history.addMessage(msg)
  }
  await history.addMessage(new AIMessage(summary))
}
```

### 算法图解

```
8 条消息，Token 分布如下：
  [1] 我叫李四              (4 tokens)
  [2] 你好李四...            (15 tokens)
  [3] 我是一名设计师          (6 tokens)
  [4] 设计师很有创造力...      (20 tokens)
  [5] 我喜欢艺术和音乐        (8 tokens)
  [6] 艺术和音乐都是好爱好    (12 tokens)
  [7] 我擅长 UI/UX 设计      (9 tokens)
  [8] UI/UX 设计非常重要！    (10 tokens)

keepRecentTokens = 80

从后往前累加：
  ← [8] 10 tokens  (累计 10) ✅
  ← [7] 9 tokens   (累计 19) ✅
  ← [6] 12 tokens  (累计 31) ✅
  ← [5] 8 tokens   (累计 39) ✅
  ← [4] 20 tokens  (累计 59) ✅
  ← [3] 6 tokens   (累计 65) ✅
  ← [2] 15 tokens  (累计 80) ✅ 刚好到预算
  ← [1] 4 tokens   (累计 84) ❌ 超了，停！

保留：[2]~[8] 共 7 条
总结：[1] "我叫李四" → 压缩进摘要
```

> 💡 这就是 `/compact` 命令的实现原理 —— Claude Code 里执行 `/compact` 时，做的事情和我们这里一模一样：总结老消息 + 保留最近上下文。

---

## 四、🔁 总结策略的完整心智模型

```
┌──────────────────────────────────────────────────────┐
│              总结压缩的完整工作流                        │
│                                                      │
│  用户新消息                                           │
│     ↓                                                │
│  检测 Token / 消息数 是否超阈值？                       │
│     │                                                │
│     ├── NO → 正常对话                                 │
│     │                                                │
│     └── YES → 触发总结流程                             │
│           │                                          │
│           ├── 1. 分离：最近消息 vs 老消息               │
│           ├── 2. getBufferString() → 字符串           │
│           ├── 3. LLM 总结 → 摘要                      │
│           ├── 4. history.clear()                     │
│           └── 5. 重新组装：[最近消息] + [摘要]          │
│                      ↓                               │
│               model.invoke(重组后的消息)               │
└──────────────────────────────────────────────────────┘
```

---

## 五、🚀 进入向量世界：Milvus 部署

> 总结压缩解决了"保留关键信息"的问题，但它仍然是 **全量拼接** —— 所有摘要 + 最近消息都会塞进 prompt。
>
> 当历史对话有 **成百上千轮** 时，你需要的是 **按需检索** —— 只把和当前问题相关的历史找出来。

### 5.1 为什么选 Milvus？

| 向量数据库 | 特点 | 部署方式 |
|:---:|:---|:---|
| **Milvus** | 开源、高性能、支持十亿级向量 | Docker / K8s / 云服务 |
| Pinecone | 全托管、零运维 | 纯 SaaS |
| Chroma | 轻量级、适合原型 | 嵌入式 / Docker |

Milvus 是最流行的开源向量数据库，支持多种索引类型，性能强劲，社区活跃。

### 5.2 Docker 一键部署

创建 `milvus-standalone-docker-compose.yml`：

```yaml
version: '3.5'

services:
  # ① etcd：元数据存储
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.25
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://etcd:2379
              -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd

  # ② MinIO：对象存储（存放向量数据）
  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-05-28T17-19-04Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"    # MinIO 控制台
      - "9000:9000"    # MinIO API
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"

  # ③ Milvus Standalone：向量数据库本体
  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v3.0.0
    command: ["milvus", "run", "standalone"]
    environment:
      MINIO_REGION: us-east-1
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    ports:
      - "19530:19530"  # Milvus gRPC 端口 ⬅️ SDK 连这个
      - "9091:9091"    # 健康检查端口
    depends_on:
      - "etcd"
      - "minio"

networks:
  default:
    name: milvus
```

**启动命令：**

```bash
docker-compose -f milvus-standalone-docker-compose.yml up -d
```

### 5.3 架构三件套

```
┌─────────────────────────────────────────────┐
│               Milvus Standalone              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  etcd    │  │  MinIO   │  │  Milvus  │  │
│  │          │  │          │  │  Engine  │  │
│  │ 元数据    │  │ 对象存储  │  │ 向量索引  │  │
│  │ 集合定义  │  │ 向量数据  │  │ 检索引擎  │  │
│  │ 索引配置  │  │ 原始数据  │  │ 查询处理  │  │
│  │          │  │          │  │          │  │
│  │ :2379    │  │ :9000    │  │ :19530   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  SDK 连接 → localhost:19530                  │
└─────────────────────────────────────────────┘
```

---

## 六、📥 写入 Milvus：对话向量化存储

> 把每轮对话变成一个 **向量**，存进 Milvus，为后续的语义检索做准备。

### 6.1 核心概念

| 概念 | 类比 SQL | 说明 |
|:---:|:---:|:---|
| Collection | 表（Table） | 存储同类数据的容器 |
| Field | 列（Column） | 数据字段 |
| Vector | - | 高维浮点数组，由 Embedding 模型生成 |
| Index | 索引 | 加速向量检索（如 IVF_FLAT） |
| Metric | - | 相似度度量方式（余弦、欧氏等） |

### 6.2 初始化 SDK 和 Embedding

```js
import { MilvusClient, DataType, MetricType, IndexType } from '@zilliz/milvus2-sdk-node'
import { OpenAIEmbeddings } from '@langchain/openai'

const VECTOR_DIM = 1024  // 向量维度（取决于 Embedding 模型）

// Embedding 模型：把文本变成 1024 维的浮点向量
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-v3',
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: VECTOR_DIM
})

async function getEmbedding(text) {
  return await embeddings.embedQuery(text)
}

// 连接 Milvus（默认端口 19530）
const client = new MilvusClient({ address: 'localhost:19530' })
```

### 6.3 创建 Collection（建表）

```js
const COLLECTION_NAME = 'conversations'

await client.createCollection({
  collection_name: COLLECTION_NAME,
  fields: [
    // 主键：用字符串类型的唯一 ID（比自增 ID 更安全）
    { name: 'id',        data_type: DataType.VarChar, max_length: 50, is_primary_key: true },
    // 向量字段：1024 维浮点数组
    { name: 'vector',    data_type: DataType.FloatVector, dim: VECTOR_DIM },
    // 对话内容：原文存储
    { name: 'content',   data_type: DataType.VarChar, max_length: 5000 },
    // 对话轮次
    { name: 'round',     data_type: DataType.Int64 },
    // 时间戳（Milvus 没有 DateTime 类型，用字符串存储）
    { name: 'timestamp', data_type: DataType.VarChar, max_length: 100 }
  ]
})
```

**Collection 结构可视化：**

```
conversations (Collection)
┌────────────────────────────────────────────────────────────┐
│  id (VarChar)    │ vector (FloatVector[1024])              │
│  content (VarChar)│ round (Int64) │ timestamp (VarChar)    │
├──────────────────┼─────────────────────────────────────────┤
│  "conv_001"      │ [0.012, -0.034, 0.089, ...]            │
│  "用户：我叫赵六   │  1   │ "2025-06-11T..."                │
│   助手：很高兴..." │     │                                  │
├──────────────────┼─────────────────────────────────────────┤
│  "conv_002"      │ [0.045, 0.023, -0.067, ...]            │
│  "用户：最近在研究 │  2   │ "2025-06-11T..."                │
│   机器学习..."    │     │                                  │
└──────────────────┴─────────────────────────────────────────┘
```

### 6.4 创建索引 & 加载集合

```js
// 为向量字段创建 IVF_FLAT 索引（用余弦相似度度量）
await client.createIndex({
  collection_name: COLLECTION_NAME,
  field_name: 'vector',
  index_type: IndexType.IVF_FLAT,   // 倒排索引 + 平面量化
  metric_type: MetricType.COSINE     // 余弦相似度
})

// 将 Collection 加载到内存（检索前必须执行）
await client.loadCollection({ collection_name: COLLECTION_NAME })
```

> 💡 **IVF_FLAT** 是 Milvus 中最常用的索引类型：先把向量空间分成若干簇（聚类），检索时只在最相似的几个簇里搜索，兼顾速度和精度。类似图书馆的"分类 → 找书架 → 找书"的过程。

### 6.5 向量化对话并写入

```js
const conversations = [
  {
    id: 'conv_001',
    content: '用户：我叫赵六，是一名数据科学家\n助手：很高兴认识你，赵六！',
    round: 1,
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv_002',
    content: '用户：我最近在研究机器学习算法\n助手：机器学习确实很有意思！',
    round: 2,
    timestamp: new Date().toISOString()
  },
  // ... 更多对话
]

// ✅ 关键：每条对话 → Embedding 向量化 → 批量写入
const conversationData = await Promise.all(
  conversations.map(async (conv) => ({
    ...conv,
    vector: await getEmbedding(conv.content)  // 文本 → [0.012, -0.034, ...]
  }))
)

await client.insert({
  collection_name: COLLECTION_NAME,
  data: conversationData
})
```

**写入流程图解：**

```
"用户：我叫赵六，是数据科学家  助手：很高兴认识你..."
    │
    ↓  getEmbedding()
    │
[0.012, -0.034, 0.089, -0.021, ..., 0.056]   ← 1024 维向量
    │
    ↓  client.insert()
    │
┌──────────────────────────────────────┐
│  Milvus: conversations               │
│                                      │
│  id: "conv_001"                      │
│  vector: [0.012, -0.034, ...]       │
│  content: "用户：我叫赵六..."         │
│  round: 1                            │
│  timestamp: "2025-06-11T..."         │
└──────────────────────────────────────┘
```

---

## 七、🔍 从 Milvus 检索：语义级长期记忆

> 这是整个方案最精彩的部分 —— 用户问了一个问题，我们不用把 **所有** 历史塞进 prompt，而是只检索 **最相关** 的几条。

### 7.1 检索函数

```js
async function retrieveRelevantConversations(query, k = 2) {
  // ① 把用户问题向量化
  const queryVector = await getEmbedding(query)

  // ② 在 Milvus 中做相似度搜索
  const searchResult = await client.search({
    collection_name: COLLECTION_NAME,
    vector: queryVector,           // 查询向量
    limit: k,                      // 返回最相似的 k 条
    metric_type: MetricType.COSINE, // 余弦相似度
    output_fields: ['id', 'content', 'round', 'timestamp']
  })

  return searchResult.results
}
```

**检索原理图解：**

```
用户问："我之前提到的机器学习项目进展如何？"
    │
    ↓  getEmbedding()
    │
查询向量：[0.034, -0.012, 0.067, ...]
    │
    ↓  Milvus COSINE 相似度搜索
    │
    ├── conv_001 "我叫赵六，是数据科学家..."  → 相似度: 0.72  ✅
    ├── conv_002 "我最近在研究机器学习算法..." → 相似度: 0.91  ✅ 最相关！
    ├── conv_003 "我喜欢打篮球和看电影..."     → 相似度: 0.31
    └── conv_005 "我的职业是软件工程师..."     → 相似度: 0.58

返回 Top 2：conv_002 + conv_001（和机器学习最相关的两条）
```

> 🎯 **注意**：用户问的是"机器学习项目"，Milvus 自动找到语义最相关的对话，即使措辞完全不同！这就是向量检索和关键词搜索的本质区别。

### 7.2 完整的检索 + 对话 + 存储循环

```js
async function retrievalMemoryDemo() {
  // 连接 Milvus
  await client.connectPromise

  const history = new InMemoryChatMessageHistory()
  const input = "我之前提到的机器学习项目进展如何?"

  console.log(`用户：${input}`)

  // ======== ① 从 Milvus 检索相关历史 ========
  console.log('\n[检索相关历史对话]')
  const retrievedConversations = await retrieveRelevantConversations(input, 2)

  let relevantHistory = ''
  if (retrievedConversations.length > 0) {
    relevantHistory = retrievedConversations
      .map((conv, idx) => `[历史对话 ${idx + 1}]\n轮次：${conv.round}\n${conv.content}`)
      .join('\n\n------\n\n')
  }

  // ======== ② 拼接上下文：检索结果 + 用户问题 ========
  const contextMessage = [
    new HumanMessage(`相关历史对话：\n${relevantHistory}\n\n用户问题：${input}`)
  ]

  // ======== ③ 调用 LLM 回答 ========
  const response = await model.invoke(contextMessage)
  console.log(response.content)

  // ======== ④ 本轮对话写入 Milvus（为未来检索做准备） ========
  await history.addMessage(new HumanMessage(input))
  await history.addMessage(response)

  const conversationText = `用户：${input}\n 助手：${response.content}`
  const convId = `conv_${Date.now()}_1`  // 唯一 ID

  await client.insert({
    collection_name: COLLECTION_NAME,
    data: [{
      id: convId,
      vector: await getEmbedding(conversationText),
      content: conversationText,
      round: 1,
      timestamp: new Date().toISOString()
    }]
  })
}
```

### 7.3 完整循环图解

```
┌──────────────────────────────────────────────────────────┐
│           Retrieval Memory 完整工作流                      │
│                                                          │
│  用户问题："我之前提到的机器学习项目进展如何？"              │
│       │                                                  │
│       ↓                                                  │
│  ┌─────────────────┐                                     │
│  │ 1. Embedding    │  问题 → 向量                         │
│  └────────┬────────┘                                     │
│           ↓                                              │
│  ┌─────────────────┐                                     │
│  │ 2. Milvus 检索  │  找到 Top-K 相关历史对话              │
│  └────────┬────────┘                                     │
│           ↓                                              │
│  ┌─────────────────┐                                     │
│  │ 3. 拼接 Context │  [相关历史] + [用户问题] → prompt     │
│  └────────┬────────┘                                     │
│           ↓                                              │
│  ┌─────────────────┐                                     │
│  │ 4. LLM 回答     │  基于相关上下文生成回复                │
│  └────────┬────────┘                                     │
│           ↓                                              │
│  ┌─────────────────┐                                     │
│  │ 5. 存入 Milvus  │  本轮对话向量化后写回数据库            │
│  └─────────────────┘     （为下一次检索做准备）             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

> 🔁 每次对话都是一次 **"检索 → 回答 → 存储"** 的闭环，Agent 的记忆随对话不断积累。

---

## 八、⚖️ 三种 Memory 策略终极对比

| 维度 | 截断（Truncation） | 总结（Summary） | 向量检索（Retrieval） |
|:---:|:---:|:---:|:---:|
| 核心思路 | 丢掉老消息 | 压缩老消息 | 检索相关消息 |
| Token 开销 | ⚡ 最低 | 🔥 需要额外 LLM 调用 | 🔥 需要 Embedding 调用 |
| 信息保留 | ❌ 丢失 | ✅ 关键信息保留 | ✅ 语义级别保留 |
| 实现复杂度 | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| 依赖 | 无 | LLM API | 向量数据库 + Embedding |
| 适合场景 | 短对话 | 中长对话 | 超长记忆、知识库 |
| 生产推荐 | 🟡 快速原型 | 🟢 中型应用 | 🟢 大型应用 |

### 如何选型？

```
你的对话有多长？
    │
    ├── < 10 轮 → 截断就够了（slice / trimMessages）
    │
    ├── 10~50 轮 → 总结压缩（每 N 条触发一次 Summary）
    │
    ├── 50~500 轮 → 总结 + 向量检索混合
    │
    └── 知识库 / 超长记忆 → 纯向量检索（Milvus / Pinecone）
```

---

## 九、🏗️ 生产级架构：三种策略组合使用

在实际的 Agent 应用中，三种策略往往 **组合使用**：

```
┌─────────────────────────────────────────────────┐
│              生产级 Memory 架构                    │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  Layer 1: 临时记忆（Working Memory）  │        │
│  │  最近 4~6 条消息，直接拼入 prompt      │        │
│  │  策略：截断（slice）                  │        │
│  └──────────────────┬──────────────────┘        │
│                     │                            │
│  ┌──────────────────▼──────────────────┐        │
│  │  Layer 2: 短期记忆（Summary）         │        │
│  │  每 20 条消息触发一次总结              │        │
│  │  摘要存入 Milvus                     │        │
│  │  策略：Summarization                 │        │
│  └──────────────────┬──────────────────┘        │
│                     │                            │
│  ┌──────────────────▼──────────────────┐        │
│  │  Layer 3: 长期记忆（Vector DB）       │        │
│  │  所有历史对话的向量存储                │        │
│  │  按语义相似度检索 Top-K 放入 prompt    │        │
│  │  策略：Retrieval (Milvus)             │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  prompt = SystemMsg + Summary + Retrieved       │
│           + RecentHistory + UserMsg             │
└─────────────────────────────────────────────────┘
```

> 🏆 **Claude Code 的 `/compact` 命令** 就是 Layer 2 的实践；而 RAG（检索增强生成）则是 Layer 3 的应用。理解了这三层架构，你就理解了 Agent Memory 的全貌。

---

## 🎯 总结

本文通过 **四个实战示例**，覆盖了从总结压缩到向量检索的完整进阶路线：

| 示例 | 文件 | 核心知识点 |
|:---:|:---:|:---|
| ⑤ 总结（按消息数） | `summarization-memory.mjs` | `getBufferString` + LLM 摘要 + 历史重组 |
| ⑥ 总结（按Token数） | `summarization-memory2.mjs` | Token 精确计算 + 预算算法 + 触发阈值 |
| ⑦ 写入 Milvus | `insert-conversations.mjs` | Collection 创建 + Embedding 向量化 + 索引 |
| ⑧ 从 Milvus 检索 | `retrieval-memory.mjs` | 语义搜索 + 上下文拼接 + 闭环存储 |

**三句话记住全文核心**：

> 📝 **截断**是"选择性失忆" —— 直接忘掉老的，简单但丢失信息
>
> 📝 **总结**是"写读书笔记" —— 用 LLM 把老消息压缩成摘要
>
> 📝 **向量检索**是"图书馆找书" —— 按语义相似度精准召回相关历史

三种策略从简到繁，从粗到精，对应着 Agent Memory 从 Demo 到生产的完整演进路径。理解了这个体系，你就掌握了 AI Agent 记忆管理的核心知识。

