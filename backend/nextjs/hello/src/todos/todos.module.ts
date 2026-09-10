// Todos Module 的定义文件 
import { Module } from '@nestjs/common';
import { TodosController } from './Todos.controller.js';
import { TodosService } from './Todos.service.js';
// 大型后端框架，MVC  试图层 不可以直接去数据库查数据 
// View Controller Model 
@Module({
  controllers: [TodosController],
  providers: [TodosService]
})
export class TodosModule { }