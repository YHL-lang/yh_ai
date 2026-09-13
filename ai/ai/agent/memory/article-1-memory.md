# 🧠 从零理解 Agent Memory 管理：内存记忆、文件持久化与上下文截断

> **Agent = LLM + Tools + RAG + Memory + ...**
>
> 给模型扩展 Tool，不只是回答问题，而是让它干活；RAG 基于 query 获取向量数据库相关的知识放入 prompt。而这两者，都依赖于一个核心能力 —— **Memory（记忆）**。

---

## 📌 为什么需要 Memory？

大模型（LLM）本质上是 **无状态的**。每次调用 API，它都不记得上一次你问了什么。

```
第1轮：你 → "红烧肉怎么做？" → 🤖 回答了一大段
第2轮：你 → "好吃吗？"       → 🤖 "...什么好吃？"  ❌ 失忆了
```

所以，要实现多轮对话，就必须自己管理 **对话历史（Chat History）**，在每次请求时把历史消息一起传给模型。

这就是 **Memory** 的作用。

---

## 🗂️ Memory 的三种策略

| 策略 | 思路 | 适用场景 |
|:---:|:---:|:---:|
| **截断（Truncation）** | `slice(-4)` 只保留最近几条 | 简单快速，适合短对话 |
| **总结（Summary）** | 用 LLM 把历史压缩成摘要 | 长对话，需要保留关键信息 |
| **检索（Retrieval）** | 从向量数据库中检索相关历史 | 超长记忆，语义级别召回 |

本文将通过 **三个递进的实战示例**，带你从最简单的内存记忆，到文件持久化，再到智能截断，一步步掌握 Memory 管理的核心思路。

---

## 🏗️ 项目结构

```
demo/
├── .env                        # 环境变量（API Key、模型名等）
├── chat_history.json           # 文件持久化产生的对话记录
├── package.json
└── src/
    ├── history-test.mjs        # ① 内存记忆 — InMemoryChatMessageHistory
    ├── history-test2.mjs       # ② 文件记忆 — FileSystemChatMessageHistory
    ├── history-test3.mjs       # ③ 文件记忆恢复 — 从文件中读取历史继续对话
    └── memory/
        └── truncation-memory.mjs  # ④ 上下文截断 — 消息数 & Token 数两种策略
```

**依赖：**

```json
{
  "@langchain/core": "^1.2.10",
  "@langchain/openai": "^1.5.11",
  "@langchain/community": "^1.1.29",
  "js-tiktoken": "^1.0.21",
  "dotenv": "^17.4.2"
}
```

---

## 一、🔹 内存记忆：InMemoryChatMessageHistory

> 最基础的记忆方式 —— 把对话历史存在 **内存变量** 里。

### 核心思路

```
┌─────────────┐     addMessage()     ┌──────────────────────────┐
│  用户消息     │ ──────────────────→ │  InMemoryChatMessageHistory │
│  AI 回复     │ ←────────────────── │  （内存中的 messages 数组）    │
└─────────────┘     getMessages()    └──────────────────────────┘
                                            ↓
                                    拼接 SystemMessage + 历史
                                            ↓
                                     调用 LLM 生成回复
```

每次对话流程：
1. 📥 用户发送消息 → `addMessage()` 存入历史
2. 📤 `getMessages()` 取出全部历史 + SystemMessage → 拼成完整 prompt
3. 🤖 调用模型获取回复
4. 📥 AI 回复也 `addMessage()` 存入历史，供下一轮使用

### 代码实现

**初始化模型和历史对象：**

```js
import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

const history = new InMemoryChatMessageHistory()
const systemMessage = new SystemMessage(
  "你是一个友好、幽默的做菜助手，喜欢分享美食和做菜技巧"
)
```

**第一轮对话 —— 建立记忆：**

```js
console.log("[第一轮会话]")

// 1️⃣ 用户消息存入历史
const userMessage1 = new HumanMessage("你今天吃的什么？")
await history.addMessage(userMessage1)

// 2️⃣ 拼接：SystemMessage + 全部历史消息
const messages1 = [systemMessage, ...(await history.getMessages())]

// 3️⃣ 调用模型
const response1 = await model.invoke(messages1)
console.log(`助手：${response1.content}\n`)

// 4️⃣ AI 回复也要存入历史！
await history.addMessage(response1)
```

**第二轮对话 —— 基于上下文连贯回答：**

```js
console.log("[第二轮会话 基于历史]")

const userMessage2 = new HumanMessage("好吃吗？")
await history.addMessage(userMessage2)

// ⬆️ 此时 history 里已有：用户问1 + AI答1 + 用户问2
// 模型能理解 "好吃吗？" 指的是上一轮聊的食物
const messages2 = [systemMessage, ...(await history.getMessages())]
const response2 = await model.invoke(messages2)
await history.addMessage(response2)
console.log(`助手：${response2.content}\n`)
```

**查看全部历史记录：**

```js
const allMessages = await history.getMessages()
console.log(`共保存了 ${allMessages.length} 条消息`)

allMessages.forEach((message, index) => {
  const prefix = message.type === 'human' ? '用户' : '助手'
  console.log(`${index + 1}. [${prefix}]: ${message.content.substring(0, 50)}...`)
})
```

### ⚠️ 局限性

`InMemoryChatMessageHistory` 的数据存在 **Node.js 进程的内存** 里：

- ❌ 程序重启后，记忆 **全部丢失**
- ❌ 不适合长时间运行的服务
- ✅ 适合快速验证、单次测试、短期对话

> 💡 **小结**：内存记忆是最简单的方案，理解了它，就理解了 Memory 的核心循环 —— **存、取、拼接、调用**。

---

## 二、📁 文件持久化：FileSystemChatMessageHistory

> 把对话历史写入 **JSON 文件**，程序重启后依然保留。

### 为什么需要持久化？

想象一个场景：用户今天和助手聊了红烧肉的做法，关掉浏览器，明天再打开继续问"需要哪些食材？" —— 如果用内存记忆，昨天的对话早就没了。

文件持久化解决的就是这个问题：

```
程序启动 → 从 JSON 文件读取历史 → 继续对话 → 对话写回文件
    ↓                              ↓              ↓
  恢复记忆                      正常聊天        持久保存
```

### 代码实现

**与内存记忆的关键区别 —— 初始化方式：**

```js
import { FileSystemChatMessageHistory } from '@langchain/community/stores/message/file_system'
import path from 'node:path'

// ⬇️ 指定文件路径和会话 ID（支持多用户隔离）
const filePath = path.join(process.cwd(), "chat_history.json")
const sessionId = "user_session_001"

const history = new FileSystemChatMessageHistory({
  filePath,
  sessionId,
})
```

> 🔑 **关键点**：`sessionId` 让不同用户的对话历史互不干扰，同一个 `filePath` 里可以存多个会话。

**第一轮 & 第二轮对话 —— 和内存记忆几乎一样：**

```js
// ---- 第一轮 ----
console.log("[第一轮会话]")
const userMessage1 = new HumanMessage("红烧肉怎么做")
await history.addMessage(userMessage1)

const message1 = [systemMessage, ...(await history.getMessages())]
const response1 = await model.invoke(message1)
await history.addMessage(response1)
console.log(`用户：${userMessage1.content}`)
console.log(`助手：${response1.content}\n`)

// ---- 第二轮 ----
console.log("[第二轮会话 基于历史]")
const userMessage2 = new HumanMessage("好吃吗？")
await history.addMessage(userMessage2)

const messages2 = [systemMessage, ...(await history.getMessages())]
const response2 = await model.invoke(messages2)
await history.addMessage(response2)
console.log(`助手：${response2.content}\n`)
```

代码几乎没变，只是把 `InMemoryChatMessageHistory` 换成了 `FileSystemChatMessageHistory` —— 这就是 LangChain 抽象层的魅力 ✨。

### 📂 JSON 文件长什么样？

对话结束后，`chat_history.json` 会自动生成：

```json
{
  "": {
    "user_session_001": {
      "messages": [
        {
          "type": "human",
          "data": { "content": "红烧肉怎么做" }
        },
        {
          "type": "ai",
          "data": {
            "content": "哈哈，红烧肉可是中华美食界的"顶流爱豆"...",
            "usage_metadata": {
              "input_tokens": 34,
              "output_tokens": 992,
              "total_tokens": 1026
            }
          }
        }
      ]
    }
  }
}
```

> 💡 每条消息记录了 `type`（human/ai）、`content`（内容）、以及 token 用量等元信息。

---

## 三、🔄 从文件恢复记忆：跨会话续聊

> 程序重启后，从文件中 **读取历史**，无缝继续对话。

### 核心价值

这是文件持久化的真正价值所在 —— **跨会话延续记忆**。

```
会话1（昨天）：问红烧肉怎么做 → 得到详细回答 → 保存到文件
                ⬇️ 关闭程序 ⬇️
会话2（今天）：从文件恢复历史 → 问"需要哪些食材？" → 模型知道上下文！
```

### 代码实现

```js
// 1️⃣ 创建新的 history 实例（指向同一个文件 + sessionId）
const restoredHistory = new FileSystemChatMessageHistory({
  filePath,
  sessionId
})

// 2️⃣ 从文件中恢复历史消息
const restoredMessages = await restoredHistory.getMessages()
console.log(`从文件中恢复 ${restoredMessages.length} 条消息`)

// 3️⃣ 打印恢复的历史（让用户看到之前的对话）
restoredMessages.forEach((msg, index) => {
  const prefix = msg.type === "human" ? "用户" : "助手"
  console.log(`${index + 1}. [${prefix}]: ${msg.content.substring(0, 50)}...`)
})

// 4️⃣ 继续第三轮对话 —— 模型拥有完整的前两轮记忆！
console.log("[第三轮对话]")
const userMessage3 = new HumanMessage("需要哪些食材？")
await restoredHistory.addMessage(userMessage3)

const messages3 = [systemMessage, ...(await restoredHistory.getMessages())]
const response3 = await model.invoke(messages3)
await restoredHistory.addMessage(response3)
console.log(response3.content)
```

### 🧩 三种记忆方式对比

| 特性 | 内存记忆 | 文件记忆 | 向量数据库（拓展） |
|:---:|:---:|:---:|:---:|
| 存储位置 | RAM | JSON 文件 | Milvus / Pinecone 等 |
| 持久化 | ❌ | ✅ | ✅ |
| 多用户隔离 | ❌ 需手动管理 | ✅ sessionId | ✅ |
| 检索能力 | 全量返回 | 全量返回 | 语义检索 |
| 适合场景 | 快速测试 | 小规模应用 | 大规模生产 |

---

## 四、✂️ 上下文截断：控制 Memory 大小

> 对话越来越长，消息越来越多，token 开销越来越大 —— 必须 **截断**。

### 为什么要截断？

假设你和助手聊了 50 轮，每次都把 50 轮历史全发给模型：

- 💸 **成本爆炸**：token 数线性增长，费用直线上升
- 🐌 **响应变慢**：输入越长，模型推理越慢
- 📏 **超出限制**：模型有最大上下文窗口（如 128K / 200K tokens）

所以我们需要 **智能截断** —— 只保留最相关、最新的历史。

### 策略一：按消息数量截断（简单直接）

最粗暴但最有效的方式 —— 只保留最近 N 条消息。

```js
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { HumanMessage, AIMessage } from '@langchain/core/messages'

async function messageCountTruncation() {
  const history = new InMemoryChatMessageHistory()
  const maxMessages = 4

  // 模拟 8 条历史消息（4轮对话）
  const messages = [
    { type: 'human', content: '我叫李四' },
    { type: 'ai',    content: '你好李四，很高兴认识你！' },
    { type: 'human', content: '我是一名设计师' },
    { type: 'ai',    content: '设计师是个很有创造力的职业！' },
    { type: 'human', content: '我喜欢艺术和音乐' },
    { type: 'ai',    content: '艺术和音乐都是很好的爱好。' },
    { type: 'human', content: '我擅长 UI/UX 设计' },
    { type: 'ai',    content: 'UI/UX 设计非常重要！' },
  ]

  for (const msg of messages) {
    if (msg.type === 'human') {
      await history.addMessage(new HumanMessage(msg.content))
    } else {
      await history.addMessage(new AIMessage(msg.content))
    }
  }

  // ✅ 关键操作：slice(-N) 只保留最近 N 条
  let allMessages = await history.getMessages()
  const trimmedMessages = allMessages.slice(-maxMessages)

  console.log(`原始消息数：${allMessages.length}`)     // 8
  console.log(`保留消息数：${trimmedMessages.length}`) // 4
  // 丢掉了 "我叫李四"、"你好李四"、"我是一名设计师"、"设计师..." 四条
  // 只保留了最近两轮对话
}
```

**图解截断过程：**

```
原始历史（8条）：
  [1] 我叫李四          ← 被丢弃
  [2] 你好李四...        ← 被丢弃
  [3] 我是一名设计师      ← 被丢弃
  [4] 设计师很有创造力...  ← 被丢弃
  [5] 我喜欢艺术和音乐    ← 保留 ✅
  [6] 艺术和音乐...      ← 保留 ✅
  [7] 我擅长 UI/UX 设计   ← 保留 ✅
  [8] UI/UX 设计非常重要！ ← 保留 ✅

slice(-4) → 只取后4条
```

### 策略二：按 Token 数量截断（生产推荐）

按消息数量截断虽然简单，但不同消息长度差异大。更精确的方式是按 **Token 数量** 截断。

```js
import { trimMessages } from '@langchain/core/messages'
import { getEncoding } from 'js-tiktoken'

// 计算消息的 token 数
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

async function tokenCountTruncation() {
  const history = new InMemoryChatMessageHistory()
  const maxTokens = 100

  // ... 添加消息（同上）...

  let allMessages = await history.getMessages()
  const enc = getEncoding('cl100k_base') // GPT 系列使用的编码器

  // ✅ 使用 LangChain 内置的 trimMessages 工具
  const trimmedMessages = await trimMessages(allMessages, {
    maxTokens: maxTokens,                          // token 上限
    tokenCounter: async (msgs) => countTokens(msgs, enc),  // 自定义计数器
    strategy: 'latest',                            // 保留最新的消息
  })

  console.log(`截断后消息数：${trimmedMessages.length}`)
}
```

> 💡 **`trimMessages`** 是 LangChain 提供的内置工具，底层使用 **二分查找** 策略，在 `maxTokens` 限制下尽可能多地保留最新消息，比手动 `slice` 更智能。

### 两种截断策略对比

| 维度 | 按消息数量 | 按 Token 数量 |
|:---:|:---:|:---:|
| 实现难度 | ⭐ 极简 | ⭐⭐⭐ 需要 tokenizer |
| 精确度 | 粗略（消息长短不一） | 精确（精确到 token） |
| 适用场景 | 快速原型 | 生产环境 |
| 依赖 | 无 | `js-tiktoken` 等 |

---

## 🧭 Agent 执行流程中的 Memory

在整个 Agent 的 ReAct 循环中，Memory 的位置如下：

```
┌──────────────────────────────────────────────┐
│                 Agent 执行流程                  │
│                                              │
│  用户输入                                      │
│     ↓                                        │
│  Memory.read()  ← 从 Memory 加载历史           │
│     ↓                                        │
│  拼接 Messages = [SystemMsg, ...History, UserMsg] │
│     ↓                                        │
│  LLM 推理（ReAct: Think → Act → Observe）      │
│     ↓                                        │
│  Memory.write() → 把本轮对话存入 Memory         │
│     ↓                                        │
│  返回结果给用户                                 │
└──────────────────────────────────────────────┘
```

---

## 📊 Memory 管理的三层架构

```
┌─────────────────────────────────────────┐
│            临时记忆（Working Memory）       │  ← 当前对话轮次的上下文
│  InMemoryChatMessageHistory              │
├─────────────────────────────────────────┤
│            短期记忆（Short-term Memory）    │  ← 最近几次对话
│  FileSystemChatMessageHistory            │
├─────────────────────────────────────────┤
│            长期记忆（Long-term Memory）     │  ← 所有历史知识
│  向量数据库（Milvus / Pinecone / Chroma）  │
└─────────────────────────────────────────┘
```

| 层级 | 存储方式 | 管理策略 | 读取速度 |
|:---:|:---:|:---:|:---:|
| 临时记忆 | 内存 | 截断（slice） | ⚡ 极快 |
| 短期记忆 | 文件/Redis | 截断 + 总结 | 🚀 快 |
| 长期记忆 | 向量数据库 | 语义检索 | 🔍 按需 |

---

## 🎯 总结

本文通过 **四个递进示例**，完整演示了 Agent Memory 管理的核心知识：

| 示例 | 文件 | 核心知识点 |
|:---:|:---:|:---|
| ① 内存记忆 | `history-test.mjs` | `InMemoryChatMessageHistory` — 基础的存取循环 |
| ② 文件持久化 | `history-test2.mjs` | `FileSystemChatMessageHistory` — 对话落盘 |
| ③ 记忆恢复 | `history-test3.mjs` | 跨会话续聊 — 从文件读取历史继续对话 |
| ④ 上下文截断 | `truncation-memory.mjs` | `slice` + `trimMessages` — 控制 Memory 大小 |

**记忆管理的本质** 就是一个循环：

> **存（Store）** → **取（Retrieve）** → **拼接（Compose）** → **调用（Invoke）** → 回到 **存**

掌握了这个循环，你就掌握了 Agent Memory 的核心。后续的向量数据库检索、总结压缩等高级策略，都是在这个基础上的优化。

---

> 🚀 **下一篇预告**：我们将深入 **向量数据库记忆**，用 Embedding + 相似度检索实现真正意义上的"长期记忆" —— 让 Agent 在百万条对话中精准找到相关上下文。
