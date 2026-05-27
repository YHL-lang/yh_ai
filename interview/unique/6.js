/**
 * @func 数组去重
 * @param {Array} arr 数组
 * @returns {Array} 去重后的数组
 * @author yh
 * @date 2026-05-27
 */
//使用Set数据结构
function unique(arr) {
//参数校验 不是数组，返回空数组
    if (!Array.isArray(arr)) {
        console.error('type error');
        return [];
    }
   return [...new Set(arr)];
  
}
console.log(unique([1, 2, 3, 2, 5])); // [1, 2, 3, 5]