# Docker
容器
海运 万吨巨轮
Docker 是一个应用容器化工具，解决我的电脑能跑，你的电脑怎么跑？的问题
- node
- redis
- next
- react
- mysql....
除了代码，依托一堆的，有版本要求的运行环境，docker帮我们打包为一个整体的容器，非常方便的部署在任何设备上

Agent = LLM + Harness（tool+mcp+rag+skill..+...）
Docker = 应用 + 运行环境

## 举例
你到公司接手一个n年前Vue2 的项目，要求使用Node 16 + npm 8 版本
你的电脑装的是node 22，跑不起来的。
容器化 docker 虚拟化技术，将各个依赖隔离化安装

bush
docker run

docker ps 
展示所有本地的容器

docker image 
展示所有本地的镜像

docker rmi 
删除镜像

## Docker 基本概念
image  光盘
应用程序 + 环境 隔离的
git pull image
container DVD

## Web 简单应用
http://localhost:1314
www.juejin.cn      :80 默认端口号 不用输入:3000
运维知识
服务器软件 把所有80 端口产生的请求，代理给3000端口

## nginx 服务器
高并发、代理转发，需要nginx
监听80 端口的访问
并通过配置文件帮我们转发1314端口

### 启动 nginx image
docker run
  启动一个镜像，成为可运行的容器
  --name my-nginx-demo
  容器的名字
  -p 80:80
  本机的80 端口:映射到容器的 80 端口
  80端口是nginx 的监视端口
  http://localhost:80 用户的浏览器输入 转给，映射给container 80
  -v C:\Users\yihao\Desktop\workspace\yh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf
  nginx.conf 配置文件(本机？)
  80 代理 1314端口
  -d nginx
  后台运行nginx

  docker run --name my-nginx-demo -p 80:80 -v C:\Users\yihao\Desktop\workspace\yh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf -d nginx

## 运维考点
- nginx
  反向代理

   用户上网intent -> browser（chrom）（正向代理http）-> local:80 -> docker -port :container(80) -> -v 映射配置文件（local:/etc/nginx/nginx.conf） -> -d (后台运行) nginx（image） ->
    nginx:80（nginx.conf 代理端口服务） <- 1314(反向代理)
   localhost 我们是不知道后端具体在哪个端口上运行的。

   - docker
   pull 任何想要的镜像
   run 任何的镜像
   docker stop $(docker ps -q)
   docker rm -f $(docker ps -aq)
   docker rmi nginx

## mysql
 docker run mysql:8.0
