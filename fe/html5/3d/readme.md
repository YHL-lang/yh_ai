# 3D

- canvas
html5 新增标签，js api 绘制 

## css 3d
css 属性去触发3d 绘制，不止3d，还会带来GPU 加速
哪怕是2d的页面，有时我们也会手动3d化
### 布局 layout
- 外层盒子 布局
- 内层盒子 展示

### 水平垂直居中
- 父容器
   body 100% 100vh(css3新单位)
   100 份 (等比例)  
   实现移动端的适配
   viewport-height
   viewport-width
- 子元素  

## 行内/块级
- html元素有两类 行内元素 块级元素
div , ul 等块级
span 等行内
- 块级 block 盒子
  - 可以设置宽高
  - 独占一行
- 行内 inline
  - 不可以设置宽高
  - 也不会把兄弟挤下去
- display 属性 
    flex 开启弹性格式上下文
    inline-block 行内块级 
      - 不会把兄弟挤下去
      - 可以设置宽高
    浏览器默认块级/行内->display手动切换inline/block->格式化上下文(flex/inline-block/grid)
      inline-block 默认有一个天坑
      默认空格符会占据一定的大小 \n\r

## 定位
position : relative 相对定位
position : absolute 绝对定位
