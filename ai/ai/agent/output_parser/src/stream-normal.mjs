// 流式输出
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

const prompt = '详细介绍莫扎特的星系';
console.log("普通流式输出展示：（无结构化）\n");
//llm api 容错
try {
  // invoke 同步输出
  // stream 流式输出
  let fullContent = '';
  let chunkContent = 0;
  const stream = await model.stream(prompt);
  // stream 水流 ， 管子，chunk 一个数据块
  console.log(`接收流式数据`);
  // 数据块
  console.log(stream);
  // for await (const chunk of stream) {
  //   chunkContent++;
  //   const content = chunk.content;
  //   fullContent += content;
  //   process.stdout.write(content);// 实时显示流式文本
  // }

  console.log(`\n\n共接收${chunkContent}个数据块`);
  console.log(`完整内容：${fullContent}`);

} catch (err) {
  console.error(err.message);
}