import "dotenv/config";
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from '@langchain/openai';
import {
  Annotation,
  END,
  START,
  StateGraph
} from '@langchain/langgraph';
import { Milvus } from "@langchain/community/vectorstores/milvus"

const COLLECTION_NAME = "ebook_collection";
const TOP_K = 5;

//状态声明
const GraphState = Annotation.Root({
  question: Annotation,//问题
  k: Annotation,// 检索数量
  document: Annotation,//检索到的文档
  generation: Annotation//生成的回复
})

const model = new ChatOpenAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

const embedding = new OpenAIEmbeddings({
  model: "text-embedding-v3",
  dimension: 1024
});

let vectorStore;

async function retrieveRelevantContent(question, k = TOP_K) {
  try {
    const docsWithScores = await vectorStore.similaritySearchWithScore(question, k);
    return docsWithScores.map(([doc, score]) => ({
      document: doc.pageContent,
      score,
      id: doc.metadata?.id ?? "unknown",
      book_id: doc.metadata?.book_id ?? "未知",
      chapter_num: doc.metadata?.chapter_num ?? "未知",
      index: doc.metadata?.index ?? "未知",
      //doc.pageContent
      //doc.metadata 相关字段
    }))
  } catch (err) {
    console.error("检索内容时出错:", err.message);
    return [];
  }
}

const retrieveNode = async (state) => {
  const document = await retrieveRelevantContent(state.question, state.k);
  return {
    question: state.question,
    document,
    k: state.k
  }
}

const generateNode = async (state) => {
  const context = state.document
    .map((item, i) => `[片段${i + 1}]
  章节:第${item.chapter_num}章
  内容:${item.document}
  `).join("\n\n-------------\n\n")
  const prompt = `
  你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确，详细的语言。
  请根据以下《天龙八部》小说片段内容回答问题：
  ${context}
  用户问题：${state.question}

  回答要求：
  1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答
  2. 可以综合多个片段的内容，提供完整的答案
  3. 如果片段中没有相关信息，请如实告知用户
  4. 回答要准确，符合小说的情节和人物设定
  5. 可以引用原文内容来支持你的回答
  
  AI 助手的回答：
  `
  process.stdout.write("\n[AI回答(流式)]\n");
  let generation = "";
  const stream = await model.stream(prompt);
  for await (const chunk of stream) {
    const text = typeof chunk === "string" ? chunk.content : "";
    if (!text) continue;
    generation += text;
    process.stdout.write(text);
  }
  process.stdout.write("\n");
  return {
    question: state.question,
    document: state.document,
    k: state.k,
    generation
  }
}

const graph = new StateGraph(GraphState)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END)
  .compile();

const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);

async function main() {
  const question = "阿朱的结局是什么？"
  const kArg = 5;

  console.log("连接到Milvus...");
  vectorStore = await Milvus.fromExistingCollection(embedding, {
    collectionName: COLLECTION_NAME,
    url: "localhost:19530",
    textField: "content",
    primaryField: "id",
    vectorField: "vector",
    indexCreateOptions: {
      metric_type: "COSINE",
      //多层近图向量索引
      //IVF_FLAT 桶
      index_type: "HNSW",
      params: {
        M: 16, efConstruction: 200
      },
      search_params: { ef: 64 }
    }
  })
}

main()
  .catch(err => console.error(err.message))