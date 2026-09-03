## jwt 登录鉴权
用的都是JWT JSON web Token
- http 是 无状态 Stateless,用户身份？你是谁？
- Header Authorization
  Bear Token 一串鉴权码 凭证 加密
- /login admin 123456
{
  id:1,
  username:'admin';
  role:'admin';
}
  JSON 身份对象 -> JWT(单向操作) -> Token 颁发给登录者
  每次带上token -> authorization -> decode -> JSON 对象

## zustand
轻量级的状态管理框架 react 全家桶 react + react-router-dom + zustand
- 父子传递 组件通信 状态共享
- createContext + useContext 跨层级共享
- 登录与否，用户信息 全局状态
  全局共享，跨路由
  zustand 统一管理 store 文件夹 状态仓库
  react App = UI Component + Store

## mockjs 大前端 鉴权
- axios baseUrl
- vite mockjs 插件
  /api/

## JSONWebToken
sign verify 两个动作
sign 用户的json 对象 （身份信息，json 表现力）
cookie/session 登录方案
cookie 请求每次都会带上 sessionId
sessionId -> 内存中session 会话对象 不太适合分布式
jwt 没有这个问题，任何一台服务器签发的token 都可以在任何一台其它自己的服务器上 解码出来，JSON 对象

## 拦截器
axios 默默地做了很多
1. 后端签发的token 放在localStorage
2. axios 配置里添加一个interceptors
   - request
   每个anxios  请求拦下来
    config  请求配置对象
    config.headers['Authorization'] 
    每次请求自动戴上
   return config;
   - response
   服务器返回的数据 response.data
   response.config
   response.headers