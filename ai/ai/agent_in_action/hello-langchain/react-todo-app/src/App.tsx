import { useState, useEffect, useCallback, useRef } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Filter = 'all' | 'active' | 'completed';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('react-todo-app-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());
  const nextId = useRef(
    todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 持久化
  useEffect(() => {
    localStorage.setItem('react-todo-app-data', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: nextId.current++,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput('');
    inputRef.current?.focus();
  }, [input]);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setAnimatingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const clearCompleted = useCallback(() => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    completedIds.forEach((id) => {
      setAnimatingIds((prev) => new Set(prev).add(id));
    });
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => !t.completed));
      setAnimatingIds(new Set());
    }, 300);
  }, [todos]);

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="title">
            <span className="title-icon">✅</span>
            TodoList
          </h1>
          <p className="subtitle">高效管理你的每一天</p>
        </header>

        {/* Input */}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="todo-input"
            placeholder="✍️ 添加一个新任务..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="btn-add" onClick={addTodo} disabled={!input.trim()}>
            添加
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filters">
          {([
            ['all', '全部'],
            ['active', '进行中'],
            ['completed', '已完成'],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="filter-count">
                {key === 'all'
                  ? stats.total
                  : key === 'active'
                  ? stats.active
                  : stats.completed}
              </span>
            </button>
          ))}
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              <span className="empty-icon">📋</span>
              <p>
                {filter === 'all'
                  ? '暂无任务，开始添加吧！'
                  : filter === 'active'
                  ? '没有进行中的任务 👍'
                  : '还没有已完成的任务'}
              </p>
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${
                  animatingIds.has(todo.id) ? 'removing' : ''
                }`}
              >
                <button
                  className={`check-circle ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? '标记未完成' : '标记完成'}
                >
                  {todo.completed && <span className="check-mark">✓</span>}
                </button>
                <span className="todo-text" onClick={() => toggleTodo(todo.id)}>
                  {todo.text}
                </span>
                <button
                  className="btn-delete"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="删除"
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <footer className="footer">
            <div className="stats">
              <div className="stat-item">
                <span className="stat-num">{stats.total}</span>
                <span className="stat-label">总计</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num active-color">{stats.active}</span>
                <span className="stat-label">进行中</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num completed-color">{stats.completed}</span>
                <span className="stat-label">已完成</span>
              </div>
            </div>
            {stats.completed > 0 && (
              <button className="btn-clear" onClick={clearCompleted}>
                清除已完成
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
