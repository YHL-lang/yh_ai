import {
  Annotation,// 注释 工作流状态描述 数据 state
  END,// 结束节点
  START,// 开始节点
  StateGraph,// 状态图类 流程编排器 节点的组织
} from '@langchain/langgraph';
const StateAnnotation = Annotation.Root({
  query: Annotation({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  router: Annotation({
    reducer: (_prev, next) => next,
    default: () => "chat",
  }),
  answer: Annotation({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
})

//路由节点 节点声明 走向可以选择的
const router = (state) => {
  const isMath = /[+\-*]/.test(state.query)
  // 下一步怎么走？
  // 如果是数学问题，走 math 节点
  // 如果不是数学问题，走 chat 节点
  return {
    router: isMath ? "math" : "chat",
  }
}

const math = (state) => {
  try {
    return {
      answer: String(eval(state.query)),
    }
  } catch (error) {
    return {
      answer: "数学问题计算错误",
    }
  }
}

const chatNode = (state) => (
  { answer: `你说的是${state.query}` }
)

const graph = new StateGraph(StateAnnotation)
  .addNode("routerNode", router)// 路由节点 ， name "routerNode"
  .addNode("math", math)// 数学问题节点 ， name "math"
  .addNode("chat", chatNode)// 聊天节点 ， name "chat"
  .addEdge(START, "routerNode")// 开始节点 到 路由节点 走向固定
  //条件分支 state.route 值判断 math 节点 或 chat 节点
  .addConditionalEdges("routerNode", (state) => state.router, {
    math: "math",
    chat: "chat",
  })
  .addEdge("math", END)// 数学问题节点 到 结束节点
  .addEdge("chat", END)// 聊天节点 到 结束节点
  .compile()

// 流程图
const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyle: true });
console.log(mermaid);
//langchain langgraph 共享底层相同的基础功能 llm
console.log("result:", await graph.invoke({ query: "你好" }));
console.log("result:", await graph.invoke({ query: "1+2" }));
