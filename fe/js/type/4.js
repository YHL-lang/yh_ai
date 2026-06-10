// symbol 唯一的标识符，用函数创建的，简单数据类型
// 轻松表达独一无二
console.log(Symbol('zhang'));
console.log(Symbol('zhang') === Symbol('zhang'));
console.log(typeof Symbol('zhang'));
// symbol 类型
console.log(Symbol()); //绝对唯一，可以传一个标签lable
let obj = {
  [Symbol()]: 'value',
  prop: '2'
}