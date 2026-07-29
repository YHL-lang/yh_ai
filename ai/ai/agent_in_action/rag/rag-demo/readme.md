# RAG
Retrieval-Augmented Generation
Retrieval 检索器 名词
知识库 -> 先embedding 基于向量数据库 -> 检索器  （embedding + 行速度 + Prompt embedding）

## langchain RAG 业务能力
- @langchain/openai ChatOpenAI Embedding
- @langchain/core/documents
 embedding 的最小单元
 知识库 由文件（文本、声音、图片、视频等）构成
 某个段落的文字 有我们要找的语义
 {
  pageContent: '要单独embedding 的文本',
  meta:{元数据 不做embedding处理
    ...
    link: 'https://www.baidu.com',
    author: 'yihao'
  }
 }
 documents... 简单就放内存 复杂，发向量数据库
- @langchain/classic llm 开发以来 langchain 的经典常用模块
MemoryVectorStore 内存向量数据库 内存向量存储

检索器=(知识库 -> 文档 -> documents -> embedding -> memoryVectorStore)
invoke()

AI 发展太迅猛 langchain 版本更新太快，看文档

- retriever.invoke(3) top_k
 在相似度 查询的基础上，还会做去重、过滤、rerank等
- vector.similaritySearchWithScore(3) 只做向量查询
score 会表达内容质量