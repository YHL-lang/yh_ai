import dayjs from 'dayjs';
import SidebarNoteItemContent from '@/components/SidebarNoteItemContent';

export default function SidebarNoteItem({ noteId, note }) {
  const { title, content = '', updateTime } = note;
  return (
    <SidebarNoteItemContent
      id={noteId}
      title={note.title}
      expandChildren={
        <p className='sidebar-note-excerpt'>
          {content.substring(0, 20) || <i>(No content)</i>}
        </p>
      }
    >
      <header className='sidebar-note-header'>
        <string>{title}</string>
        <small>{dayjs(updateTime).format('YYYY-MM-DD')}</small>
      </header>
    </ SidebarNoteItemContent>
  )
}