# 全栈项目部署全流程
- 运维工程师
加分项
- vercel 云端部署
  - 比较固定
  next.js + supabase 项目
  java，go，python 部署自由度
  - 国内支持
  腾讯云

## 使命
- 理解部署的全流程
- nginx 用**宝塔**面板搭建生产环境变量
- 前后端分离项目
  - react + ts 产出？
    组件，
    npm run dev
    npm run build dist/ 静态资源文件
  - node 后端产出
     /api 接口 json

## 部署全流程
- 得花钱买服务器
   35
- 买域名？ 备案 10-20 天
- 配置HTTPS 更安全的http SSL
- nginx
- 配置反向代理
  前后端/api 通信？
  跨域？
  不存在
  :5173 /api/todos vite 配置 mocks 拦截/api todos
  前端发送请求，vite 基础设施 拦截？
  :5173 /api/todos nginx ？ 拦截前端请求 反向代理 server 3001
- 安全

## 购买服务器
轻量云服务器，linux
全量的linux 部署，命令行成本有点高，难度
宝塔（BT panel） ，是一套服务器管理面板
可视化的，点击操作，完成服务器部署
给服务器装了一个“控制台/操作系统的后台”
得到了一个公网IP

## 宝塔的优势
/www/wwwroot
服务器内置了宝塔: 8888
- 可视化
- 自由度高
  想怎么部署就怎么部署

## 用户访问网址到底发生了什么？
1. 输入URL Browser -> DNS (Domain Name System) 先找到服务器 Server IP
   DNS 返回 服务器公网IP
   先查地址，再去敲门
   DNS 查询会缓存到本地
   - browser 
   - 上网设备系统
   - 局域网
   - 城域网
   - 根服务器 .com.cn

2.  安全组 防火墙
    看门人，放不放行
    - ip 限流，恶意ip，
    - 尽量少开放端口
    80 http 默认端口 nginx 默认监听80端口
    443 https 默认端口
    3306 端口 Mysql 可选择的访问
    只开发一些IP dev ， production

  安全组
    位置: 云厂商网络层（比如腾讯云）
    作用？ 控制这台云服务器哪些端口被外网访问
    类比：小区大门保安 不让进 
  防火墙：
    位置： 服务器操作系统内部

3. nginx 真正的入口（分流）
- 静态资源
  react + ts 打包
  route，static route，返回静态资源
- 动态资源
  route 走服务器路由
Nginx 是一个高性能的Web服务器
三件事:接受请求，返回静态文件，或把请求返回给后端（反向代理解决跨域问题）
http://134.175.39.163/ index.html
  http://134.175.39.163/api/todos
  vite mock
  跨域问题 5173 ：80 -> 3001
  nginx: 配置 /api -> 反向代理 server 3001
  http://134.175.39.163:3001/todos
  json -> nginx 返回前端调用

   node -> mysql mvc 

## 服务器准备
- 通过网站 -> node 项目
  Node.js 版本管理器  nvm（同时容纳多个node 版本，指针，当前是哪个版本） 
  node 版本需求不一样，项目依赖不同的node 版本
- html 项目 安装 nginx
- 安装  MySQL
    - 建立 dev/production 两个数据库
    - 开发和线上互不影响
    time_capsule_dev
    time_capsule_production

## 项目在本地跑起来
### 前端
- 瀑布流（小红书），经典复杂的前端用户体验，无限滚动（滚动到底部）
## 后端
- .env
- npm run dev
  线上的dev数据库
  数据库连接失败
- ts 是大型项目标配
- ts -> js -> 热更新运行 ts-node-dev
  npm run dev  本地开发
- npm run build ts-> js
   生产环境打包
   出现dist/ 目录
- npm run start  正式启动
  node dist/app.js