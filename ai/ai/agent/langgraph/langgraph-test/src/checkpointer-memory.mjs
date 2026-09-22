import {
  Annotation,// 注释 工作流状态描述 数据 state
  END,// 结束节点
  START,// 开始节点
  MemorySaver,// 内存保存器
  StateGraph,// 状态图类 流程编排器 节点的组织
} from '@langchain/langgraph';

const StateAnnotation = Annotation.Root({
  // session 相关会话状态 某人 访问次数
  // 每个人的访问次数是独立的
  visitCount: Annotation({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),
  message: Annotation({
    reducer: (_prev, next) => next,
    default: () => "",
  })
})
// 计数的节点
function recordVisit(state) {
  const visitCount = state.visitCount + 1;
  const message =
    visitCount === 1
      ? "这是你在本会话里第一次进入"
      : `这是你在本会话里第${visitCount}次进入`
  return {
    visitCount,
    message,
  }
}

const graph = new StateGraph(StateAnnotation)
  .addNode("recordVisit", recordVisit)
  .addEdge(START, "recordVisit")
  .addEdge("recordVisit", END)

const checkpointer = new MemorySaver();// 内存保存器
const app = graph.compile({
  checkpointer
});
// 多用户
const user1 = { configurable: { thread_id: "用户-小张" } }
const user2 = { configurable: { thread_id: "用户-小李" } }
const res1 = await app.invoke({}, user1);
console.log(res1);
const res2 = await app.invoke({}, user1);
console.log(res2);
const res3 = await app.invoke({}, user1);
console.log(res3);
const res4 = await app.invoke({}, user2);
console.log(res4);
