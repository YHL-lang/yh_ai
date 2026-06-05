// Javascript 执行机制对于开发者至关重要。
// 代码是怎么执行的？
showName('极客时间')
console.log(myname)

var myname = 'yihao'
function showName(name) {
  console.log(name);
  var b = 1;
  console.log('函数showName执行', name)
}