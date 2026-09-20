# 🐳 Docker 入门实战指南：从概念到实践

> **一句话总结**：Docker = 应用 + 运行环境，解决"我的电脑能跑，你的电脑怎么跑？"的经典难题。

---

## 📖 目录

- [1. Docker 是什么？](#1-docker-是什么)
- [2. 核心概念：镜像与容器](#2-核心概念镜像与容器)
- [3. 常用命令速查表](#3-常用命令速查表)
- [4. 实战：用 Docker 运行 Node.js 应用](#4-实战用-docker-运行-nodejs-应用)
- [5. Nginx 反向代理：从 80 端口转发到 1314](#5-nginx-反向代理从-80-端口转发到-1314)
- [6. 完整请求链路图解](#6-完整请求链路图解)
- [7. MySQL 容器化部署](#7-mysql-容器化部署)
- [8. 常用运维命令汇总](#8-常用运维命令汇总)

---

## 1. Docker 是什么？

### 🎯 为什么需要 Docker？

想象一个真实场景：

> 你到公司接手一个 **N 年前的 Vue2 项目**，要求使用 **Node 16 + npm 8**。
> 但你的电脑装的是 **Node 22**，项目根本跑不起来！😫

**传统解决方案**：
- 安装 nvm，来回切换 Node 版本
- 各种依赖冲突，环境变量混乱
- "在我电脑上明明能跑啊！" —— 经典甩锅语录

**Docker 的解决方案**：

```
┌─────────────────────────────────────────────────┐
│                   Docker 容器                      │
│  ┌─────────────────────────────────────────────┐ │
│  │   应用代码  +  运行环境  +  所有依赖          │ │
│  │   (Vue2 项目)  (Node 16)    (npm 8)         │ │
│  └─────────────────────────────────────────────┘ │
│                ↓ 一键部署到任何设备 ↓                │
│   你的电脑 ✅   同事电脑 ✅   服务器 ✅            │
└─────────────────────────────────────────────────┘
```

### 🚢 Docker 的类比

| 类比 | 说明 |
|------|------|
| **海运集装箱** | 标准化包装，任何码头都能装卸 |
| **Docker 容器** | 标准化应用包，任何机器都能运行 |

**核心公式**：
```
Agent = LLM + Harness（tool + mcp + rag + skill + ...）

Docker = 应用 + 运行环境
```

---

## 2. 核心概念：镜像与容器

### 📀 镜像（Image）

镜像就像一张 **光盘**（只读模板）：

- 包含应用程序 + 运行环境
- 隔离的、不可变的
- 可以从远程仓库拉取（`git pull image`）

### 📦 容器（Container）

容器就像一台 **DVD 播放器**（运行中的实例）：

- 基于镜像创建
- 可以启动、停止、删除
- 每个容器都是独立的

```
┌─────────────────────────────────────┐
│           Docker 仓库               │
│   ┌─────┐  ┌─────┐  ┌─────┐       │
│   │nginx│  │mysql│  │redis│  ...   │
│   └──┬──┘  └──┬──┘  └──┬──┘       │
│      │        │        │           │
└──────┼────────┼────────┼───────────┘
       │        │        │
       ▼        ▼        ▼
    ┌─────┐  ┌─────┐  ┌─────┐
    │容器1 │  │容器2 │  │容器3 │   ← 运行中的实例
    └─────┘  └─────┘  └─────┘
```

---

## 3. 常用命令速查表

### 📋 容器管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker run` | 启动镜像，成为可运行的容器 | `docker run -d nginx` |
| `docker ps` | 查看所有正在运行的容器 | `docker ps` |
| `docker ps -a` | 查看所有容器（包括已停止的） | `docker ps -a` |
| `docker stop` | 停止容器 | `docker stop my-nginx` |
| `docker rm` | 删除容器 | `docker rm my-nginx` |

### 🖼️ 镜像管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker images` | 查看所有本地镜像 | `docker images` |
| `docker pull` | 从仓库拉取镜像 | `docker pull nginx` |
| `docker rmi` | 删除镜像 | `docker rmi nginx` |

### 🧹 批量操作

```bash
# 停止所有正在运行的容器
docker stop $(docker ps -q)

# 删除所有容器（强制）
docker rm -f $(docker ps -aq)

# 删除指定镜像
docker rmi nginx
```

---

## 4. 实战：用 Docker 运行 Node.js 应用

### 📁 项目结构

```
demo/
├── index.js        # Node.js 服务端代码
├── package.json    # 项目配置
└── nginx.conf      # Nginx 配置（后面会用到）
```

### 💻 代码实现

**index.js** — 一个最简单的 HTTP 服务器：

```javascript
// node 早期的 commonjs 规范
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('hello world');
});

server.listen(1314, '0.0.0.0', () => {
  console.log('node server running on port 1314');
});
```

**package.json** — 项目配置：

```json
{
  "name": "demo",
  "version": "1.0.0",
  "main": "index.js",
  "type": "commonjs"
}
```

### 🚀 启动服务

```bash
# 进入 demo 目录
cd demo

# 运行 Node.js 服务
node index.js

# 访问 http://localhost:1314 → 输出 "hello world"
```

### 🌐 端口知识

| URL | 说明 |
|-----|------|
| `http://localhost:1314` | 访问本地 1314 端口的服务 |
| `http://www.juejin.cn:80` | 访问掘金网站（80 是 HTTP 默认端口，可省略） |
| `http://www.juejin.cn` | 等同于上面，省略了 `:80` |

> 💡 **运维小知识**：80 端口是 HTTP 协议的默认端口，用户访问网站时不需要手动输入。

---

## 5. Nginx 反向代理：从 80 端口转发到 1314

### 🤔 为什么需要 Nginx？

- 用户习惯访问 `http://localhost:80`（不带端口号）
- 但我们的 Node 服务跑在 `1314` 端口
- **解决方案**：用 Nginx 做反向代理，把 80 端口的请求转发到 1314

### ⚙️ Nginx 配置文件

**nginx.conf**：

```nginx
events {}

http {
  server {
    listen 80;

    location / {
      proxy_pass http://host.docker.internal:1314;
      proxy_set_header Host $host;
    }
  }
}
```

**配置解读**：

| 配置项 | 说明 |
|--------|------|
| `listen 80` | Nginx 监听 80 端口 |
| `location /` | 匹配所有请求路径 |
| `proxy_pass` | 转发目标地址 |
| `host.docker.internal` | Docker 特殊域名，指向宿主机 |
| `proxy_set_header Host $host` | 保留原始请求头 |

### 🐳 用 Docker 启动 Nginx

```bash
docker run \
  --name my-nginx-demo \
  -p 80:80 \
  -v C:\Users\yihao\Desktop\workspace\yh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf \
  -d nginx
```

**参数详解**：

| 参数 | 说明 | 示例 |
|------|------|------|
| `--name` | 容器名称 | `my-nginx-demo` |
| `-p` | 端口映射（宿主机:容器） | `80:80` |
| `-v` | 挂载配置文件 | `本地路径:容器路径` |
| `-d` | 后台运行 | `daemon` 模式 |

### 🔍 逐行解析

```bash
docker run \
  # 1. 启动一个镜像，成为可运行的容器
  --name my-nginx-demo \
  # 2. 给容器起个名字

  -p 80:80 \
  # 3. 本机的 80 端口 → 映射到容器的 80 端口
  #    用户访问 http://localhost:80 → 转给容器的 80 端口

  -v C:\Users\yihao\Desktop\workspace\yh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf \
  # 4. 把本地的 nginx.conf 挂载到容器内的 /etc/nginx/nginx.conf
  #    实现配置文件的"热更新"

  -d nginx
  # 5. 后台运行 nginx 镜像
```

---

## 6. 完整请求链路图解

### 🔄 请求流转过程

```
用户浏览器
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  http://localhost:80                                     │
│  (用户输入的 URL)                                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Docker 容器 (my-nginx-demo)                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Nginx 监听 80 端口                                │  │
│  │  ↓ 读取 nginx.conf                                │  │
│  │  ↓ 反向代理到 http://host.docker.internal:1314    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  宿主机 (你的电脑)                                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Node.js 服务监听 1314 端口                        │  │
│  │  ↓ 返回 "hello world"                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
用户浏览器显示 "hello world" ✅
```

### 🎯 关键知识点

**正向代理 vs 反向代理**：

| 类型 | 方向 | 说明 |
|------|------|------|
| **正向代理** | 客户端 → 代理 → 服务器 | 客户端知道目标服务器 |
| **反向代理** | 客户端 → 代理 → 服务器 | 客户端不知道真实服务器 |

```
正向代理：
浏览器 ──→ 代理服务器 ──→ 目标服务器
(知道要去哪)

反向代理：
浏览器 ──→ Nginx(80) ──→ Node(1314)
(不知道真实端口)
```

> 💡 **运维考点**：用户访问 `localhost` 时，我们（作为开发者）知道后端在 1314 端口运行，但用户完全不知道！这就是反向代理的核心价值。

---

## 7. MySQL 容器化部署

### 🗄️ 启动 MySQL 容器

```bash
docker run -d \
  --name my-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  mysql:8.0
```

**参数说明**：

| 参数 | 说明 |
|------|------|
| `-p 3306:3306` | 映射 MySQL 默认端口 |
| `-e MYSQL_ROOT_PASSWORD` | 设置 root 密码 |
| `mysql:8.0` | 指定 MySQL 版本 |

### 🐘 常见数据库镜像

```bash
# MySQL
docker pull mysql:8.0

# PostgreSQL
docker pull postgres:15

# Redis
docker pull redis:7

# MongoDB
docker pull mongo:6
```

---

## 8. 常用运维命令汇总

### 📊 容器状态查看

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止）
docker ps -a

# 查看容器日志
docker logs my-nginx-demo

# 实时查看日志
docker logs -f my-nginx-demo

# 进入容器内部
docker exec -it my-nginx-demo /bin/bash
```

### 🔧 容器生命周期

```bash
# 启动容器
docker start my-nginx-demo

# 停止容器
docker stop my-nginx-demo

# 重启容器
docker restart my-nginx-demo

# 删除容器
docker rm my-nginx-demo

# 强制删除运行中的容器
docker rm -f my-nginx-demo
```

### 🖼️ 镜像管理

```bash
# 查看本地镜像
docker images

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest

# 删除镜像
docker rmi nginx

# 删除所有未使用的镜像
docker image prune
```

### 💡 实用技巧

```bash
# 一键停止所有容器
docker stop $(docker ps -q)

# 一键删除所有容器
docker rm -f $(docker ps -aq)

# 查看容器资源占用
docker stats

# 查看 Docker 磁盘使用
docker system df
```

---

## 📝 总结

### 🎯 核心要点

| 概念 | 说明 |
|------|------|
| **镜像 (Image)** | 只读模板，包含应用 + 环境 |
| **容器 (Container)** | 镜像的运行实例 |
| **端口映射 (`-p`)** | 宿主机端口 → 容器端口 |
| **卷挂载 (`-v`)** | 本地文件 → 容器文件 |
| **反向代理** | Nginx 将请求转发到后端服务 |

### 🚀 学习路径

```
初学者                进阶                    高级
  │                    │                      │
  ▼                    ▼                      ▼
基础命令 ──────→ Dockerfile ──────→ Docker Compose
run/ps/rmi        构建自定义镜像       多容器编排
```

### 💼 常见应用场景

- ✅ **开发环境隔离**：不同项目使用不同版本的 Node/Python
- ✅ **微服务部署**：每个服务独立容器，互不干扰
- ✅ **CI/CD 流水线**：构建、测试、部署全流程容器化
- ✅ **数据库管理**：快速部署 MySQL/Redis/MongoDB

---

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker 从入门到实践](https://yeasy.gitbook.io/docker_practice/)

---

> 📌 **记住这个公式**：
> ```
> Docker = 应用 + 运行环境
> ```
> 有了它，"我的电脑能跑"就等于"所有电脑都能跑"！🎉
