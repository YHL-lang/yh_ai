import { create } from 'zustand';
import { type Todo } from '../types/todo';
import { fetchTodos as getTodos, createTodo } from '../api/todos';
// ts 里store 里当然要定义 数据状态和actions
interface TodoStore {
  todos: Todo[];
  fetchTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  fetchTodos: async () => {
    const res = await getTodos(); // 请求通过 Nginx 代理
    // const data = await res.json();
    console.log(res)
    set({ todos: res });
  },
  addTodo: async (title: string) => {
    const res = await createTodo(title);
    console.log(res)
    // set((state) => ({ todos: [...state.todos, res] }));
  },
}));