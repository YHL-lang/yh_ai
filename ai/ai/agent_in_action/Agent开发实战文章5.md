# 🤖 Agent 智能体开发实战 · 第五课：Mini-Cursor —— 手写 AI 编程 Agent 终极实战

> **上节回顾**：第四课我们打造了完整的四工具模块化工具箱（`all-tools.mjs`），覆盖了读、写、列、执行四个核心能力。
>
> **本课聚焦**：把工具箱接入一个完整的 Agent 主程序，用 **ReAct 循环 + 安全护栏 + 工程化细节**，从零手写一个能真正干活的小型 AI 编程 Agent —— **Mini-Cursor**。

---

## 📖 本课目录

- [一、什么是 Mini-Cursor](#一什么是-mini-cursor)
- [二、架构全景图](#二架构全景图)
- [三、Agent 主程序逐层拆解](#三agent-主程序逐层拆解)
- [四、实战：Agent 如何生成 React TodoList 项目](#四实战agent-如何生成-react-todolist-项目)
- [五、工程化精要](#五工程化精要)
- [六、本课学习总结](#六本课学习总结)

---

## 一、什么是 Mini-Cursor

### 🎯 定位

**Mini-Cursor** 是五节课的集大成者——把前四课的所有能力串联成一个**可独立运行的 AI 编程 Agent**：

```
第一课 Tool 定义  ──┐
第二课 Agent Loop  ──┤
第三课 CLI Tool    ──┼──▶  Mini-Cursor = 第四课工具箱 + 第五课主程序
第四课 完整工具集  ──┘
```

更直白地说，**运行 `mini-cursor.mjs`，它会自动调用 `all-tools.mjs` 里的四个工具，在大约 10-15 轮 ReAct 循环后，在 `hello-langchain/react-todo-app/` 下生成一个完整可运行的 React TodoList 项目。**

### 🆚 与 Cursor/Trae 的关系

| 特性 | Mini-Cursor | Cursor / Trae |
|------|-------------|---------------|
| LLM 推理 | ✅ DeepSeek | ✅ GPT/Claude |
| 文件读写 | ✅ read + write | ✅ 完整 IDE 集成 |
| 命令执行 | ✅ spawn | ✅ 终端集成 |
| 项目结构感知 | ✅ list_directory | ✅ 文件树 |
| 多文件编辑 | ✅ 循环多次 | ✅ diff apply |
| 代码补全 | ❌ | ✅ 内置 |
| GUI 界面 | ❌ | ✅ VS Code / IDE |

> 🎯 Mini-Cursor 去掉 GUI 和高级功能，保留了 AI 编程 Agent 最核心的本质：**LLM 思考 + 工具执行 + 循环反馈**。

---

## 二、架构全景图

```
┌──────────────────────────────────────────────────────────┐
│                     🤖 Mini-Cursor                         │
│                                                          │
│  ┌────────────┐    ┌────────────────┐    ┌────────────┐  │
│  │   LLM      │    │  runAgentWith  │    │ all-tools  │  │
│  │ deepseek   │◄──►│  Tools()       │◄──►│ .mjs       │  │
│  │ v4-pro     │    │  主循环函数     │    │ 工具箱     │  │
│  └────────────┘    └────────────────┘    └────────────┘  │
│                           │                    │         │
│                           │           ┌────────┼─────┐   │
│                           │           │        │     │   │
│                           │      📖read  ✍️write 📋list 🖥️exec│
│                           │           │        │     │   │
│                           ▼           ▼        ▼     ▼   │
│                     chalk 彩色输出    node:fs  node:child  │
│                                       .promises  _process │
└──────────────────────────────────────────────────────────┘
```

### 📂 文件关系

```
src/
├── all-tools.mjs      ← 第四课产物：四工具模块
└── mini-cursor.mjs    ← 本课产物：Agent 主程序

mini-cursor.mjs  ──import──▶ all-tools.mjs
       │
       └── runAgentWithTools(case1) ──▶ 生成 react-todo-app/
```

---

## 三、Agent 主程序逐层拆解

### 🏗️ Layer 1：依赖导入与 LLM 初始化

```javascript
// 手写 mini-cursor
// 使用 vite 基于 react 创建 todolist 项目，帮我跑起来，
// 给我目录列表
// 编程 Agent 自动化
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages';
import {
  executeCommandTool,
  readFileTool,
  writeFileTool,
  listDirectoryTool
} from './all-tools.mjs';
import chalk from 'chalk'; // 颜色输出 突出重点
```

| 依赖 | 来源 | 作用 |
|------|------|------|
| `dotenv/config` | npm | 加载 `.env` 环境变量 |
| `ChatOpenAI` | `@langchain/openai` | LLM 统一接口 |
| `{Human, System, Tool}Message` | `@langchain/core` | 消息角色 |
| `{四工具}` | `./all-tools.mjs` | 工具箱模块 |
| `chalk` | npm | 🎨 彩色终端输出，突出重点 |

```javascript
const model = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',  // ⬆️ 升级：pro 模型，编程能力更强
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const tools = [
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  executeCommandTool
]
// lang + chain（链）
const modelWithTools = model.bindTools(tools);
```

> 💡 **为什么用 `deepseek-v4-pro`？** Mini-Cursor 需要 LLM 生成大量 React 代码，编程任务对模型能力要求高，pro 模型比 flash 更适合。

---

### 🏗️ Layer 2：任务 Prompt（case1）

```javascript
const case1 = `
创建一个功能丰富的 React TodoList 应用：
1. 创建项目 ： 
echo -e "n\nn" | pnpm create vite react-todo-app --template react-ts
2. 修改 src/App.tsx，实现完整功能的 TodoList:
- 添加、删除、标记完成
- 分类筛选（全部/进行中/已完成）
- 统计信息显示
- localStorage 数据持久化 
3. 添加复杂样式
- 渐变背景（蓝到紫）
- 卡片阴影，圆角
- 悬停效果
4. 添加动画：
- 添加/删除时的过渡动画 
- 使用 css transitions
5. 列出目录确定

注意： 使用 pnpm，功能要完整，样式要美观，要有动画效果 

之后 react-todo-app 项目中：
1. 使用 pnpm install 安装依赖
2. 使用 pnpm run dev 启动服务器
`
```

> 🎯 这个 Prompt 是一个**完整的编程任务规格书**，涵盖了项目创建、代码实现、样式设计、运行验证四个阶段。LLM 需要自己规划步骤、调用工具、逐步完成。

---

### 🏗️ Layer 3：核心 Agent 执行函数

```javascript
// Agent 执行函数 ReAct
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new SystemMessage(`你是一个项目管理助手，使用工具完成任务。
        当前工作目录: ${process.cwd()}
        工具: 
        1. read_file: 读取文件
        2. write_file: 写入文件
        3. execute_command: 执行命令（支持 workingDirectory 参数）
        4. list_directory: 列出目录
        重要规则 - execute_command：
            - workingDirectory 参数会自动切换到指定目录
            - 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
            - 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" }
            这是错误的！因为 workingDirectory 已经在 react-todo-app 目录了，再 cd react-todo-app 会找不到目录
            - 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
            这样就对了！workingDirectory 已经切换到 react-todo-app，直接执行命令即可

            回复要简洁，只说做了什么
        
        `),
    new HumanMessage(query)
  ];
```

### 🔑 SystemMessage 的两个关键设计

| 设计 | 说明 |
|------|------|
| 📂 `当前工作目录: ${process.cwd()}` | 告知 LLM 它在哪个目录下操作，避免路径混乱 |
| ⚠️ `workingDirectory` 规则 | **防止 LLM 犯典型错误**：在 workingDirectory 里重复 cd，导致路径叠加找不到目录 |

> 💡 这就是写 Agent 的经验——**在 System Prompt 里提前埋好"防坑规则"**，比事后修 bug 高效得多。

```javascript
  // ReAct 循环是 Agent 执行流程
  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`正在等待第${i}次 AI 思考...`))
    const response = await modelWithTools.invoke(messages);
    messages.push(response);
    if (!response.tool_calls ||
      response.tool_calls.length === 0) {
      console.log(`\n: AI 最终回复：\n ${response.content}\n`);
      return response.content
    }

    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      if (foundTool) {
        const toolResult = await foundTool.invoke(toolCall.args)
        messages.push(new ToolMessage({
          content: toolResult,
          tool_call_id: toolCall.id
        }))
      }
    }
  }
  return messages[messages.length - 1].content
}
```

### 🔄 for vs while

本课用 `for` 而非 `while`，因为 `maxIterations = 30` 提供了硬性兜底：

| 对比项 | while | for |
|--------|-------|-----|
| 退出条件 | LLM 不返回 tool_calls | LLM 不返回 tool_calls **或** 达到最大次数 |
| 安全性 | 可能无限循环 | `maxIterations` 硬性兜底 |
| 适用场景 | 简单任务（1-2轮） | **复杂工程任务（10+轮）** |

> 🛡️ **安全护栏**：任务复杂时 Agent 可能反复调用工具陷入循环，`maxIterations` 确保最多 30 轮就会停止，不会无限烧 token。

---

### 🏗️ Layer 4：执行入口 + 超时兜底

```javascript
try {
  await runAgentWithTools(case1);
} catch (err) {
  console.error(`\n 错误：${err.message}`);
}

// ⏰ 超时兜底强制退出进程
setTimeout(() => {
  console.log("⏰ 超时兜底强制退出进程");
  process.exit(0);
}, 1000000);
```

| 防护层 | 机制 | 作用 |
|--------|------|------|
| 🛡️ 第一层 | `maxIterations = 30` | 防止无限循环 |
| 🛡️ 第二层 | `try-catch` | 捕获未预期的异常 |
| 🛡️ 第三层 | `setTimeout` 超时退出 | 兜底：1,000,000ms（约16分钟）后强制退出进程 |

> 🏭 **三重安全护栏**是工程级 Agent 的标配——Agent 运行在服务器上时，不能因为任何原因卡死。

---

## 四、实战：Agent 如何生成 React TodoList 项目

### 🎬 执行过程还原

当 `runAgentWithTools(case1)` 运行时，Agent 经历了约 **10-15 轮** ReAct 循环：

```
🚀 Mini-Cursor 启动
│
├── Round 1-2  🏗️ 创建项目
│   REASON: 需要先创建 Vite 项目骨架
│   ACT:     execute_command "echo -e 'n\nn' | pnpm create vite react-todo-app --template react-ts"
│   OBSERVE: ✅ 项目创建成功
│
├── Round 3    📋 了解项目结构
│   REASON: 查看 react-todo-app/src 下有哪些文件
│   ACT:     list_directory "react-todo-app/src"
│   OBSERVE: App.tsx, main.tsx, index.css ...
│
├── Round 4    📖 读取现有代码
│   REASON: 了解 App.tsx 现有内容，准备修改
│   ACT:     read_file "react-todo-app/src/App.tsx"
│   OBSERVE: 当前是默认的 Vite 模板代码
│
├── Round 5-6  ✍️ 写入 TodoList 组件
│   REASON: 生成完整的 TodoList React 组件代码
│   ACT:     write_file "react-todo-app/src/App.tsx" + (200+ 行代码)
│   OBSERVE: ✅ 成功写入
│
├── Round 7    ✍️ 写入样式文件
│   REASON: 添加渐变背景、卡片阴影、动画效果
│   ACT:     write_file "react-todo-app/src/index.css" + (样式代码)
│   OBSERVE: ✅ 成功写入
│
├── Round 8    📦 安装依赖
│   REASON: 项目需要安装依赖才能运行
│   ACT:     execute_command "pnpm install" (workingDirectory: "react-todo-app")
│   OBSERVE: ✅ 依赖安装成功
│
├── Round 9    🚀 启动开发服务器
│   REASON: 一切就绪，启动项目
│   ACT:     execute_command "pnpm run dev" (workingDirectory: "react-todo-app")
│   OBSERVE: ✅ VITE 启动在 http://localhost:5173/
│
├── Round 10   📋 最终确认
│   REASON: 列出最终目录结构，确认所有文件就位
│   ACT:     list_directory "react-todo-app/src"
│   OBSERVE: App.tsx, index.css, main.tsx, ... 全部就位
│
└── ✅ 任务完成！输出总结
```

### 📊 工具调用统计

| 工具 | 调用次数 | 典型用途 |
|------|----------|----------|
| 🖥️ `execute_command` | 4-5 次 | 创建项目、安装依赖、启动服务 |
| ✍️ `write_file` | 2-3 次 | 写入组件代码、样式文件 |
| 📖 `read_file` | 1-2 次 | 读取现有文件内容 |
| 📋 `list_directory` | 2-3 次 | 了解目录结构、确认文件就位 |

### 🎯 生成的项目

> 📂 **实锤**：`hello-langchain/react-todo-app/` 目录真实存在，它就是 `node src/mini-cursor.mjs` 跑出来的产物。

Agent 在没有任何人工编写代码的情况下，全自动生成了以下内容：

- ✅ Vite + React + TypeScript 项目骨架（`npm init vite` 创建）
- ✅ 完整的 TodoList 组件：添加、删除、标记完成
- ✅ 分类筛选：全部 / 进行中 / 已完成
- ✅ 统计信息显示（共 X 项，已完成 Y 项）
- ✅ localStorage 数据持久化（刷新不丢失）
- ✅ 渐变背景（蓝→紫）+ 卡片阴影 + 圆角 + 悬停效果
- ✅ CSS transitions 过渡动画（添加/删除时平滑过渡）
- ✅ 依赖已安装（`pnpm install`）、开发服务器已启动（`pnpm run dev`）

---

## 五、工程化精要

### 📋 Mini-Cursor 的工程化要点

| 要点 | 实现 | 位置 |
|------|------|------|
| 📦 模块分离 | 工具定义独立于 Agent 逻辑 | `all-tools.mjs` ← `mini-cursor.mjs` |
| 🎨 可视化反馈 | chalk 彩色输出 | `chalk.bgGreen(...)` |
| 🔢 迭代上限 | `maxIterations = 30` | `runAgentWithTools` 参数 |
| 🛡️ 异常兜底 | `try-catch` + 超时 `setTimeout` | 最外层 |
| 📝 防坑规则 | Prompt Engineering | SystemMessage 中的 `workingDirectory` 规则 |
| 🎯 模型选型 | 编程任务用 pro 模型 | `deepseek-v4-pro` |

### 🧩 完整启动流程

```bash
# 1. 确保 .env 配置了 DEEPSEEK_API_KEY
# 2. 运行 Agent
node src/mini-cursor.mjs

# 3. Agent 自动完成：
#    - 创建 react-todo-app 项目
#    - 编写组件代码
#    - 安装依赖
#    - 启动开发服务器

# 4. 浏览器打开 http://localhost:5173/ 查看成果
```

---

## 六、本课学习总结

### 🧠 思维导图

```
🤖 Mini-Cursor · 知识全景
│
├── 🏗️ 架构全景
│   ├── LLM：deepseek-v4-pro
│   ├── Agent 主循环：runAgentWithTools()
│   ├── 四工具工具箱：all-tools.mjs
│   └── 彩色输出：chalk
│
├── ⚙️ 核心函数：runAgentWithTools(query, maxIterations)
│   ├── messages 初始化
│   │   ├── SystemMessage（角色 + 规则）
│   │   └── HumanMessage（任务）
│   ├── for 循环（最多 maxIterations 轮）
│   │   ├── LLM.invoke() → 推理
│   │   ├── 无 tool_calls → 返回最终结果
│   │   ├── 有 tool_calls → 遍历执行工具
│   │   └── ToolMessage → 喂回 LLM
│   └── return 最终回复
│
├── 🛡️ 三重安全护栏
│   ├── ① maxIterations：迭代上限（防无限循环）
│   ├── ② try-catch：异常捕获（防崩溃）
│   └── ③ setTimeout：超时退出（防卡死）
│
├── 💡 SystemMessage 防坑规则
│   ├── 告知当前工作目录
│   ├── workingDirectory 参数说明
│   └── 禁止重复 cd（避免路径叠加）
│
├── 🎬 实战：React TodoList（10 轮 ReAct）
│   ├── Round 1-2：execute_command → 创建 Vite 项目
│   ├── Round 3：list_directory → 了解项目结构
│   ├── Round 4：read_file → 读取现有模板
│   ├── Round 5-6：write_file → 写入组件代码
│   ├── Round 7：write_file → 写入动画样式
│   ├── Round 8：execute_command → pnpm install
│   ├── Round 9：execute_command → pnpm run dev
│   └── Round 10：list_directory → 最终确认
│
└── 🏭 工程化精要
    ├── 模块分离（all-tools.mjs ↔ mini-cursor.mjs）
    ├── 可视化反馈（chalk 彩色输出）
    ├── 迭代上限（maxIterations = 30）
    ├── 异常兜底（try-catch）
    ├── 防坑规则（System Prompt 预设）
    └── 模型选型（编程任务用 pro 模型）
```

### ✅ 知识清单

| 编号 | 掌握项 | 核心要点 |
|------|--------|----------|
| 1 | Mini-Cursor 架构 | `LLM + 四工具 + ReAct Loop + 安全护栏` |
| 2 | `runAgentWithTools` 函数 | 通用 Agent 执行器，接收 query 和 maxIterations |
| 3 | `for` vs `while` 循环 | for 可选代上限，防止无限循环 |
| 4 | System Prompt 防坑 | 在提示词中预设规则（如 workingDirectory 禁止 cd） |
| 5 | chalk 彩色输出 | `chalk.bgGreen(...)` 让终端反馈更直观 |
| 6 | 三重安全护栏 | maxIterations + try-catch + setTimeout |
| 7 | 模型选型策略 | 编程任务用 pro 模型，简单查询用 flash |
| 8 | 模块化导入 | `import { 四工具 } from './all-tools.mjs'` |
| 9 | Agent 完整执行流程 | 10 轮 ReAct 循环，4 个工具协同完成复杂任务 |

### 📊 五课能力进化

| 维度 | 第一课 | 第二课 | 第三课 | 第四课 | 第五课 |
|------|--------|--------|--------|--------|--------|
| 核心能力 | Tool 定义 | Agent Loop | CLI 执行 | 完整工具集 | **完整 Agent** |
| 工具数量 | 1 | 1 | 2 | 4 | 4（复用） |
| 代码组织 | 单文件 | 单文件 | 单文件 | 模块化 | **主从分离** |
| 安全护栏 | 无 | 无 | 无 | 无 | **三重防护** |
| 工程成熟度 | ★☆☆ | ★★☆ | ★★☆ | ★★★ | **★★★★** |
| Agent 完整度 | 30% | 60% | 80% | 90% | **✅ 100%** |

### 🎓 五课总结：Agent 学习全景

```
                    Agent 学习路线图
                    
  第一课              第二课              第三课
  Tool 定义           Agent Loop          CLI Tool
  ─────────           ─────────           ─────────
  给 LLM 装手         让循环转起来        操控命令行
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  第四课：完整工具集
                  ─────────────────
                  读 + 写 + 列 + 执行
                  模块化导出
                           │
                           ▼
                  第五课：Mini-Cursor
                  ─────────────────
                  AI 编程 Agent 终极实战
                  🛡️ 三重护栏 + 🎨 chalk
                  ✅ 可独立运行的完整产品
```

> 🎯 **五课学完，你已经掌握了**：
> 1. 用 LangChain 定义 Tool，给 LLM 装上"手"
> 2. 用 ReAct 循环让 Agent 持续推理和执行
> 3. 用 child_process 让 Agent 操控命令行
> 4. 构建模块化的完整工具集
> 5. 整合所有能力，手写一个能独立运行的 AI 编程 Agent
>
> **从零到一，Mini-Cursor 就是你的 Agent 开发毕业作品。** 🎉

---

*📅 2026-07-10 | 🏷️ Agent · Mini-Cursor · ReAct · AI编程 · 第五课 · 完结*
