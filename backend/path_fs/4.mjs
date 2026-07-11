import fs from 'fs/promises';

// 解决回调地狱
// es6 es8
// 回调地狱 无法忍受
// then 链式调用 爬楼梯 也烦
// es8 async/await 语法糖

//立即执行函数 IIFE
// 异步的 它只是语法糖 不是 fs.readFileSync
// await 帮我们实现了流程控制，不需要手动处理回调地狱then 链式调用
// 同步 -> js单线程，耗时性任务（block）->异步（event loop）-> callback(回调)-> 流程控制业务复杂（回调地狱）->promise + then(略显复杂) -> async/await(es8 语法糖) 异步代码同步化（可读性），本质还是promise ，异步中的微任务
// setTimeout 是宏任务
(async () => {
  // console.log('111');
  const file1Data = await fs.readFile('./file1.txt', 'utf-8');
  console.log('file1.txt', file1Data);
  const file2Data = await fs.readFile('./file2.txt', 'utf-8');
  console.log('file2.txt', file2Data);
  const file3Data = await fs.readFile('./file3.txt', 'utf-8');
  console.log('file3.txt', file3Data);
})();

// fs.readFile('./file1.txt', 'utf-8')
//   .then((data) => { //比 callback 优雅 then 语义 好理解
//     console.log('file1.txt', data);
//     // Promise 实例
//     // then 返回的 Promise ,继续then 链式调用
//     return fs.readFile('./file2.txt', 'utf-8');
//   })
//   .then((data) => {
//     console.log('file2.txt', data);
//     return fs.readFile('./file3.txt', 'utf-8');
//   })
//   .then((data) => {
//     console.log('file3.txt', data);
//   })