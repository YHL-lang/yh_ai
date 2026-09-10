import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TodosService } from './Todos.service.js';
import { type Todo } from './Todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }
  @Get()
  findAll(): Todo[] {
    // /todos
    console.log('/todos controller');
    // 怎么找到service? import  new 实例化 
    return this.todosService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Todo {
    console.log(id);
    return this.todosService.findOne(Number(id));
  }

  @Post()
  create(@Body('title') title: string): Todo {
    return this.todosService.create(title);
  }
  @Delete(":id")
  remove(@Param('id') id: string): { message: string } {
    this.todosService.remove(Number(id));
    return { message: `删除todo ${id}` };
  }
  //patch
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() patch: Partial<Todo>,
  ): Todo {
    return this.todosService.update(Number(id), patch);
  }
}
