// commonjs 老的，esm 新的
// module
// html5 新增的功能
const WebSocket = require('ws');
const http = require('http');//node 内置http模块

//先要把启动http server
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end('WebSocket Server Running!');
});

// 基于http server 再搭建socket协议
// websocket
const wss = new WebSocket.Server({ server, path: '/ws' });

// 监听事件 有人连接
wss.on("connection", (ws) => {
  console.log('Client Connected');
  // 接受信息
  ws.on('message', (message) => {
    console.log(`Received Message: ${message}`);
    ws.send(`Server received: ${message}`);
  })
})


server.listen(8080, () => {
  console.log(`listen on http://localhost:8080`);
});