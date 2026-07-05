const arr = [1, [2,[3,4,[5,6]]]];
// 扁平化[1,2,3,4,5,6]
console.log(arr.flat(Infinity));
//Infinity表示无限层级的扁平化
