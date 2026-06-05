// 函数表达式
// 类MyQueue 
// 早期的js 没有类
// JS 是基于原型的面向对象
// 不需要class 也可以完成面向对象
// 函数 + prototype  更优秀
// js开发比较快
// 类？ 抽象 一套属性 + 方法的模版
const MyQueue = function() {
  // 构造函数， 属性
  console.log('实例化',this);
//   this.x =  1;
this.stack1 = {};
this.stack2 = {};
}
MyQueue.prototype.push= function()
{
    console.log('push方法');
}
// new 运算符 this 指向我们的实例
const queue = new MyQueue();
console.log(queue);
console.log(queue.push());

