const str = '价格是100元,进价是80元,赚了20元';
//匹配数字
const reg = /\d+/g; //g表示全局匹配
console.log(reg.test(str)); //true
const res = str.match(reg);
console.log(res); //['100', '80', '20']
