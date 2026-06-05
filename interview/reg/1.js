let str = '15188888898';
// 描述一个匹配的规则
// 一个字符一个字符的匹配
//[] 表示匹配的字符范围
//{n} 表示字符的长度
//let reg =/1[3-9][0-9]{9}/;
let reg =/^1[3-9]\d{9}$/;
console.log(
   Object.prototype.toString.call(reg)
)
console.log(typeof {}); //类型  对象object
console.log(typeof reg); //类型  对象object
console.log(reg.test(str)); //true//let str = '13888888888';
//console.log(reg.test(str)); //false//let str = '138888888';少一个8
//console.log(reg.test(str)); //false//let str = '13888888888ss';$表示字符串的结束
//console.log(reg.test(str)); //false//let str = 'aa13888888888';^表示字符串的开始