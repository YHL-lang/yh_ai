# 🚀 宝塔面板部署全栈项目完整指南

## 📌 核心使命

🎯 **理解部署的全流程**，用**宝塔面板**搭建生产环境，实现前后端分离项目部署

**技术栈**：
- 🎨 前端：React + TypeScript → `npm run build` → `dist/` 静态资源
- ⚙️ 后端：Node.js + TypeScript → `npm run build` → `dist/app.js`
- 🗄️ 数据库：MySQL（开发/生产环境分离）
- 🖥️ 服务器：宝塔面板（可视化管理）

---

## 🌐 部署全流程概览

```
购买服务器 → 安装宝塔 → 配置安全组 → 安装环境 → 部署项目 → 配置Nginx → 上线
```

---

## 🔍 用户访问网址到底发生了什么？

在开始部署之前，先理解用户访问网站的完整流程，这样你就能明白每个配置的作用。

**完整访问流程图**：
```
用户输入URL → DNS查询 → 获取服务器IP → 安全组/防火墙 → Nginx入口 → 返回结果
```

### 1️⃣ DNS 查询：先查地址，再去敲门

**🔍 DNS (Domain Name System) 域名解析系统**

**查询流程**：
```
用户输入：http://your-domain.com
        ↓
Browser（浏览器缓存）→ 命中？→ 返回IP
        ↓ 未命中
上网设备系统缓存 → 命中？→ 返回IP
        ↓ 未命中
局域网DNS缓存 → 命中？→ 返回IP
        ↓ 未命中
城域网DNS缓存 → 命中？→ 返回IP
        ↓ 未命中
根服务器（.com.cn）→ 返回权威DNS服务器IP
        ↓
权威DNS服务器 → 返回最终IP：134.175.39.163
```

**DNS 查询结果**：
- ✅ 返回服务器公网IP：`134.175.39.163`
- 💾 查询结果会缓存到本地（各层级）
- 🔄 缓存过期后会重新查询

**类比**：
- 🏠 先查地址簿（DNS缓存）
- 🚪 找到地址后，再去敲门（建立连接）

---

### 2️⃣ 安全组/防火墙：看门人，放不放行

**🛡️ 安全组（云厂商网络层）**

**位置**：云厂商网络层（比如腾讯云）

**作用**：控制这台云服务器哪些端口被外网访问

**类比**：小区大门保安，不让进

**配置内容**：
- 🌐 **80端口**：HTTP默认端口，nginx默认监听
- 🔐 **443端口**：HTTPS默认端口，更安全
- 🗄️ **3306端口**：MySQL端口，可选择性访问
- 🔧 **8888端口**：宝塔面板，用完可关闭
- 👥 **只开放一些IP**：开发/生产环境

**安全策略**：
- 🔒 **IP限流**：防止恶意IP攻击
- 📉 **尽量少开放端口**：减少攻击面
- 🔐 **分环境配置**：开发/生产环境端口不同

---

**🔥 防火墙（服务器操作系统内部）**

**位置**：服务器操作系统内部

**作用**：系统级别的访问控制

**与安全组的区别**：
- 安全组：云厂商层面，控制外网访问
- 防火墙：系统层面，控制本机访问

---

### 3️⃣ Nginx：真正的入口（分流）

**🔀 Nginx 是什么？**

Nginx 是一个高性能的 Web 服务器，做三件事：
1. 📁 **接受请求**
2. 📄 **返回静态文件**
3. 🔄 **把请求返回给后端**（反向代理解决跨域问题）

**分流规则**：

**静态资源**（React + TypeScript 打包）：
```
请求：http://134.175.39.163/
        ↓
Nginx 检查：是静态资源吗？
        ↓ 是
返回：index.html（前端打包后的文件）
```

**动态资源**（走服务器路由）：
```
请求：http://134.175.39.163/api/todos
        ↓
Nginx 检查：是 /api 开头吗？
        ↓ 是
反向代理到：http://127.0.0.1:3001/todos
        ↓
Node.js 服务器处理
        ↓
返回 JSON 数据
```

---

### 4️⃣ 跨域问题解决：开发 vs 生产

**🚫 什么是跨域？**

**开发环境**（Vite 拦截）：
```
前端：http://localhost:5173/api/todos
后端：http://localhost:3001/api/todos
问题：端口不同（5173 vs 3001），产生跨域
```

**Vite 解决方案**：
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```
- Vite 配置 mocks 拦截 `/api`
- 前端发送请求 → Vite 拦截 → 转发到后端

**生产环境**（Nginx 反向代理）：
```
前端：http://134.175.39.163/api/todos
后端：http://134.175.39.163:3001/api/todos
问题：端口不同（80 vs 3001），产生跨域
```

**Nginx 解决方案**：
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
}
```
- Nginx 拦截前端请求
- 反向代理到 server 3001
- 前后端同源（都是80端口），不存在跨域

---

### 5️⃣ 完整数据流向图

**🌐 前端访问流程**：
```
用户浏览器
    ↓ 输入：http://134.175.39.163/
DNS 查询
    ↓ 返回：134.175.39.163
安全组检查
    ↓ 允许80端口
防火墙检查
    ↓ 允许80端口
Nginx 接收请求
    ↓ 检查：是 / 吗？
返回静态资源
    ↓ index.html
浏览器渲染页面
```

**🔌 API 访问流程**：
```
前端代码：fetch('/api/capsules')
    ↓
浏览器发送请求：http://134.175.39.163/api/capsules
    ↓
DNS 查询 → 134.175.39.163
    ↓
安全组/防火墙 → 允许80端口
    ↓
Nginx 接收请求
    ↓ 检查：是 /api 开头吗？
反向代理到：http://127.0.0.1:3001/api/capsules
    ↓
Node.js 服务器处理
    ↓
Express 路由匹配：/api/capsules
    ↓
控制器处理：getCapsules()
    ↓
数据库查询：SELECT * FROM capsules
    ↓
MySQL 返回数据
    ↓
Node.js 返回 JSON
    ↓
Nginx 返回给前端
    ↓
前端渲染数据
```

**🗄️ 后端 MVC 架构**：
```
Node.js (Express)
    ↓
路由层：/api/capsules → capsuleRoutes
    ↓
控制器层：capsuleController.getCapsules()
    ↓
模型层：pool.query('SELECT * FROM capsules')
    ↓
数据库层：MySQL
    ↓
返回：JSON 数据
```

---

### 6️⃣ 关键要点总结

**🎯 DNS 查询**：
- 先查地址，再去敲门
- 多级缓存：浏览器 → 系统 → 局域网 → 城域网 → 根服务器
- 最终返回服务器公网IP

**🛡️ 安全组/防火墙**：
- 安全组：云厂商层面，控制外网访问（小区大门保安）
- 防火墙：系统层面，控制本机访问
- 尽量少开放端口，分环境配置

**🔀 Nginx 分流**：
- 静态资源：直接返回（React + TS 打包）
- 动态资源：反向代理到后端（解决跨域）
- 三件事：接受请求、返回静态文件、反向代理

**🔄 跨域解决**：
- 开发环境：Vite 拦截 `/api`，转发到后端
- 生产环境：Nginx 反向代理，前后端同源
- 结果：不存在跨域问题

**📊 数据流向**：
- 前端 → Nginx → 静态资源 或 反向代理到后端
- 后端 → MySQL (MVC 架构)
- 最终返回 JSON 数据

---

**理解了整个流程，接下来开始部署！**

---

## 一、☁️ 购买服务器

### 1.1 服务器选择

**推荐配置**：
- 🏢 **云厂商**：腾讯云（国内支持好）
- 💻 **类型**：轻量应用服务器
- 🐧 **系统**：Linux（Ubuntu 20.04 LTS）
- 📊 **配置**：2核4G（最低2核2G）
- 📶 **带宽**：5Mbps起
- 💰 **价格**：约35元/月起

**购买后获取**：
- 🌍 公网IP地址（如：134.175.39.163）
- 🔑 root登录密码

### 1.2 域名准备（可选但推荐）

**域名购买**：
- 在腾讯云、阿里云等平台购买域名
- 价格：.com 域名约 60元/年

**域名备案**：
- ⏰ 备案周期：10-20个工作日
- 📋 国内服务器必须备案才能使用域名访问
- 💡 备案期间可先用 IP 地址访问

---

## 二、🖥️ 安装宝塔面板

### 2.1 什么是宝塔？

**宝塔（BT Panel）** 是一套服务器管理面板，提供可视化界面管理服务器，大幅降低 Linux 命令行操作门槛。

**宝塔的优势**：
- 🎨 **可视化**：点击操作，完成服务器部署
- 🔧 **自由度高**：想怎么部署就怎么部署
- 📂 **目录规范**：`/www/wwwroot` 统一管理网站
- 🌐 **内置端口**：宝塔默认监听 8888 端口

### 2.2 安装步骤

1. **🔌 SSH连接服务器**：
   ```bash
   ssh root@你的服务器IP
   # 例如：ssh root@134.175.39.163
   ```

2. **📦 更新系统**：
   ```bash
   # Ubuntu/Debian
   apt update && apt upgrade -y
   
   # CentOS
   yum update -y
   ```

3. **⬇️ 安装宝塔**：
   ```bash
   # Ubuntu/Debian 安装命令
   wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
   
   # CentOS 安装命令
   yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
   ```

4. **📝 记录安装信息**：
   安装完成后会显示：
   ```
   Bt-Panel: http://你的服务器IP:8888/随机安全入口
   username: 随机用户名
   password: 随机密码
   ```
   ⚠️ **务必保存这些信息！**

5. **🔐 登录宝塔面板**：
   - 浏览器访问：`http://你的服务器IP:8888`
   - 输入用户名和密码
   - 首次登录会提示安装套件，选择**LNMP**（推荐）：
     - Nginx 1.24
     - MySQL 8.0
     - PHP 8.0（可选）
     - phpMyAdmin（可选）

---

## 三、🛡️ 配置安全组（防火墙）

### 3.1 理解安全组和防火墙

**安全组**：
- 📍 位置：云厂商网络层（比如腾讯云）
- 🎯 作用：控制这台云服务器哪些端口被外网访问
- 🏢 类比：小区大门保安，不让进

**防火墙**：
- 📍 位置：服务器操作系统内部
- 🎯 作用：系统级别的访问控制

### 3.2 必须开放的端口

| 🔌 端口 | 📝 用途 | ⚠️ 说明 |
|---------|--------|--------|
| 22 | SSH连接 | ✅ 必须 |
| 80 | HTTP访问 | ✅ 必须（nginx 默认监听） |
| 443 | HTTPS访问 | ✅ 推荐（更安全的 HTTP） |
| 8888 | 宝塔面板 | ⚠️ 用完可关闭 |
| 3306 | MySQL远程连接 | 🔒 按需开放（开发用） |
| 3001 | Node.js后端 | 🔧 临时调试用 |

**安全建议**：
- 🔒 尽量少开放端口
- 🌐 80 HTTP 默认端口，nginx 默认监听
- 🔐 443 HTTPS 默认端口，更安全
- 📊 3306 MySQL 端口，可选择性访问
- 👥 只开发一些IP（开发/生产环境）

---

## 四、🔧 服务器环境准备

### 4.1 安装 Node.js（使用 nvm）

**为什么用 nvm？**
- 🔄 不同项目可能需要不同 Node.js 版本
- 📦 nvm 可以同时容纳多个版本，灵活切换
- 🎯 使用指针管理当前版本

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc

# 安装 Node.js 18
nvm install 18

# 设置默认版本
nvm use 18
nvm alias default 18

# 验证安装
node -v
npm -v
```

### 4.2 安装 MySQL

通过宝塔面板安装：
1. 🏪 宝塔面板 → 软件商店
2. 🔍 搜索 MySQL 8.0 并安装
3. 🔑 设置 root 密码（务必记住）

### 4.3 创建数据库

**为什么要分开发/生产数据库？**
- 🔄 开发和线上互不影响
- 🧪 避免测试数据污染生产环境
- 📦 便于数据备份和迁移

```bash
# 连接 MySQL
mysql -u root -p

# 创建开发数据库
CREATE DATABASE time_capsule_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建生产数据库（推荐）
CREATE DATABASE time_capsule_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'time_capsule_dev'@'localhost' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON time_capsule_dev.* TO 'time_capsule_dev'@'localhost';
FLUSH PRIVILEGES;
```

**数据库命名建议**：
- 开发环境：`time_capsule_dev`
- 生产环境：`time_capsule_production`

---

## 五、🚀 部署后端项目

### 5.1 项目结构说明

**后端技术栈**：
- 📝 TypeScript 是大型项目标配
- 🔄 ts → js → 热更新运行（ts-node-dev）
- 📦 npm run dev：本地开发
- 🏗️ npm run build：TypeScript 编译为 JavaScript
- ▶️ npm run start：正式启动（node dist/app.js）

### 5.2 上传代码

```bash
# 进入网站目录
cd /www/wwwroot

# 克隆项目（或使用宝塔文件管理器上传）
git clone https://your-repo-url/future-capsule.git
cd future-capsule/server
```

### 5.3 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
vi .env
```

**配置内容**：
```bash
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=time_capsule_dev
DB_PASSWORD=你的数据库密码
DB_NAME=time_capsule_dev

# Server Configuration
PORT=3001
```

### 5.4 安装依赖并构建

```bash
# 安装依赖
npm install

# TypeScript 编译为 JavaScript
npm run build

# 验证构建结果
ls -la dist/
# 应该看到 app.js 等文件
```

### 5.5 启动后端服务

**开发模式测试**：
```bash
npm run dev
# 测试：curl http://localhost:3001/health
```

**生产模式启动**：
```bash
# 直接启动
node dist/app.js

# 或使用 PM2 进程管理（推荐）
npm install -g pm2
pm2 start dist/app.js --name "future-capsule-api"

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

**PM2 的作用**：
- 🔄 保持应用持续运行
- 🔁 自动重启崩溃的进程
- 📊 管理日志
- 📈 监控资源使用

---

## 六、🎨 部署前端项目

### 6.1 前端项目说明

**前端技术栈**：
- ⚛️ React + TypeScript
- 📦 Vite 构建工具
- 🌐 Axios HTTP 客户端

**构建流程**：
```bash
npm run dev    # 本地开发（热更新）
npm run build  # 生产环境打包
# 产出 dist/ 静态资源文件
```

### 6.2 配置环境变量

```bash
cd /www/wwwroot/future-capsule/client
vi .env
```

**配置内容**：
```bash
# 生产环境（使用域名）
VITE_API_URL=https://your-domain.com

# 生产环境（使用IP）
VITE_API_URL=http://134.175.39.163
```

### 6.3 构建前端项目

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 验证构建结果
ls -la dist/
# 应该看到 index.html、assets 等文件
```

**构建产物说明**：
```
dist/
├── index.html          # 主页面
├── assets/
│   ├── index-xxx.js    # JavaScript 代码
│   └── index-xxx.css   # 样式文件
└── vite.svg           # 静态资源
```

---

## 七、🔀 配置 Nginx 反向代理

### 7.1 理解 Nginx 的作用

**Nginx 是什么？**
Nginx 是一个高性能的 Web 服务器，做三件事：
1. 📁 **接受请求**
2. 📄 **返回静态文件**
3. 🔄 **把请求返回给后端**（反向代理解决跨域问题）

**为什么需要反向代理？**

**开发环境**：
```
浏览器 → Vite (5173端口) → 拦截 /api → 转发到后端
```

**生产环境**：
```
浏览器 → Nginx (80端口) → 前端静态资源 (直接返回)
         ↓
         /api/* → Node.js (3001端口) → 返回 JSON 数据
```

**跨域问题解决**：
- 开发时：Vite 配置 mocks 拦截 `/api`
- 生产时：Nginx 拦截前端请求，反向代理到 server 3001
- 结果：前端发送请求 → Nginx 拦截 → 转发到后端 → 返回数据

### 7.2 创建 Nginx 配置

**方法一：使用宝塔面板（推荐）**

1. 🌐 宝塔面板 → 网站 → 添加站点
2. 📝 填写信息：
   - 域名：`your-domain.com`（或服务器IP）
   - 根目录：`/www/wwwroot/future-capsule/client/dist`
   - PHP版本：纯静态
3. 🔄 点击站点名称 → 反向代理 → 添加反向代理：
   - 代理名称：`api`
   - 目标URL：`http://127.0.0.1:3001`

**方法二：手动编辑配置文件**

```bash
vi /www/server/panel/vhost/nginx/your-domain.conf
```

**配置内容**：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 网站根目录
    root /www/wwwroot/future-capsule/client/dist;
    index index.html;
    
    # 前端路由支持（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.3 测试并重载 Nginx

```bash
# 测试配置文件语法
nginx -t

# 如果显示 "test is successful"，重载配置
nginx -s reload
```

---

## 八、🔐 配置 HTTPS（推荐）

### 8.1 为什么需要 HTTPS？

- 🔒 **更安全**：加密数据传输
- 🛡️ **SSL 证书**：验证服务器身份
- 🌐 **现代标准**：浏览器优先 HTTPS

### 8.2 使用宝塔申请免费 SSL 证书

1. 🏰 宝塔面板 → 网站 → 点击站点名称 → SSL
2. 📜 选择"Let's Encrypt" → 申请
3. ✅ 开启"强制HTTPS"

### 8.3 更新前端环境变量

```bash
# client/.env
VITE_API_URL=https://your-domain.com
```

重新构建前端：
```bash
npm run build
```

---

## 九、🧪 验证部署

### 9.1 测试前端访问

```bash
# 浏览器访问
http://your-domain.com
# 或
http://你的服务器IP
```

### 9.2 测试 API 访问

```bash
# 测试健康检查
curl http://your-domain.com/health
# 应该返回：{"status":"ok"}

# 测试 API
curl http://your-domain.com/api/capsules
# 应该返回胶囊列表 JSON
```

---

## 十、🔧 常见问题排查

### 10.1 数据库连接失败

**错误信息**：`ECONNREFUSED` 或 `ER_ACCESS_DENIED_ERROR`

```bash
# 检查 MySQL 服务状态
systemctl status mysql

# 测试数据库连接
mysql -u time_capsule_dev -p -h 127.0.0.1 time_capsule_dev

# 检查用户权限
mysql -u root -p
GRANT ALL PRIVILEGES ON time_capsule_dev.* TO 'time_capsule_dev'@'localhost';
FLUSH PRIVILEGES;
```

### 10.2 端口被占用

**错误信息**：`EADDRINUSE: address already in use :::3001`

```bash
# 查找占用端口的进程
lsof -i :3001
# 或者
netstat -tulpn | grep 3001

# 终止进程
kill -9 进程ID

# 或者使用 PM2 管理
pm2 delete future-capsule-api
pm2 start dist/app.js --name future-capsule-api
```

### 10.3 Nginx 502 Bad Gateway

**原因**：Nginx 无法连接到后端服务

```bash
# 检查后端服务是否运行
pm2 status
curl http://localhost:3001/health

# 检查 Nginx 错误日志
tail -f /www/wwwlogs/future-capsule.error.log

# 测试 Nginx 配置
nginx -t
```

### 10.4 跨域问题（CORS）

**解决方案**：使用 Nginx 反向代理（推荐）
- 前后端都通过 Nginx 的 80/443 端口访问
- 浏览器认为是同源请求，不存在跨域

---

## 十一、📋 部署清单

### ✅ 服务器准备
- [ ] 🖥️ 服务器已购买并获取公网 IP
- [ ] 🏰 宝塔面板已安装并登录
- [ ] 🔧 Nginx 和 MySQL 已安装
- [ ] 🛡️ 安全组已配置（80、443、8888端口）

### ✅ 数据库配置
- [ ] 🗄️ 数据库已创建（开发/生产环境分离）
- [ ] 👤 用户已创建并授权
- [ ] 📊 表结构已导入

### ✅ 后端部署
- [ ] 📁 代码已上传到服务器
- [ ] ⚙️ `.env` 文件已配置
- [ ] 📦 依赖已安装，TypeScript 已构建
- [ ] ▶️ 服务已启动（PM2 管理）

### ✅ 前端部署
- [ ] 🎨 `.env` 文件已配置（API 地址）
- [ ] 🏗️ 前端已构建，`dist` 目录已生成

### ✅ Nginx 配置
- [ ] 📂 静态资源根目录指向 `dist` 文件夹
- [ ] 🔄 反向代理配置正确（`/api` → `http://127.0.0.1:3001`）
- [ ] ✅ Nginx 配置已测试并重载

### ✅ 最终验证
- [ ] 🌐 前端页面可访问
- [ ] 🔌 API 接口可访问
- [ ] 📝 可以创建和查看数据
- [ ] 🔐 HTTPS 已配置（可选）

---

## 十二、⚡ 关键命令速查

### PM2 命令
```bash
pm2 start app.js --name "app"    # 🚀 启动应用
pm2 stop app                      # ⏹️ 停止应用
pm2 restart app                   # 🔄 重启应用
pm2 list                          # 📋 列出所有应用
pm2 logs app                      # 📊 查看日志
pm2 monit                         # 📈 监控面板
pm2 startup                       # 🔄 设置开机自启
pm2 save                          # 💾 保存当前进程列表
```

### Nginx 命令
```bash
nginx -t                          # ✅ 测试配置
nginx -s reload                   # 🔄 重载配置
systemctl status nginx            # 📊 查看状态
systemctl restart nginx           # 🔄 重启服务
```

### MySQL 命令
```bash
mysql -u 用户名 -p 数据库名      # 🔌 连接数据库
SHOW DATABASES;                   # 📋 显示数据库
USE 数据库名;                     # 🔄 切换数据库
SHOW TABLES;                      # 📊 显示表
```

---

## 🎓 总结

**部署核心流程**：
1. ☁️ 购买服务器 → 🏰 安装宝塔面板
2. 🛡️ 配置安全组 → 🔧 安装 Nginx + MySQL
3. 🗄️ 创建数据库 → 🚀 部署后端（TypeScript → JavaScript → PM2 运行）
4. 🎨 部署前端（npm run build → dist/）
5. 🔀 配置 Nginx 反向代理（静态资源 + API 转发）
6. 🔐 配置 HTTPS（可选）

**关键要点**：
- 🏰 宝塔面板简化服务器管理
- 🔀 Nginx 反向代理解决跨域问题
- 🔄 PM2 确保 Node.js 应用稳定运行
- 🔒 开发/生产环境分离，互不影响

**访问地址**：
- 🌐 HTTP：`http://your-domain.com`
- 🔐 HTTPS：`https://your-domain.com`（配置 SSL 后）

---

## 🎉 部署完成！

**🎊 恭喜！你的全栈项目已成功部署！**

**现在你可以**：
- 🌐 通过 `http://your-domain.com` 访问前端
- 🔌 通过 `http://your-domain.com/api/capsules` 访问API
- 🗄️ 数据存储在 MySQL 数据库中
- 🔐 配置 HTTPS 后更安全

**理解了整个流程，你就能**：
- 🐛 快速定位问题（DNS、安全组、Nginx、后端、数据库）
- 🔧 灵活调整配置（端口、代理、缓存）
- 📈 优化性能（CDN、负载均衡、数据库优化）
- 🛡️ 加强安全（HTTPS、防火墙、权限控制）

**部署完成！🚀**