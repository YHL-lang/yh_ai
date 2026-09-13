import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import {
  InMemoryChatMessageHistory// 内存记忆
} from '@langchain/core/chat_history'
import {
  HumanMessage,
  SystemMessage// 系统消息
} from '@langchain/core/messages'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

async function inMemoryDemo() {
  // 数组 升华到 内存记忆的实例
  const history = new InMemoryChatMessageHistory();
  // console.log(history)
  // 独立
  const systemMessage = new SystemMessage(
    "你是一个友好、幽默的做菜助手，喜欢分享美食和做菜技巧"
  );
  console.log("[第一轮会话]");
  const userMessage1 = new HumanMessage("你今天吃的什么？")
  await history.addMessage(userMessage1) // messages 数组添加对话
  // 第一轮会话
  const messages1 = [systemMessage, ...(await history.getMessages())]
  console.log(messages1);
  const response1 = await model.invoke(messages1)
  console.log(`助手：${response1.content}\n`);
  // 维护memory
  await history.addMessage(response1);
  // console.log(history.getMessages());
  console.log("[第二轮会话 基于历史]");
  const userMessage2 = new HumanMessage("好吃吗？");
  await history.addMessage(userMessage2) // messages 数组添加对话
  const messages2 = [systemMessage, ...(await history.getMessages())];
  const response2 = await model.invoke(messages2);
  await history.addMessage(response2);
  console.log(`助手：${response2.content}\n`);

  const allMessages = await history.getMessages();
  console.log(`共保存了${allMessages.length}条消息`);
  allMessages.forEach((message, index) => {
    const type = message.type === 'human' ? '用户' : '助手';
    const prefix = type === 'human' ? '用户' : '助手';
    console.log(`${index + 1}.[${prefix}]:${message.content.substring(0, 50)}....`)
  })

}

// Promise<T>
inMemoryDemo()
  // 链式调用 chain
  .catch(console.error)
  .finally(() => {
    console.log('done')
  })