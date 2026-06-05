// js 没有class ,约定大写构造函数，对象
function  Greeting(name){
this.name=name;
}
console.log(this);
Greeting.prototype.say = function()
{
    console.log('我叫'+this.name+',很高兴认识你'); //'+this.name+'==${this.name}
}
Greeting.prototype.work = function(){
    console.log('我叫'+this.name+',我正在工作');
}
// console.log(new Greeting('yhl'));
const yhl =new Greeting('yhl');
console.log(yhl.name);
yhl.say();
yhl.work();
