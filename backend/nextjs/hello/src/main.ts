// nestjs 按需加载 大型框架的性能优化、模块化的思考
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { createObserveModule } from '@nestjs/observe';

const { ObserveInstrument } = createObserveModule();

async function bootstrap() {
  // 实例化 后端nestjs 应用
  // 面向对象思想
  // 工厂模式
  // nest 可以开发的后端服务太多了
  // /首页 由AppModel 来服务
  // Model 是一个整体 后端最常见的MVC 模式
  // M Model 数据库抽象
  // C Controller 控制器
  // V View 视图层 html
  // 一个文件 几千行代码
  //localhost:3000/ /后端路由 -> 送到 AppModel
  // 组织控制器 controller ，server层CRUD sql
  const app = await NestFactory.create(AppModule, {
    //启动web http 服务 3000
    instrument: ObserveInstrument,
  });
  // 启用 CORS，允许前端跨域请求
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
