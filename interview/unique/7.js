/**
 * @func 数组去重
 * @param {Array} arr 数组
 * @returns {Array} 去重后的数组
 * @author yh
 * @date 2026-05-27
 */
//hash表法
function unique(arr) {
//参数校验 不是数组，返回空数组
    if (!Array.isArray(arr)) {
        console.error('type error');
        return [];
    }
   let res = [];
   obj = new Map();
for (let i = 0; i < arr.length; i++) {
    if(!obj.get(arr[i])) {
        res.push(arr[i]);
        obj.set(arr[i], 1);
    }
    else{
        obj.set(arr[i], obj.get(arr[i]) + 1);
    }
  }
    return res;
}
console.log(unique([1, 2, 3, 2, 5])); // [1, 2, 3, 5]