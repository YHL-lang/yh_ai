# 🚀 把 DeepSeek-R1 装进浏览器 —— WebGPU + Transformers.js 端侧推理实战

> **一句话介绍：**
> 我用 **WebGPU + Transformers.js**，把 15 亿参数的推理大模型 **DeepSeek-R1-Distill-Qwen-1.5B** 直接跑在浏览器里。
> 模型从 Hugging Face 下载后缓存在本地，**推理全程不经过服务器，断网也能用**。

这个项目在面试里我只讲三个关键词：

| 🔑 关键词 | 含义 |
|-----------|------|
| 🧠 **端侧大模型** | AI 推理从"云端服务器"下沉到"用户设备" |
| 🔒 **隐私安全** | 数据不出浏览器，没有网络请求，天然合规 |
| ⚡ **WebGPU 加速** | 用浏览器直接调用 GPU 算力，而不是 CPU 硬扛 |

---

## 📌 一、为什么做这个项目（背景与价值）

传统的大模型使用方式是**云端推理**：你的问题上传到服务器，服务器跑完再返回结果。这套模式有三个绕不开的问题：

| 对比维度 | ☁️ 云端推理（传统） | 💻 浏览器推理（本项目） |
|----------|-------------------|----------------------|
| 数据隐私 | 提问内容上传到第三方服务器 | ✅ 数据全程留在本地 |
| 使用成本 | 每调一次都要付 GPU 服务器费用 | ✅ 一次下载，无限次使用 |
| 网络依赖 | 断网即不可用 | ✅ 模型缓存后可离线 |
| 响应延迟 | 受网络 RTT + 排队影响 | ✅ 本地计算，无网络往返 |
| 部署门槛 | 需要 GPU 服务器、运维 | ✅ 一个静态网页就能跑 |

> 💡 **核心洞察：** 随着模型量化技术和 WebGPU 的成熟，**"1.5B 参数量级"的模型已经可以塞进浏览器**。它不是要替代 GPT-4，而是覆盖"轻量推理 + 隐私敏感 + 离线场景"的真实需求。

---

## 🧩 二、技术选型

```bash
npm install
```

| 技术栈 | 作用 | 为什么选它 |
|--------|------|-----------|
| `@huggingface/transformers` | JS 版 Transformers 库 | 提供 `AutoTokenizer` / `AutoModelForCausalLM`，一行代码加载模型并推理 |
| **ONNX Runtime Web** | 模型运行时 | 把 ONNX 模型的计算图调度到 WebGPU 后端执行 |
| **WebGPU** | 浏览器 GPU 计算 API | 让 JS 直接调用 GPU，比 WASM/CPU 快一个量级 |
| **Web Worker** | 后台线程 | 推理是重计算，必须挪出主线程，否则页面直接卡死 |
| `marked` | Markdown → HTML | AIGC 返回的是 Markdown，要转成 HTML 才能渲染代码块、加粗、引用 |
| `dompurify` | XSS 防护 | 渲染模型输出的 HTML 前必须消毒，防止注入攻击 |
| `better-react-mathjax` | 数学公式渲染 | 推理模型经常输出 LaTeX 公式 |
| React 19 + TS + Vite | 前端框架与构建 | 类型安全 + 极速开发体验 |

---

## 🏗️ 三、整体架构

```
┌─────────────────────────── 主线程 (Main Thread) ───────────────────────────┐
│                                                                            │
│   React UI (App.tsx)                                                       │
│     ├─ 进度条 Progress.tsx      ← 模型下载进度                              │
│     ├─ 对话区 Chat.jsx          ← marked + DOMPurify + MathJax 渲染         │
│     └─ tps / token 数展示       ← 实时性能指标                              │
│                                                                            │
│            │  postMessage({ type: 'load' | 'generate' | 'interrupt' })      │
│            ▼                                          ▲                     │
└────────────┼──────────────────────────────────────────┼─────────────────────┘
             │                                          │
             ▼                                          │
┌─────────────────────────── Worker 线程 (worker.js) ────────────────────────┐
│                                                                           │
│   TextGenerationPipeline (单例)                                           │
│     ├─ AutoTokenizer.from_pretrained()      → 分词器                       │
│     └─ AutoModelForCausalLM.from_pretrained(dtype: 'q4f16', device:'webgpu')│
│                                                                           │
│   generate(messages)                                                      │
│     ├─ apply_chat_template()   → 套用 DeepSeek 对话模板                    │
│     ├─ model.generate()        → 自回归推理                                │
│     ├─ TextStreamer            → 流式吐字 + 统计 tps                       │
│     └─ InterruptableStoppingCriteria → 可中断                              │
│                                                                           │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    ▼
                    Transformers.js → ONNX Runtime Web → 🌐 WebGPU
```

> ⭐ **面试重点 1：** 主线程与 Worker 之间是**消息驱动**的，两边不共享内存（`postMessage` 是结构化克隆/转移），这既是安全隔离，也是"页面不卡"的关键。

---

## 🔄 四、完整链路：从点击 Load 到流式回答

### 阶段一：Load —— 把模型"搬"进浏览器

```
用户点击 [Load model]
        │
        ▼
worker.postMessage({ type: 'load' })
        │
        ▼
① 能力检测  navigator.gpu.requestAdapter()
        │     拿不到 adapter → 直接报 "WebGPU is not supported"
        ▼
② 异步下载（大文件分块到达，带进度回调）
   AutoTokenizer.from_pretrained(model_id, { progress_callback })
   AutoModelForCausalLM.from_pretrained(model_id, {
       dtype : 'q4f16',      // 4bit 量化权重 + fp16 计算
       device: 'webgpu',     // 用 GPU 跑
       progress_callback,
   })
   // 两个下载是并行的 → Promise.all([tokenizer, model])
        │
        ▼
③ 预热：用假输入跑一次，提前编译 shader
   await model.generate({ ...tokenizer('a'), max_new_tokens: 1 })
        │
        ▼
postMessage({ status: 'ready' })  →  解锁输入框
```

**进度回调是怎么驱动的？** 这是全链路里最出彩的一段，因为它涉及"**多个文件并发下载**"的状态管理：

```
Worker → postMessage({ status: 'initiate', file })   → 主线程新增一条进度条
Worker → postMessage({ status: 'progress', file, progress, total }) → 更新对应进度
Worker → postMessage({ status: 'done',     file })   → 移除该进度条
```

主线程用 **函数式更新** 来处理，避免闭包拿到旧状态：

```js
// ❌ 错误示范：并发回调容易拿到过期的 state
setProgressItems([...progressItems, e.data]);

// ✅ 正确做法：用函数式更新，永远基于最新状态计算
setProgressItems((prev) => [...prev, e.data]);
```

> ⭐ **面试重点 2：** `progress` 回调在多个文件下载时**高频触发**，必须用函数式 `setState((prev) => ...)`，否则会出现"进度条丢失/错乱"。这是我踩过的坑。

### 阶段二：Generate —— 流式生成

```
用户输入 → messages 追加 { role:'user', content }
        │
        ▼
tokenizer.apply_chat_template(messages, { add_generation_prompt: true })
        │   套用 DeepSeek 模板，并在末尾追加 "<|im_start|>assistant\n" 引导续写
        ▼
model.generate({ max_new_tokens: 2048, streamer, stopping_criteria })
        │
        ▼
TextStreamer 每生成一个 token 就回调 → postMessage({ status:'update', output, tps, state })
        │
        ▼
主线程把 output 拼到"最后一条 assistant 消息"上 → React 重渲染 → 打字机效果 ✨
```

### 阶段三：Interrupt / Reset

| 操作 | 实现 |
|------|------|
| ⏹ **中断生成** | `InterruptableStoppingCriteria` —— 每次生成 token 都检查这个条件，为 `true` 就停下 |
| 🔄 **重置对话** | 清空 `past_key_values_cache` + `stopping_criteria.reset()` |

---

## 🧠 五、Transformer 原理详解（面试重头戏）

> 这套前端代码之所以能跑起来，是因为背后有一个完整的 Transformer 在干活。下面我按**数据的流动顺序**讲一遍。

### 5.1 大模型的本质：一个"下一个词预测器"

先把神秘感去掉 —— Transformer 做的事情，本质上是：

> **给我前面这段话，我预测下一个 token 是什么。**

```
输入： "今天天气真"
输出： { "好": 0.72, "不错": 0.15, "冷": 0.06, ... }   ← 词表上所有 token 的概率分布
       取概率最高的 "好"，拼回去，再预测下一个……
```

就这么一个朴素的任务，在**海量文本**上训练后，模型就"涌现"出了翻译、写代码、数学推理等能力。**自回归（Autoregressive）** 指的就是这种"生成一个 → 拼回去 → 再生成"的循环。

本项目用的 **DeepSeek-R1-Distill-Qwen-1.5B** 是**纯 Decoder 架构**（GPT 系），它包含 3 个部分：

```
① Tokenizer（分词器）→ ② Transformer Decoder 堆叠（N 层）→ ③ LM Head（输出层）
```

### 5.2 第一步：Tokenizer —— 文本 → token id

模型不认识字，只认识数字。Tokenizer 负责切分：

```
"你好，世界"  →  [ "你好", "，", "世界" ]  →  [ 108386, 3837, 99494 ]
                    ↑ 子词切分（BPE）
```

- **为什么不用字或词？** 用字则序列太长，用词则词表爆炸且无法处理新词。**子词（Subword）** 是平衡点。
- 本项目里，这一层是 `AutoTokenizer.from_pretrained()` 下载的 `tokenizer.json`。

**⚡ 关键点 1：对话模板（Chat Template）**

原始的 Decoder 只会续写文本，它不认识"用户/助手"的角色。所以要把多轮对话拍平成一段**带特殊标记的字符串**：

```
<|im_start|>system
你是一个有帮助的助手<|im_end|>
<|im_start|>user
1+1等于几？<|im_end|>
<|im_start|>assistant
```

代码里就是这一行：

```js
const inputs = tokenizer.apply_chat_template(messages, {
  add_generation_prompt: true,  // 末尾自动追加 <|im_start|>assistant\n，让模型"接着答"
  return_dict: true,
});
```

> ⭐ **面试重点 3：** 不同模型的模板是**训练时定的**，推理时必须严格对齐，否则效果会明显下降。这就是"模型适配"最基础的一环。

### 5.3 第二步：Embedding —— 数字 → 向量

token id 是一个整数，没有语义。查一张 **Embedding 表**（尺寸 `词表大小 × 隐藏维度 d`），把它变成 `d` 维向量：

```
token id: 99494  →  [0.12, -0.87, 0.44, ..., 0.03]   (d 维，比如 1536)
```

同时要注入 **位置编码（Positional Encoding）**。因为 Attention 本身是"无序"的（打乱输入顺序，计算结果只是跟着换位置），必须额外告诉模型"谁在前谁在后"。

> 💡 现代模型多用 **RoPE（旋转位置编码）**，通过旋转向量的角度来编码相对位置，外推能力更好。

### 5.4 第三步：Self-Attention —— 整个架构的灵魂

这是面试最容易被追问的地方。我用一个**图书馆检索**的类比来讲：

| 符号 | 类比 | 作用 |
|------|------|------|
| **Q** (Query) | 你手上的**检索词** | 我想找什么信息 |
| **K** (Key) | 每本书的**标签/索引** | 我能提供什么信息 |
| **V** (Value) | 每本书的**正文内容** | 实际被取走的信息 |

计算流程：

```
① 由输入 X 线性变换出三个矩阵：
      Q = X · W_Q      K = X · W_K      V = X · W_V

② 用 Q 和 K 做点积，算"注意力分数"（谁跟谁相关）：
      scores = Q · Kᵀ / √d_k          ← 除以 √d_k 是防止梯度消失

③ 做因果掩码（Decoder 独有！）：
      把"未来"的位置置为 -∞，保证 token i 只能看到 j ≤ i
      ┌─────────────────┐
      │ ✓ ✗ ✗ ✗ ✗       │   ← 第1个词只能看自己
      │ ✓ ✓ ✗ ✗ ✗       │   ← 第2个词能看前两个
      │ ✓ ✓ ✓ ✗ ✗       │      （下三角矩阵，这就是"因果"的含义）
      │ ✓ ✓ ✓ ✓ ✗       │
      │ ✓ ✓ ✓ ✓ ✓       │
      └─────────────────┘

④ softmax 归一化成概率，再对 V 加权求和：
      Attention(Q,K,V) = softmax(Q·Kᵀ / √d_k) · V
```

**一句话理解：** 每个 token 都会去"询问"前面所有 token（Q 查 K），按相关度分配注意力权重，然后把它们的 Value **加权融合**成自己的新表示。

这就是为什么模型能理解"**它**指的是前面哪个名词"—— 指代消解就是注意力分数高的表现。

### 5.5 Multi-Head Attention —— 多视角并行

单个注意力头只能学到一种"关注方式"。于是把 `d` 维拆成 `h` 个头，各自独立算，最后拼接：

```
d = 1536，h = 12   →   每个头负责 128 维

    头1：关注"语法主谓关系"
    头2：关注"指代关系"
    头3：关注"标点/句式结构"
    ...
    头h：关注"某种我们说不清的模式"

    Concat(头1..头h) → 线性投影 W_O → 输出
```

> 💡 多头的价值：**让模型在同一层里，从多个子空间并行捕捉不同的语义关系**。

### 5.6 FFN —— 逐位置的前馈网络

Attention 负责"token 之间交流信息"，但它本质是**线性加权**。所以每个 Transformer 块后面接一个两层 MLP 做**非线性变换**：

```
x → Linear(d → 4d) → 激活函数(GELU / SwiGLU) → Linear(4d → d) → 输出
```

- 参数量上，FFN 通常占整个块的大头（约 2/3）。
- 直觉理解：Attention 决定"**看哪里**"，FFN 决定"**怎么处理看到的东西**"。

### 5.7 组装：一个 Transformer Block 长什么样

```
输入 X
  │
  ├───────────────┐
  ▼               │
LayerNorm         │  ← Pre-Norm（现代主流，训练更稳）
  ▼               │
Multi-Head         │
Self-Attention     │
  ▼               │
  ⊕ ◄─────────────┘  ← 残差连接（Residual），缓解梯度消失
  │
  ├───────────────┐
  ▼               │
LayerNorm         │
  ▼               │
FFN (MLP)         │
  ▼               │
  ⊕ ◄─────────────┘
  │
  ▼
下一层（共 N 层，1.5B 模型大约 28 层）
```

**两个工程细节必须记住：**

| 机制 | 作用 |
|------|------|
| 🔗 **残差连接** | `output = x + f(x)`，让梯度能"抄近路"回传，才能堆深 |
| 📏 **LayerNorm** | 每层前归一化，稳定数值分布；**Pre-Norm** 比 Post-Norm 更容易训练 |

### 5.8 输出：从向量到"下一个字"

N 层堆叠之后，最后一层的输出经过：

```
最后一层输出
   ▼
Final LayerNorm
   ▼
LM Head（Linear：d → 词表大小）
   ▼
logits（词表上每个 token 的原始分数）
   ▼
softmax → 概率分布 🎯
   ▼
采样策略选一个 token：
   ├─ greedy         ：永远选概率最高的（本项目 do_sample: false）
   ├─ temperature    ：>1 更随机、<1 更保守
   └─ top-k / top-p  ：只在概率最高的前 k 个 / 累计 p 的范围内采样
```

### 5.9 自回归生成与 KV Cache（性能关键）

生成是**逐 token** 进行的：

```
第1步：输入 [今天, 天气]            → 生成 "真"
第2步：输入 [今天, 天气, 真]        → 生成 "好"
第3步：输入 [今天, 天气, 真, 好]    → 生成 "！"
```

**问题：** 第 2 步里，"今天/天气"的 K、V 和第 1 步**完全一样**，重算就是浪费。而且每多一个 token，全序列注意力是 `O(n²)` 的。

**解法：KV Cache** —— 把每层算好的 K、V 缓存起来，新 token 只算自己的 Q：

```
无 KV Cache：每步重算全序列  →  O(n²) 增长
有 KV Cache：每步只算新 token →  O(n)  增长 ✅
```

本项目里对应的代码：

```js
let past_key_values_cache = null;

const { past_key_values, sequences } = await model.generate({
  ...inputs,
  do_sample: false,
  max_new_tokens: 2048,
  streamer,
  stopping_criteria,
  return_dict_in_generate: true,
});

past_key_values_cache = past_key_values;  // 缓存下来，下一轮对话复用
```

> ⭐ **面试重点 4：** KV Cache 是**推理侧最重要的优化**，它用显存换时间。多轮对话能"记住上文"，靠的就是这份缓存。

### 5.10 推理模型（R1）的特殊性：思考 token

普通模型直接给答案，**推理模型 DeepSeek-R1 会先"想"再答**：

```
<think>
首先，x² - 3x + 2 = 0 可以因式分解为 (x-1)(x-2) = 0
所以 x = 1 或 x = 2。让我验证一下……
</think>
x = 1 或 x = 2
```

代码里通过**检测特殊 token id** 来切分"思考"和"回答"两个阶段：

```js
const [START_THINKING_TOKEN_ID, END_THINKING_TOKEN_ID] = tokenizer.encode(
  "<think></think>", { add_special_tokens: false }
);

let state = "thinking";
const token_callback_function = (tokens) => {
  if (tokens[0] == END_THINKING_TOKEN_ID) {
    state = "answering";   // 思考结束，切到正式回答
  }
};
```

UI 层再根据状态记录 `answerIndex`，把内容拆成**可折叠的"思考过程"** + **最终答案**：

```jsx
// App.tsx：状态从 thinking 切到 answering 的那一刻，记录切分点
if (data.answerIndex === undefined && state === "answering") {
  data.answerIndex = last.content.length;
}
```

```jsx
// Chat.jsx：按切分点拆分渲染
const thinking = answerIndex ? content.slice(0, answerIndex) : content;
const answer   = answerIndex ? content.slice(answerIndex) : "";
```

效果就是 ChatGPT o1 / DeepSeek 那种 "**Thinking... ▸**" 的可展开思维链。🧠

---

## ✨ 六、工程亮点（面试加分项）

### 6.1 WebGPU 能力检测 & TypeScript 类型声明

```js
const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
```

看起来一行，但踩了两个坑：

**坑 1：`navigator.gpu` 报错**
WebGPU 是较新的实验性 API，TS 的 `Navigator` 类型里**根本没有 `gpu` 属性**。

```ts
// ❌ 报错：Property 'gpu' does not exist on type 'Navigator'
navigator.gpu

// 🩹 临时方案：类型断言
(navigator as any).gpu
```

但 `as any` 是**放弃类型检查**，用多了会让 TS 形同虚设、类型污染扩散。

**正解：安装类型声明文件**

```bash
pnpm i -D @webgpu/types
```

```json
// tsconfig.app.json —— 让 TS 认识 WebGPU 的类型
{
  "compilerOptions": {
    "types": ["vite/client", "@webgpu/types"]
  }
}
```

> 💬 **我的理解：** TS 的类型检测能力，本质来自 `@types/*` 这类**声明文件**。`navigator.gpu` 报错不是代码错了，而是"**缺少描述它的说明书**"。这也是我理解 TS 类型系统底层的一个转折点。

**坑 2：`check()` 为什么要拿 adapter？**

```js
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error("WebGPU is not supported (no adapter found)");
```

概念分层要讲清楚：

```
navigator.gpu            ← WebGPU 入口
      ▼ requestAdapter()
   adapter               ← GPU 适配器的抽象（代表一块显卡）
      ▼ requestDevice()
   device                ← 实际执行计算/渲染的句柄
```

这里只验证 `adapter` 是否存在，就足以判断浏览器是否支持 WebGPU。

### 6.2 Web Worker —— 主线程绝不能碰重计算

```js
worker.current = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",   // ⚠️ 浏览器默认不支持 Worker 里的 ESM，必须显式声明
});
```

| 为什么要 Worker | 说明 |
|----------------|------|
| 🚫 **避免页面卡死** | 模型推理是秒级、密集的同步计算，放主线程会直接冻结 UI |
| 🎨 **保证渲染流畅** | 主线程只负责渲染，计算全部下沉到 Worker |
| 🔌 **消息驱动** | 通过 `postMessage` / `addEventListener('message')` 通信 |

Worker 侧用 `switch` 分发指令，语义非常清晰：

```js
self.addEventListener("message", async (e) => {
  const { type, data } = e.data;
  switch (type) {
    case "check":     check();      break;  // 检测 WebGPU
    case "load":      load();       break;  // 加载模型
    case "generate":  stopping_criteria.reset(); generate(data); break;
    case "interrupt": stopping_criteria.interrupt(); break;        // 中断
    case "reset":     past_key_values_cache = null; stopping_criteria.reset(); break;
  }
});
```

### 6.3 单例模式 + 惰性加载 —— 一个人只能有一个模型

模型加载动辄 GB 级、耗时很长。如果每次生成都重新加载，页面直接崩溃。所以用**单例模式**保证全局只初始化一次：

```js
class TextGenerationPipeline {
  static model_id = "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX";

  static async getInstance(progress_callback = null) {
    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, { progress_callback });
    this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback,
    });
    return Promise.all([this.tokenizer, this.model]);
  }
}
```

**三个设计要点：**

| 要点 | 代码 | 说明 |
|------|------|------|
| ① 静态属性 | `static model_id` | 类级别的"存储容器"，不属于任何实例 |
| ② 惰性初始化 | `??=` 空值合并赋值 | **只在下游为 `null`/`undefined` 时才赋值**，已有实例则直接复用 |
| ③ 并发安全 | `Promise.all` | 存的是 **Promise 而非结果**，所以并发调用也只会发起一次下载 ✅ |

**为什么用 `??=` 而不是 `if (!x)`？**

```js
// ??= 只在 null / undefined 时赋值 —— 语义精准
this.model ??= load();

// if (!x) 会把 0、''、false 也当成"空"，属于误判
if (!this.model) this.model = load();
```

> ⭐ **面试重点 5：** 单例模式解决的是"**全局唯一 + 昂贵资源复用**"。这里的精妙之处在于：**缓存的是 Promise**，所以即使 `getInstance()` 被并发调用多次，也只会触发一次下载。

### 6.4 流式输出 & 实时性能指标

如果等 2048 个 token 全生成完再返回，用户要盯着空白屏幕等十几秒 —— 体验极差。用 `TextStreamer` 每生成一个 token 就推给 UI：

```js
const streamer = new TextStreamer(tokenizer, {
  skip_prompt: true,
  skip_special_tokens: true,
  callback_function,        // 拿到解码后的文本片段
  token_callback_function,  // 拿到 token id（用于状态机判断）
});

// 用 performance.now() 实时计算 tps
const token_callback_function = (tokens) => {
  startTime ??= performance.now();
  if (numTokens++ > 0) {
    tps = (numTokens / (performance.now() - startTime)) * 1000;  // tokens/秒
  }
};
```

界面上实时显示 **`xx.xx tokens/second`** —— 这既是用户体验，也是**性能回归的量化指标**。

### 6.5 模型量化：q4f16

```js
device: "webgpu",
dtype : "q4f16",   // 权重 4bit 量化，计算用 fp16
```

| 精度 | 1.5B 模型体积（约） | 说明 |
|------|-------------------|------|
| fp32 | ~6 GB | 浏览器基本不可用 |
| fp16 | ~3 GB | 下载太慢 |
| **q4f16** | **~1 GB** | ✅ 精度损失很小，体积可接受 |

> 💡 **面试可延伸：** 量化的本质是"**用更少的 bit 表示权重**"，代价是精度损失，收益是**下载体积、内存占用、带宽**全面下降。这是端侧 AI 能落地的**前提条件**。

### 6.6 Markdown 渲染 + 安全防护

模型输出的是 Markdown 和 LaTeX，直接显示是乱码。渲染链路：

```
原始文本 → marked.parse()  → HTML 字符串
         → DOMPurify.sanitize() → 🛡️ 消毒，防 XSS
         → dangerouslySetInnerHTML → 渲染
         → MathJax 包裹 → 数学公式正常显示
```

```js
const result = DOMPurify.sanitize(
  marked.parse(text, { async: false, breaks: true })
);
```

> ⚠️ **安全提醒：** 只要用 `dangerouslySetInnerHTML` 渲染**第三方内容**，就必须配 `DOMPurify`。否则模型可以"被诱导"输出恶意脚本，造成 XSS。

---

## 📊 七、性能与体验优化汇总

| 优化点 | 手段 | 收益 |
|--------|------|------|
| 下载体积 | `dtype: 'q4f16'` | ~3GB → ~1GB |
| 计算速度 | `device: 'webgpu'` | GPU 并行，远快于 WASM/CPU |
| 首屏可用性 | 用假输入预热（`max_new_tokens: 1`） | 提前编译 shader，避免首次生成卡顿 |
| 重复计算 | KV Cache | 每步 `O(n²)` → `O(n)` |
| 页面流畅 | Web Worker | 主线程不阻塞 |
| 感知等待 | TextStreamer 流式输出 | 首字延迟大幅降低 |
| 可中断 | `InterruptableStoppingCriteria` | 用户可随时停止，不浪费算力 |
| 滚动体验 | 粘性滚动（阈值 120px） | 用户往上翻时不被"拽回底部" |
| 输入体验 | 动态 `resize` textarea | 高度 24px ~ 200px 自适应 |

---

## 🎤 八、面试高频追问 & 我的回答

<details open>
<summary><b>Q1：为什么用 Web Worker？不用会怎样？</b></summary>

模型推理是**秒级的密集同步计算**。放在主线程会阻塞渲染 → 页面完全冻结、进度条都不动、用户以为卡死了。
Worker 让计算和渲染分离，主线程只处理 UI，推理过程还能实时回传进度和流式 token。
</details>

<details open>
<summary><b>Q2：单例模式在这个项目里解决了什么问题？</b></summary>

模型加载**昂贵且幂等**（同样的 `model_id` 只需加载一次）。如果不用单例，每轮对话都重新下载/初始化，既浪费时间又爆内存。
这里用 `static` 属性 + `??=` 惰性赋值实现单例，**缓存的是 Promise**，所以并发调用也只会触发一次下载。
</details>

<details open>
<summary><b>Q3：`navigator.gpu` 为什么 TS 会报错？怎么解？</b></summary>

因为 TS 内置的 `Navigator` 类型里没有 `gpu` 属性 —— **不是代码错，是缺类型声明文件**。
临时方案是 `(navigator as any).gpu`，但 `any` 会绕过类型检查、容易泛滥。
正解是装 `@webgpu/types`，并在 `tsconfig.app.json` 的 `types` 里声明。
</details>

<details open>
<summary><b>Q4：模型的注意力机制是怎么工作的？</b></summary>

把输入线性变换成 Q/K/V 三个矩阵（类比"检索词/索引/正文"）。用 `Q·Kᵀ` 算相关性，除以 `√d_k` 缩放，Decoder 还要加**因果掩码**（只能看左边），softmax 后对 V 加权求和。
多头就是把这个过程分成 h 个子空间并行做，再拼接 —— 让模型从多个视角捕捉语义关系。
</details>

<details open>
<summary><b>Q5：KV Cache 为什么能加速？</b></summary>

自回归生成时，前面 token 的 K/V 不会变，但每步都在重算，且复杂度是 `O(n²)`。
缓存后，新 token 只需要算自己的 Q，去和缓存的 K/V 做注意力，复杂度降到 `O(n)`。
代价是**显存占用**，属于典型的"空间换时间"。
</details>

<details open>
<summary><b>Q6：`do_sample: false` 是什么意思？</b></summary>

就是 **greedy decoding（贪心解码）** —— 每步都取概率最高的 token。
优点是稳定、可复现；缺点是缺乏多样性、可能陷入重复。
如果需要更有创造性的输出，可以开 `temperature` / `top_k` / `top_p`。
</details>

<details open>
<summary><b>Q7：为什么要 `DOMPurify`？</b></summary>

因为要用 `dangerouslySetInnerHTML` 渲染模型输出的 HTML。而模型输出是**不可信内容**（可能被 prompt injection 诱导出恶意脚本）。
`DOMPurify` 会过滤掉危险标签和属性，防止 XSS。这是渲染第三方内容的**标准安全实践**。
</details>

---

## 🎯 九、总结

```
      ┌──────────────────────────────────────────────────┐
      │  端侧 AI = 量化模型 + WebGPU 算力 + 流式体验       │
      └──────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ① 模型能"装下"       ② 算力能"跑动"         ③ 体验能"接受"
    q4f16 量化           WebGPU + ONNX          Worker + 流式
    ~3GB → ~1GB          硬件加速                首字秒出、可中断
```

**这个项目让我真正打通了几件事：**

| 收获 | 说明 |
|------|------|
| 🧠 **原理层** | 从 Tokenizer → Embedding → Attention → FFN → 采样，完整走通 Transformer 的推理链路 |
| ⚙️ **工程层** | Web Worker 线程隔离、单例模式的资源复用、消息协议设计、并发状态管理 |
| 🔧 **语言层** | TS 类型声明的本质（`@types/*`）、`as` 断言与 `any` 的边界、`??=` 的精确语义 |
| 🚀 **性能层** | 量化、KV Cache、shader 预热、流式输出 —— 每一步都在为"端侧可用"服务 |
| 🛡️ **安全层** | `dangerouslySetInnerHTML` 必须配 `DOMPurify` |

> 💬 **一句话收尾：**
> 这个项目最有价值的地方，不是"跑起来了一个大模型"，而是让我理解到 ——
> **AI 应用的瓶颈，往往不在算法本身，而在工程：怎么把 15 亿参数塞进浏览器、怎么让用户不卡、怎么让首字更快出现。**
> 把原理讲清楚，把工程做扎实，这才是端侧 AI 真正的门槛。

---

## 📚 附：参考资料

- 🤗 [Transformers.js 官方文档](https://huggingface.co/docs/transformers.js)
- 🧠 [DeepSeek-R1-Distill-Qwen-1.5B-ONNX 模型页](https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX)
- ⚡ [WebGPU 规范](https://www.w3.org/TR/webgpu/)
- 📖 [Attention Is All You Need (Transformer 原论文)](https://arxiv.org/abs/1706.03762)
