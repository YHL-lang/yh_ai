# Agentic RAG
AI Agent 全栈开发岗
- 你用的什么向量数据库
milvus，ts
qdrant python
pipecone
...
## RAG 
公司内部的Agent 基本都要用到RAG
llm 能思考，但不知道公司内部的文档，我们需要基于内部文档来回答。
这个流程太固定了，有些缺点
- 所有问题都走RAG检索？简单问题不需要检索，浪费资源（token和检索，增强流程）
 1+1=？
 两个分支，一个简单问题，一个复杂问题。
 llm 来判断简单？
- 没有纠错和评估机制，无法判断检索内容是否精确，是否足够
  llm 评估函数
- 处理不了需要多步检索的复杂问题，比如先查A，再查B，最后回答问题
  天龙八部 中 四大恶人 排名第二的是谁？此人之子在身世揭晓前，其生父在武林中的公开身份是什么？
  分步骤


## Agentic RAG
自主规划，更智能，评估
langgraph 设计一个graph 表示 Agentic RAG 流程？

## RAG graph
- 简单问题 任然会走retrieve，浪费token和时间
  重新设计graph