let arr = [10, 2, 5];
arr.sort();
console.log(arr);//[10, 2, 5]ASCLL码排序

//一定要传函数，否则按ASCLL码排序
arr.sort((a, b) => a - b);
console.log(arr);//[2, 5, 10]按数值排序
arr.sort((a, b) => b - a);//按数值排序，从大到小
console.log(arr); // [10, 5, 2]
