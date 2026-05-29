// 常量一开始就要赋值
const item = 1; // 常量必须在声明时赋值
let a; // undefined
// 简单数据类型
const key = 'abc123';
key = 'ABC123'; // TypeError: Assignment to constant variable. 常量不能被重新赋值
let points = 50;
// let 不止是值可以改变，它的类型也可以改变
// 不要这么干
points = 51; //不好的
let winner = false;
winner = '戴';
// 复杂数据类型 对象
// 值可以改变，但类型不能改变
const person = {
    name: 'zhangsan',
    age: 18
} 
person.age++
console.log(person); // 19
person = '111'; // TypeError: Assignment to constant variable. 常量不能被重新赋值