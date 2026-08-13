# Document 切割

- 知识库 放的知识
  知识的来源很多，一个word文档，一个pdf文件，一个bilibili视频，
  一个url，一个挺靠谱的twitter
  各种格式文件 -> 向量化前的Document?loader
  不能直接创建一个Document对象
  怎么处理一下？
  Document？ langchain 提供的标准格式的文档 pageContent metadata
  pageContent 文档的内容
  metadata 文档的元数据

## loader
知识库 -> 向量数据库
各种知识文件，后缀，不同的文件也有不同的loader
输入是文件
输出是Documents
两件事情要做
1. 选择相应的loader  180多种
2. 分块 文件太大，要检索的是一定大小具有一定语义的chunk
来自社区 @langchain/community 主要由社区维护，我们都可以写loader
langchain @langchain/core 官方维护的

- 爬虫 crawl 
  - 从目标url开始，发送请求，拿到html字符串 axios 简单
  - 解析html字符串，提取需要的文本内容（正则） 难度
  - cheerio 另辟蹊径，前端思维 css 选择器 需要内容
    cheerio.load(html) document 对象
    $(CSS selector).text() 提取文本内容

## AI 时代程序员价值
- 不再是coding ，交给AI
- vibecoding 问出好的问题（prompt）、提供丰富准确的上下文（context）、驾驭（Harness）并部署（FDE）Agent产品，设计长时间稳定运行的Loop，用好AI，快速成为一名AI 架构师。
- 切割的意义
  保持语义完整性
  - separators 语义最基本构成符号。 ？ ！，不会是，
  - 按chunksize 大小来 切割 组装
  - 切断了，chunk的最后一句和下一个chunk的第一句，它们的语义相关性是最大的，但是因为chunksize 切开了，语义遗憾用overlap 用一定的冗余来确保语义的完整性
