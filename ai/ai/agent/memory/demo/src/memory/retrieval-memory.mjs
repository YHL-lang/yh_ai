import 'dotenv/config';
import {
  OpenAIEmbeddings,
  ChatOpenAI
} from '@langchain/openai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node';
import {
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";

const COLLECTION_NAME = 'conversations'; // 集合
const VECTOR_DIM = 1024;// 维度

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-v3',
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  dimension: VECTOR_DIM
});

async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
});

const client = new MilvusClient({
  address: 'localhost:19530'
});

async function retrieveRelevantConversations(query, k = 2) {
  try {
    const queryVector = await getEmbedding(query);// embedding
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: k,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'content', 'round', 'timestamp']
    });
    return searchResult.results;
  } catch (err) {
    console.error('检索对话时出错', err.message);
    return [];
  }
}

async function retrievalMemoryDemo() {
  try {
    console.log('连接到 Milvus ...');
    await client.connectPromise;
    console.log('已连接\n');
  } catch (err) {
    console.error('无法连接到Milvus');
    return;
  }

  // 当前会话的history 实例
  const history = new InMemoryChatMessageHistory();
  const conversations = [
    { input: "我之前提到的机器学习项目进展如何?" },
    { input: "我周末进场做什么?" },
    { input: "我的职业是什么?" }
  ];

  // for (let i = 0; i < conversations.length; i++) {
  for (let i = 0; i < 1; i++) {
    const { input } = conversations[i];
    const userMessage = new HumanMessage(input);

    console.log(`\n 第${i + 1} 轮对话`);
    console.log(`用户：${input}`);
    console.log(`\n [检索相关历史对话]`);
    const retrievedConversations =
      await retrieveRelevantConversations(input, 2);
    let relevantHistory = '';
    if (retrievedConversations.length > 0) {
      relevantHistory = retrievedConversations
        .map((conv, idx) => {
          return `[历史对话 ${idx + 1}]
          轮次：${conv.round}
          ${conv.content}
        `
        }).join('\n\n------\n\n');
    } else {
      console.log('未找到相关历史对话');
    }
    // milvus 检索历史会话
    console.log(relevantHistory, '---------------')
    const contextMessage = relevantHistory ? [new HumanMessage(`相关历史对话：\n${relevantHistory}\n\n 
      用户问题：${input}`)] : [userMessage];
    const response = await model.invoke(contextMessage);
    console.log(response.content);
    await history.addMessage(userMessage);
    await history.addMessage(response);
    // 会话 持久化到milvus
    const conversationText = `用户：${input}\n 助手：${response.content}`;
    const convId = `conv_${Date.now()}_${i + 1}`;// 时间 + i 唯一ID uuid
    const convVector = await getEmbedding(conversationText);
    try {
      await client.insert({
        collection_name: COLLECTION_NAME,
        data: [{
          id: convId,
          vector: convVector,
          content: conversationText,
          round: i + 1,
          timestamp: new Date().toISOString()
        }]
      })
    } catch (err) {

    }
  }
}
retrievalMemoryDemo()
  .catch(console.error);