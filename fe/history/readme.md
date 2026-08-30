# 浏览历史
## 路由 Route
- navigator  对象
- 浏览器 url
  - url 浏览器 访问代理
  - http 协议 server 发起请求
  - server 伺服状态 给与响应 text/html
  - 浏览器拿到响应数据 渲染页面
  - 浏览器历史插入一条记录

## 链接
万物互联考得是链接
<a href="https://www.baidu.com">百度一下</a>
多了点啥？
传统的，每次都得重新渲染 整个页面。 PC适当
慢，没有必要重新渲染整个页面

移动时代，App 体验式不一样的。
单页应用 Single Page Application 
SPA

传统的多页面 每次都需要重新渲染 移动端时代
有点没必要了 页面会白一下（网速慢一点）
访问体验上提升
怎么把丰富的内容写在一个网页里显示？
DOM 编程？
根据响应的url
/index.html content DOM 放到 #container
/about.html content DOM 放到 #container

# 单页应用
- 点击链接跳转
  - url 和资源 一一 对应关系
  怎么改变url
  不只是DOM 编程
  hash 方式可以做到，改变hash，url 改变了，不会跳转

## Hash 路由
http(s)://www.baidu.com/u/123?a=1&b=2#/page1
  protocol   host       path   queryString hash
url 中， hash部分 # 开始
- url 一定要变， 不同的url对应不同的资源
- 监听变化 根据hash 部分，渲染不同的内容
优点是url 改变了（局部），页面不会刷新。
锚链接
hash 作为url 一部分，标记传统的pc长页面某一部分，坐电梯一样直达
做前端路由 #/  #/about 不会重新渲染整个页面，又能满足url 和 资源的一一对应关系，前端路由。当hash 部分改变的时候 hashchange 事件，dom或组件替换。
