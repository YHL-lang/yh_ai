// RSC 组件 async 异步 为了 await 先去 后端数据
export default async function Page() {
  return (
    <div className="note--empty-state">
      <span className="note-text--empty-state">
        Click a note on the left to view something.
      </span>
    </div>
  )
}