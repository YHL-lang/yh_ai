// v8 引擎的眼里
// 声明提升
var myname  //变量提升 undefined
function showName() {
  console.log('函数showName执行');
}

showName();
console.log(myname);
myname = 'yihao';
