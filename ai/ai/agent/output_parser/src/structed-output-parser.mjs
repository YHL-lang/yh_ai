import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
// 结构化输出解析器
import { StructuredOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

// json ,name,description 更靠谱
// JsonOutputParser 格式化的升级
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  name: '姓名',
  birth_year: '出生年份',
  nationality: '国籍',
  major_achievements: '主要成就，用逗号分隔的字符串',
  famous_theory: '著名的理论'
});

const question = `
请介绍一下爱因斯坦的信息
${parser.getFormatInstructions()}
`;

console.log(question, '------------------');

try {
  console.log("正在调用大模型(使用StructuredOutputParser)...\n");
  const response = await model.invoke(question);
  console.log(response.content);

  const result = await parser.parse(response.content);
  console.log(`姓名：${result.name}`);
  console.log(`出生年份：${result.birth_year}`);
  console.log(`国籍：${result.nationality}`);
  console.log(`主要成就：${result.major_achievements}`);
  console.log(`著名的理论：${result.famous_theory}`);
} catch (err) {
  console.error(err.message);
}