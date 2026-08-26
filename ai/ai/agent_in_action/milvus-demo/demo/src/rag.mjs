import 'dotenv/config';
import {
  MilvusClient,    // C/S B/S
  MetricType, // 相似度求方法 
} from '@zilliz/milvus2-sdk-node';
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from '@langchain/openai';

const ADDRESS = process.env.MILVUS_ADDRESS;
// api key
const TOKEN = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ai_dairy';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  dimensions: VECTOR_DIM
});

const model = new ChatOpenAI({
  temperature: 0.1,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
})

const getEmbedding = async (text) => {
  const result = await embeddings.embedQuery(text);
  return result;
}

async function retrieveDiaries(question, k = 1) {
  try {
    const queryVector = await getEmbedding(question);
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: k,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'content', 'date', 'mood', 'tags']
    });
    return searchResult.results;
  } catch (err) {
    console.error('检索相关日记失败', err.message);
    return [];
  }
}

async function answerDiaryQuestion(question, k = 2) {
  try {
    console.log('='.repeat(80));
    console.log(`问题: ${question}`);
    console.log('='.repeat(80));
    // r a g 模块化
    console.log(`检索相关日记`);
    const retrievedDiaries = await retrieveDiaries(question, k);
    if (retrievedDiaries.length === 0) {
      console.log('没有找到相关日记');
      return;
    }

    retrievedDiaries.forEach((diary, i) => {
      console.log(`日记${i + 1} 相似度: ${diary.score.toFixed(4)}\n
      内容：${diary.content}
      `);
    });

    const content = retrievedDiaries
      .map((diary, i) => `
       [日记${i + 1}]
       日期: ${diary.date}
       心情: ${diary.mood}
       标签: ${diary.tags?.join(', ')}
       内容: ${diary.content}
      `)
      .join('\n\n----\n\n');

    const prompt = `你是一个温暖贴心的AI 日记助手。基于用户的日记内容回答问题，用亲切自然的语言。
      请根据以下日记内容回答问题：
      ${content}

       用户问题: ${question}
       回答要求：
       1. 如果日记中有相关信息，请结合日记内容给出详细、温暖的回答。
       2. 可以总结多篇日记的内容，找出共同点或趋势。
       3. 如果日记中没有相关信息，请温和告知用户。
       4. 用第一人称“你”来称呼日记的作者。
       5. 回答要有同理心，让用户感到被理解和关心。
       AI助手回答：
      `
    console.log('[AI 回答]');
    const response = await model.invoke(prompt);
    console.log(response.content);
  } catch (err) {
    console.error('失败', err.message);
    return null;
  }
}

async function main() {
  try {
    console.log('连接到Milvus server...');
    await client.connectPromise; //先握手
    console.log('已连接');
    await answerDiaryQuestion('我最近做了什么让我感到快乐的事情？', 2);

  } catch (err) {

  }
}
main();