# Agent

最值钱的Agent开发 
如何打造自己的Agent?

## 不是直接调用大模型接口 
llm 有些问题
- 你上周和它聊过的消息，它能记住吗？
  llm stateless 不可以
  数据库、前端存储、redis 
  llm + 后端 
  Memory 模块 
- 让llm 帮访问一个网页， 做一些事情， llm 只能告诉你思路 我们自己做 
  Tool Use 模块 
- 访问内部私有文档， llm 不知道 
  RAG 模块  
- 最新的世界杯新闻， 新的不再预训练数据中 
  MCP(第三方Tool， llm 协议) Tool
- 做ppt, 分析股市并自动买卖
  skills 技能 蒸馏 

Agent 就是围绕以上问题 给llm 加上Memory记忆模块，Tool工具调用能力， RAG， MCP, Skills 等 。
Agent = llm + Memory + Tool + RAG + MCP + Skills

Claude Code, Codex  Coding Agent 
小龙虾， Manus 自动化任务 

## Agent 的工作流程
user 以prompt 的形式 提出一个任务（复杂）交给 Agent 智能体
llm planning/Reasioning(规划/推理) -> 要不要加载memory
-> 要不要调用工具（分步骤多个工具）-> RAG(查询出来的内容Prompt Template ) -> response -> user (任务完成)

## Agent 开发框架 Langchain 
node（nestjs） + langchain(单智能体开发框架) + langgraph (多智能体开发)

结合后端技术，开发AI 全栈Agent产品，让AI技术通过Harness Engineering 落地， 实现AI技术的商业价值（FDE）。

Agent 其实也不复杂， llm本身也可以思考，规划，给它用Tool 扩展能力，能自己做事情了， 用memory 管理记忆，它就可以记住你要它记住的东西。还可以用RAG查询内部知识库来获取知识。

这样一个知道内部知识、能思考、规划，能够帮你做事情的扩展后的大模型， 就是一个Agent。
- nestjs 
- langchain   js node
- langgraph
- MCP\RAG\SKill 

## langchain
- LLM
  统一且兼容 chatOpenAI
  @langchain/openai
  按需加载的llm 模型
- Tool
  langchain 又来接管 @langchain/core zod 验证工具
  tool openai 接口 里有描述和格式的约束
  - 2个部分 （异步）处理函数
    函数描述对象
    - name
    - **description** 详细功能，覆盖场景，参数需求
    - **schema** 参数约束 tool 与llm 要调用此工具，必须提供
    schema 约定的参数
- tool 的 返回格式
  - llm 有自知之明， 当要调用tool的时候，不生成，停下来告诉用户tool_calls 要调用的工作列表
  id ，name，arguments 多个工具id 关联等下tool 函数调用
  结果 需要历史会话列表 才能组成完整的任务上下文
  tool异步的， llm哪个任务细节由哪个工具执行，id关联llm基于自然语言

## llm Tool 性能
- llm 任务复杂 可能调用多个tool，或每个tool调用多次
- Promise.all  static 方法 **并行执行**多个Promise， 等待所有Promise 都完成，返回结果
  - Promise es6 提供的异步语法 三种状态
    - pending 等待中...
    - resolved() 已解决 Pending ->Fullfilled
    - rejected() 已拒绝 Pending ->Rejected
    只能从pending 状态转换到 resolved 或 rejected 之一，而且不能再变了
  - await es8 最优雅的异步变同步 语法
  - Promise.all([Promise数组])并行执行多个Promise， 等待所有Promise 都完成，返回结果，结果顺序与Promise数组顺序一致

  即将打造高性能的第一个Agent