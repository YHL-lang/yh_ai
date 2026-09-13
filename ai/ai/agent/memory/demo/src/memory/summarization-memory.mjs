import 'dotenv/config';
// 被截断的数组 -> 字符串拼接 -> ai summarization
import {
  InMemoryChatMessageHistory
} from '@langchain/core/chat_history'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  // trimMessages,//langchain 自带的history 裁剪工具，留下最近的
  getBufferString
  // 被裁剪的老消息（总结），留下来的（history clear，新的message）
} from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

// 总结历史消息，返回总结结果
async function summarizeHistory(messages) {
  if (messages.length === 0) {
    return '';
  }
  // 对象数组 -> 字符串拼接
  const conversationText = getBufferString(messages, "用户", "助手")
  // console.log(conversationText);
  const summaryPrompt = `请总结以下对话的核心内容，保留重要信息：
  ${conversationText}
  总结：
  `;
  // langchain 编排线性工作流  pipe 
  // langgraph 编排非线性工作流  graph
  const summaryResponse = await model.invoke([new SystemMessage(summaryPrompt)]);
  console.log(summaryResponse.content);
  return summaryResponse.content;
}

async function summarizationDemo() {
  const history = new InMemoryChatMessageHistory();
  const maxMessages = 6;
  const messages = [
    { type: 'human', content: '我叫李四' },
    { type: 'ai', content: '你好李四，很高兴认识你！' },
    { type: 'human', content: '我是一名设计师' },
    { type: 'ai', content: '设计师是个很有创造力的职业！你主要做什么类型的设计？' },
    { type: 'human', content: '我喜欢艺术和音乐' },
    { type: 'ai', content: '艺术和音乐都是很好的爱好，它们能激发创作灵感。' },
    { type: 'human', content: '我擅长 UI/UX 设计' },
    { type: 'ai', content: 'UI/UX 设计非常重要，好的用户体验能让产品更成功！' },
  ];
  for (const msg of messages) {
    if (msg.type === 'human') {
      await history.addMessage(new HumanMessage(msg.content));
    } else {
      await history.addMessage(new AIMessage(msg.content));
    }
  }

  let allMessages = await history.getMessages();
  console.log(`原始消息数量：${allMessages.length}`);
  console.log(`原始信息：`, allMessages.map(m => `${m.constructor.name}: ${m.content}`).join('\n'));
  if (allMessages.length > maxMessages) {
    const keepRecent = 2;
    const RecentMessages = allMessages.slice(-keepRecent);
    const messagesToSummarize = allMessages.slice(0, -keepRecent);
    console.log("\n历史消息过多，开始总结...");
    console.log(`\n将被总结的消息数量：${messagesToSummarize.length}`);

    const summary = await summarizeHistory(messagesToSummarize);

    // 先清空历史消息
    await history.clear();

    for (const msg of RecentMessages) {
      await history.addMessage(msg);
    }

    // 再添加总结信息
    await history.addMessage(new AIMessage(summary));

    const newMessages = await history.getMessages();
    for (let msg of newMessages) {
      console.log(`${msg.constructor.name}: ${msg.content}`);
    }
  }
}
summarizationDemo()
  .catch(console.error)