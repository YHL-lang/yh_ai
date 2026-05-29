// 全局作用域
{
// 代码块
// 块级作用域
//申明了变量，属于当前块级作用域
const name = 'zhangsan';
console.log(name);
}
// console.log(name); //会报错，因为name是块级作用域变量，不能在块外访问
//退出循环，才是10
for(let i=0;i<10;i++)// for循环的块级作用域 10块
    {
    //用var i  同步代码 尽快执行完
    console.log(i);
    //异步代码  1秒后执行 i已经是10了
    setTimeout(function(){
        console.log('This number is ' + i);
    },1000);
    } 