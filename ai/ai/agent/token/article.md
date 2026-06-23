# 🔤 从 Token 到 Embedding：理解大模型如何"读懂"文本

> 📖 本文基于对 Tokenization（分词）和 Embedding（向量嵌入）的学习笔记整理，结合 `js-tiktoken` 和 OpenAI Embedding API 的实战代码，拆解大模型处理文本的底层逻辑。

---

## 一、🧐 为什么大模型必须分词？

### 1.1 🧮 神经网络只能处理数字

大语言模型（LLM）的底层是**神经网络**，而神经网络本质上做的只有一件事——**矩阵运算**。它看得懂向量、矩阵，但**看不懂中文、英文等人类字符**。这是由计算机的底层运行机制和模型训练的效率共同决定的。

因此，当我们输入一段 Prompt 文本时，必须先把它转换成一串**离散的数字符号 ID**——这就是 **Token（分词）**。

### 1.2 💰 Token：LLM 计价和工作的最小单位

Token 是 LLM 世界里的"基本粒子"。无论是计费还是推理，都以 token 为粒度：

| 文本类型 | Token 换算 |
|---------|------------|
| 1 个英文字符 | ≈ 0.3 个 token |
| 1 个中文字符 | ≈ 0.6 个 token |
| 100 万 token | 约几元人民币 |

每次 LLM 调用的总 token 数 = **输入 tokens + 输出 tokens**。

### 1.3 ❌ 为什么不能直接切成字符？

如果把文本切成单个字符，每个字符缺乏独立的语义，对模型理解没有意义。Token 可以近似理解为一个"单词"，但不完全是——它的切分规则由编码器（如 `cl100k_base`）决定。同一个单词在不同上下文中可能被切分成不同的 token。

**🔀 核心流程：**

```
输入文本 → cl100k_base 映射规则 → Token ID（如 215、100k 等离散数字）
```

---

## 二、🛠️ 动手实践：用 js-tiktoken 编解码 Token

下面用 `js-tiktoken` 库（GPT 官方的 token 编码器）来直观感受分词过程。

### 📄 index.mjs — 文本 ↔ Token 互转

```javascript
import { getEncoding } from "js-tiktoken";

// cl100k_base 是 GPT 官方的 token 编码器，基于 UTF-8
const enc = getEncoding("cl100k_base");

// 待编码的文本（中英混合）
const text = "Hello, tiktoken! 你好，世界！";

// 编码：文本 → Token ID 数组
const tokens = enc.encode(text);
console.log("Token IDs:", tokens, "Token 数量:", tokens.length);
// 输出示例：Token IDs: [9906, 11, 1234, ...] Token 数量: 12

// 解码：Token ID 数组 → 文本
const decodedText = enc.decode(tokens);
console.log("Decoded Text:", decodedText);
// 输出：Decoded Text: Hello, tiktoken! 你好，世界！
```

**🔍 代码解读：**

- `getEncoding("cl100k_base")`：获取 GPT 系列模型使用的编码器，`cl100k` 表示约 10 万规模的词汇表。
- `enc.encode(text)`：将文本映射为一串整数 ID，每个 ID 对应词汇表中的一个 token。
- `enc.decode(tokens)`：反向操作，将 token ID 数组还原为可读文本。
- **同一个编码器实例**既负责编码也负责解码，保证映射规则一致。

**💡 关键收获**：Tokenization 的本质是一次**离散映射**——把连续的语义文本打散为词汇表中的编号。但这只是第一步，token ID 本身并不携带语义信息（ID 215 和 ID 100k 之间没有"远近"关系），下一步需要 **Embedding** 来赋予它们数学上的意义。

---

## 三、🧭 Embedding：让 Token 拥有语义

### 3.1 🤔 为什么需要 Embedding？

大模型不能直接处理文本，完整流程是：

```
文本 → Tokenize（分词） → Embedding（向量化） → 神经网络计算
```

Tokenize 只是把大的文本理解任务切割为小的单元（提升 LLM 处理性能），但 token ID 只是一个编号——"215"和"100k"之间没有任何数学关系。**Embedding 的作用就是把这些离散的 token ID 映射到高维向量空间**，让语义相近的词在向量空间中也相近。

### 3.2 ✨ Embedding 的核心特性

- **高维向量**：每个 token 被映射为一个高维向量（如 1024 维），每个维度的值在 `-1` 到 `1` 之间。
- **语义相近 = 向量相近**：通过**余弦相似度**可以量化两个文本的语义相似程度。
- **数学可计算**：向量化之后，神经网络就能对"语义"做数学运算了。

---

## 四、🧪 动手实践：用 Embedding 计算语义相似度

下面用阿里百炼的 Embedding API，将两段文本向量化后计算它们的语义相似度。

### 📐 main.mjs — 文本 Embedding + 余弦相似度

```javascript
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// 初始化客户端（阿里百炼）
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_API_BASE_URL,
});

/**
 * 调用 LLM Embedding 接口，将文本转为高维向量
 * @param {string} text - 输入文本
 * @returns {number[]} - 1024 维向量数组
 */
async function getEmbedding(text) {
  const res = await client.embeddings.create({
    model: "text-embedding-v4",  // 嵌入模型
    input: text,
    dimensions: 1024,            // 向量维度
  });
  return res.data[0].embedding;  // 返回 [-1, 1] 之间的浮点数数组
}

/**
 * 余弦相似度：衡量两个向量的方向一致性
 * 值域 [0, 1]，1 表示语义完全相同
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];    // 点积
    magA += vecA[i] ** 2;        // A 的模长平方
    magB += vecB[i] ** 2;        // B 的模长平方
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function run() {
  // 三组测试文本
  const text1 = "Andrej Karpathy LLM Tokenization 分词原理";
  const text2 = "卡帕西讲解大模型BPE字词分词";         // 与 text1 语义相近
  const text3 = "今天天气晴朗，适合出门散步";           // 与 text1 语义无关

  // 向量化
  const vec1 = await getEmbedding(text1);
  const vec2 = await getEmbedding(text2);
  const vec3 = await getEmbedding(text3);

  // 计算相似度
  const sim_1_2 = cosineSimilarity(vec1, vec2);
  console.log("text1 vs text2 相似度:", sim_1_2);
  // 期望输出：> 0.8（语义高度相关）

  const sim_1_3 = cosineSimilarity(vec1, vec3);
  console.log("text1 vs text3 相似度:", sim_1_3);
  // 期望输出：< 0.3（语义不相关）
}

run();
```

### 🔬 代码拆解

**⚙️ 第一步：向量化（`getEmbedding`）**

调用 LLM 的 Embedding 接口，指定模型 `text-embedding-v4` 和维度 `1024`。返回结果是一个 1024 维的浮点数数组，每个值在 `-1` 到 `1` 之间。这个数组就是文本在"语义空间"中的数学坐标。

**📏 第二步：余弦相似度（`cosineSimilarity`）**

余弦相似度衡量的是两个向量在方向上的接近程度，而非绝对距离：

- **点积（dot product）**：对应位置相乘再求和，衡量两个向量的"共向程度"。
- **模长归一化**：除以两个向量的模长，消除向量长度的影响，使结果落在 `[0, 1]` 区间。
- **值越大越相似**：0 表示完全无关，1 表示语义完全相同。

> 🌍 注意看：`text1`（英文）和 `text2`（中文）**字面上完全不同**，但因为它们描述的是同一个主题（Karpathy 讲分词），Embedding 向量化后余弦相似度很高。这就是 Embedding 的威力——**跨语言的语义理解**。

---

## 五、🌊 完整数据流：从 Prompt 到输出

把上面的知识点串联起来，LLM 处理一次请求的完整链路如下：

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Prompt 文本   │ →  │ Tokenization │ →  │  Embedding   │
│ (自然语言)    │    │ (离散 ID)     │    │ (连续向量)    │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 输出文本      │ ←  │  Token 解码   │ ←  │ Transformer  │
│ (自然语言)    │    │ (ID → 文本)   │    │ 神经网络计算  │
└──────────────┘    └──────────────┘    └──────────────┘
```

1. 🔢 **Tokenization**：输入文本 → `cl100k_base` 编码器 → Token ID 数组
2. 📊 **Embedding**：Token ID → 高维向量空间（1024 维，-1 到 1）
3. ⚡ **Transformer**：基于 Attention 机制，计算 token 间的语义相关性，逐 token 预测下一个词
4. 🔓 **Decode**：模型输出的 Token ID → 还原为可读文本

---

## 六、🚀 学习路径推荐

如果你也想深入理解 LLM，以下是一个递进式的学习路径：

### 6.1 📚 理论基础

- 🎓 **吴恩达系列课程**：`AI for Everyone` → `Generative AI for Everyone` → `AI Prompting for Everyone`
- 🎬 **Andrej Karpathy**（Tesla 前 AI 总监、GPT-3 作者之一）：[3 小时大模型入门课程](https://www.bilibili.com/video/BV16cNEeXEer/)，讲透大模型原理
- 🏗️ **核心概念**：Transformer 架构、Attention 注意力机制、Fine-tuning 微调

### 6.2 ⌨️ 动手用起来

把日常重复性工作交给 AI，在实战中建立体感：

| 工具 | 用途 |
|------|------|
| **CC / Codex** | AI 辅助编程，从代码补全到完整功能生成 |
| **NotebookLM**（Google RAG 产品） | 上传文档，AI 帮你理解、总结、提问 |
| **Obsidian** | 打造"第二大脑"，知识管理与 AI 结合 |

### 6.3 🎯 打造个人作品

- 🎨 **Vibe Coding**：用 AI 辅助完成一个完整项目（网站、小程序、CRM 系统）
- 🤖 **Agent 开发**：构建能自主决策、调用工具的 AI Agent

### 6.4 👀 持续关注

- 🧑‍🔬 **晓辉博士** — 专业深度内容
- 📈 **42章经** — 行业趋势分析
- ✍️ **宝玉** — AI Prompt Engineering
- 🧩 **歸藏** — AI 产品实践

---

## 七、🏁 小结

本文从"为什么必须分词"出发，逐步深入到大模型处理文本的完整链路：

1. 🔢 **Tokenization** 是将自然语言转为离散数字 ID 的桥梁，`cl100k_base` 等编码器定义了映射规则。
2. 📊 **Embedding** 将这些离散 ID 投射到连续的高维语义空间，让"意思相近"在数学上变得可计算。
3. 🧪 通过 `js-tiktoken` 和 Embedding API 的实战代码，我们可以在几行代码中直观感受这两个核心过程。

🔑 理解 Token 和 Embedding，是理解 LLM 工作原理的第一把钥匙。剩下的 Transformer 架构、Attention 机制、微调等高级话题，都建立在这个基础之上。
