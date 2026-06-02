//.env 文件 apiKey 读取进来？
//dotenv
import dotenv from 'dotenv';
import {OpenAI} from 'openai';

dotenv.config()
 const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_BASE_URL
    });
//process ? 进程对象
//操作系统的核心概念
//node index.mjs 本质是启动进程
//进程是分配资源（内存、cpu、IO）的最小单位
//node 就是process 这个全局对象
//process.env 是一个对象，包含环境变量

//console.log(process.env, 
//   process.env.DEEPSEEK_API_KEY);
//函数表达式
//async 修饰符 表示函数是异步的
//函数内部 await 只能在 async 函数中使用
//省略function 关键字，箭头函数
const main =async () =>{
    console.log('程序开始运行');
    const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'user',
                content: 'hello'
            }
        ]
});
    console.log(response.choices[0].message);

    //setTimeout(function(){
    //    console.log('1秒后运行');
    //}, 1000);
    //console.log('程序运行结束');
};
main();
