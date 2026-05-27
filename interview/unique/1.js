/**
 * @func 数组去重
 * @param {Array} arr 数组
 * @returns {Array} 去重后的数组
 * @author yh
 * @date 2026-05-27
 */

function unique(arr) {
//参数校验 不是数组，返回空数组
    if (!Array.isArray(arr)) {
        console.error('type error');
        return [];
    }
    //双循环去重
    let res = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        let flag = true;
        for (let j = 0; j < res.length; j++) {
            if (arr[i] === res[j]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            res.push(arr[i]);
        }
    }
    return res;

}
console.log(unique([1, 2, 3, 2, 5])); // [1, 2, 3, 5]