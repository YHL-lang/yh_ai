//promise es6 用于异步任务控制的最佳机制
const p = new Promise((resolve, reject) => {
  console.log('许诺言');
  // 放置耗时性任务
  setTimeout(() => {
    // resolve(666);
    reject("网络错误");// 耗时性的异步任务，没有完成，就拒绝了
  }, 2000);
}); // 许下诺言
console.log(p.__proto__);
p
  .then((data) => {
    console.log(data);
    console.log('end');
  })
  // 拒绝了，就执行catch
  .catch((error) => {
    console.log(error);
    console.log('失败了');
  })
  .finally(() => {
    console.log('finally');
  })
