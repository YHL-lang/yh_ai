# 🌡️ 大模型是怎么「随机说话」的？—— temperature 与 Top-K 背后的秘密

> 同一个问题问大模型，为什么每次答案都不一样？为什么写诗要「放飞自我」，写代码却要「滴水不漏」？
> 答案藏在两个看似不起眼的采样参数里：**temperature（温度）** 和 **Top-K**。
> 本文从「预测下一个词」讲起，用一份真实的 LangChain 代码，把这套机制讲透。

---

## 📖 目录

1. [一切的起点：大模型在「猜下一个词」](#1-一切的起点大模型在猜下一个词)
2. [参数一：temperature 温度](#2-参数一temperature--温度)
3. [参数二：Top-K 采样](#3-参数二top-k--采样)
4. [黄金组合：先 Top-K 收窄，再 temperature 控温](#4-黄金组合先-top-k-收窄再-temperature-控温)
5. [副作用：幻觉从哪来](#5-副作用幻觉从哪来)
6. [LangChain：把 AI 工作流「链」起来](#6-langchain把-ai-工作流链起来)
7. [实战代码拆解：t-demo/main.mjs](#7-实战代码拆解t-demomainmjs)
8. [避坑指南：概念 vs API 实现](#8-避坑指南概念-vs-api-实现)
9. [一张表带走：选参速查](#9-一张表带走选参速查)

---

## 1. 一切的起点：大模型在「猜下一个词」

大模型（LLM）本质上是一个 **「预测下一个词」** 的机器。它不是一次性写出整篇文章，而是一个字一个字（专业说法是 **token**）往后「接龙」：

```
上次输出「你好」，接下来接哪个字？
```

模型内部会算出一个 **概率分布**，每个候选词都有一个得分：

| 候选词 | 概率 |
|:---:|:---:|
| 吗 | 0.60 |
| 啊 | 0.15 |
| 呀 | 0.10 |
| 美 | 0.05 |
| 坏 | 0.01 |

> 💡 **关键点**：模型给出的是「概率」，不是「唯一答案」。

这就带来了一个核心问题：**怎么从这个概率分布里挑出下一个词？**

- 如果永远挑概率最高的「吗」—— 结果**稳定但呆板**，每次都一样；
- 如果完全随机抽—— 结果**有创意但可能胡言乱语**。

于是就有了「采样参数」，用来**控制这股随机性**。最常用的两个就是 `temperature` 和 `Top-K`。

---

## 2. 参数一：temperature 🌡️ 温度

### 2.1 它是什么

`temperature` 直译是「温度」，取值范围通常在 **0 ~ 1**（部分 API 如 OpenAI 允许到 2）。它像一个「随机性旋钮」：

> 温度越高 → 概率分布越「平均」→ 采样越随机；温度越低 → 概率分布越「尖锐」→ 越偏向高分词。

**数学直觉**：采样前，模型会把每个词的得分先「除以温度」，再转成概率。

- 温度低（如 0.2）：高分词的差距被**放大**，几乎只会选「吗」—— 保守、确定；
- 温度高（如 0.8）：高分词的差距被**抹平**，连「坏」这种 0.01 的词也有机会被选中—— 发散、有惊喜。

### 2.2 用一张图感受一下

```
temperature = 0.2（严谨）          temperature = 0.8（发散）
        吗 ████████████████               吗 ██████
        啊 ███                           啊 ████
        呀 ██                            呀 ████
        美 █                             美 ███
        坏 ▏                             坏 ██   ← 连它也有机会了！
```

### 2.3 什么时候用多少

| 温度 | 风格 | 适合场景 |
|:---:|:---:|:---|
| 0.0 ~ 0.3 | 🎯 严谨、保守 | 写代码、法律文书、公司合同、数学推理 |
| 0.3 ~ 0.7 | ⚖️ 均衡 | 通用问答、翻译、总结 |
| 0.7 ~ 1.0 | 🎨 发散、有创意 | 文学创作、文案、AI 漫剧、多模态创意 |

---

## 3. 参数二：Top-K 🎲 采样

### 3.1 它是什么

`Top-K` 的思路很直接：**先从概率分布里按得分排序，只保留前 K 个高分词，再在里面采样。**

```
全部候选（按概率降序）：
吗 0.60 → 啊 0.15 → 呀 0.10 → 美 0.05 → 坏 0.01 → ...（还有成千上万个）

Top-K = 3 时，只保留前 3 个：
吗 0.60 → 啊 0.15 → 呀 0.10   （重新归一化后再采样）
```

它的作用是**「兜底」**：把那些概率极低的「垃圾词」直接挡在门外，避免模型跑偏。

### 3.2 默认值是 8

很多实现里 `Top-K` 默认取 **8**：既不会太窄（丢信息），也不会太宽（引入噪音）。

### 3.3 小 K vs 大 K

| Top-K | 效果 |
|:---:|:---|
| 🔽 小（如 4） | 只在高分圈里选，**聚焦、不易跑偏** |
| 🔼 大（如 8） | 候选更多，**信息更完整、更丰富** |

---

## 4. 黄金组合：先 Top-K 收窄，再 temperature 控温

> 🧠 **核心思路（来自 readme.md）**：分两步做，两个参数打配合，而不是各管各的。

**第一步**：用 `Top-K` 把高概率的词先**圈出来**（保证下限，不让结果太离谱）；
**第二步**：再用 `temperature` 在圈内**控制随机程度**（保证上限，让该有的创意有、该稳的稳）。

由此得到两条经典配方：

| 配方 | temperature | Top-K | 效果 |
|:---:|:---:|:---:|:---|
| 🎯 严谨路线 | 低（0.2） | 大（8） | **准确 + 信息完整**，适合代码/合同 |
| 🎨 创意路线 | 高（0.8） | 小（4） | **靠谱的创意**，发散了又不至于跑偏 |

> ⚠️ 反过来想：两个都调很大 —— 结果会很飘、满嘴跑火车；两个都调很小 —— 结果死板、毫无灵性。**极端参数不可取**。

---

## 5. 副作用：幻觉从哪来

「幻觉」（模型一本正经地胡说八道）和随机性是一体两面：

> **把 temperature 拉高 → 随机性增加 → 低概率词也可能被选中 → 生成内容越来越「不靠谱」。**

所以对事实性、严谨性要求高的场景（代码、法律、合同），**务必压低温、收紧 Top-K**；
只有创作类场景才敢放开随机性去换创意。这正是一个开发者「有效、靠谱地控制 AI 应用随机性」的核心能力。

---

## 6. LangChain：把 AI 工作流「链」起来

理解了采样参数，还要理解怎么把它**工程化**。这里就要请出 `LangChain`。

> 📌 **LangChain = Lang(uage) + Chain**：语言 + 链条，即「LLM 工作流/工作链的编排」。

### 6.1 为什么需要它

AI Agent / 生成式应用有点「黑盒」：要么觉得它干得不够智能，要么太智能却不知道它是怎么干出来的。

`chain` 的价值就是：**把 AI 工作链条上的每个节点，像流水线一样显式地连起来**，让过程可控、可复用、可维护。

### 6.2 核心模块（@langchain/core）

| 模块 | 作用 |
|:---:|:---|
| 💬 `messages` | 对话列表 |
| 📤 `output_parsers` | 输出解析器，自动解析出需要的格式 |
| 🧰 `tools` | 创建工具函数（给模型调用） |
| 📝 `prompts` | 提示词模板 |

### 6.3 一条典型工作流

```
start → PromptTemplate → LLM → StringOutputParser → end
         （提示词模板）  （模型）   （输出解析器）
```

---

## 7. 实战代码拆解：t-demo/main.mjs

下面就是 `t-demo` 文件夹里的完整代码。它同时构造了「创意模型」和「严谨模型」两条生产路线，用同一个主题各生成一段文字，直观对比两种参数的效果。

```javascript
// main.mjs
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
// 把大模型输出解析成纯字符串
import { StringOutputParser } from '@langchain/core/output_parsers'
// Prompt 模板：好复用、好维护，不用把提示词硬编码在代码里
import { PromptTemplate } from '@langchain/core/prompts'

// 🎨 创意模型：高温 + 小 Top-K
const creativeModel = new ChatOpenAI({
  model: 'deepseek-v4-pro',
  temperature: 0.8, // 负责增强创意的发散性
  topk: 4,          // 仅从概率前四的词汇里采样，限制跑偏
  maxToken: 600,
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com',
  }
})

// 🎯 严谨模型：低温 + 大 Top-K
const preciseModel = new ChatOpenAI({
  model: 'deepseek-v4-pro',
  temperature: 0.2, // 负责保守
  topk: 8,          // 更大的 Top-K，保证信息的完整性
  maxToken: 600,
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  }
})

// 📝 提示词模板：输入变量 theme，可复用
const storyPrompt = new PromptTemplate({
  inputVariables: ['theme'],
  template: `
  请写一篇短篇散文，主题:{theme}
  风格温柔治愈，篇幅200字左右，不要分段，文字细腻有画面感
  `,
})

// 📤 输出解析器：统一返回纯文本
const outputParser = new StringOutputParser()

// 🔗 用 pipe 把「提示词 → 模型 → 解析器」串成一条流水线
const creativeChain = storyPrompt
  .pipe(creativeModel)
  .pipe(outputParser)

const preciseChain = storyPrompt
  .pipe(preciseModel)
  .pipe(outputParser)

// 🚀 把原料（theme）送到流水线上生产
async function runWriteDemo() {
  const theme = '秋日山野晚风';

  console.log('创意写作模式');
  const creativeText = await creativeChain.invoke({ theme });
  console.log(creativeText);

  console.log('严谨写作模式');
  const preciseText = await preciseChain.invoke({ theme });
  console.log(preciseText);
}

runWriteDemo()
  .catch(err => console.error(err))
```

### 7.1 逐段拆解

**① 两个模型 = 两条「性格」不同的生产线**

```javascript
const creativeModel = new ChatOpenAI({ temperature: 0.8, topk: 4, ... }); // 🎨 发散
const preciseModel  = new ChatOpenAI({ temperature: 0.2, topk: 8, ... }); // 🎯 保守
```

这正是第 4 节的两条经典配方：创意路线「高温 + 小 Top-K」、严谨路线「低温 + 大 Top-K」。

**② PromptTemplate：提示词不再硬编码**

```javascript
const storyPrompt = new PromptTemplate({
  inputVariables: ['theme'],
  template: `请写一篇短篇散文，主题:{theme} ...`,
});
```

以前提示词写死在代码里，不好维护、不好模块化。而 AI 业务很多是 **prompt 驱动** 的：同一套逻辑，换个身份/主题就能复用。`PromptTemplate` 位于 AI 工作流「比较靠前」的位置——它是整条链的**入口**。

**③ StringOutputParser：统一输出纯文本**

模型返回的是一堆复杂对象，`StringOutputParser` 把它解析成干净的字符串，方便直接展示或传给下游。

**④ chain：用 pipe 串起工作流**

```javascript
const creativeChain = storyPrompt.pipe(creativeModel).pipe(outputParser);
```

`pipe` 就是流水线：`提示词模板 → 模型 → 输出解析器`，数据像零件一样依次经过每个节点。最后用 `invoke({ theme })` 投入原料、拿到成品。

### 7.2 两个模型效果对比

| | 🎨 创意模型 | 🎯 严谨模型 |
|:---:|:---:|:---:|
| temperature | 0.8 | 0.2 |
| Top-K | 4 | 8 |
| 风格 | 发散、有画面感、可能有惊喜 | 保守、克制、更确定 |
| 典型场景 | 散文、文案、漫剧 | 代码、合同、法律 |

---

## 8. 避坑指南：概念 vs API 实现

> 🚨 这一节是**文档里常被忽略、但实际踩坑最多**的地方，务必看清。

### 8.1 「Top-K」在 OpenAI 兼容接口里其实是 `top_p`

上面的代码为了讲清概念，写了 `topk: 4`。但要注意：**DeepSeek 走的是 OpenAI 兼容接口，它开放的采样参数是 `top_p`（核采样），并不是严格意义上的 `top_k`。**

- `Top-K`：只留**前 K 个**词；
- `Top-P`（nucleus）：从高分往低分累加，留到**累计概率达到 p** 的那一批词。

两者都是「收窄候选」的手段，思想相通，但实现和字段名不同。在 LangChain 的 `ChatOpenAI` 里，对应的标准字段是 **`topP`**。

### 8.2 `maxToken` 应写成 `maxTokens`

LangChain `ChatOpenAI` 的标准字段是 **`maxTokens`**（复数），`topk` 也并非标准字段。若想让采样参数真正生效，建议这样写：

```javascript
// ✅ 更贴合 OpenAI 兼容接口的写法
const creativeModel = new ChatOpenAI({
  model: 'deepseek-v4-pro',
  temperature: 0.8,
  topP: 0.7,        // 用 top_p 收窄候选，替代概念上的 top_k
  maxTokens: 600,
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: 'https://api.deepseek.com' },
});
```

> 💡 原代码里的 `topk` / `maxToken` 更多是**教学演示**，用来传递「Top-K」这个核心概念；落地时记得换成接口真正支持的 `topP` / `maxTokens`。

### 8.3 两个 baseURL 的差别

细看代码，两个模型的 `baseURL` 一个是 `https://api.deepseek.com`、一个是 `https://api.deepseek.com/v1`。OpenAI 兼容接口通常二者都能访问，但**保持一致更稳妥**，避免因路由差异产生奇怪问题。

---

## 9. 一张表带走：选参速查

| 场景 | temperature | Top-K（概念）/ top_p | 关键词 |
|:---:|:---:|:---:|:---|
| 📄 代码 / 法律 / 合同 | 0.0 ~ 0.3 | 大 / 高 | 准确、确定 |
| 💬 通用问答 / 翻译 | 0.3 ~ 0.7 | 中 | 均衡 |
| ✍️ 文学 / 文案 / 漫剧 | 0.7 ~ 1.0 | 小 / 低 | 创意、发散 |

**一句话总结**：

> 🎲 **Top-K（/top_p）负责「圈范围」—— 保证下限，别跑偏；**
> 🌡️ **temperature 负责「调随机」—— 决定上限，要不要放飞；**
> 🔗 **LangChain 的 chain 负责「串流程」—— 让这一切可控、可复用、可维护。**

控制好这三个要素，你就真正摸到了「让大模型既聪明、又靠谱」的那根弦。
