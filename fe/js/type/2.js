let a; //声明变量 未赋值 未初始化
console.log(a); // undefined


let obj = {} //不存在的属性
console.log(obj.property); // undefined


function noreturn() {

}
console.log(noreturn()); //没有返回的函数 undefined


let arr = [1, 2, 3];
console.log(arr[5]); // undefined


