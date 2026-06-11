const { Children } = require("react");

function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;//先左后右赋值
}


const tree = {
  value: 'A',
  children: [
    {
      value: 'B',
      children: [
        { value: 'D', children: [] },
        { value: 'E', children: [] }
      ]
    },
    {
      value: 'C',
      children: [
        { value: 'F', children: [] },
        { value: 'G', children: [] }
      ]
    }
  ]
};

console.log(tree.value); // A
console.log(tree.children[0].children[0].value); // D
console.log(tree.children[1].children[1].value); // G