# 跨域

- nginx 反向代理
  - 前端项目 index.html nginx
  - 发出的请求 /api
  - :3001/
- vite + mockjs dev
- websocket 
  后端 sse server sent event
  服务器**单向**流式输出
- jsonp json with padding
- cors 
  跨域资源共享 **CORS (Cross-Origin Resource Sharing)**
- postMessage 跨域通信，单向

  
- http 之外的协议
  **单向**传输
  用户发起请求，服务器反馈，一般服务器是不可以主动向用户发送数据的
  server 伺服状态 等

  **sse 流式**，服务器可以不断地向浏览器推送数据 单向
  响应头
  Content-Type: text/event-stream;
  Cache-Control: no-cache;
  Connection: keep-alive;

  QQ、wechat Socket 协议 ，**双工通信**
  不再是http 那种 只有浏览器发送数据，服务器也可以。
  在线状态

  Socket 实时通信，聊天，直播
  Client 端 
  当他来到web端，webSocket 协议
  抖音，腾讯， 哔哩哔哩 弹幕，AI

两边都可以发送数据，平等
  - websocket 协议
  qq、wechat
  实时聊天

- 安装ws库
 websocket 协议 实现 
  - 连接的时候，url ws://localhost:8080/ws
  ws://localhost:8080/ws 分两步
  1. http://localhost:8080 http 连接服务器 Web Server 找到 只需要一次
  2. 101（status code） Switching Protocols 切换协议 socket协议
  基于http web server 的socket 服务 双向通信建立了
  1XX 还在通信中，没有完成
  2XX 成功
  3XX 重定向
  4XX 客户端错误
  5XX 服务器错误
  - 基于事件机制，双向通信

websocket 协议 可以跨域
http（s）跨域: 不同的域名，不同的端口，不同的协议，浏览器因安全问题，同源策略（Same-Origin Policy-SOP），拦截了跨域请求
websocket 协议 不需要遵守同源策略，可以直接跨域通信。还是用于实时通信，不去做常规的跨域解决

## websocket 双工通信，为何不用于llm的流式输出？
一边生成一边输出，socket 双向也可以