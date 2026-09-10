# 🚀 NestJS 后端开发实战：从设计模式到 CRUD 全栈

> 本文基于一个 NestJS 学习项目，从**工厂设计模式**讲起，逐步深入到 **NestJS 模块化架构**和**完整 CRUD API** 的实现。适合前端开发者入门后端开发。

---

## 📑 目录

- [一、后端开发做什么？](#一后端开发做什么)
- [二、工厂模式：设计模式的第一课](#二工厂模式设计模式的第一课)
- [三、NestJS 项目初始化](#三nestjs-项目初始化)
- [四、NestJS 核心架构：模块化思想](#四nestjs-核心架构模块化思想)
- [五、实战：构建 Todos CRUD API](#五实战构建-todos-crud-api)
- [六、测试保障质量](#六测试保障质量)
- [七、总结](#七总结)

---

## 一、后端开发做什么？

在开始写代码之前，先搞清楚后端开发的核心职责：

| 方向 | 说明 |
|------|------|
| 🌐 **Web API** | 提供 RESTful / GraphQL 接口给前端调用 |
| 🔗 **系统集成** | 对接第三方服务、消息队列、缓存等 |
| 🤖 **AI Infra** | AI 模型服务、向量数据库等底层基础设施 |
| 🧩 **微服务** | 拆分大型系统为独立可部署的服务单元 |

**NestJS** 是 Node.js 生态中**企业级后端框架**的首选，它：

- ✅ 默认使用 TypeScript，类型安全
- ✅ 全面模块化，适合大型项目
- ✅ 装饰器驱动，代码简洁优雅
- ✅ 内置依赖注入，解耦彻底

---

## 二、工厂模式：设计模式的第一课

在深入 NestJS 之前，我们先理解一个核心设计模式——**工厂模式**。NestJS 的 `NestFactory.create()` 就是工厂模式的经典应用。

### 🧋 从一杯奶茶说起

想象一下，你想喝奶茶。你会怎么做？

- ❌ **自己做**：买茶叶、煮珍珠、调奶盖……流程繁琐
- ✅ **找蜜雪冰城**：告诉店员"我要一杯珍珠奶茶"，等着拿就行

> 💡 **工厂模式的核心思想**：你不需要知道产品的制造细节，只需要告诉工厂你想要什么。

### 🏢 定义产品类

蜜雪冰城有很多产品，每种产品都实现了相同的 `show()` 接口：

```javascript
// 🍦 冰淇淋
class IceCream {
  constructor() {
    this.name = '冰淇淋'
    this.price = 3
  }
  show() {
    console.log(`${this.name} ${this.price}元`)
  }
}

// 🍋 柠檬水
class LemoTea {
  constructor() {
    this.name = '柠檬水'
    this.price = 4
  }
  show() {
    console.log(`${this.name} ${this.price}元`)
  }
}

// 🥤 珍珠奶茶
class MilkTea {
  constructor() {
    this.name = '珍珠奶茶'
    this.price = 8
  }
  show() {
    console.log(`${this.name} ${this.price}元`)
  }
}
```

### 🏭 创建工厂类

工厂负责**统一管理和创建**产品，使用者不需要关心内部实现：

```javascript
// 蜜雪冰城工厂
class MiXueFactory {
  static create(type) {
    switch (type) {
      case 'ice':
        return new IceCream();
      case 'lemo':
        return new LemoTea();
      case 'milk':
        return new MilkTea();
    }
  }
}

// 🛒 使用工厂 —— 只和工厂打交道，不直接 new 产品类
const drink1 = MiXueFactory.create('ice')
drink1.show()   // 输出：冰淇淋 3元

const drink2 = MiXueFactory.create('lemo')
drink2.show()   // 输出：柠檬水 4元

const drink3 = MiXueFactory.create('milk')
drink3.show()   // 输出：珍珠奶茶 8元
```

### 🎁 工厂模式的三大优势

| 优势 | 说明 |
|------|------|
| 🧩 **解耦** | 使用者不需要知道 `IceCream`、`LemoTea` 等类的实现细节 |
| 📦 **统一接口** | 所有产品都实现了 `show()` 方法，调用方式一致 |
| 🔧 **易于扩展** | 新增产品只需在工厂里加一个 `case`，无需修改使用方代码 |

> 🌍 **现实中的工厂模式**：NestJS 的 `NestFactory`、React 的 `React.createElement()`、数据库连接池，都是工厂模式的实际应用。

---

## 三、NestJS 项目初始化

### 📦 安装与创建

```bash
# 全局安装 NestJS CLI
npm i -g @nestjs/cli

# 创建项目
nest new hello

# 进入项目并启动
cd hello
pnpm run start:dev
```

### 📁 目录结构一览

```
hello/
├── src/
│   ├── main.ts              # 🚀 应用入口
│   ├── app.module.ts        # 📦 根模块
│   ├── app.controller.ts    # 🎮 根控制器
│   ├── app.service.ts       # 🔧 根服务
│   └── todos/               # 📋 Todos 业务模块
│       ├── todos.module.ts
│       ├── Todos.controller.ts
│       └── Todos.service.ts
├── test/                    # 🧪 测试文件
├── package.json
└── tsconfig.json
```

---

## 四、NestJS 核心架构：模块化思想

NestJS 的架构可以用一句话概括：

```
App → Modules → Controller → Service
```

### 🏗️ MVC 模式在 NestJS 中的体现

```
┌─────────────────────────────────────────────────┐
│                  AppModule                       │
│                                                  │
│   ┌──────────────┐      ┌──────────────────┐    │
│   │  Controller   │ ───→ │     Service       │    │
│   │  (控制层)     │      │  (数据/业务层)    │    │
│   │              │      │                  │    │
│   │ · 参数校验    │      │ · CRUD 操作      │    │
│   │ · 简单逻辑    │      │ · 复杂业务       │    │
│   │ · 返回响应    │      │ · 数据库交互      │    │
│   └──────────────┘      └──────────────────┘    │
│          ↑                       ↑               │
│          │        @Injectable()  │               │
│          └───── 依赖注入 ────────┘               │
└─────────────────────────────────────────────────┘
```

> ⚠️ **核心原则**：视图层（View）不能直接查询数据库，必须通过 Controller → Service 的链路。

---

## 五、实战：构建 Todos CRUD API

接下来，我们从零构建一个完整的 Todos 待办事项 API，涵盖增删改查。

### Step 1️⃣：应用入口 `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // 🏭 工厂模式！NestFactory.create() 创建应用实例
  const app = await NestFactory.create(AppModule);

  // 🌐 启用 CORS，允许前端跨域请求
  app.enableCors();

  // 🎧 监听端口
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

**🔑 关键点**：

- `NestFactory.create(AppModule)` —— 工厂模式的经典应用，一行代码启动整个后端服务
- `app.enableCors()` —— 开启跨域，让前端可以访问后端 API
- 端口默认 `3000`，可通过环境变量 `PORT` 覆盖

### Step 2️⃣：根模块 `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';

@Module({
  imports: [TodosModule],       // 📦 导入 Todos 业务模块
  controllers: [AppController], // 🎮 注册控制器
  providers: [AppService],      // 🔧 注册服务（自动依赖注入）
})
export class AppModule { }
```

**🔑 关键点**：

- `imports` —— 导入其他模块，实现模块间组合
- `controllers` —— 注册控制器，处理 HTTP 请求
- `providers` —— 注册服务，NestJS 会**自动进行依赖注入**

### Step 3️⃣：Todos 模块定义 `todos.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TodosController } from './Todos.controller.js';
import { TodosService } from './Todos.service.js';

@Module({
  controllers: [TodosController],  // 🎮 该模块的控制器
  providers: [TodosService]        // 🔧 该模块的服务
})
export class TodosModule { }
```

> 📌 每个业务模块都是独立的，有自己的 Controller 和 Service，职责清晰。

### Step 4️⃣：数据层 `Todos.service.ts` ⭐

Service 层是整个后端的**核心**，负责数据操作和业务逻辑：

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'

// 📋 Todo 数据结构
export interface Todo {
  id: number;
  title: string;
  complete: boolean;
}

// 💾 内存数据库（学习阶段使用，生产环境替换为真实数据库）
let todos: Todo[] = [
  { id: 1, title: '学习 NestJS', complete: false },
  { id: 2, title: '学习 CRUD', complete: true },
]

let nextId = 3;

@Injectable()  // ⭐ 标记为可注入，NestJS 自动管理实例
export class TodosService {

  // 📖 查询所有
  findAll(): Todo[] {
    return todos
  }

  // 🔍 查询单个
  findOne(id: number): Todo {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) {
      // ❌ 找不到时抛出标准错误
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  // ➕ 创建
  create(title: string): Todo {
    const todo: Todo = {
      id: +nextId++,
      title,
      complete: false,
    }
    todos.push(todo);
    return todo;
  }

  // 🗑️ 删除
  remove(id: number): void {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    todos.splice(index, 1);
  }

  // ✏️ 更新（部分更新）
  update(id: number, patch: Partial<Todo>): Todo {
    const todo = this.findOne(id);
    Object.assign(todo, patch);  // 合并更新字段
    return todo;
  }
}
```

**🔑 关键点**：

- `@Injectable()` —— **装饰器模式**的极致运用，让 NestJS 自动管理依赖
- `NotFoundException` —— NestJS 内置的标准化错误类，自动返回 404 状态码
- `Partial<Todo>` —— TypeScript 类型，表示所有字段都是可选的，实现部分更新

### Step 5️⃣：控制层 `Todos.controller.ts` ⭐

Controller 是 HTTP 请求的**入口**，负责路由映射和参数提取：

```typescript
import {
  Body, Controller, Delete, Get,
  Param, Post, Put,
} from '@nestjs/common';
import { TodosService } from './Todos.service.js';
import { type Todo } from './Todos.service.js';

@Controller('todos')  // 🛣️ 路由前缀：/todos
export class TodosController {
  // ⭐ 依赖注入：NestJS 自动将 TodosService 实例注入
  constructor(private readonly todosService: TodosService) { }

  // 📖 GET /todos - 查询所有
  @Get()
  findAll(): Todo[] {
    return this.todosService.findAll();
  }

  // 🔍 GET /todos/:id - 查询单个
  @Get(':id')
  findOne(@Param('id') id: string): Todo {
    return this.todosService.findOne(Number(id));
  }

  // ➕ POST /todos - 创建
  @Post()
  create(@Body('title') title: string): Todo {
    return this.todosService.create(title);
  }

  // 🗑️ DELETE /todos/:id - 删除
  @Delete(':id')
  remove(@Param('id') id: string): { message: string } {
    this.todosService.remove(Number(id));
    return { message: `删除todo ${id}` };
  }

  // ✏️ PUT /todos/:id - 更新
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() patch: Partial<Todo>,
  ): Todo {
    return this.todosService.update(Number(id), patch);
  }
}
```

**🔑 装饰器速查表**：

| 装饰器 | 作用 | 示例 |
|--------|------|------|
| `@Controller('todos')` | 定义路由前缀 | 所有请求以 `/todos` 开头 |
| `@Get()` / `@Post()` | HTTP 方法映射 | `GET /todos` / `POST /todos` |
| `@Get(':id')` | 路由参数 | `GET /todos/1` |
| `@Param('id')` | 提取路由参数 | 获取 URL 中的 `id` |
| `@Body('title')` | 提取请求体字段 | 获取 `{ title: "..." }` 中的 title |

### 🧪 API 测试

启动服务后，可以用以下方式测试：

```bash
# 📖 查询所有待办
curl http://localhost:3000/todos

# 🔍 查询单个
curl http://localhost:3000/todos/1

# ➕ 创建
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "学习工厂模式"}'

# ✏️ 更新
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"complete": true}'

# 🗑️ 删除
curl -X DELETE http://localhost:3000/todos/1
```

---

## 六、测试保障质量

NestJS 项目天然支持测试，使用 **Vitest** 作为测试框架。

### 🔬 单元测试 `app.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // 🏗️ 创建测试模块，模拟依赖注入
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

运行测试：

```bash
# 单元测试
pnpm run test

# 端到端测试
pnpm run test:e2e
```

---

## 七、总结

### 🗺️ NestJS 请求处理全流程

```
客户端请求
    │
    ▼
┌─────────────┐
│   main.ts   │  ← 应用入口，NestFactory 创建应用
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AppModule   │  ← 根模块，组装所有子模块
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  TodosController  │  ← 接收 HTTP 请求，参数校验
│  @Get / @Post     │
└──────┬───────────┘
       │  依赖注入
       ▼
┌──────────────────┐
│  TodosService     │  ← 业务逻辑，数据操作
│  @Injectable()    │
└──────┬───────────┘
       │
       ▼
    返回响应
```

### 📌 核心知识点回顾

| 知识点 | 说明 |
|--------|------|
| 🏭 **工厂模式** | `NestFactory.create()` 一行代码启动应用，封装创建过程 |
| 📦 **模块化** | 每个业务功能独立成 Module，职责单一 |
| 🎮 **控制器** | 处理 HTTP 请求，参数校验，返回响应 |
| 🔧 **服务层** | `@Injectable()` 标记，自动依赖注入，处理业务逻辑 |
| 🎨 **装饰器模式** | `@Module()`、`@Get()`、`@Post()` 等，不修改类的前提下扩展功能 |
| ❌ **错误处理** | `NotFoundException` 等内置错误类，标准化错误输出 |

### 🚀 下一步学习方向

- 🗄️ **数据库集成**：接入 Prisma / TypeORM，替换内存存储
- 🔐 **身份认证**：JWT / Passport 实现登录鉴权
- 📡 **中间件与拦截器**：日志、缓存、权限校验
- 🐳 **Docker 部署**：容器化部署到云服务器

---

> 🎯 **记住**：NestJS 的哲学是**面向接口编程，而不是面向实现编程**。模块化 + 装饰器 + 依赖注入，三者配合，让你的后端代码既优雅又可维护。
