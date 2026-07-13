# 🤖 Agent 智能体开发实战 · 第七课：Remote MCP —— 从本地工具到远程服务

> **上节回顾**：第六课我们用 MCP 协议让 Agent 跨进程调用本地工具——通过 stdio 启动自己的 MCP Server 子进程。
>
> **本课聚焦**：MCP 不止 stdio 本地调用，还支持 **HTTP 远程调用**和 **npm 包直接拉起**。本课让 Agent 同时连接高德地图（远程）、Chrome DevTools（远程调试）、FileSystem（npm 包）和自己的 my-mcp-server（本地）——四个不同来源的 MCP Server 协同工作，完成一个真实的 **AI 工作流**。

---

## 📖 本课目录

- [一、从本地 MCP 到远程 MCP](#一从本地-mcp-到远程-mcp)
- [二、四种 MCP Server 连接方式](#二四种-mcp-server-连接方式)
- [三、核心改造：兼容多种 Tool 返回格式](#三核心改造兼容多种-tool-返回格式)
- [四、完整代码拆解](#四完整代码拆解)
- [五、AI 工作流实战：查酒店 → 开浏览器 → 保存结果](#五ai-工作流实战查酒店--开浏览器--保存结果)
- [六、本课学习总结](#六本课学习总结)

---

## 一、从本地 MCP 到远程 MCP

### 🔙 第六课的 MCP 架构

```
Agent ──stdio──► my-mcp-server（本地子进程）
                  └─ query-user Tool
```

第六课只用了 stdio 本地通信，MCP Server 是自己写的 Node.js 脚本。

### 🚀 本课的 MCP 架构

```
                    ┌─────────────┐
                    │  amap-mcp   │  高德地图（HTTP 远程）
                    │  URL 连接    │  → 位置查询、路线规划
                    └─────────────┘
                          │ HTTP
                    ┌─────┴───────┐
    Agent ──stdio──►│ my-mcp-server│  本地子进程（复用第六课）
                    └─────────────┘
                          │ stdio
                    ┌─────┴───────┐
                    │ filesystem  │  npm 包（npx 拉起）
                    │  读写文件    │  → @modelcontextprotocol/server-filesystem
                    └─────────────┘
                          │ stdio
                    ┌─────┴───────┐
                    │ chrome-devtools│ npm 包（npx 拉起）
                    │  操控浏览器  │  → 打开 Tab、点击、截图
                    └─────────────┘
```

> 🎯 **核心突破**：一个 Agent 同时连接 4 个 MCP Server——2 个远程/包、1 个本地自己写的、1 个 npm 的——工具从"自己造"变成了"接入现成的生态"。

---

## 二、四种 MCP Server 连接方式

`MultiServerMCPClient` 的配置字典中，每个 Server 用 key 标识，value 可以是两种格式：

| 连接方式 | 配置格式 | 原理 |
|----------|----------|------|
| 🔗 **HTTP 远程** | `{ url: "https://..." }` | 直接 HTTP 请求，不需要启动子进程 |
| 🖥️ **stdio 本地** | `{ command: "...", args: [...] }` | 同第六课，spawn 子进程，stdin/stdout 通信 |

基于这个配置，来看本课连接的 4 个 Server：

### 1. 高德地图 MCP（HTTP 远程）

```javascript
'amap-mcp': {
  url: "https://mcp.amap.com/mcp?key=f0259c6adf20e8543e0773ba8e18ddc8"
}
```

URL 里带 API key（需要去 [developer.amap.com](https://developer.amap.com/) 申请），连接后可以调用位置查询、路线规划等工具。**这是远程 MCP——不需要本地启动任何进程。**

### 2. 自己的 MCP Server（stdio 本地）

```javascript
'my-mcp-server': {
  command: 'node',
  args: ['C:/Users/yihao/Desktop/workspace/yh_ai/ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs']
}
```

复用第六课写的 `query-user` 工具，通过 `node` + 脚本路径拉起。

### 3. FileSystem MCP（npm 包，npx 拉起）

```javascript
'filesystem': {
  command: 'npx',
  args: [
    '-y',
    '@modelcontextprotocol/server-filesystem',
    // 允许访问的文件夹，可以配置多个，用空格隔开
    'C:/Users/yihao/Desktop/workspace/yh_ai/ai/ai/agent_in_action/remote-mcp'
  ]
}
```

| 要点 | 说明 |
|------|------|
| `command: 'npx'` | 不是 node，是 npx——直接运行 npm 包 |
| `-y` | 自动确认，跳过安装确认提示 |
| `@modelcontextprotocol/server-filesystem` | npm 上发布的 MCP Server 包 |
| 文件夹路径参数 | 传给 Server，限制它只能操作这个文件夹 |

> 💡 **不用自己写工具了**。FileSystem 是社区已有的 MCP Server，提供 `read_file`、`write_file`、`list_directory` 等——跟第四课的 `all-tools.mjs` 功能一样，但它是独立进程、独立语言实现。

### 4. Chrome DevTools MCP（npm 包，npx 拉起）

```javascript
// Chrome‑DevTools MCP，默认连接本地打开的Chrome
// （开启远程调试：chrome --remote-debugging-port=9222）
'chrome-devtools': {
  command: 'npx',
  args: [
    '-y',
    'chrome-devtools-mcp@latest',
  ]
}
```

连接已打开的 Chrome 浏览器（需以 `chrome --remote-debugging-port=9222` 启动），提供打开页面、点击元素、截图、修改标题等浏览器操控能力。

### 🔑 四种 Server 对比

| Server | 连接方式 | 来源 | 提供的能力 |
|--------|----------|------|-----------|
| 🗺️ amap-mcp | HTTP URL | 高德开放平台 | 位置查询、路线规划 |
| 🏠 my-mcp-server | stdio (node) | 自己写的（第六课） | 用户信息查询 |
| 📁 filesystem | stdio (npx) | npm 包 | 读写文件、列目录 |
| 🌐 chrome-devtools | stdio (npx) | npm 包 | 操控浏览器 Tab、截图 |

---

## 三、核心改造：兼容多种 Tool 返回格式

第六课的 Tool 返回格式是固定的——自己写的 Server，返回的 `content` 格式可控。但远程 MCP Server（高德、Chrome DevTools 等）的返回格式五花八门：

| 返回类型 | 示例 | 来源 |
|----------|------|------|
| 纯字符串 | `"查询结果：xxx"` | 多数 stdio Server |
| content 数组 | `[{ type: 'text', text: '...' }]` | 标准 MCP 返回 |
| 对象 | `{ text: '...', result: '...' }` | 某些第三方 Server |

本课的 `invoke` 部分做了**格式兼容处理**：

```javascript
let contentStr;
try {
  const toolResult = await selectedTool.invoke(tool_call.args);
  // mcp tool 返回一般是字符串
  // 还可能是 content 数组
  if (typeof toolResult === 'string') {
    contentStr = toolResult;
  } else if (Array.isArray(toolResult)) {
    contentStr = toolResult.map(item => item.text || JSON.stringify(item)).join('\n');
  } else if (toolResult && typeof toolResult === 'object') {
    contentStr = toolResult.text || toolResult.result || JSON.stringify(toolResult);
  } else {
    contentStr = String(toolResult);
  }
} catch (err) {
  console.log(chalk.red(`工具调用失败 ${tool_call.name}: ${err.message}`));
  contentStr = `Error: ${err.message}`;
}
messages.push(new ToolMessage({
  tool_call_id: tool_call.id,
  content: contentStr
}));
```

| 处理分支 | 逻辑 |
|----------|------|
| `typeof === 'string'` | 直接使用 |
| `Array.isArray` | 提取每个元素的 `.text`，拼接 |
| `typeof === 'object'` | 优先取 `.text` → `.result` → JSON 序列化 |
| 兜底 | `String()` 强制转字符串 |
| try-catch | 工具调用失败也不崩溃，返回错误信息 |

> 🎯 这是工程化的关键细节——**你控制不了远程 Server 的返回格式，必须做兼容处理**。

---

## 四、完整代码拆解

### 第1步：导入 + LLM 初始化

```javascript
import 'dotenv/config';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});
```

### 第2步：配置 4 个 MCP Server

```javascript
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'amap-mcp': {
      url: "https://mcp.amap.com/mcp?key=f0259c6adf20e8543e0773ba8e18ddc8"
    },
    'my-mcp-server': {
      command: 'node',
      args: ['C:/Users/yihao/Desktop/workspace/yh_ai/ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs']
    },
    'filesystem': {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        // 允许访问的文件夹，可以配置多个，用空格隔开
        'C:/Users/yihao/Desktop/workspace/yh_ai/ai/ai/agent_in_action/remote-mcp'
      ]
    },
    // Chrome‑DevTools MCP，默认连接本地打开的Chrome
    // （开启远程调试：chrome --remote-debugging-port=9222）
    'chrome-devtools': {
      command: 'npx',
      args: [
        '-y',
        'chrome-devtools-mcp@latest',
      ]
    }
  }
})
```

> 🎯 4 个 Server 配置在一个对象里，`MultiServerMCPClient` 统一管理连接、获取工具、关闭连接。Agent 不用知道哪个 Tool 来自哪个 Server。

### 第3步：获取工具 + bindTools

```javascript
const tools = await mcpClient.getTools();
console.log(tools); // 打印所有可用工具，看看4个Server总共提供了多少
const modelWithTools = model.bindTools(tools);
```

### 第4步：Agent Loop

```javascript
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new HumanMessage(query)
  ];

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`第${i + 1}轮迭代`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(chalk.green(`AI 回答：${response.content}`));
      return response.content;
    }

    console.log(chalk.bgBlue(`工具调用${response.tool_calls.map(t => t.name).join(', ')}`))
    for (const tool_call of response.tool_calls) {
      const selectedTool = tools.find(t => t.name === tool_call.name);
      if (!selectedTool) {
        console.log(chalk.red(`未找到工具：${tool_call.name}`));
        continue;
      }
      // 格式兼容处理（见第三节）
      // ...
      messages.push(new ToolMessage({
        tool_call_id: tool_call.id,
        content: contentStr
      }));
    }
  }
  // 最后一次消息是AI的回复
  return messages[messages.length - 1].content;
}
```

### 第5步：启动 + 保存结果

```javascript
const result = await runAgentWithTools(
  "北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名"
);

// 保存结果到 md 文件
const outputDir = path.resolve(import.meta.dirname, '../output');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `hotel-result-${Date.now()}.md`);
fs.writeFileSync(outputPath, `# 北京南站附近酒店查询结果\n\n${result}\n`);
console.log(chalk.cyan(`\n✅ 结果已保存到：${outputPath}`));
```

> 📂 运行一次就生成一个带时间戳的 `.md` 文件在 `remote-mcp/output/`，记录完整结果。

---

## 五、AI 工作流实战：查酒店 → 开浏览器 → 保存结果

### 🎬 任务拆解

Agent 收到一个复杂任务：**"北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，展示在浏览器，图片标题改为酒店名"**。

这不是一个单一操作，而是一个**多步骤工作流**：

```
┌─────────────────────────────────────────────────┐
│  🗺️  Step 1: amap-mcp                            │
│  搜索"北京南站"坐标 → 查询附近酒店 →               │
│  返回酒店列表（名称、距离、评分）                  │
└─────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│  🗺️  Step 2: amap-mcp                            │
│  根据酒店名称搜索图片 URL                         │
│  拿到每个酒店的图片链接                           │
└─────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│  🌐  Step 3: chrome-devtools                     │
│  为每个酒店开一个 Chrome Tab                      │
│  修改每个 Tab 的标题为酒店名                      │
│  设置 page title 方便用户识别                     │
└─────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│  📁  Step 4: filesystem                          │
│  将结果写入 output/hotel-result-xxx.md            │
│  保存完整的查询结果                               │
└─────────────────────────────────────────────────┘
```

### 🎯 实际产出

运行 `node src/mcp-test.mjs` 后，Agent 自动完成了所有步骤，在 `output/` 生成了结果文件：

```markdown
# 北京南站附近酒店查询结果

| 排名 | 酒店名称 | 步行距离 | 评分 | Tab |
|------|----------|----------|------|-----|
| 🥇 | **北京永鑫宾馆** | **228米** | ⭐4.2 | Tab 2 |
| 🥈 | **轻羽精品酒店(北京南站北广场店)** | **257米** | ⭐3.2 | Tab 3 |
| 🥉 | **米家青年酒店(北京南站店)** | **304米** | ⭐3.6 | Tab 4 |
```

> 🤯 人工只做了一件事——**描述需求**。Agent 自动调度 3 个 MCP Server（高德、Chrome DevTools、FileSystem）完成了整个工作流。

### 🧩 MCP 生态的核心价值

有了 MCP 协议后：

```
以前：想用高德地图？→ 读 API 文档 → 写 fetch 调用 → 自己封 Tool
现在：高德提供了 MCP Server → url 配上去 → getTools() → 直接用

以前：想操控浏览器？→ 学 Puppeteer/Playwright → 写脚本
现在：chrome-devtools-mcp → npx 拉起 → getTools() → 直接用

以前：跨团队共享工具？→ 写成 npm 包 → 对方 import → 还是得同语言
现在：写成 MCP Server → 任何语言 → 任何项目 → getTools() → 直接用
```

> 🎯 **MCP 把 Tool 从"自己造"变成了"接入生态"**——任何人都可以开发基于这个协议的 MCP Server，然后直接复用。高德地图、Chrome DevTools、FileSystem 这些不是我们自己写的，但它们提供的 Tool 跟我们自己写的一样用。

---

## 六、本课学习总结

### 🧠 知识点

```
📋 Remote MCP · 知识点
│
├── 🚀 从本地到远程
│   ├── 第六课：只有 stdio 本地
│   └── 本课：HTTP 远程 + npx 包 + stdio 本地 混合
│
├── 🔗 四种 MCP Server 连接方式
│   ├── 🗺️ amap-mcp（HTTP URL）
│   │   └── 高德地图 API，纯远程调用，不需本地进程
│   ├── 🏠 my-mcp-server（stdio · node）
│   │   └── 复用第六课自己的 Server
│   ├── 📁 filesystem（stdio · npx）
│   │   └── npm 包 @modelcontextprotocol/server-filesystem
│   └── 🌐 chrome-devtools（stdio · npx）
│       └── npm 包 chrome-devtools-mcp@latest
│
├── 🔧 格式兼容处理
│   ├── string → 直接用
│   ├── Array → 提取 .text 拼接
│   ├── object → .text → .result → JSON
│   ├── 兜底 → String()
│   └── try-catch → 不崩溃
│
├── 🔄 Agent Loop
│   ├── for + ToolMessage（同第五课）
│   ├── 多 Server 统一管理
│   └── tools 来自 4 个不同来源
│
├── 💾 结果持久化
│   ├── fs.mkdirSync + recursive
│   ├── fs.writeFileSync
│   ├── 带时间戳的文件名
│   └── 保存在 output/ 目录
│
└── 🧩 MCP 生态价值
    ├── 工具从"自己造" → "接入生态"
    ├── 任何人开发 → 任何人复用
    ├── 高德/Chrome/FileSystem 即插即用
    └── Agent 的能力 = 接入的 MCP Server 数量
```

### ✅ 知识清单

| 编号 | 掌握项 | 核心要点 |
|------|--------|----------|
| 1 | HTTP 远程 MCP | `{ url: "https://..." }` 连接远程 Server，不需本地进程 |
| 2 | npx 拉起 MCP | `{ command: 'npx', args: ['-y', 'package-name'] }` |
| 3 | 混合连接 | 一个 `MultiServerMCPClient` 同时连 HTTP + stdio + npx |
| 4 | 返回格式兼容 | string / array / object 三种类型都要处理 |
| 5 | 高德 MCP 接入 | URL 带 API Key，提供位置查询、路线规划 |
| 6 | Chrome DevTools MCP | 操控浏览器：打开 Tab、截图、修改标题 |
| 7 | FileSystem MCP | npm 包读写文件，限制访问目录 |
| 8 | AI 工作流 | Agent 自动编排多个 Server 完成多步骤任务 |
| 9 | 结果保存 | `fs.writeFileSync` + 时间戳文件名，持久化到 output/ |
| 10 | MCP 生态 | 工具不再自己写，接入现成 MCP Server 即可 |

### 📊 基础 Agent → MCP 优化 → Remote MCP

| 维度 | 前五课 · 基础 Agent | 第六课 · MCP 本地 | 第七课 · Remote MCP |
|------|-------------------|-------------------|---------------------|
| 工具来源 | 本地定义 / import | MCP stdio 动态获取 | **HTTP + npx + stdio 混合** |
| Server 类型 | 无 | 自己写的 Node 脚本 | **自己写的 + npm 包 + 远程服务** |
| 连接方式 | 无 | stdio | **stdio + HTTP URL** |
| 工具数量 | 1 → 4 | N（本地 Server 提供） | **N×M（M 个 Server 各提供 N 个）** |
| 生态复用 | ❌ | ❌ | **✅ 高德/Chrome/FileSystem 即插即用** |
| 返回格式 | 固定字符串 | 自己控制的格式 | **需兼容 string/array/object** |

> 🎯 **本课定位**：第六课证明了 MCP 能让工具脱离 Agent 进程。本课进一步证明——**工具不需要自己写**。高德地图、Chrome DevTools、FileSystem 这些成熟的 MCP Server 直接接入，Agent 的能力不再受限于你写工具的能力，而取决于你接入了多少个 MCP Server。

---

*📅 2026-07-13 | 🏷️ Agent · MCP · Remote MCP · HTTP · AI工作流 · 第七课*
