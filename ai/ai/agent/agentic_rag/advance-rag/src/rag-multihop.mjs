// 段誉遇到的第一个神仙姐姐画像，是谁的弟子？
// 直接把query 向量化匹配不够准确
// 支持子问题拆分的工作节点

import "dotenv/config";
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from "@langchain/openai";
import {
  Annotation,
  END,
  START,
  StateGraph
} from '@langchain/langgraph';
import { Milvus } from '@langchain/community/vectorstores/milvus';
import { z } from 'zod';

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL_NAME,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  apiKey: process.env.OPENAI_API_KEY
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-v3",
  dimensions: 1024,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  apiKey: process.env.OPENAI_API_KEY
});

let vectorStore;

const GraphState = Annotation.Root({
  question: Annotation,
  k: Annotation,
  strategy: Annotation,
  routeReason: Annotation,
  subQuestions: Annotation,
  nextSubIdx: Annotation, // 指针 question[i] 判断跳出循环
  currentQuery: Annotation,// 当前的子问题
  retrievalCount: Annotation, // 检索次数统计
  maxRetrievals: Annotation,// 最大检索次数
  plannedNext: Annotation,// 计划下一个子问题
  documents: Annotation,
  generation: Annotation
})

const RouteSchema = z.object({
  // 枚举
  strategy: z.enum(["simple", "complex"]),
  reason: z.string()
});
// llm 完成问题的分辨
// RouteSchema 结构化输出约束
const routeQuestionNode = async (state) => {
  console.log('___ROUTE-QUESTION___');
  // 结构化输出
  const router = model.withStructuredOutput(RouteSchema);
  const route = await router.invoke(`
  你是问答路由器，请判断用户问题是否需要外部检索。

  规则：
  - simple: 常识问答、简短定义、无需特定小说细节即可回答。
  - complex: 需要《天龙八部》具体情节、任务关系、章节事实、原文细节或证据支持。
  
  用户问题： ${state.question}
  `);

  console.log(`路由策略：${route.strategy} ${route.reason}`)
  return {
    question: state.question,
    k: state.k,
    strategy: route.strategy,
    routeReason: route.reason
  }
}

const directAnswerNode = async (state) => {
  console.log('----DIRECT_ANSWER----');
  process.stdout.write("\n [AI 回答（流式）] \n");
  let generation = "";
  const stream = await model.stream(`你是一个中文回答助手,
  请直简洁回答问题。
  问题：${state.question}
  `)
  for await (const chunk of stream) {
    const text = typeof chunk.content === 'string' ? chunk.content : "";
    if (!text) continue;
    generation += text;
    process.stdout.write(text);
  }
  process.stdout.write("\n");
  return {
    question: state.question,
    k: state.k,
    strategy: state.strategy,
    routeReason: state.routeReason,
    documents: [],
    generation
  }
}

async function retrieveRelevantContent(question, k = TOP_K) {
  try {
    const docsWithScores =
      await vectorStore.similaritySearchWithScore(question, k);
    return docsWithScores.map(([doc, score]) => ({
      score,
      content: doc.pageContent,
      id: doc.metadata?.id ?? "unknown",
      book_id: doc.metadata?.book_id ?? "未知",
      chapter_num: doc.metadata?.chapter_num ?? "未知",
      index: doc.metadata?.index ?? "未知"
      // doc.pageContent 
      // doc.metadata 相关的字段
    }))
  } catch (error) {
    console.error("检索内容时出错：", error.message);
    return [];
  }
}

const DecomposeSchema = z.object({
  sub_questions: z.array(z.string()).min(1).max(8),
  reason: z.string()
})

// plan llm + prompt
// 给他身份
const decomposeQuestionNode = async (state) => {
  console.log("---DECOMPOSE_QUESTION---");
  const decomposer = model.withStructuredOutput(DecomposeSchema);
  const out = await decomposer.invoke(`
    你是《天龙八部》多跳问答的【子问题拆解器】
    用户原始问题：
    ${state.question}
    
    任务：将问题拆成**有序**子问题列表 sub_questions, 用于**依次向量检索**。要求：
    1. 链式推理、多层关系、应果先后的问题，必须拆成多条；单跳即可答的也可只输出1条。
    2. 每条子问题必须是**可独立检索**的完整中文问句，**禁止**使用「他/她/此人/上文」等指代；可写全人物名与事件名。
    3. 顺序必须符合推理链：先搞清前置实体/事实，再查后续结论。
    4. **不要**把整句原题原样复制成唯一一条（除非确实无法拆分）；不要拆成过碎的关键词列表。
    5. 输出 1～8 条即可。

    请输出 sub_questions 与简短 reason。
    `)
  // 去重空格，排除不需要的question
  const subQuestion = out.sub_questions.map((s) => s.trim()).filter(Boolean)
  if (subQuestion.length === 0) {
    throw new Error("decompose_question:sub_question 为空")
  }

  console.log(`拆解${subQuestion.length}条子问题(${out.reason})`)
  subQuestion.forEach((q, i) => {
    console.log(`[${i + 1}] ${q}`)
  });
  return {
    subQuestions: subQuestion,
    nextSubIdx: 0,
    currentQuery: subQuestion[0]
  }
}

const mergeUnique = (exsitingDocs, newDocs) => {
  //map key 可以是对象
  //has get
  const map = new Map();//es6 新增的Hashmap 数据结构key：value
  for (const d of [...exsitingDocs, ...newDocs]) {
    const key = String(d.id);
    const prev = map.get(key);
    if (!prev || Number(d.score) > Number(prev.score)) {
      map.set(key, d)
    }
  }
  return Array.from(map.values()).sort((a, b) => Number(b.score) - Number(a.score));
}

const retrieveNode = async (state) => {
  const subs = state.subQuestions ?? [];
  const idx = state.nextSubIdx ?? 0;
  const q = subs[idx]?.trim();//当前这一轮问题

  if (!q) {
    throw new Error(`retrieve:子问题下标${idx}无有效文本
      共${subs.length}条`)
  }

  const round = state.retrievalCount + 1;
  console.log(`---第${round}轮，子问题${idx + 1}/${subs.length}---`)
  console.log(`查询${q}`)
  const newDocs = await retrieveRelevantContent(q, state.k);
  //多轮retrieve可能重复，会浪费资源
  //重复可能让llm我们在强调，错觉
  const merged = mergeUnique(state.documents ?? [], newDocs)
  if (newDocs.length === 0) {
    console.log(`本轮未命中文档`)
  } else {
    console.log(`本轮共${merged.length}条命中文档,累计去重后${merged.length}条`)
    newDocs.forEach((item, i) => {
      const preview = item.content.length > 120
        ? `${item.content.substring(0, 120)}...}`
        : item.content
      console.log(`[R${i + 1}]score=${Number(item.score).toFixed(4)}chapter=${item.chapter_num} index=${item.index}`)
      console.log(`preview:${preview}`)
    })
  }

  return {
    documents: merged,
    retrievalCount: round,
    nextSubIdx: idx + 1,
    currentQuery: q
  }

  const documents = await retrieveRelevantContent(state.question, state.k);
  return {
    question: state.question,
    k: state.k,
    documents
  }
}


const generateNode = async (state) => {
  const context = state.documents
    .map((item, i) => `[片段 ${i + 1}]
    章节: 第 ${item.chapter_num}章
    内容：${item.content}
    `).join("\n\n----------\n\n")
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
  process.stdout.write("\n[AI回答（流式）]\n");
  let generation = "";
  const stream = await model.stream(prompt);
  for await (const chunk of stream) {
    const text = typeof chunk.content === "string" ? chunk.content : "";
    if (!text) continue;
    generation += text;
    process.stdout.write(text);
  }
  process.stdout.write("\n");

  return {
    question: state.question,
    k: state.k,
    documents: state.documents,
    generation
  }
}

const decideNext = (state) =>
  (state.strategy === 'simple' ? "direct_answer" : "decompose_question")

const graph = new StateGraph(GraphState)
  .addNode("route_question", routeQuestionNode)
  .addNode("direct_answer", directAnswerNode)
  .addNode("decompose_question", decomposeQuestionNode)
  .addNode("retrieve", retrieveNode)
  // .addNode("retrieve", retrieveNode)
  // .addNode("rag_generate", generateNode)
  .addEdge(START, "route_question")
  .addConditionalEdges("route_question", decideNext, {
    direct_answer: "direct_answer",
    decompose_question: "decompose_question"
  })
  // .addEdge("retrieve", "rag_generate")
  .addEdge("direct_answer", END)
  .addEdge("decompose_question", "retrieve")
  .addEdge("retrieve", END)
  .compile();

const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);



async function main() {
  // const question = "1+1=?";
  const question = "《天龙八部》中【四大二人】排行第二是谁？此人之子在身世揭晓前，其生父在武林中的公开身份是什么？";
  const k = 5;
  vectorStore = await Milvus.fromExistingCollection(embeddings, {
    collectionName: "ebook_collection",
    url: "localhost:19530",
    textField: "content",
    primaryField: "id",
    vectorField: "vector",
    indexCreateOptions: {
      metric_type: "COSINE",
      index_type: "HNSW",
      params: { M: 16, efConstruction: 200 },
      search_params: { ef: 64 }
    }
  });
  vectorStore.indexSearchParams = {
    metric_type: "COSINE",
    params: JSON.stringify({ ef: 64 })
  }

  try {
    await vectorStore.client.loadCollection({
      collection_name: "ebook_collection"
    });
    console.log("集合已加载;")
  } catch (error) {
    if (!error.message.includes("already loaded")) {
      throw error
    }
    console.log('集合已经处于加载zhaugntai');
  }

  const result = await graph.invoke({
    question,
    k: Number.isFinite(k) ? k : 5,
    strategy: "",
    routeReason: "",
    documents: [],
    generation: ""
  });

  console.log(JSON.stringify(result));

}

main()
  .then(err => console.error(err))