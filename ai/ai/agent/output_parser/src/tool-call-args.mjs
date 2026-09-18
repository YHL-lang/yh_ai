// 从tool-call zod schema 得到灵感 可以直接 tool-call?
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const scientistSchema = z.object({
  name: z.string().describe('科学家的姓名'),
  birth_year: z.number().describe('出生年份'),
  nationality: z.string().describe('国籍'),
  fields: z.array(z.string()).describe('研究领域列表'),
})
// 偏门
// llm 调用的上下文
const modelWithTool = model.bindTools([
  {
    name: 'extract_scientist_info',
    description: '提取和结构化科学家的详细信息',
    schema: scientistSchema
  }
]);

// 这个工具不是为了直接调用，只做schema 校验，而是为了方便后续的解析和处理
const response = await modelWithTool.invoke('请介绍以下爱因斯坦的详细信息');
console.log(response);
console.log(response.tool_calls[0].args);
// 通过返回tool_calls的信息，也能拿到结构化数据
// 这种方式比output parser 更好
// output parser 模块还有存在的必要吗？

// que -> llm 生成 -> tool 想解决 -> schema 解析参数 -> 结构化数据