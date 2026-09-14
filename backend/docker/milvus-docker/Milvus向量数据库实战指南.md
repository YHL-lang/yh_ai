# 🧭 Milvus 向量数据库实战指南：从 Docker 部署到 AI 日记语义搜索

> 📖 本文将带你从零开始，使用 Docker Compose 部署 Milvus 向量数据库，并结合 OpenAI Embeddings 实现一个"AI 日记"语义搜索 Demo。

---

## 一、❓ 为什么需要向量数据库？

传统数据库（MySQL、MongoDB）擅长精确匹配查询，比如"查找日期为 2026-01-10 的日记"。但当我们想查询**语义相近**的内容时，比如：

> "我想找关于**户外活动**的日记"

传统数据库就无能为力了——它无法理解"爬山""散步""公园"都属于"户外活动"的范畴。

**向量数据库**正是为解决这类问题而生。它的核心原理是：

1. 🔡 将文本通过 Embedding 模型转化为**高维向量**（一组浮点数）
2. 💾 存储这些向量到数据库
3. 🔍 查询时，同样将查询文本转为向量，通过**余弦相似度**等算法找到最相近的结果

> 💡 这就是**语义搜索**（Semantic Search）的本质。

---

## 二、🚀 Milvus 是什么？

[Milvus](https://milvus.io/) 是由 Zilliz 公司推出的**开源向量数据库**，专为大规模向量相似度搜索而设计。它的核心优势：

| 特性 | 说明 |
|------|------|
| ⚡ **高性能** | 支持十亿级向量的毫秒级搜索 |
| 🧩 **多种索引** | IVF_FLAT、HNSW、ANNOY 等多种索引算法 |
| ☁️ **云原生** | 原生支持 Kubernetes，天然适合容器化部署 |
| 🌐 **生态丰富** | 提供 Python、Node.js、Java 等多语言 SDK |
| 🔀 **混合查询** | 支持向量搜索 + 标量过滤的混合查询 |

---

## 三、🐳 Docker Compose 一键部署 Milvus

Milvus Standalone 模式由**三个核心服务**组成，通过 `docker-compose.yml` 编排：

```
┌─────────────────────────────────────────────────┐
│              Docker Compose 编排                  │
│                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐  │
│  │   etcd   │   │  MinIO   │   │   Milvus     │  │
│  │ 元数据存储│   │ 对象存储  │   │  Standalone  │  │
│  │          │   │          │   │  (核心引擎)   │  │
│  └──────────┘   └──────────┘   └──────────────┘  │
│       ↑               ↑               ↑           │
│    :2379           :9000           :19530         │
│                   :9001           :9091           │
└─────────────────────────────────────────────────┘
```

### 📋 三个服务各自的职责：

**1️⃣ etcd — 元数据存储**
- 🗂️ 存储 Milvus 的元数据信息（集合定义、索引配置等）
- 🏷️ 基于 CoreOS etcd v3.5.25
- 🛡️ 配置了自动压缩和快照策略，保证数据一致性

**2️⃣ MinIO — 对象存储**
- 📦 存储实际的向量数据文件和索引文件
- 🔗 兼容 S3 协议的对象存储
- 🌐 暴露 9000（API）和 9001（管理控制台）端口
- 🔑 默认凭证：`minioadmin / minioadmin`

**3️⃣ Milvus Standalone — 核心引擎**
- 🧠 向量数据库的主服务，处理所有查询和写入请求
- 🚪 暴露 **19530**（gRPC，SDK 连接端口）和 **9091**（健康检查）端口
- ⏳ 依赖 etcd 和 MinIO，启动时会等待它们健康就绪

### ▶️ 启动命令

```bash
# 🚀 在项目目录下执行
docker-compose -f milvus-standalone-docker-compose.yml up -d

# 📊 查看服务状态
docker-compose -f milvus-standalone-docker-compose.yml ps

# 🛑 停止服务
docker-compose -f milvus-standalone-docker-compose.yml down
```

> 💾 **数据持久化**：所有数据通过 `./volumes/` 目录挂载到宿主机，重启不丢失。

---

## 四、🤖 Node.js SDK 集成实战：AI 日记语义搜索

部署好 Milvus 后，我们用 Node.js 构建一个"AI 日记"Demo——将日记内容向量化后存入 Milvus，实现语义搜索。

### 📚 4.1 技术栈

| 🧰 组件 | 📝 用途 |
|------|------|
| `@zilliz/milvus2-sdk-node` | Milvus 官方 Node.js SDK |
| `@langchain/openai` | 调用 Embedding 模型生成向量 |
| `dotenv` | 管理环境变量 |

### ⚙️ 4.2 环境配置

在 `.env` 文件中配置 API 密钥和模型：

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDINGS_MODEL_NAME=text-embedding-v3
```

> 🌟 本示例使用阿里云 DashScope 的 `text-embedding-v3` 模型，输出 **1024 维**向量。你也可以替换为 OpenAI 的 `text-embedding-3-small` 等模型。

### 🔄 4.3 核心流程

整个流程分为 **5 步**：

```
🔗 连接 Milvus → 📁 创建集合 → 🏗️ 创建索引 → 📥 加载集合 → ✍️ 插入数据
```

#### 🔗 Step 1：连接 Milvus

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'localhost:19530'  // Milvus gRPC 端口
});
```

#### 📁 Step 2：定义集合 Schema

```javascript
import { DataType } from '@zilliz/milvus2-sdk-node';

await client.createCollection({
  collection_name: 'ai_diary',
  fields: [
    { name: 'id',      data_type: DataType.VarChar, max_length: 50, is_primary_key: true },
    { name: 'vector',  data_type: DataType.FloatVector, dim: 1024 },  // 1024维向量
    { name: 'content', data_type: DataType.VarChar, max_length: 5000 },
    { name: 'date',    data_type: DataType.VarChar, max_length: 50 },
    { name: 'mood',    data_type: DataType.VarChar, max_length: 50 },
    { name: 'tags',    data_type: DataType.Array, element_type: DataType.VarChar,
                       max_capacity: 10, max_length: 50 }
  ]
});
```

> ⚠️ **关键点**：`vector` 字段类型为 `FloatVector`，维度 `dim` 必须与 Embedding 模型输出维度一致（这里是 1024）。

#### 🏗️ Step 3：创建向量索引

```javascript
import { IndexType, MetricType } from '@zilliz/milvus2-sdk-node';

await client.createIndex({
  collection_name: 'ai_diary',
  field_name: 'vector',
  index_type: IndexType.IVF_FLAT,    // 索引算法
  metric_type: MetricType.COSINE,    // 相似度度量：余弦相似度
  params: { nlist: 1024 }            // 聚类中心数
});
```

**📊 索引类型选择指南**：

| 索引类型 | 适用场景 | 特点 |
|----------|----------|------|
| `IVF_FLAT` | 中小规模数据（< 100万） | ✅ 精度高，速度适中 |
| `HNSW` | 低延迟要求 | ⚡ 查询极快，内存占用大 |
| `IVF_SQ8` | 大规模数据 | 💰 节省内存，精度略降 |

#### ✍️ Step 4：生成 Embedding 并插入数据

```javascript
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: { baseURL: process.env.OPENAI_BASE_URL },
  dimensions: 1024
});

// 🔡 将日记内容转为向量
async function getEmbedding(text) {
  return await embeddings.embedQuery(text);
}

// 📦 批量生成向量并插入
const diaryData = await Promise.all(
  diaryContents.map(async (diary) => ({
    ...diary,
    vector: await getEmbedding(diary.content)
  }))
);

await client.insert({
  collection_name: 'ai_diary',
  data: diaryData
});
```

### 📓 4.4 日记数据示例

Demo 中准备了 5 条模拟日记：

| 🆔 ID | 📅 日期 | 😊 心情 | 🏷️ 标签 | 📝 内容摘要 |
|----|------|------|------|----------|
| diary_001 | 2026-01-10 | 😄 happy | 生活、散步 | 去公园散步，看到花开了 |
| diary_002 | 2026-01-11 | 🤩 excited | 工作、成就 | 完成项目里程碑，有成就感 |
| diary_003 | 2026-01-12 | 😌 relaxed | 户外、朋友 | 和朋友爬山，享受大自然 |
| diary_004 | 2026-01-12 | 🧐 curious | 学习、技术 | 学习 Milvus 向量数据库 |
| diary_005 | 2026-01-13 | 🥳 proud | 美食、家庭 | 做了一顿丰盛晚餐 |

> 🔍 当你搜索"户外运动"时，Milvus 会返回 `diary_003`（爬山）和 `diary_001`（公园散步），因为它们的语义与"户外运动"最接近——即使文本中没有出现"户外运动"这四个字。

---

## 五、🏁 运行项目

```bash
# 1. 🐳 启动 Milvus
docker-compose -f milvus-standalone-docker-compose.yml up -d

# 2. 📦 安装依赖
pnpm install

# 3. 🔑 配置 .env 文件（填入你的 API Key）

# 4. ▶️ 运行 Demo
node index.mjs
```

预期输出：

```
Connecting to Milvus...
✓ Connected

Creating collection...
Collection created

Creating index...
Index created

Loading collection...
Collection loaded

Inserting diary entries...
Generating embeddings...
✓ Inserted 5 records
```

---

## 六、📌 总结

本文完整演示了向量数据库的应用链路：

```
文本数据 → Embedding 模型 → 高维向量 → Milvus 存储 → 语义搜索
```

**🎯 核心要点回顾**：

1. 🐳 **Milvus 三件套**：etcd（元数据）+ MinIO（对象存储）+ Milvus（引擎），通过 Docker Compose 一键部署
2. 🔢 **向量维度要匹配**：Embedding 模型输出维度必须与集合 Schema 中的 `dim` 一致
3. ⚡ **索引影响性能**：`IVF_FLAT` 适合入门，生产环境根据数据规模选择 `HNSW` 或 `IVF_SQ8`
4. 🔍 **语义搜索的力量**：不需要关键词完全匹配，向量数据库能理解语义相近的内容

> 🚀 这套方案可以广泛应用于 **RAG（检索增强生成）**、**智能客服**、**文档搜索**、**推荐系统** 等 AI 应用场景。
