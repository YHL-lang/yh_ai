import {
  Injectable, NotFoundException // 可以被自动注入
} from '@nestjs/common'

export interface Todo {
  id: number;
  title: string;
  complete: boolean;
}
let todos: Todo[] = [
  { id: 1, title: '学习 NestJS', complete: false },
  { id: 2, title: '学习 CRUD', complete: true },
]

let nextId = 3;

@Injectable()
export class TodosService {
  findAll(): Todo[] {
    return todos
  }
  findOne(id: number): Todo {
    const todo = todos.find((todo) => todo.id === id);
    // 后端业务严谨稳定 容错模块
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }
  create(title: string): Todo {
    const todo: Todo = {
      id: +nextId++,
      title,
      complete: false,
    }
    todos.push(todo);
    return todo;
  }
  remove(id: number): void {
    // index
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    todos.splice(index, 1);
  }
  update(id: number, patch: Partial<Todo>): Todo {
    const todo = this.findOne(id);
    Object.assign(todo, patch);
    return todo;
  }
}


