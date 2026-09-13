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
  const filePath = path.join(process.cwd(), "chat_history.json");
  const sessionId = "user_session_001";
  const systemMessage = new SystemMessage("你是一个友好、幽默的做菜助手，喜欢分享美食和做菜");
  // 从文件中恢复历史
  const restoredHistory = new FileSystemChatMessageHistory({
    filePath,
    sessionId
  })
  const restoredMessages = await restoredHistory.getMessages();
  console.log(`从文件中恢复${restoredMessages.length}条消息`);
  restoredMessages.forEach((msg, index) => {
    const type = msg.type;
    const prefix = type === "human" ? "用户" : "助手";
    console.log(`${index + 1}.[${prefix}]:${msg.content.substring(0, 50)}....`);
  });
  console.log("[第三轮对话]");
  const userMessage3 = new HumanMessage("需要哪些食材？");

  await restoredHistory.addMessage(userMessage3);
  const messages3 = [systemMessage, ...(await restoredHistory.getMessages())]
  const response3 = await model.invoke(messages3);
  await restoredHistory.addMessage(response3);
  console.log(response3.content);
  console.log("对话已保存到文件");
}
fileHistoryDemo()
  .catch(console.error);