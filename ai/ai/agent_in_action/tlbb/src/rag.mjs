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
const COLLECTION_NAME = 'ebook2';
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

//RAG 图书业务知识库化
//函数名可读性
// 一个函数一个功能
// 只有一个返回值
async function retrieveRelevantContent(question, k = 3) {
  try {
    const queryVector = await getEmbedding(question);
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      metric_type: MetricType.COSINE,
      limit: k,
      output_fields: [
        'id',
        'book_id',
        'book_name',
        'chapter_num',
        'index',
        'content'
      ]
    });
    return searchResult.results;
  } catch (err) {
    console.error('检索相关内容时出错');
    return [];
  }
}

async function answerEbookQuestion(question, k = 3) {
  try {
    const retrievedContent = await retrieveRelevantContent(question, k);
    if (retrievedContent.length === 0) {
      console.log('没有找到相关的内容');
      return '抱歉,我没有找到相关的《天龙八部》内容。';
    }
    const context = retrievedContent.map((item, i) => `
    [片段${i + 1}]
    章节：第${item.chapter_num}章
    内容：${item.content}
    `).join('\n\n----\n\n');
    const prompt = `
    你是一个专业的《天龙八部》小说助手。基于小说回答问题，用准确、详细的语言。
    请根据以下小说片段内容回答问题：
    ${context}
    用户问题：${question}

    回答要求：
    1. 如果片段中有相关信息，请结合小说内容给出详细准确的回答。
    2. 可以综合多个片段的内容，提供完整的答案。
    3. 如果片段中没有相关信息，请如实告知用户。
    4. 回答要准确，符合小说的情节和人物设定
    5. 可以引用原文内容来支持你的回答。
    AI 助手的回答：
    `
    const response = await model.invoke(prompt);
    return response.content;
  } catch (err) {

  }
}

async function main() {
  try {
    await client.connectPromise;
    console.log('连接成功');
    try {
      await client.loadCollection({
        collection_name: COLLECTION_NAME
      });
      console.log('集合加载成功');
    } catch (err) {
      console.error('出错');
    }
    const result = await answerEbookQuestion('鸠摩智会什么武功？', 5);
    console.log(result);
  } catch (err) {
    console.error('error:', err);
  }
}

main()
  .catch((err) => {
    console.error('error:', err);
  })