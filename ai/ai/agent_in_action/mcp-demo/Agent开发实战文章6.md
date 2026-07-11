# 🤖 Agent 智能体开发实战 · 第六课：MCP 协议 —— 基础 Agent 的优化升级

> **上节回顾**：第五课我们用四工具模块 + ReAct 循环手写了 Mini-Cursor，一个最普通、最基本的 AI 编程 Agent——所有工具都在同一进程内定义和运行。
>
> **本课聚焦**：基础 Agent 有两个天生缺陷——工具不能跨项目复用，不能跨语言调用。MCP（Model Context Protocol）协议是解决这个问题的**优化方案**：让工具脱离 Agent 进程独立运行，实现**跨进程、跨语言、跨网络**调用，还给 LLM 增加了 Resource（静态知识注入）能力。

---

## 📖 本课目录

- [一、前五课 Tool 的局限性](#一前五课-tool-的局限性)
- [二、MCP 协议是什么](#二mcp-协议是什么)
- [三、MCP Server：注册 Tool + Resource](#三mcp-server注册-tool--resource)
- [四、MCP Client：Agent 如何连接 MCP Server](#四mcp-clientagent-如何连接-mcp-server)
- [五、完整流程：从 Client 启动到 Server 响应](#五完整流程从-client-启动到-server-响应)
- [六、实战：Agent 通过 MCP 查询用户信息](#六实战agent-通过-mcp-查询用户信息)
- [七、本课学习总结](#七本课学习总结)

---

## 一、基础 Agent 的痛点

### 🔙 前五课搭建的基础 Agent

```
┌─────────────────────────────────────────┐
│              Agent 进程                   │
│                                         │
│  LLM → tool_calls → tools.find()        │
│                     ↓                   │
│              tool.invoke()               │
│                     ↓                   │
│           同一个进程内执行               │
│           fs.readFile / spawn           │
└─────────────────────────────────────────┘
```

这是一个**最普通、最基本**的 Agent，它完全可用。但在实际工程中会遇到两个问题：

| 问题 | 说明 |
|------|------|
| 🔒 **项目绑定** | 工具只能在本项目用，不能跨项目复用 |
| 🧩 **语言锁定** | Node.js 写的工具，Java/Python/Rust 写的工具没法直接用 |

> 🎯 真实的开发场景：后端团队用 Python 写了一个数据库查询工具，前端团队用 Node.js 写 Agent——怎么让 Agent 调用 Python 写的工具？这就是 MCP 要解决的问题。

---

## 二、MCP 协议是什么

### 🧠 核心定义

**MCP（Model Context Protocol）**是给 LLM **扩展 Context（上下文）**的标准化协议——让 LLM 能做的更多（Tool），知道的更多（Resource）。

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ┌──────────┐          MCP 协议          ┌────────────┐  │
│   │  MCP Client │◄──── stdio / HTTP ────►│  MCP Server │  │
│   │  (Agent)    │                         │  (Tool 提供方)│  │
│   └──────────┘                          └────────────┘  │
│                                                  │
│   可以是 Node.js 进程           可以是 Node/Python/Java/  │
│   LangChain Agent               Rust 写的任何进程       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 📊 MCP 的两大通信方式

| 通信方式 | 场景 | 原理 |
|----------|------|------|
| 🖥️ **stdio**（标准输入输出流） | 本地跨进程调用 | 键盘输入 → 控制台输出，进程间通过 stdin/stdout 通信 |
| 🌐 **HTTP** | 远程跨网络调用 | 通过网络请求调用远程 MCP Server |

> 💡 **它不是 fetch 接口调用**——MCP 不只是拿接口数据，它的目的是**扩展 LLM 的 Context**（提供 Tool + Resource + Prompt），让 LLM 拥有更多能力。

### 🏗️ MCP 的五大核心能力

| 能力 | 说明 | 类比前五课 |
|------|------|-----------|
| 🔧 **Tool** | 让 LLM 调用的工具函数 | 本质就是 Tool，只是跨进程了 |
| 📋 **Resource** | 静态资源（文档、指南等），给 LLM 补充知识 | 🆕 前五课没有的概念 |
| 💬 **Prompt** | 预定义的提示词模板 | 🆕 前五课没有的概念 |
| 📡 **跨进程** | stdio / HTTP 通信 | 第三课的 child_process 是单向的，MCP 是双向协商的 |
| 🌍 **跨语言** | 不限制实现语言 | Node / Python / Java / Rust 都可以写 MCP Server |

---

## 三、MCP Server：注册 Tool + Resource

### 🎯 架构定位

MCP Server 是**工具的提供方**。它通过 `StdioServerTransport` 暴露自己，等待 MCP Client 连接和调用。

```
┌──────────────────────────────────┐
│          MCP Server               │
│                                  │
│  server.registerTool(...)        │
│  server.registerResource(...)    │
│         ↓                        │
│  StdioServerTransport            │
│         ↓                        │
│  通过 stdin/stdout 与 Client 通信 │
└──────────────────────────────────┘
```

### 第1步：导入依赖 + 准备数据

```javascript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// 假数据，未来可以走数据库
const database = {
  users: {
    '001': { id: '001', name: 'zuhao', email: 'zuhhao@example.com', role: 'admin' },
    '002': { id: '002', name: 'xiaoming', email: 'xiaoming@example.com', role: 'user' },
    '003': { id: '003', name: 'zohong', email: 'zohong@example.com', role: 'user' },
  }
}
```

> 💡 `database` 是一个内存假数据对象。注释"未来可以走数据库"，说明实际项目中这里会替换成 MySQL/MongoDB 等真实数据源。MCP Server 的业务逻辑和 Agent 完全无关——它只管提供数据。

### 第2步：创建 McpServer 实例

```javascript
const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});
```

`McpServer` 是 MCP SDK 的核心类。`name` 用来标识这个服务（Client 配置中会用到），`version` 用于版本管理。这类似于 npm 包名和版本号。

### 第3步：注册 Tool —— `registerTool`

```javascript
server.registerTool('query-user', {
  description: `查询数据库中的用户信息。输入用户ID，返回该用户的详细信息（姓名、邮箱、角色）`,
  inputSchema: {
    userId: z.string().describe('用户ID，例如：001，002，003')
  },
}, async ({ userId }) => {
  const user = database.users[userId];
  if (!user) {
    return {
      content: [
        { type: 'text', text: `用户ID ${userId} 不存在。可用的ID有：001，002，003` }
      ]
    }
  }
  return {
    content: [
      {
        type: 'text',
        text: `用户ID ${userId} 的信息如下：
姓名：${user.name}
邮箱：${user.email}
角色：${user.role}`
      }
    ]
  }
})
```

| 参数 | 说明 |
|------|------|
| `'query-user'` | Tool 名称，LLM 会在 tool_calls 中使用 |
| `description` | 告诉 LLM 这个工具做什么、什么时候调用 |
| `inputSchema` | 用 Zod 定义参数，跟前五课 `schema: z.object(...)` 一样 |
| `async ({ userId })` | 处理函数，从 `inputSchema` 中解构参数 |

> ⚠️ **关键差异**：返回格式是 `{ content: [{ type: 'text', text: '...' }] }`，不是纯字符串。前五课的 `tool()` 直接返回字符串即可，MCP 需要包装成 `content` 数组。

### 第4步：注册 Resource —— `registerResource`

```javascript
// http:// stdio -> 定义的访问路径
server.registerResource(
  '使用指南',
  'docs://guide', // 定义的访问路径
  {
    description: 'MCP Server 使用指南',
    mimeType: 'text/plain'
  },
  async () => {
    return {
      contents: [
        {
          uri: 'docs://guide',
          mimeType: 'text/plain',
          text: `MCP Server 使用指南
功能：提供用户查询等工具。
使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。`
        }
      ]
    }
  }
)
```

| 参数 | 说明 |
|------|------|
| `'使用指南'` | Resource 名称（人类可读） |
| `'docs://guide'` | Resource URI（定义的访问路径）——Client 通过这个 URI 读取内容 |
| `description` / `mimeType` | 元信息，描述内容和类型 |
| `async ()` | 返回 `{ contents: [...] }`，格式和 Tool 返回类似 |

> 🆕 **Resource 是前五课完全没有的概念**。Tool 是"做事情"（执行动作），Resource 是"给知识"（提供文档/指南/配置）。Client 读取后在 System Prompt 中注入，LLM 不用调 Tool 就能知道这些信息。

### 第5步：启动 stdio 传输层

```javascript
// 🚀 跨进程通信方式：stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

`StdioServerTransport` 是 MCP 的本地通信实现。它把 MCP Server 挂在 stdin/stdout 上，等待 Client 进程的输入。`server.connect(transport)` 启动监听——从这一刻起，其他进程可以通过 stdio 与这个 Server 通信。

### 🔑 MCP Server vs 前五课 Tool 的对比

| 维度 | 前五课 `tool()` | MCP `registerTool()` |
|------|-----------------|---------------------|
| 定义方式 | `tool(func, { name, schema })` | `server.registerTool(name, { description, inputSchema }, func)` |
| 返回格式 | 纯字符串 | `{ content: [{ type: 'text', text: '...' }] }` |
| 运行位置 | Agent 同一进程 | 独立子进程（通过 stdio 通信） |
| 语言限制 | 只能用 Node.js | 任何语言，只要实现了 MCP 协议 |
| 可复用性 | 只能在定义它的项目用 | **所有项目都可以连上这个 Server 使用** |
| 🆕 Resource | 无 | 有：提供静态文档/指南给 LLM |

---

## 四、MCP Client：Agent 如何连接 MCP Server

### 🎯 架构定位

MCP Client 是**Agent 这一侧**。它启动 MCP Server 子进程，通过 `MultiServerMCPClient` 连接，获取 Tool 和 Resource，然后驱动 Agent Loop。

```
┌─────────────────────────────────────────────────────┐
│                   MCP Client (Agent)                 │
│                                                     │
│  MultiServerMCPClient                               │
│    ├─ 启动 my-mcp-server.mjs 子进程                  │
│    ├─ 通过 stdio 连接                                │
│    ├─ mcpClient.getTools()       → 动态获取 Tool     │
│    └─ mcpClient.listResources()  → 获取 Resource     │
│                                                     │
│  model.bindTools(tools)  →  Agent Loop  →  close()  │
└─────────────────────────────────────────────────────┘
```

### 第1步：导入依赖 + LLM 初始化

```javascript
import 'dotenv/config';
// agent 配置 mcp client —— 可以配置多个 mcp server 的 client
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
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

> 💡 核心新面孔是 `MultiServerMCPClient`——它能同时管理多个 MCP Server 的连接。注释"可以配置多个 mcp server 的 client"，说明 Agent 可以接 N 个 MCP Server，各自提供不同领域的工具。

### 第2步：配置 MCP Client —— 连接 Server

```javascript
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'my-mcp-server': {
      command: 'node',
      args: ['C:/Users/yihao/Desktop/workspace/yh_ai/ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs']
    }
  }
})
```

| 字段 | 说明 |
|------|------|
| `'my-mcp-server'` | Server 名称，对应 `new McpServer({ name: 'my-mcp-server' })` |
| `command: 'node'` | 用什么启动 MCP Server 进程 |
| `args: ['...']` | 脚本路径，传给 node 的参数 |

> 🎯 这里的 `command + args` 跟第三课 `spawn('node', ['script.mjs'])` 是一个原理。`MultiServerMCPClient` 内部用 `child_process.spawn` 启动了 MCP Server 子进程。

### 第3步：动态获取 Tool

```javascript
// 获取工具 —— 动态从 MCP Server 获取，不是本地定义的！
const tools = await mcpClient.getTools();
```

前五课的工具都是本地 `import` 或直接定义的。这里 `getTools()` 一行代码，从 MCP Server 子进程**动态拉取**所有注册的 Tool。加新工具？在 Server 里 `registerTool` 就行，Agent 端**零改动**。

### 第4步：获取 Resource 并注入 System Prompt

```javascript
const res = await mcpClient.listResources();
let resourceContent = '';
for (const [serverName, resources] of Object.entries(res)) {
  for (const resource of resources) {
    const content = await mcpClient.readResource(
      serverName, resource.uri
    )
    resourceContent += content[0].text;
  }
}
console.log(resourceContent, '---------------');
```

| 方法 | 作用 |
|------|------|
| `listResources()` | 列出所有 MCP Server 提供的 Resource（名称 + URI） |
| `readResource(serverName, uri)` | 通过 URI 读取 Resource 的完整内容 |

> 🔰 **JS 基础：`Object.entries()` + `for...of` 解构**
>
> 上面遍历 Resource 的代码用到了 `Object.entries()`，这是理解 MCP Client 代码的前提。来看 `1.js`：
>
> ```javascript
> const obj = {
>   'bytedance': ['AI全栈开发', 'Agent 工程师'],
>   'tecent': ['后端开发', 'Agent 工程师'],
>   '163': ['前端开发']
> }
> // 二维数组
> for (let [key, value] of Object.entries(obj)) {
>   console.log(key, value);
> }
> ```
>
> `Object.entries(obj)` 把对象转成**二维数组** `[['bytedance', [...]], ['tecent', [...]], ...]`，然后 `for...of` + 解构语法 `[key, value]` 一次性拿到键和值。回到 MCP 代码：`Object.entries(res)` 把 `{ 'my-mcp-server': [resource1, resource2] }` 转成可遍历的 `[serverName, resources]`，外层拿服务名，内层拿每个资源。

遍历所有 Server 的所有 Resource，拼接成文本，后面直接作为 System Prompt 注入——让 LLM "提前知道"这些知识，不用再调 Tool 去查。

### 第5步：Agent Loop

```javascript
const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new SystemMessage(resourceContent), // Resource 直接注入 System Prompt
    new HumanMessage(query)
  ];
  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`正在等待AI思考，第${i}轮....`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n AI 最终回复： \n ${response.content}`);
      return response.content;
    }

    console.log(chalk.bgBlue(`检测到 
      ${response.tool_calls.length}个工具调用`));
    console.log(chalk.bgBlue(`工具调用: 
      ${response.tool_calls.map(t => t.name).join(', ')}`))

    for (const toolCall of response.tool_calls) {
      // find 方法 匹配的哪一项，如果找到了，后面不会执行
      // Promise.all 只要一个失败了，不会等待剩下结果
      // 已经发起的异步任务会继续执行
      const foundTool = tools.find(t =>
        t.name === toolCall.name);
      if (foundTool) {
        const toolResult = await foundTool.invoke(
          toolCall.args);
        // 返回的是纯文本，tool 的返回是由上下文的相关性
        // 一定得带上 tool_call_id
        messages.push(new ToolMessage({
          content: toolResult,
          tool_call_id: toolCall.id
        }))
      }
    }
  }
  // 循环次数（轮数）达到30次，仍无法回复问题，返回最后一轮
  return messages[messages.length - 1].content;
}
```

Agent Loop 的逻辑和前五课完全一样。注释中几个要点：

| 注释 | 知识点 |
|------|--------|
| `Resource 直接注入 System Prompt` | Resource 不进 Tool 调用流程，直接喂给 LLM |
| `find 方法，匹配的哪一项，如果找到了，后面不会执行` | `Array.find()` 返回第一个匹配项就停止 |
| `Promise.all 只要一个失败了，不会等待剩下结果` | 这也是第五课用 `for...of` 串行执行的原因之一 |
| `返回的是纯文本，tool 的返回是由上下文的相关性` | Tool 返回的内容会被 LLM 当作上下文理解 |
| `一定得带上 tool_call_id` | `ToolMessage` 必须绑定 `tool_call_id`，否则 LLM 不知道哪个结果对应哪个调用 |
| `循环次数达到30次，仍无法回复问题，返回最后一轮` | 同第五课的 `maxIterations` 安全护栏 |

### 第6步：清理 —— `close()`

```javascript
// 🚀 启动
// await runAgentWithTools('查一下用户002的信息');
await runAgentWithTools('MCP Server的使用指南是什么？');

// 关闭所有 MCP 子进程与通信通道，释放进程资源
// 关闭和 MCP Server 的通信通道
// my-mcp-server.mjs 被启动了，手动关闭进程
// 释放相关资源，避免脚本一直挂着不退出
// node langchain-mcp-test.mjs 启动进程
//   启动一个子进程 child-process client
//   子进程连接 my-mcp-Server.mjs
//   主进程通过 stdio 和他们通话
//   close() 把这个链接和子进程一起关掉
await mcpClient.close();
```

> ⚠️ **`close()` 是 MCP 特有的清理步骤，前五课没有**。因为 MCP Server 作为子进程一直运行，不关闭的话脚本会一直挂着。`close()` 做了三件事：关闭和 MCP Server 的通信通道、终止子进程、释放相关资源。

### 🔑 关键设计点

| 设计点 | 说明 |
|--------|------|
| 🔗 **MultiServerMCPClient** | 一个 Client 可以连接多个 MCP Server，每个 Server 提供不同工具 |
| 🚀 **command + args** | 通过 `node` + 脚本路径启动 MCP Server 子进程，同第三课的 spawn 原理 |
| 📥 **getTools()** | 工具不是本地定义，而是**从 MCP Server 动态获取** |
| 📋 **listResources()** | 获取 Server 提供的静态资源内容，注入 System Prompt |
| 🔄 **Agent Loop** | 和第五课的 for + ToolMessage 完全一样，只是工具来源变了 |
| 🧹 **close()** | 关闭所有 MCP 子进程与通信通道，释放进程资源 |

---

## 五、完整流程：从 Client 启动到 Server 响应

```
┌─────────────────────────────────────────────────────────────────┐
│  🖥️  终端: node langchain-mcp-test.mjs                           │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: MultiServerMCPClient 启动                               │
│           ↓                                                     │
│           spawn node my-mcp-server.mjs  →  子进程启动             │
│           ↓                                                     │
│           StdioServerTransport 连接建立                          │
│           （主进程和子进程通过 stdin/stdout 双向通信）             │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: mcpClient.getTools()                                    │
│           ↓                                                     │
│           通过 stdio 向 MCP Server 请求工具列表                    │
│           ↓                                                     │
│           Server 返回 [query-user]                               │
│           ↓                                                     │
│           tools = [{ name: 'query-user', ... }]                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: mcpClient.listResources()                               │
│           ↓                                                     │
│           获取 "MCP Server 使用指南" 文本                          │
│           ↓                                                     │
│           注入 SystemMessage                                     │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: model.bindTools(tools)  →  Agent Loop 启动              │
│           ↓                                                     │
│           LLM 推理 → tool_call { name: "query-user", ... }       │
│           ↓                                                     │
│           tools.find() → tool.invoke()                           │
│           ↓                                                     │
│           通过 stdio 发请求到 MCP Server 子进程                    │
│           ↓                                                     │
│           Server 执行业务逻辑，返回结果                            │
│           ↓                                                     │
│           ToolMessage 喂回 LLM → 继续推理                        │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: LLM 生成最终回复                                        │
│           ↓                                                     │
│           mcpClient.close()  →  关闭所有子进程                    │
│           （释放资源，避免脚本一直挂着不退出）                      │
└─────────────────────────────────────────────────────────────────┘
```

> 🎯 整个流程的核心差异只有一处：**工具不在 Agent 本地定义，而是通过 MCP 协议从外部进程动态获取**。Agent Loop 的逻辑完全不变。

---

## 六、实战：Agent 通过 MCP 查询用户信息

### 🎬 执行过程

```
🟢 Round 1 — REASON
   用户要查用户 002 的信息 → 调用 query_user 工具
                        │
                        ▼
🟡 Round 1 — ACT
   Tool: query-user
   Args: { userId: "002" }
                        │
                        ▼
   MCP Client ──stdio──► MCP Server 子进程
                        database.users['002']
                        返回 { name: 'xiaoming', ... }
   MCP Server ──stdio──► MCP Client
                        │
                        ▼
🟠 Round 1 — OBSERVE
   用户ID 002 的信息如下：
   姓名：xiaoming
   邮箱：xiaoming@example.com
   角色：user
                        │
                        ▼
🟢 Round 2 — REASON (FINAL)
   已获取用户信息，格式化输出给用户
```

### 🛠️ Resource 的实际效果

当问 `"MCP Server的使用指南是什么？"` 时，Agent 因为 System Prompt 中已经注入了 Resource 的完整内容，可以直接回答——**不需要调用任何 Tool**。

> 💡 **Resource 的价值**：Tool 是"做事情"，Resource 是"给知识"。把文档、配置、规则注入 LLM 的上下文，比让它自己去读文件高效得多。

---

## 七、本课学习总结

### 🧠 思维导图

```
📋 MCP 协议 · 知识点
│
├── 🎯 基础 Agent 的痛点
│   ├── 项目绑定：工具只能在本项目用
│   └── 语言锁定：只能用 Node.js 写工具
│
├── 🚀 MCP 优化方案
│   ├── Model Context Protocol
│   ├── 为 LLM 扩展 Context（Tool + Resource + Prompt）
│   ├── 不是 fetch 接口调用，是跨进程协议
│   └── LLM 和 Tool 解耦
│
├── 📡 两大通信方式
│   ├── stdio（本地跨进程）
│   │   └── 键盘输入 → 控制台输出 → 进程间 stdin/stdout
│   └── HTTP（远程跨网络）
│       └── 通过网络调用远程 MCP Server
│
├── 🖥️ MCP Server（my-mcp-server.mjs）
│   ├── McpServer({ name, version })
│   ├── registerTool(name, { description, inputSchema }, handler)
│   │   ├── 返回 { content: [{ type, text }] } 格式
│   │   └── 不同于 tool() 的纯字符串返回
│   ├── registerResource(name, uri, metadata, handler)
│   │   └── 🆕 前五课没有：提供静态文档/指南
│   └── StdioServerTransport + server.connect()
│
├── 🔗 MCP Client（langchain-mcp-test.mjs）
│   ├── MultiServerMCPClient({ mcpServers })
│   │   └── command + args 启动子进程（同 spawn 原理）
│   ├── mcpClient.getTools()
│   │   └── 动态获取工具，非本地定义
│   ├── mcpClient.listResources() + readResource()
│   │   └── 获取资源内容，注入 System Prompt
│   ├── Agent Loop
│   │   └── for + ToolMessage（和第五课完全一样）
│   └── mcpClient.close()
│       └── 关闭子进程 + 通信通道 + 释放资源
│
├── 🔄 完整调用流程（5 步）
│   ├── ① Client 启动 → spawn Server 子进程
│   ├── ② getTools() → stdio 请求 → Server 返回工具列表
│   ├── ③ listResources() → 获取文档 → 注入 System Prompt
│   ├── ④ Agent Loop → tool_calls → stdio → Server 执行 → ToolMessage
│   └── ⑤ LLM 回复 → close() 清理所有子进程
│
└── 🎯 核心价值
    ├── 跨进程：工具和 Agent 解耦，独立进程运行
    ├── 跨语言：Node/Python/Java/Rust 都可以写 MCP Server
    └── 跨项目：一套工具，所有 Agent 项目都能用
```

### ✅ 知识清单

| 编号 | 掌握项 | 核心要点 |
|------|--------|----------|
| 1 | 为什么需要 MCP | 前五课工具是项目内、同语言的；MCP 实现跨进程、跨语言 |
| 2 | MCP 协议本质 | 标准化 LLM 与 Tool/Resource 的通信，不是 fetch 接口调用 |
| 3 | `McpServer` 创建 | `new McpServer({ name, version })` |
| 4 | `registerTool` | 不同于 `tool()`，返回 `{ content: [{ type, text }] }` |
| 5 | `registerResource` | 🆕 前五课没有：提供静态文档给 LLM |
| 6 | `StdioServerTransport` | 基于 stdin/stdout 的跨进程通信 |
| 7 | `MultiServerMCPClient` | 一个 Client 可连接多个 Server，每个配置 `command + args` |
| 8 | `mcpClient.getTools()` | 工具从外部进程动态获取，非本地定义 |
| 9 | `mcpClient.listResources()` | 获取资源内容，注入 System Prompt |
| 10 | `mcpClient.close()` | 关闭所有子进程 + 通信通道 + 释放资源 |

### 📊 基础 Agent vs MCP 优化

| 维度 | 前五课 · 基础 Agent | 第六课 · MCP 优化 |
|------|-------------------|-------------------|
| 核心能力 | Tool 定义 + Agent Loop + CLI + 完整工具集 | **跨进程工具 + Resource** |
| 工具来源 | 本地定义 / 模块导入 | **MCP 动态获取** |
| 工具数量 | 1 → 4 | **N（不限）** |
| 跨语言 | ❌ 只能用 Node.js | **✅ Node/Python/Java/Rust 皆可** |
| 跨项目复用 | ❌ 绑定在项目内 | **✅ 一套 Server，所有项目共用** |
| Resource | ❌ | **✅ 🆕 静态知识注入** |

> 🎯 **本课定位**：前五课搭建的是最普通、最基本的 Agent（LLM + Tool + Loop），它已经能独立完成编程任务。MCP 是在这个基础上的**优化升级**——把工具从"Agent 的附属品"变成"独立的、可共享的、可跨语言的服务"。基础 Agent 够用的时候不必上 MCP，但当你需要跨团队共享工具、调用 Python/Java 写的服务时，MCP 就是解题钥匙。

---

*📅 2026-07-11 | 🏷️ Agent · MCP · Model Context Protocol · 跨进程 · Resource · 第六课*
