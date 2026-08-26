import 'dotenv/config';
import {
  MilvusClient,    // C/S B/S
  MetricType, // 相似度求方法 
  IndexType,
  DataType  // 字段数据类型约束
} from '@zilliz/milvus2-sdk-node';
import {
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

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
})
const getEmbedding = async (text) => {
  const result = await embeddings.embedQuery(text);
  return result;
}

async function main() {
  try {
    console.log('Connection to Milvus server...');
    await client.connectPromise;// 先连接服务器Milvus，再操作
    console.log('Connected');
    const query = '我想看看关于户外活动的日记';
    const queryVector = await getEmbedding(query);
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: 2,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'content', 'date', 'mood', 'tags']
    });
    console.log(`Search ${searchResult.results.length} results`);
    searchResult.results.forEach((item, index) => {
      console.log(`${index + 1}.[${item.score.toFixed(4)}]`);
      console.log(`
        ID: ${item.id};
        Date: ${item.date};
        Mood: ${item.mood};
        Tags: ${item.tags?.join(",")};
        Content: ${item.content}
        `)
    });
  } catch (err) {

  }
}
main()
  .catch(console.error)