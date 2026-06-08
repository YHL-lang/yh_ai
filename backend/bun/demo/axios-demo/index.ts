//http 请求llm 接口
// bun 代替 npm 做包管理器
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DEEPSEEK_BASE_URL,"-----")
async function chat() {
    //llm 可能会出错，异常
    //timeout  network 请求太多，llm 忙 |apikey 用不了 没钱 
    try{
        //GET 请求有上限制
        //apikey GET 不安全 明文传输
        //图片 上传 post body 请求体 
        //请求行 url， method ，http version
        //请求头 Authorization apikey
        //请求体 body
        //process 静程
        //fetch http 请求api
        //axios http 请求的框架，封装了fetch ，企业级别的。
        const res =await axios.post(`${process.env.DEEPSEEK_BASE_URL}`,{
            model :'deepseek-v4-flash',
            messages :[{
                role : 'user',
                content:'你好，介绍一下Bun'
            }]
        },
    {
headers:{
    'Content-Type':"application/json",
    Authorization:`Bearer ${process.env.DEEPSEEK_API_KEY}`
}
    }
)
// axois 默认会在响应前面带上data
console.log(res.data.choices[0].message.content);
    }catch(err:any){
console.log(err.message);
    }
}
chat();