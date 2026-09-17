// next.js 除了 use client 都是后端
// /api 数据接口 仍然满足 app router 约定
// route.ts 返回json 数据接口
import { type Todo } from "../../todos/type";
let todos: Todo[] = [
  {
    id: 1,
    content: '学习App Router',
    completed: true,
  },
  {
    id: 2,
    content: 'next.js 个人官网开发',
    completed: false,
  },
];
// /api/todos get 请求 restful
export async function GET() {
  // 返回json 数据接口 next.js 封装了 Response 类
  return Response.json(todos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newTodo: Todo = {
    id: +Date.now(),
    content: body.content,
    completed: false,
  }
  todos.push(newTodo);
  return Response.json(newTodo);
}