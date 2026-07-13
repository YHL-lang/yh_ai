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
import { AsyncGeneratorWithSetup } from '@langchain/core/utils/stream';

const model = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

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
    // Chrome‑DevTools MCP，默认连接本地打开的Chrome（开启远程调试：chrome --remote-debugging-port=9222）
    'chrome-devtools': {
      command: 'npx',
      args: [
        '-y',
        'chrome-devtools-mcp@latest',
      ]
    }
  }
})

const tools = await mcpClient.getTools();
console.log(tools);
const modelWithTools = model.bindTools(tools);

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
    }
  }
  // 最后一次消息是AI的回复
  //改进
  return messages[messages.length - 1].content;
}

const result = await runAgentWithTools("北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名");

// 保存结果到 md 文件
const outputDir = path.resolve(import.meta.dirname, '../output');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `hotel-result-${Date.now()}.md`);
fs.writeFileSync(outputPath, `# 北京南站附近酒店查询结果\n\n${result}\n`);
console.log(chalk.cyan(`\n✅ 结果已保存到：${outputPath}`));