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

//路由节点
const router = (state) => {
  const isMath = /[+\-*]/.test(state.query)
  return {

  }
}
