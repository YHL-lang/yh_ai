// prompt(文本输入) -> tokens(编码器) -> 向量化(embedding 数字语义) -> llm(transform) -> tokens(解码器) -> text(文本输出)
import OpenAI from "openai";
import dotenv from "dotenv";
import { Containers } from "openai/resources/index.mjs";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,// 阿里百炼
  baseURL: process.env.DASHSCOPE_API_BASE_URL,// 阿里百炼的api地址
});
// llm 向量化的封装函数
async function getEncoding(text) {
  // 文本 数学 高维度 向量化
  const res = await client.embeddings.create({
    // 嵌入模型 embedding
    model: "text-embedding-v4",
    input: text,
    dimensions: 1024 // 维度
  })
  return res.data[0].embedding;
}
// 余弦相似度 计算两个向量之间的相似度
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}//值越大相似度越高 0-1 1 表示完全相似

async function run() {
  // 语义相似
  // 文本匹配绝对不一致
  // embedding 语义 1024 维度 向量化-1->1 数学表达
  const text1 = "Andrej Karpathy LLM Tokenization 分词原理";
  const text2 = "卡帕西讲解大模型BPE字词分词";
  const text3 = "今天天气晴朗，适合出门散步";
  const vec1 = await getEncoding(text1);
  // console.log(vec1);
  // console.log(vec1.length);
  const vec2 = await getEncoding(text2);
  const vec3 = await getEncoding(text3);
  // 计算相似度
  const similarity = cosineSimilarity(vec1, vec2);
  console.log("相似度:", similarity);
  // 计算相似度
  const similarity3 = cosineSimilarity(vec1, vec3);
  console.log("相似度:", similarity3);
}

run();