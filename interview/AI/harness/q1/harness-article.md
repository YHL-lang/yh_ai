# 🐴 Harness 工程：用工程化手段驯服 LLM 的幻觉

> **一句话理解 Harness**：像马具（harness）驾驭马匹一样，用结构化流水线驾驭大模型，让它在 **"生成 → 评测 → 择优"** 的闭环中自动产出更高质量的结果。

---

## 📌 一、为什么需要 Harness？

大模型（LLM）有两个老生常谈的问题：

| 问题 | 表现 |
|------|------|
| 🎲 **不确定性** | 同一个 Prompt 每次生成的结果不同，质量参差不齐 |
| 🤥 **幻觉** | 模型可能一本正经地胡说八道，输出看似正确实则有 Bug 的代码 |

单次调用 LLM 就像"开盲盒"——你永远不知道这次拿到的是惊喜还是惊吓。

**Harness 的思路很简单：既然一次不靠谱，那就多生成几次，再让模型自己当评委挑最好的。**

---

## 🧠 二、核心思想：三板斧

Harness 的设计由三个关键模式组合而成：

```
┌─────────────────────────────────────────────────┐
│                  Harness 流水线                    │
│                                                   │
│   ① Best of N Sampling    ② LLM as Judge         │
│   ┌───────────────┐       ┌───────────────┐       │
│   │  并行生成 N 个  │──────▶│  LLM 自动评分  │       │
│   │  候选结果       │       │  0-10 打分     │       │
│   └───────────────┘       └───────┬───────┘       │
│                                   │               │
│                       ③ 择优筛选   │               │
│                       ┌───────────▼───────┐       │
│                       │  排序取最高分       │       │
│                       │  返回最优结果       │       │
│                       └───────────────────┘       │
└─────────────────────────────────────────────────┘
```

### ① Best of N Sampling（N 选 1 采样）

> 🎯 **核心思想**：并行调用 LLM 多次，利用随机性覆盖更多可能性。

模型的输出带有随机性（temperature > 0），这意味着同一个 Prompt 每次可能得到不同的答案。既然如此，**不如多跑几次，扩大搜索空间**，总有一版是好的。

### ② LLM as Judge（大模型当评委）

> 🧑‍⚖️ **核心思想**：用 LLM 替代人工评测，实现闭环自动化。

人工逐条检查候选结果太累了。既然 LLM 有代码理解能力，**不如让它自己当裁判**，对每个候选结果打分，实现全自动评审。

### ③ Harness 抽象（流水线编排）

> 🔗 **核心思想**：将"生成 → 评测 → 择优"三阶段解耦为流水线。

三个阶段各司其职，可以独立替换、升级。比如换一个更好的 Judge 模型，或者增加候选数量，都不影响其他环节。

---

## 💻 三、代码实现详解

下面以"**让 LLM 实现数组去重函数**"为例子，完整展示 Harness 的实现。

### 3.1 项目初始化

```bash
# 创建项目
mkdir q1 && cd q1 && pnpm init

# 安装依赖
pnpm add openai dotenv
```

`package.json` 关键配置：

```json
{
  "type": "commonjs",
  "dependencies": {
    "dotenv": "^17.4.2",
    "openai": "^7.8.0"
  }
}
```

> 💡 使用 `dotenv` 管理 API Key，使用 `openai` 官方 SDK 调用模型。

### 3.2 基础调用封装

```js
import OpenAI from 'openai';
import { config } from 'dotenv';
config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// 通用 LLM 调用函数
const askLLM = async (prompt) => {
  const res = await client.chat.completions.create({
    model: process.env.MODEL_NAME,
    messages: [{ role: 'user', content: prompt }]
  });
  return res.choices[0].message.content;
};
```

> 🔑 通过 `.env` 文件配置 API Key、Base URL 和模型名称，方便切换不同提供商。

### 3.3 第一步：Best of N —— 并行生成候选

```js
const generateCandidates = (prompt, n = 3) => {
  const tasks = Array.from({ length: n }, () => askLLM(prompt));
  return Promise.all(tasks);  // 并行发起 N 次请求
};
```

> ⚡ `Promise.all` 让 N 次请求并行执行，总耗时约等于单次调用的时间。如果串行调用，耗时就是 N 倍。

**执行效果示意：**

```
Prompt: "请使用 javascript 实现一个数组去重函数"
         │
         ├──▶ Candidate 1: [...new Set(arr)]
         ├──▶ Candidate 2: arr.filter((v, i) => arr.indexOf(v) === i)
         └──▶ Candidate 3: arr.reduce((acc, cur) => ...)
```

### 3.4 第二步：LLM as Judge —— 自动评分

```js
async function judge(code) {
  const prompt = `
    你是一个严格的代码评审，请判断下面代码是否正确实现"数组去重函数"
    要求：
    - 只返回一个数字评分(0-10)
    - 不要解释
    代码：
    ${code}
  `;
  const res = await askLLM(prompt);
  const score = parseFloat(res);
  return isNaN(score) ? 0 : score;
}

// 批量评估所有候选
async function evaluateAll(candidates) {
  const results = [];
  for (const code of candidates) {
    const score = await judge(code);
    results.push({ code, score });
  }
  return results;
}
```

> 🧑‍⚖️ **关键 Prompt 技巧**：
> - 明确角色："你是一个严格的代码评审"
> - 限定输出格式："只返回一个数字评分(0-10)"
> - 抑制废话："不要解释"
>
> 这样 `parseFloat()` 就能直接解析出分数，实现结构化输出。

### 3.5 第三步：择优筛选

```js
function pickBest(results) {
  return results.sort((a, b) => b.score - a.score)[0];
}
```

> 🏆 按分数降序排列，取第一个就是最优候选。

### 3.6 串联：Harness 主流程

```js
async function harness(prompt) {
  // ① 生成候选
  console.log('生成多个候选者....\n');
  const candidates = await generateCandidates(prompt, 3);
  console.log('候选结果:');
  candidates.forEach((c, i) => {
    console.log(`\n---- Candidate ${i + 1} ----\n${c}`);
  });

  // ② 评分
  console.log('\nEvaluate Candidates...\n');
  const evaluated = await evaluateAll(candidates);
  console.log('打分结果:');
  evaluated.forEach((c, i) => {
    console.log(`\n---- Candidate ${i + 1} ----\n${c.code}\n-> ${c.score}`);
  });

  // ③ 择优
  const best = pickBest(evaluated);
  return best.code;
}

// 启动 Harness
const bestCode = await harness("请使用 javascript 实现一个数组去重函数");
console.log('\n✅ 最终结果:\n', bestCode);
```

**完整执行流程：**

```
🚀 启动 Harness
│
├── ① generateCandidates(prompt, 3)
│   ├── Candidate 1: const unique = [...new Set(arr)];
│   ├── Candidate 2: arr.filter((v, i) => arr.indexOf(v) === i);
│   └── Candidate 3: arr.reduce((res, cur) => ...)
│
├── ② evaluateAll(candidates)
│   ├── Candidate 1 -> score: 9
│   ├── Candidate 2 -> score: 8
│   └── Candidate 3 -> score: 7
│
└── ③ pickBest(evaluated)
    └── ✅ Winner: Candidate 1 (score: 9)
```

---

## 🏗️ 四、架构全景

```
┌──────────────────────────────────────────────────────────┐
│                    Harness 架构图                          │
│                                                          │
│  ┌─────────┐     ┌──────────────────────────────────┐    │
│  │  Prompt  │────▶│      ① Generator (生成器)         │    │
│  └─────────┘     │  ┌────────┐ ┌────────┐ ┌────────┐│    │
│                  │  │  Gen 1  │ │  Gen 2  │ │  Gen 3  ││    │
│                  │  └───┬────┘ └───┬────┘ └───┬────┘│    │
│                  └──────┼──────────┼──────────┼─────┘    │
│                         │          │          │           │
│                         ▼          ▼          ▼           │
│                  ┌──────────────────────────────────┐    │
│                  │      ② Judge (评委)               │    │
│                  │  ┌────────┐ ┌────────┐ ┌────────┐│    │
│                  │  │Score: 9│ │Score: 7│ │Score: 8││    │
│                  │  └───┬────┘ └───┬────┘ └───┬────┘│    │
│                  └──────┼──────────┼──────────┼─────┘    │
│                         │          │          │           │
│                         ▼          ▼          ▼           │
│                  ┌──────────────────────────────────┐    │
│                  │      ③ Selector (择优器)          │    │
│                  │        排序 → 取最高分             │    │
│                  └───────────────┬──────────────────┘    │
│                                  │                        │
│                                  ▼                        │
│                          ✅ 最优结果输出                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🆚 五、对比：有无 Harness 的区别

| 维度 | ❌ 单次调用 | ✅ Harness |
|------|-----------|-----------|
| **质量保障** | 看运气，可能好也可能差 | 多次生成 + 评分筛选，质量上限更高 |
| **幻觉控制** | 无法自检 | LLM 当评委，自动过滤低质量输出 |
| **可扩展性** | 无 | 可调节候选数 N，可更换 Judge 模型 |
| **成本** | 1 次调用 | N + N 次调用（生成 N 次 + 评分 N 次） |
| **延迟** | 单次延迟 | 约 2 倍单次延迟（并行生成 + 串行评分） |

> ⚖️ **Trade-off**：Harness 用更多的 Token 消耗换取更高的输出质量。在对质量要求高、允许一定成本的场景下非常划算。

---

## 🚀 六、进阶优化方向

Harness 的三阶段解耦设计让它天然易于扩展：

### 6.1 生成阶段优化
- 🌡️ 调高 `temperature` 增加多样性
- 📝 使用不同的 Prompt 变体（多角度提问）
- 🔄 引入 Self-Refinement（让模型自我改进）

### 6.2 评测阶段优化
- 🧑‍⚖️ 使用更强的模型做 Judge（如用 GPT-4 评审 GPT-3.5 的输出）
- 📊 多维度评分（正确性、可读性、性能分别打分）
- ✅ 结合单元测试做自动化验证（代码可执行时）

### 6.3 择优阶段优化
- 🗳️ 多数投票（Majority Voting）替代简单取最高分
- 🔀 加权融合（将多个候选的优点合并）
- 📈 帕累托前沿（多目标优化）

---

## 🎯 七、适用场景

| 场景 | 适合度 | 说明 |
|------|--------|------|
| 代码生成 | ⭐⭐⭐⭐⭐ | 有明确的正确性标准，适合自动评分 |
| 文案撰写 | ⭐⭐⭐⭐ | 可从流畅度、创意等维度评分 |
| 数据分析 | ⭐⭐⭐ | 可评分但需结合业务逻辑 |
| 闲聊对话 | ⭐⭐ | 主观性强，自动评分困难 |

---

## 💡 八、面试高频追问

**Q1：Harness 和 RAG 有什么区别？**

> RAG 是从外部知识库检索信息增强输入（解决"不知道"的问题）；Harness 是多次生成 + 评分筛选增强输出（解决"不稳定"的问题）。两者可以组合使用。

**Q2：为什么用 LLM 当 Judge 而不是用规则？**

> 规则（如单元测试）只能验证功能正确性，无法评估代码风格、可读性等软指标。LLM 作为 Judge 能做更全面的语义级评估。

**Q3：N 取多大合适？**

> 通常 3-5 个即可。N 越大质量越高，但成本线性增长。实践中 3 个性价比最高，因为最好的 1/3 通常已经远超单次调用的平均水平。

**Q4：如果 Judge 本身也有幻觉怎么办？**

> 这是 Harness 的一个局限。解决方案：
> 1. 用更强的模型做 Judge（如 GPT-4 评审 GPT-3.5）
> 2. 多个 Judge 投票
> 3. 结合可执行验证（代码跑测试用例）

---

## 📝 总结

Harness 工程的核心可以用一句话概括：

> **"不信任单次 LLM 输出，用生成-评测-择优的闭环流水线驯服不确定性。"**

它体现了工程化思维解决 AI 问题的典型范式——**不追求单点完美，而是通过系统设计提升整体产出质量**。这正是 "Harness" 这个名字的精髓：不是让马自由奔跑，而是用马具引导它走向正确的方向。🐴
