# 🐳 从一行 Dockerfile 到全栈项目部署实战

> **一句话主线**：
> `Dockerfile` 是把"这个应用怎么跑"写成一份配方 → Docker 照着配方做出**镜像** → 镜像跑起来就是**容器**；
> 而 `todos-fullstack` 就是把这套配方，用在一个真实的「React 前端 + Nest 后端 + Nginx 网关」项目上。

---

## 📖 目录

| # | 章节 | 你会学到 |
|---|------|---------|
| 1 | [两个文件夹是什么关系](#1️⃣-两个文件夹是什么关系) | 学习样例 vs 真实项目 |
| 2 | [Dockerfile：把应用写成配方](#2️⃣-dockerfile把应用写成配方-) | FROM / WORKDIR / COPY / CMD |
| 3 | [构建、运行、发布镜像](#3️⃣-构建运行发布镜像-) | build / run / login / push / pull |
| 4 | [todos 全栈项目长什么样](#4️⃣-todos-全栈项目真实工程长什么样-️) | React19 + Zustand + Nest.js |
| 5 | [跨域：绕不开的第一道坎](#5️⃣-跨域前后端分离绕不开的第一道坎-) | 同源策略与三种解法 |
| 6 | [Nginx：把 80 端口变成统一入口](#6️⃣-nginx把-80-端口变成统一入口-) | 反向代理与端口映射 |
| 7 | [现状盘点与学习路径](#7️⃣-现状盘点还差哪几块拼图-) | 还差哪些拼图 |

---

<a id="1"></a>
## 1️⃣ 两个文件夹是什么关系？

```
backend/docker/
├── 📁 file/                    ← 教学样例：最小可运行的 Docker 练习
│   ├── readme.md               ← Dockerfile 概念笔记
│   └── my-docker-demo/
│       ├── Dockerfile          ← 只有 4 行的"配方"
│       └── index.js            ← 只打印一行日志
│
└── 📁 todos-fullstack/         ← 真实项目：待容器化的全栈应用
    ├── todos/                  ← 前端 React + TS + Zustand
    └── todos-backend/          ← 后端 Nest.js
```

| 对比项 | `file/` | `todos-fullstack/` |
|--------|---------|--------------------|
| 定位 | 语法练习场 🏫 | 工程落地场 🏭 |
| 代码量 | 2 个文件 | 前后端各一套工程 |
| 关注点 | Dockerfile 怎么写 | 跨域、代理、部署链路 |
| 依赖 | 无 | React 19、Zustand 5、Nest 12 |

**关系一句话**：先在 `file/` 里学会"配方怎么写"，再去 `todos-fullstack/` 里解决"真实项目怎么部署"。

---

<a id="2"></a>
## 2️⃣ Dockerfile：把应用写成"配方" 📝

### 2.1 先讲人话：蜜雪冰城的 SOP

`file/readme.md` 里的比喻非常到位：

> 蜜雪冰城的**标准操作手册 SOP**：先加奶茶、再加奶、放三勺糖、摇匀。
> 任何人照着做，出来味道都一样 —— 于是才开得成连锁店。

Dockerfile 就是这份 SOP：

```
SOP 操作手册（配方）   ──►   做出来的那杯奶茶
Dockerfile（文本配方） ──►   镜像 Image（成品）
                        ──►   容器 Container（端上桌正在被喝的那杯）
```

🔑 **关键区别**：
- **Dockerfile** = 菜谱（纯文本，可提交到 Git）
- **Image** = 预制好的半成品（只读、可复制分发）
- **Container** = 真正在运行的那一份（可启停、可删除）

### 2.2 逐行拆解那份"4 行配方"

`file/my-docker-demo/Dockerfile`：

```dockerfile
# 1. 选一个基础镜像
FROM node
# 2. 在容器里切到 /app 文件夹，设置工作目录
WORKDIR /app
# 3. 把本地代码复制进容器
COPY index.js .
CMD ["node", "index.js"]
```

配套的 `index.js` 只有一行：

```javascript
console.log(`hello Docker! 我跑在容器里了`);
```

| 指令 | 作用 | 生活类比 🍹 |
|------|------|------------|
| `FROM node` | 基于官方 node 镜像，自带 Node 运行时 | 先去仓库领一台**标准操作台** |
| `WORKDIR /app` | 切到容器内的 `/app` 目录，后续命令都在这里执行 | 站到**指定的操作台**前 |
| `COPY index.js .` | 把宿主机当前目录的 `index.js` 复制到容器的工作目录 | 把**原料**摆上操作台 |
| `CMD ["node","index.js"]` | 容器启动时执行的命令（**只能有一条**） | 开业的**最后一步**：摇匀出杯 |

> 💡 **为什么用 `CMD ["node","index.js"]` 而不是 `CMD node index.js`？**
> 中括号是 **exec 形式（JSON 数组）**，Node 进程会成为容器里的 1 号进程，能正确接收 `docker stop` 发出的停止信号；不加中括号是 shell 形式，中间会多一层 shell 进程。

### 2.3 补充：其他常用指令（工程里迟早会用到）

| 指令 | 用途 | 示例 |
|------|------|------|
| `RUN` | **构建时**执行命令（装依赖、编译） | `RUN npm install` |
| `ENV` | 设置环境变量 | `ENV NODE_ENV=production` |
| `EXPOSE` | 声明容器监听端口（文档性质） | `EXPOSE 3000` |
| `ENTRYPOINT` | 固定入口程序，`CMD` 变参数 | `ENTRYPOINT ["node"]` |
| `.dockerignore` | 排除不必进镜像的文件 | `node_modules`、`.git` |

⚠️ **新手最爱搞混的一对**：

| | 执行时机 | 典型用途 |
|---|---------|---------|
| `RUN` | **构建镜像时**执行一次 | 装依赖、编译代码 |
| `CMD` | **容器启动时**执行 | 启动服务进程 |

---

<a id="3"></a>
## 3️⃣ 构建、运行、发布镜像 🚀

### 3.1 构建镜像：`docker build`

```bash
docker build -t my-docker-demo .
```

| 片段 | 含义 |
|------|------|
| `docker build` | 按当前目录的 Dockerfile 构建镜像 |
| `-t my-docker-demo` | `-t` = tag，给镜像起名字（不写默认 `<none>`） |
| `.` | **构建上下文**：把当前目录打包发给 Docker 引擎 |

### 3.2 运行容器

```bash
docker run my-docker-demo
# 输出：hello Docker! 我跑在容器里了
```

### 3.3 发布到镜像仓库：登录 → 打标 → 推送 → 拉取

`file/readme.md` 里记了一条完整的发布链路：

```
 ┌──────────────┐
 │ 本地写代码    │
 └──────┬───────┘
        ▼
 docker build -t my-docker-demo .        # ① 构建镜像
        ▼
 docker login                            # ② 登录仓库（Docker Hub / 私有 Harbor）
        ▼
 docker tag my-docker-demo 用户名/my-docker-demo:v1
        ▼
 docker push 用户名/my-docker-demo:v1     # ③ 推送到远端
        ▼
 ┌────────────────────────────────┐
 │  另一台机器 / 服务器             │
 │  docker pull 用户名/my-docker-demo:v1 │  # ④ 拉取并运行
 └────────────────────────────────┘
```

> 🎯 **这就是"发布项目的标准方式之一"**：
> 服务器上**不需要装 Node、不需要 `npm install`**，只要能 `pull` 到镜像，就能跑起一模一样的服务。
> 这正是"Docker = 应用 + 运行环境"的落地。

---

<a id="4"></a>
## 4️⃣ todos 全栈项目：真实工程长什么样 🏗️

### 4.1 项目结构

```
todos-fullstack/
├── todos/                         # 🖥️ 前端
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                # 入口组件
│       ├── api/
│       │   ├── config.ts          # axios 实例 + 拦截器
│       │   └── todos.ts           # 4 个接口封装
│       ├── store/todoStore.ts     # Zustand 状态管理
│       ├── components/TodoList.tsx
│       └── types/todo.ts          # 数据类型定义
│
└── todos-backend/                 # ⚙️ 后端
    └── src/
        ├── main.ts                # 启动入口 + 跨域开关
        ├── app.module.ts          # 根模块
        ├── app.controller.ts      # 路由
        └── app.service.ts         # 业务逻辑
```

### 4.2 技术选型

| 层 | 技术 | 版本 | 角色 |
|----|------|------|------|
| 前端框架 | React | 19.x | 渲染 UI |
| 语言 | TypeScript | 6.x | 类型安全 |
| 状态管理 | Zustand | 5.x | 轻量 store |
| 请求库 | Axios | 1.x | HTTP 封装 |
| 构建工具 | Vite | 8.x | 开发服务器 + 打包 |
| 后端框架 | Nest.js | 12.x | 模块化 Node 服务 |

### 4.3 前端数据流：从点击按钮到页面渲染

这是整个前端最值得理解的链路，五层各司其职：

```
 用户点击 "Add Todo"
        │
        ▼
┌──────────────────────────┐
│ 🧩 TodoList.tsx           │  只负责"长什么样"（视图层）
│    const { todos, addTodo } = useTodoStore()
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│ 🗄️ store/todoStore.ts     │  只负责"有哪些数据、能做什么操作"
│    todos: Todo[]          │  （状态层）
│    addTodo(title)         │
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│ 🔌 api/todos.ts           │  只负责"调哪个接口"（接口层）
│    fetchTodos()  GET /todos
│    createTodo()  POST /todos
└───────────┬──────────────┘
            ▼
┌──────────────────────────┐
│ ⚙️ api/config.ts          │  统一 axios 实例（基础设施层）
│    baseURL: '/api'        │
│    timeout: 10000         │
│    请求拦截器：注入 Token   │
│    响应拦截器：直接返回 data │
└───────────┬──────────────┘
            ▼
       🌐 后端 / Nginx
```

**几个设计细节值得学习**：

| 文件 | 亮点 |
|------|------|
| `types/todo.ts` | 一份 `Todo` 接口定义，前后端共用同一份"数据契约" |
| `api/config.ts` | `baseURL: '/api'` —— 前端**不写死后端地址**，交给代理层转发 |
| `api/config.ts` | 响应拦截器直接 `return response.data`，业务代码再也不用写 `.data` |
| `store/todoStore.ts` | Zustand 用 `create<TodoStore>()` 泛型约束，状态和 action 放在一起，十几行搞定全局状态 |

> 🔍 `baseURL: '/api'` 这一行的深意：**开发时**由 Vite 代理转发，**生产时**由 Nginx 转发。前端代码一行不用改，环境差异全部由代理层吸收 —— 这就是前端工程化的味道。

### 4.4 后端 Nest.js：四件套各干什么

```
main.ts          →  🚪 大门：创建应用、开跨域、监听 3000 端口
app.module.ts    →  📦 总装车间：把 controller 和 service 装配到一起
app.controller.ts→  🛣️ 路由表：什么请求走什么逻辑（@Get / @Post）
app.service.ts   →  🧠 大脑：真正的业务处理
```

启动入口 `main.ts`：

```typescript
const app = await NestFactory.create(AppModule);

app.enableCors();                       // 👈 一行解决跨域

await app.listen(process.env.PORT ?? 3000);  // 👈 端口可被环境变量覆盖
```

> 💡 两个易被忽略的工程细节：
> 1. `enableCors()` —— 后端的"跨域通行证"（第 5 节详说）。
> 2. `process.env.PORT ?? 3000` —— **容器部署的关键**：端口写死代码里就没法灵活部署，交给环境变量才是标准做法。

---

<a id="5"></a>
## 5️⃣ 跨域：前后端分离绕不开的第一道坎 🚧

### 5.1 同源策略：浏览器的"安保规则"

> **同源** = 协议 + 域名 + 端口 **三者完全相同**

```
前端：http://localhost:5173    ← Vite 开发服务器
后端：http://localhost:3000    ← Nest.js

协议相同 ✅   域名相同 ✅   端口不同 ❌
       └────────► 判定为「跨域」，浏览器拦截！
```

它和 `5173:3000` 的关系，就是 `todos-fullstack/readme.md` 里记的那句 `5173: 3000 / 同源策略 安全`。

🚨 **最坑的一点**：请求其实**已经到达服务器并且执行了**，只是响应回来时被浏览器拦下、不给 JS 读取。所以你会看到控制台报错，但后端日志里明明有记录。

### 5.2 三种解法，各有适用场景

```
          ┌─────────────────── 跨域的三种解法 ───────────────────┐
          │                                                      │
  ① CORS 响应头                ② Vite 开发代理           ③ Nginx 反向代理
  后端加"允许"标记             开发环境转发              生产环境统一入口
  app.enableCors()             server.proxy               location /api
          │                            │                          │
  浏览器：哦，是允许的 ✅        浏览器以为同源 ✅          浏览器看到同源 ✅
  适用于：任意环境              适用于：仅开发            适用于：仅生产
          └──────────────────────────────────────────────────────┘
```

**① CORS —— 服务器端配置响应头**（项目已启用）

```typescript
// todos-backend/src/main.ts
app.enableCors();   // 自动添加 Access-Control-Allow-Origin 等响应头
```

| 概念 | 说明 |
|------|------|
| **CORS** | Cross-Origin Resource Sharing，跨域资源共享 |
| 本质 | 服务器在响应头里声明"我允许某个源来访问我" |
| 缺点 | 生产环境 `enableCors()` 全放开有安全风险，通常要配白名单 |

**② Vite 开发代理**（开发环境推荐方案）

```typescript
// todos/vite.config.ts —— 示例写法
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // 后端真实地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // 去掉 /api 前缀
      },
    },
  },
});
```

> 🔑 为什么这样就"不跨域"了？
> 因为浏览器只认识 `localhost:5173` 这一个源，请求 `/api/todos` 被视为**同源请求**；真正转发到 3000 端口这件事，是 Vite 这个 **Node 服务** 干的 —— 服务器之间通信不受同源策略约束。

**③ Nginx 反向代理**（生产环境方案）—— 见下一节。

### 5.3 小知识：预检请求 OPTIONS

当你发送 `POST` + `application/json` 这类"非简单请求"时，浏览器会**先自动发一个 `OPTIONS` 探测请求**：

```
浏览器 ──OPTIONS──► 服务器：我要发 POST 了，你允许吗？
浏览器 ◄──200 + 允许头── 服务器：允许
浏览器 ──POST────► 服务器：这才是真请求
```

所以后端日志里经常能看到莫名的 `OPTIONS` 请求，这是正常现象，不是 bug。

---

<a id="6"></a>
## 6️⃣ Nginx：把 80 端口变成统一入口 🌐

### 6.1 为什么需要 Nginx？

用户访问网站时习惯输入 **`localhost`（不带端口）**，因为 **80 端口是 HTTP 默认端口**；但你的服务跑在 3000/5173 上 —— 于是需要一个"前台接待"，把 80 端口的请求分发到正确的后端服务。

参考 `demo/nginx.conf`：

```nginx
events {}

http {
  server {
    listen 80;                                        # 监听 80 端口
    location / {
      proxy_pass http://host.docker.internal:1314;    # 转发到宿主机 1314
      proxy_set_header Host $host;                    # 保留原始 Host 头
    }
  }
}
```

| 配置 | 含义 |
|------|------|
| `listen 80` | Nginx 守着 80 端口 |
| `location /` | 匹配所有路径 |
| `proxy_pass` | 请求转发目标 |
| `host.docker.internal` | Docker 内置域名，指向**宿主机**（容器里访问本机服务的钥匙 🔑） |
| `proxy_set_header Host $host` | 把原始域名透传给后端 |

### 6.2 启动 Nginx 容器：参数逐行拆解

```bash
docker run \
  --name my-nginx-demo \
  -p 80:80 \
  -v C:\...\docker\demo\nginx.conf:/etc/nginx/nginx.conf \
  -d nginx
```

| 参数 | 作用 | 类比 |
|------|------|------|
| `--name my-nginx-demo` | 给容器起名 | 给员工发工牌 🏷️ |
| `-p 80:80` | 宿主机 80 → 容器 80（`宿主:容器`） | 大厦正门开在哪 🚪 |
| `-v 本地:容器` | 把配置文件挂载进容器 | 把最新的值班手册塞进前台 📖 |
| `-d nginx` | 后台运行 nginx 镜像 | 员工开始上班（不占着你的终端）|

> 💡 `-v` 挂载改配置后**不用重新构建镜像**，`docker restart` 就生效 —— 这是开发调配置时最省事的做法。

### 6.3 完整请求链路图（把 todos 项目代入）

```
 👤 用户在浏览器输入 http://localhost
        │
        ▼
 ┌──────────────────────────────────────────────────┐
 │  🐳 Nginx 容器 (my-nginx-demo)                    │
 │     listen 80                                     │
 │       │                                           │
 │       ├── location /          → 前端静态资源 (dist)  │
 │       └── location /api/      → proxy_pass 后端 3000 │
 └──────────────────┬───────────────────────────────┘
                    │  反向代理（用户完全不知道后端在 3000）
                    ▼
 ┌──────────────────────────────────────────────────┐
 │  ⚙️ Nest.js 容器 (端口 3000)                       │
 │     app.enableCors()  →  返回 JSON 数据            │
 └──────────────────┬───────────────────────────────┘
                    │
                    ▼
        🖥️ 前端拿到数据 → Zustand 更新 store → 列表渲染 ✅
```

> 🎯 **运维考点**：用户只知道访问了 `localhost`；后端到底在 3000、4000 还是别的端口，**前端代码不知道，用户更不知道** —— 这就是反向代理的核心价值：**把复杂性藏在网关后面**。

### 6.4 正向代理 vs 反向代理

| 类型 | 方向 | 代理"代表"谁 | 典型场景 |
|------|------|------------|---------|
| **正向代理** | 客户端 → 代理 → 服务器 | 代表**客户端** | 科学上网、公司出口网关 |
| **反向代理** | 客户端 → 代理 → 服务器 | 代表**服务端** | Nginx、负载均衡 |

```
正向代理：浏览器 ──► 代理 ──► 目标服务器      （客户端知道要去哪）
反向代理：浏览器 ──► Nginx(80) ──► Node(3000)  （客户端毫不知情）
```

---

<a id="7"></a>
## 7️⃣ 现状盘点：还差哪几块拼图 🧩

对照两个文件夹的实际内容，本项目目前的状态是：

| 模块 | 现状 | 说明 |
|------|------|------|
| ✅ Dockerfile 语法 | 已完成 | `file/my-docker-demo` 可独立构建运行 |
| ✅ 前端骨架 | 已完成 | React + TS + Zustand + Axios 分层清晰 |
| ✅ axios 拦截器 | 已完成 | Token 注入 + 响应解包 |
| ✅ 后端跨域开关 | 已完成 | `app.enableCors()` |
| ⏳ 后端 `/todos` 接口 | **待实现** | 目前只有 `@Get() getHello()`，Todo Module 尚未创建 |
| ⏳ 前端 Vite 代理 | **待配置** | `vite.config.ts` 目前只有 react 插件 |
| ⏳ 前端列表渲染 | **待打通** | `TodoList.tsx` 里 `fetchTodos()` 调用被注释；`addTodo` 也还没写回状态 |
| ⏳ 两个 Dockerfile | **待编写** | 前后端各自需要一个（把 4 行配方扩展成生产级） |
| ⏳ nginx.conf | **待编写** | 目前只有 `demo/` 下的演示配置 |
| ⏳ docker-compose.yml | **待编写** | 多容器一键编排（前端 + 后端 + 网关） |

**从"最小样例"升级到"生产级 Dockerfile"的差距在哪？**

```
demo 版（教学）              生产版（工程）
FROM node                   FROM node:22-alpine      ← 指定版本 + 体积小
WORKDIR /app                WORKDIR /app
COPY index.js .             COPY package*.json .     ← 先复制依赖清单
CMD ["node","index.js"]     RUN npm ci               ← 装依赖（利用缓存）
                            COPY . .                 ← 再复制源码
                            RUN npm run build        ← 构建
                            CMD ["node","dist/main"] ← 启动产物
```

> 🎓 **为什么要"先 COPY package.json 再 COPY 源码"？**
> Docker 是**分层缓存**的：只要 `package.json` 没变，`RUN npm ci` 就直接命中缓存，改业务代码时不必重装依赖 —— 构建速度差出好几倍。

**推荐的学习路径**：

```
初学          进阶                  熟练                实战
 │             │                     │                  │
 ▼             ▼                     ▼                  ▼
run/ps/rmi → Dockerfile → Docker Compose → 多容器部署
基础命令       构建自定义镜像          一键编排前后端        Nginx + CI/CD
              （file/ 已完成）      （todos 项目目标）
```

---

## 📝 总结

| 核心概念 | 一句话理解 |
|---------|-----------|
| 🐳 **Dockerfile** | 文本配方，写清"怎么把应用做出来" |
| 📀 **镜像 Image** | 做好的成品，只读、可复制、可分发 |
| 📦 **容器 Container** | 正在运行的那一份实例 |
| 🚪 **端口映射 `-p`** | 宿主机端口 → 容器端口 |
| 📖 **卷挂载 `-v`** | 本地配置文件 → 容器内路径 |
| 🔌 **`baseURL: '/api'`** | 前端不写死后端地址，把差异交给代理层 |
| 🚧 **CORS** | 后端声明"我允许谁来访问" |
| 🌐 **Nginx 反向代理** | 统一入口，隐藏真实后端 |

> 📌 **记住这条主线**：
> ```
> Dockerfile（配方） → Image（成品） → Container（运行）
>        └─ 应用到 → todos 全栈项目：React + Nest + Nginx
> ```
> 从 `file/` 里那 4 行配方出发，把配置补全，你就能让整个 todos 项目"在任何电脑上都能跑"。🎉

---

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Zustand 官方文档](https://zustand.docs.pmnd.rs/)
- [Vite 官方文档](https://vite.dev/)
