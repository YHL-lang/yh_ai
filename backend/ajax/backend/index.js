// node 内置的 http 模块，用于创建 http 服务器
//早期js，特别是前端没有模块化系统
// function scr
// node 一定要上模块化方案require+module.exports
// ems 是升级版 import + export default
// require node 早期的模块化系统 commonjs
const http = require('http');
//伺服状态 http 基于请求响应
http.createServer((req, res) => {
  // 用户服务函数
  const todo = [{
    id: 1,
    title: '过四六级',
    completed: false
  }, {
    id: 2,
    title: '回家过节',
    completed: false
  }]
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json;charset=utf-8')
  // req 用户对象
  if (req.url === '/') {
    res.end('hello world')
  }
  if (req.url === '/todo') {
    // 二进制文本
    res.end(JSON.stringify(todo))
  }
}).listen(3000, () => {
  console.log('server is running on 3000 port');
})
