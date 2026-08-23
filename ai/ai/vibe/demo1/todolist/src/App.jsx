import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'

export default function App() {
  const [tasks, setTasks] = useState([])

  const addTask = (text) => {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ])
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const reorderTask = (activeId, overId) => {
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId)
      const newIndex = prev.findIndex((t) => t.id === overId)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800">待办清单</h1>
      <TodoInput onAdd={addTask} />
      <TodoList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onReorder={reorderTask}
      />
    </div>
  )
}
