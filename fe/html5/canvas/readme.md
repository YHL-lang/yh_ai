# AI 游戏

- 页游
4399 flash 游戏
html5 2d/3d 游戏

## HTML5 炫酷功能
Canvas 2d/3d 数据可视化/网页游戏/酷炫页面 
- canvas 标签
画布   js api 想怎么画就怎么画
太老旧的浏览器不支持 canvas 标签，需要使用 polyfill 来兼容
- canvas api
   - canvas 有大量的js 绘制 api
   - 受限获取canvas 标签 
   - getContext('2d'/'3d') 方法获取绘制上下文对象
      ai 游戏爆发 three.js 
      物理大模型 
   - 绘制各种图形
      rect 方形
      circle 圆形
      line 线段
   - 清除绘制区域
      clearRect(x,y,width,height)
      左上角 + 宽 / 高
   - 颜色
      fillStyle 填充颜色
      strokeStyle 边框颜色 描边颜色

- 怎么做游戏？
    按帧动画
    - clear 擦掉之前的
    - 绘制新的
    - 显卡帧数 1s 60次

## requestAnimationFrame api方法
浏览器提供的适配屏幕刷帧调度函数
- 不能用 setInterval (异步)
     时间可能和显示设备的刷帧率不在一个频道上
     requestAnimationFrame 是等于刷帧率  体验更协调
- 参数 递归的方式 绘制函数
- clear 方法
     帧动画不停的画，就有了动画
     加上交互 成为游戏

## 飞机游戏
- 工程初始化
  vite , git
  帮我们安装必要的依赖
  .env
- 可以和cc 头脑风暴
    - 产品方案 游戏功能列表，选择其中的一些，做第一个阶段的开发 MVP  最小可行性方案
    - 技术路线怎么样？
      技术方案
- llm 生成

## 数据可视化
echarts 报表
ECharts 是百度开源、基于 JavaScript 的高性能可视化图表库，支持各类折线 / 饼图 / 地图等数据图表快速开发。