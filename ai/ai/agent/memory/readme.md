# Memory 管理

Agent =  LLM + Harness(tool + RAG + Memory +....)
给模型扩展Tool，不只是回答问题，干活
RAG，基于query 获取向量数据库相关的知识放入prompt。
都依赖于**Memory**。

大模型是无状态的，基于上次的问答继续问，问答。
之前已经通过chatMessages 数组 做了简单的Memory 管理。

- 持久化 
- 上下文窗口大小 200k？
- /compact 总结 最近消息  /clear

Agent 执行流程 ReAct， messages 数组 -> Memory

上下文大小
Memory 三种思路 截断（slice（-4））、总结、检索
临时记忆
长期记忆

用InMemoryChatHistory 来管理messages ，放到内存里。
用addMessage 添加HumanMessage，AIMessage，ToolMessage，
调用大模型，返回（AIMessage）直接添加到history。
getMessages() 获取所有消息 ，每个message 对象
HumanMessage, AIMessage, ToolMessage，实例 type content 等属性

## 长时记忆
- 文件
- 向量数据库

## memory 逻辑
- 存储逻辑
  内存 文件 数据库
- 管理逻辑
  截断（slice（-4））、总结、检索
- trimMessages 帮我们实现了基于token的截断
- getBufferString 获取当前上下文字符串 history messages 转换为字符串
- token 精确计算

开发一个聊天应用 codex
每聊20条就触发一次总结，生成摘要，存入milvus 向量数据库
从milvus 取出对话历史，接着回答，Agent 更懂我们，Harness的Memory模块
