# Promise
- make a promise
  - new Promise((resolve, reject) => {
        // do something
        resolve('success');
      })
  - then((res) => {
        console.log(res);
      })
  - catch((err) => {
        console.log(err);
      })
     new promise 
     promise{<pending>} 待处理...
     fulfilled |rejected 不能再变 
- rejected 可能性
  只要有一个失败，整体失败，不再等待其它promise 执行
  走catch 第一个失败的原因


   
