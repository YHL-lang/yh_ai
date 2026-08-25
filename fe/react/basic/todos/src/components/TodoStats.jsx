// 统计组件
const TodoStats = ({ total, active, completed, onClearCompleted }) => {
  return (
    <div className="todo-stats">
      <p>
        Total:{total}
        Active:{active}
        Completed:{completed}
      </p>
      {
        completed > 0 && (
          <button
            onClick={onClearCompleted}
            className="clear-completed"
          >Clear Completed</button>
        )
      }
    </div>
  )
}
export default TodoStats;