// 表示空，没有
//null
// primitive 原始 内存空间固定
// 拷贝式赋值
let a = null;
console.log(a); //表示值为空

let b = a;// 拷贝，复印机 传数据
b = 2;
console.log(a); //表示值为空
console.log(b); // 2

let Obj1 = { name: 'Alice' }
let Obj2 = Obj1;// 引用式 改地址
Obj2.company = '快手';
console.log(Obj1, Obj2);


let obj = {
  name: 'Alice',
  address: null
};
console.log(obj.address); // null
console.log(obj.age); // undefined


let largeobj = {
  data: new Array(100000000).fill("hgh")
}
// 手动回收内存？
largeobj = null;
