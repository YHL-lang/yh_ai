import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TodoItem({ task, onToggle, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="拖动排序"
        className="cursor-grab touch-none text-gray-300 transition hover:text-gray-500"
      >
        ⋮⋮
      </button>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 accent-blue-500"
      />
      <span
        className={`flex-1 text-gray-800 ${
          task.completed ? 'text-gray-400 line-through' : ''
        }`}
      >
        {task.text}
      </span>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="text-sm text-red-400 transition hover:text-red-600"
      >
        删除
      </button>
    </li>
  )
}
