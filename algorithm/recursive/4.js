const flatten =(arr)=>{
    let res = [];
    arr.forEach((item,i,arr)=>{
        if(Array.isArray(item)){
            res =res.concat(flatten(item));
        } else
        {
            res.push(item);
        }
    })
    return res;
}

const arr = [1, 2,[3,4,[5,6]]];
console.log(flatten(arr));