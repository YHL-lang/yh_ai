const tree = {
  val: 'A',
  left: {
    val: 'B',
    left: {
      val: 'D',
      left: null,
      right: null
    },
    right: {
      val: 'E',
      left: null,
      right: null
    }
  },
  right: {
    val: 'C',
    left: {
      val: 'f',
      left: null,
      right: null
    },
    right: {
      val: 'G',
      left: null,
      right: null
    }
  }
}

// 前序遍历
function preorder(root) {
  // 退出条件
  if (!root) {
    return;
  }
  console.log(`当前遍历节点值是：`, root.val);//根节点先访问
  preorder(root.left);
  preorder(root.right);
}
// 调用遍历，输出顺序：A → B → D → E → C → F → G
preorder(tree);
console.log('-----------------');

// 中序遍历
function inorder(root) {
  // 退出条件
  if (!root) {
    return;
  }
  inorder(root.left);
  console.log(`当前遍历节点值是：`, root.val);
  inorder(root.right);
}
// 调用遍历，输出顺序：D → B → E → A → F → C → G
inorder(tree);
console.log('-----------------');

// 后序遍历
function postorder(root) {
  // 退出条件
  if (!root) {
    return;
  }
  postorder(root.left);
  postorder(root.right);
  console.log(`当前遍历节点值是：`, root.val);
}
// 调用遍历，输出顺序：D → E → B → F → G → C → A
postorder(tree);
console.log('-----------------');

// 层序遍历
function levelorder(root) {
  const queue = [];//队列实现
  const result = [];//结果数组
  if (!root) {
    return result;
  }
  queue.push(root);
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) {
      queue.push(node.left);
    }
    if (node.right) {
      queue.push(node.right);
    }
  }
  return result;
}
console.log(levelorder(tree));
