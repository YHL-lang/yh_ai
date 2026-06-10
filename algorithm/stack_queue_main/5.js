// js 数组内存一定连续吗？不一定
const arr = [1, 2, 3, 4];//js当数组来打理
// 每个元素类型不一样，不连续，连续没有意义
//arr2[2] 仍然可以通过下标访问 hashTable
const arr2 = ['haha', 1, { a: 1 }];//不那么数组了
console.log(arr[1], arr2[2]);