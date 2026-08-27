# 天龙八部 RAG 图书业务知识库化
我们学习了 loader 、splitter 、Milvus 数据库、RAG 流程完整跑通了。
- loader 从各种来源加载文档
epub csv ... 相应的loader 加载器？
- splitter 文档分割器 分块
separator 切割符号 。 ？ ！
chunk_size 每个分块的大小
overlap 两个分块之间的重叠大小
- embeddings 文档向量化
1024 百万字
- Milvus 数据库 存储向量化后的文档
- RAG 流程
cosine 相似度匹配 top_k