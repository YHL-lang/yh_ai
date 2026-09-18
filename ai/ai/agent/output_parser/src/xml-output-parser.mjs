// xml -> json
//  <h1>title<span>副标题<b>子标题</b></span></h1> 老钱 老一代的数据交换标准
// {
// "title": "title",
// }
// fetch 后端api，返回json 格式 数据交换的事实标准
//XMLHttpRequest 老时代交换xml ajax
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { XMLOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const parser = new XMLOutputParser();
const question = `
请提取以下文本中的任务信息：爱因斯坦生于1879年，是一位伟大的物理学家。
${parser.getFormatInstructions()}
`

console.log(question);

try {
  console.log(`正在调用大模型...\n`);
  const response = await model.invoke(question);
  console.log(response.content);
  const result = await parser.parse(response.content);
  console.log(result);
} catch (err) {
  console.error(err.message);
}
