// function add(a, b) {
//   return a + b;
// }
// add(1, 2) //纯函数
let num = 0;
// 非纯函数：依赖外部变量，结果不可控
function add(b) {
  num += b;
  return num;
}
