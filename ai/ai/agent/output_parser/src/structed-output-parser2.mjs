import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
// 结构化输出解析器
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});
// output 结构化输出，再严苛一点， Schema 来约束
const scientistSchema = z.object({
  name: z.string().describe('科学家的姓名'),
  birth_year: z.number().describe('科学家的出生年份'),
  death_year: z.number().optional().describe('死亡年份,如果还在世则为不填'),
  nationality: z.string().describe('科学家的国籍'),
  fields: z.array(z.string()).describe('研究领域列表'),
  awards: z.array(
    z.object({
      name: z.string().describe('获奖的名称'),
      year: z.number().describe('获奖的年份'),
      reason: z.string().describe('获奖的原因'),
    }).describe('科学家获得重要奖项列表')
  ),
  major_achievements: z.array(z.string()).describe('科学家的主要成就'),
  famous_theory: z.array(
    z.object({
      name: z.string().describe('理论的名称'),
      year: z.number().describe('理论的年份'),
      description: z.string().describe('理论简要描述'),
    }).describe('科学家著名的理论列表')
  ),
  biography: z.string().describe('简短传记，100字以内'),
});

const parser = StructuredOutputParser.fromZodSchema(scientistSchema);

const question = `
请介绍以下居里夫人的详细信息，
${parser.getFormatInstructions()}
`

console.log(question);

try {
  console.log("正在调用大模型...\n");
  const response = await model.invoke(question);
  console.log(response.content);

  const result = await parser.parse(response.content);
  console.log(`姓名：${result.name}`);
  console.log(`出生年份：${result.birth_year}`);
  console.log(`国籍：${result.nationality}`);
  console.log(`主要成就：${result.major_achievements}`);
} catch (err) {
  console.error(err.message);
}