import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import {
  //   // InMemoryChatMessageHistory// 内存记忆
  FileSystemChatMessageHistory// 文件记忆
} from '@langchain/community/stores/message/file_system'
import {
  HumanMessage,
  SystemMessage,// 系统消息
  AIMessage,// 大模型回复
} from '@langchain/core/messages'
import path from 'node:path'// fs path 模块

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

async function fileHistoryDemo() {
  // Promise 类上的静态方法，pending -> rejected
  // return Promise.reject("失败了")
  // return Promise.resolve("成功了")
  // console.log(process.cwd())
  // InMemory 当前的Agent
  // file 最近几次聊的
  // milvus
  const filePath = path.join(process.cwd(), "chat_history.json");
  const sessionId = "user_session_001"// 多用户
  const systemMessage = new SystemMessage(
    "你是一个友好、幽默的做菜助手，喜欢分享美食和做菜技巧"
  );
  console.log("[第一轮会话]");
  // 
  const history = new FileSystemChatMessageHistory({
    filePath,
    sessionId,
  })
  const userMessage1 = new HumanMessage("红烧肉怎么做");
  await history.addMessage(userMessage1)

  const message1 = [systemMessage, ...(await history.getMessages())];
  const response1 = await model.invoke(message1)
  console.log(response1);
  await history.addMessage(response1);
  console.log(`用户：${userMessage1.content}\n`);
  console.log(`助手：${response1.content}\n`);
  console.log("[第二轮会话 基于历史]");
  const userMessage2 = new HumanMessage("好吃吗？");
  await history.addMessage(userMessage2)

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
// promise<T>
fileHistoryDemo()
  // .then(console.log)
  .catch(console.error)
// .finally(() => console.log("finally"))