import SidebarNoteItem from "@/components/SidebarNoteItem";
// SidebarNoteList(RSC SEO)-》拆出来SidebarNoteItem （交互CSR）
export default async function SidebarNoteList({ notes }) {
  const arr = Object.entries(notes); // hash 转成二维数组 方便map 组件
  if (arr.length == 0) {
    return <div className="notes-empty">
      No Notes created yet!
    </div>
  }
  return (
    <ul className="notes-list">
      {
        arr.map(([noteId, note]) => {
          return (
            <li key={noteId}>
              <SidebarNoteItem noteId={noteId} note={JSON.parse(note)} />
            </li>
          )
        })
      }
    </ul>
  )
}