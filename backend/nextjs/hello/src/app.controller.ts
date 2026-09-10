import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    console.log('/的控制器');
    // 响应什么内容？交给server层
    // this -> module
    return this.appService.getHello();
  }
}
