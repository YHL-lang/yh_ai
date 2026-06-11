// f(n)  自顶向下思考
//树状结构
// 相同的问题，递归公式
// 退出条件 清晰的
function climbStairs(n) {
  if (n <= 2) {
    return n;
  }
  let a = climbStairs(n - 1);
  let b = climbStairs(n - 2);
  return a + b;
}
console.log(climbStairs(10));
console.log(climbStairs(100));// 卡死
