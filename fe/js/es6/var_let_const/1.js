var height = 200; //全局作用域变量
// 局部作用域 global scope 全局作用域
function setWidt()
{
    // 局部作用域变量
    var width = 100;
    console.log(width,height); //可以访问width和height
}

setWidt();
// console.log(width); //会报错，因为width是局部变量，不能在函数外访问
console.log(height); //可以访问height，因为它是全局变量
var age = 100;
if(age > 12){
    // 块级作用域
    // es6 常量 不可以改变
    //const dog = age * 7;
    let x = 111; //es6 块级作用域变量
    var dog = age * 7; //es5 全局作用域变量
    console.log(dog);
    dog ++;
}
console.log(dog); 
// console.log(x); //会报错，因为x是块级作用域变量，不能在块外访问
