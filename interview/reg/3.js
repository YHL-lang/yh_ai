//干掉-       w 改成 W大写
const str= 'hello-world';
// () 表示分组  不匹配() ,但是可以提取
// $1表示提取第一个分组的内容
const reg =/-(\w)/;
console.log(str.match(reg)); //['-w', 'w']
const res = str.replace(reg, (_,c)=>{
    console.log(_,c,'/////'); 
    return c.toUpperCase();
})
console.log(res); //helloWorld