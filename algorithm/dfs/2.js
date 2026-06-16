// 递归的升级版
function dfsPreOrderIter(root) {
  if (!root) return [];
  const stack = [root];
  const res = [];
  while (stack.length) {
    const node = stack.pop();
    res.push(node.val);
    // 先入右子树，再入左子树 LIFO 先进后出
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return res;
}
