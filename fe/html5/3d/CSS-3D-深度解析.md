# 🧊 CSS 3D 硬核解析：四个属性手写旋转立方体

> 💡 不需要 WebGL，不需要 Three.js，纯 CSS 就能搞定 3D。本文把 `perspective`、`transform-style`、`transform`、`animation` 这四个核心属性彻底拆开，每一步都解释"为什么这么写"。

---

## 👀 先看成品

一个边长 200px 的立方体，六面不同色，绕 Y 轴匀速旋转。核心代码不到 50 行。

![效果：一个彩色立方体绕 Y 轴旋转]()

下面从零开始搭，每个 CSS 属性都掰开揉碎讲清楚。

---

## 📋 目录

- [🏗️ 第一步：搭骨架 —— HTML 三层结构](#%EF%B8%8F-第一步搭骨架--html-三层结构)
- [📏 前置知识：inline vs block，display 的三种面孔](#-前置知识inline-vs-blockdisplay-的三种面孔)
- [👁️ 第二步：perspective —— 打开 3D 的"眼睛"](#%EF%B8%8F-第二步perspective--打开-3d-的眼睛)
- [🌌 第三步：transform-style —— 让空间"变立体"](#-第三步transform-style--让空间变立体)
- [🧱 第四步：六个面的 3D 定位 —— 构建立方体](#-第四步六个面的-3d-定位--构建立方体)
- [🎬 第五步：animation —— 让立方体转起来](#-第五步animation--让立方体转起来)
- [🎁 附赠：GPU 加速 —— 3D 的"赠品"](#-附赠gpu-加速--3d-的赠品)
- [📦 完整代码](#-完整代码)
- [🧠 总结](#-总结)

---

## 🏗️ 第一步：搭骨架 —— HTML 三层结构

结构非常简单，三层 div：

```html
<div class="box-wrap">           <!-- 外层：负责 3D 视距 -->
  <div class="box">               <!-- 中层：负责 3D 空间 + 旋转动画 -->
    <div class="face front">前</div>   <!-- 内层：立方体的六个面 -->
    <div class="face back">后</div>
    <div class="face left">左</div>
    <div class="face right">右</div>
    <div class="face top">上</div>
    <div class="face bottom">下</div>
  </div>
</div>
```

为什么分三层？因为 3D 的两个核心属性**必须写在不同元素上**——`perspective` 写在外层不动的地方，`transform-style` 写在旋转的元素上。后面会解释为什么。

开工前先把页面铺满并居中——两行 Flex 搞定，不展开了：

```css
* { margin: 0; padding: 0; }

html, body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

> 📐 `100vh` 是视口高度的 100%，无论手机还是电脑，`body` 都刚好铺满一屏。`display: flex` 配合 `justify-content` + `align-items`，两行代码就把立方体钉在屏幕正中央。

---

## 📏 前置知识：inline vs block，display 的三种面孔

在深入 3D 之前，花五分钟搞清楚 HTML 元素的两种天性——不然后面看到 `display: flex`、`position: absolute` 这些属性会懵。

### 块级元素 vs 行内元素

HTML 元素天生分两类，浏览器给每个标签预设了一个"出厂类型"：

| 类型 | 代表标签 | 能设宽高？ | 独占一行？ |
|------|---------|----------|----------|
| **块级 block** | `div`、`p`、`h1`、`ul`、`li` | ✅ 可以 | ✅ 会，把兄弟挤到下一行 |
| **行内 inline** | `span`、`a`、`em`、`strong` | ❌ 不能 | ❌ 不会，和兄弟排在同一行 |

#### 块级元素：一人占一整行

```
┌──────────────────────────────┐
│  div（块级）  width: 200px    │
│  宽高生效，独占一行            │
└──────────────────────────────┘
┌──────────────────────────────┐
│  div（块级）                  │
│  被挤到下一行，不管上面多窄    │
└──────────────────────────────┘
```

块级元素像一本书的章节标题——不管标题文字多短，它后面一定是另起一行。

#### 行内元素：像水流一样排列

```
┌─────┐ ┌──────────┐ ┌────┐ ┌────────┐
│span │ │span       │ │a链接│ │em强调   │  →  同一行
└─────┘ └──────────┘ └────┘ └────────┘
  宽高无效，内容多宽就多宽，排不下才换行
```

行内元素像句子里的文字——一个接一个往后排，排满了才换行。`width` 和 `height` 对它无效，大小完全由内容撑开。

#### 代码对照

```html
<!-- 块级：宽高生效，但各占一行 -->
<div style="width: 200px; height: 60px; background: red;">块级 div</div>
<div style="background: blue;">我被挤到下一行了</div>

<!-- 行内：并排显示，但宽高无效 -->
<span style="width: 200px; height: 60px; background: red;">宽高写了也没用</span>
<span style="background: blue;">我跟在上面同一行</span>
```

这就是浏览器默认的行为规则。但你可以用 `display` 属性手动改写。

### display 的三条路线

```
浏览器出厂设定
    │
    │  块级 div：独占一行，能设宽高
    │  行内 span：并排流动，宽高无效
    │
    ▼  display: block / inline    ← 路线一：在两种基础类型之间切换
    │
    │  display: inline-block       ← 路线二：行内块级，能设宽高 + 不换行
    │  display: flex               ← 路线三：弹性容器，子元素自动弹性分配
    │  display: grid               ← 路线三：网格容器
    │
    ▼  开启新的格式化上下文
```

#### 三条路线的视觉效果

```
路线一：基础切换
┌──────────┐ ┌──────────┐    display: inline 把块级变行内
│div→inline│ │div→inline│ →  能并排，但宽高又无效了
└──────────┘ └──────────┘

路线二：inline-block
┌──────────┐ ┌──────────┐    能设宽高 ✅  不换行 ✅
│   50%    │ │   50%    │ →  但中间有个空格坑…
└──────────┘ └──────────┘
                  ↑
            换行符变成的空格（几像素，但足以撑破 100%）

路线三：flex
┌─────────────────────────────┐
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│  父容器 display: flex
│  │ 1  │ │ 2  │ │ 3  │ │ 4  ││  子元素 flex: 1 自动等分
│  └────┘ └────┘ └────┘ └────┘│  无空格坑，自动响应
└─────────────────────────────┘
```

#### ① inline-block —— 行内块级

```css
.box {
  display: inline-block;  /* 行内块级：能设宽高，不独占一行 */
  width: 50%;
  background: red;
}
```

`inline-block` 取了块级和行内的优点：**既能设宽高，又不会把兄弟挤下去**。两个 `width: 50%` 的 div 可以并排。

```html
<div class="box">1</div>
<div class="box">2</div>
<!-- 两个块级 div 并排了！ -->
```

> ⚠️ **inline-block 的经典天坑**：HTML 源码中标签之间的换行符会被浏览器渲染成一个可见的**空格字符**。两个 `width: 50%` 加上这个空格，总宽度超过 100%，第二个 div 就被挤到下一行。这是新手必踩的坑。
>
> 解决方案：① 父元素设 `font-size: 0` 把空格缩成零；② 标签之间不留换行，全写在一行；③ 直接用 Flex 布局替代——完全不存在这个问题。

#### ② flex —— 弹性布局

```css
.box {
  display: flex;   /* 开启弹性格式化上下文 */
}
.item {
  flex: 1;         /* 所有子元素等分父容器空间 */
}
```

`flex: 1` 是 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%` 的简写。意思就是**所有子元素按相同比例瓜分父容器的剩余空间**——4 个子元素各 25%，3 个各 33.33%，不需要手动算百分比。

```html
<div class="box">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

Flex 是移动端最常用的布局方式。视口尺寸千变万化，Flex 天生弹性适应。本文的立方体居中用的就是 Flex。

#### ③ block / inline —— 基础切换

```css
div  { display: inline;  }   /* 让块级 div 变成行内行为 */
span { display: block;   }   /* 让行内 span 变成块级行为 */
```

这个用得少，但要知道——`display` 可以彻底改变一个元素的"天性"。

### 回到我们的立方体

搞清楚这些之后，立方体 CSS 里的 `display: flex` 和 `position: absolute` 就不再神秘了：

- `body` 设 `display: flex` → 变成弹性容器，子元素 `.box-wrap` 自动居中。
- `.face` 设 `position: absolute` → 六个面脱离文档流，叠在同一个原点。这和 `display` 无关——`absolute` 让元素不再参与文档流排版，后面会细讲。

---

## 👁️ 第二步：perspective —— 打开 3D 的"眼睛"

```css
.box-wrap {
  width: 200px;
  height: 200px;
  perspective: 600px;
}
```

### 🔍 这个属性到底在干什么

`perspective` 定义的是**你的眼睛到屏幕（z=0 平面）的距离**。

```
        👁 你（观察者）
         │
         │  ← perspective: 600px
         │
      ═══╪═══  z=0 平面（屏幕表面）
         │
         │  ← translateZ(100px)  物体往屏幕外凸
         ▼
       📦 立方体
```

**没有 perspective，Z 轴上的一切变化你都看不见。** 因为人眼是靠"近大远小"感知深度的，而透视正是这个规则的名字。关掉 `perspective`，`translateZ(100px)` 和 `translateZ(-100px)` 看起来一模一样——都是那个平面。打开它，前面的面大、后面的面小，深度感瞬间就出来了。

### 🎯 值越小，3D 感越强

这是最关键的一条直觉，很多人用了很久 3D 都没搞明白：

| perspective | 相当于 | 效果 |
|------------|--------|------|
| `200px` | 凑到脸上看 | 透视变形剧烈，广角镜头感 |
| `600px` | 正常观看距离 | 适中的 3D 感，最常用 |
| `1200px` | 远远地看 | 几乎不变形，接近平面 |

你可以打开开发者工具，把 `perspective` 从 200 拖到 2000，亲眼见证立方体从"夸张变形"到"几乎就是一个正方形在转"的整个过程。

### ⚠️ 一个容易犯的错

`perspective` **不能写在旋转的元素上**。如果把它写在 `.box`（旋转的元素）上，透视原点会跟着旋转一起动——效果鬼畜。

正确的做法：**`perspective` 写在不动的外层容器上**，这样整个 3D 场景共享同一个透视空间，旋转时六个面的透视关系始终一致。

---

## 🌌 第三步：transform-style —— 让空间"变立体"

```css
.box {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}
```

### 🔲 flat vs 🔳 preserve-3d，天差地别

`transform-style` 决定的是：当父元素发生 3D 变换时，子元素是活在 3D 空间里，还是被拍扁在 2D 平面上。

- ❌ **`flat`（默认值）**：子元素全部**压平**。无论你怎么设子元素的 `translateZ`，都看不到深度——整个东西转起来就是一张纸片。
- ✅ **`preserve-3d`**：**保留子元素的 3D 位置**。六个面真实地分布在 Z 轴不同深度处——转起来是有体积的立方体。

🧪 你现在就可以验证：在开发者工具里把 `.box` 的 `transform-style: preserve-3d` 勾掉，立方体瞬间变卡片。勾回来，立体感恢复。这一勾一改之间，就是 `flat` 和 `preserve-3d` 的全部区别。

### 🔗 两个核心的定位

```
perspective        →  管"你怎么看"      →  写在外层容器
transform-style    →  管"空间长什么样"  →  写在旋转的元素上
```

两者缺一不可：

| perspective | preserve-3d | 你看到的东西 |
|-------------|-------------|------------|
| ✅ | ✅ | 真正的 3D 立方体 |
| ✅ | ❌ | 一张会转的纸片 |
| ❌ | ✅ | 没有透视的立方体（像等距视图，很假） |
| ❌ | ❌ | 一个静止的 2D 正方形 |

---

## 🧱 第四步：六个面的 3D 定位 —— 构建立方体

立方体边长 200px，所以中心到每个面的距离是 **100px**。

### 📐 4.1 先把六个面叠在一起

```css
.face {
  width: 200px;
  height: 200px;
  position: absolute;        /* 全部脱离文档流 */
  display: flex;
  align-items: center;
  justify-content: center;   /* 文字在面内居中 */
  font-size: 30px;
  color: #fff;
  opacity: 0.8;              /* 半透明，能看到后面的面 */
}
```

父元素 `.box` 设了 `position: relative`，所以六个 `position: absolute` 的 `face` 全部以 `.box` 的左上角为原点，**精确重叠在同一个位置**。这就是俗称的"父相子绝"。

### 🔑 4.2 最重要的规则：transform 从右往左执行

写具体的 transform 之前，先死记这条规则：

```css
transform: translateX(100px) rotateY(90deg);
/*           ② 后执行          ① 先执行       */
```

CSS 的 transform 函数列表，**最右边的先执行**。`translateX(100px) rotateY(90deg)` = 先旋转，再平移。

为什么这个顺序至关重要？因为**旋转会改变元素的局部坐标系**。`rotateY(90deg)` 一执行，元素的 X 轴就被扭到了原来的 Z 轴方向——后面的 `translateX(100px)` 实际上是沿着新方向移动。

📄 想象手里拿着一张纸：

- ✅ **先转向左，再向前走 100px** → 纸在你左边 100px，纸面朝左。这是立方体左面的正确位置。
- ❌ **先向左走 100px，再转向左** → 纸在你左边 100px，纸面朝向你然后才转向左——位置和朝向都不对。

### 🧭 4.3 CSS 3D 坐标系速查

动手之前瞄一眼坐标轴：

```
        Y-  ↑
            │
            │
X- ←───────┼────────→ X+
            │
            │
        Y+  ↓

    Z+ 从屏幕指向你的眼睛
    Z- 指向屏幕深处
```

三个关键点：
- 📏 Y 轴**向下为正**（屏幕坐标系，不是数学坐标系），所以 `translateY(-100px)` 是**向上**移。
- 🔄 `rotateX()` 是绕 X 轴翻转，`rotateY()` 是绕 Y 轴水平旋转，`rotateZ()` 是绕 Z 轴 2D 旋转。
- 🤚 旋转方向用右手定则：大拇指指向轴的正方向，四指弯曲的方向就是正角度方向。

### 🎲 4.4 逐个摆好六个面

---

🔵 **前面**：默认朝前，不需要旋转，直接沿 Z 轴正方向推 100px。

```css
.front {
  background: #4299e1;
  transform: translateZ(100px);
}
```

---

🔴 **后面**：绕 Y 轴转 180° 让面朝后，再沿 Z 轴负方向推 100px。为什么要转 180°？不转的话，从背面看文字是镜像的——"后"字左右颠倒。

```css
.back {
  background: #f5656f;
  transform: translateZ(-100px) rotateY(180deg);
  /*            ② 后执行        ① 先执行        */
}
```

---

🟢 **左面**：绕 Y 轴逆时针转 90° 面朝左，再沿（旋转后的）X 轴向左推 100px。

```css
.left {
  background: #48bb78;
  transform: translateX(-100px) rotateY(-90deg);
}
```

---

🟢 **右面**：绕 Y 轴顺时针转 90° 面朝右，再沿 X 轴向右推 100px。

```css
.right {
  background: #48bb78;
  transform: translateX(100px) rotateY(90deg);
}
```

---

🟣 **上面**：绕 X 轴转 90° 面朝上，再沿 Y 轴向上推 100px。Y 负 = 上。

```css
.top {
  background: #9f7aea;
  transform: translateY(-100px) rotateX(90deg);
}
```

---

🟡 **下面**：绕 X 轴逆时针转 90° 面朝下，再沿 Y 轴向下推 100px。

```css
.bottom {
  background: #ecc94b;
  transform: translateY(100px) rotateX(-90deg);
}
```

---

### 🖼️ 4.5 一个直观的图解

```
                    +-----+  ← .top（紫色）
                   /|     /|
                  / |    / |
                 +-----+  |  ← .right（绿色）
                 |  +--|--+
                 | /   | /   ← .front（蓝色）
                 +-----+     ← .bottom（黄色）

      .left（绿色）   .back（红色，在背面看不到）
```

---

## 🎬 第五步：animation —— 让立方体转起来

立方体摆好了，加一行让它绕 Y 轴旋转。

```css
.box {
  /* 前面的属性不动 */
  animation: rotate     /* 动画名称 */
             5s         /* 一轮 5 秒 */
             linear     /* 匀速 */
             infinite;  /* 无限循环 */
}

@keyframes rotate {
  0%   { transform: rotateY(0deg);   }
  100% { transform: rotateY(360deg); }
}
```

### 🎞️ @keyframes 在做什么

`0%` 是起点，`100%` 是终点。浏览器在这两个状态之间**自动算中间值**（这叫插值），从 0° 平滑过渡到 360°，视觉上就是完整转一圈。

你可以插入任意中间关键帧来编排更复杂的动作：

```css
@keyframes wiggle {
  0%   { transform: rotateY(0deg);   }
  25%  { transform: rotateY(45deg);  }
  50%  { transform: rotateY(0deg);   }
  75%  { transform: rotateY(-45deg); }
  100% { transform: rotateY(0deg);   }
}
```

### 🏃 旋转动画为什么必须用 linear

`animation-timing-function` 控制速度曲线。旋转这件事，**永远选 `linear`**。

| 值 | 表现 | 用在旋转上 |
|----|------|----------|
| `linear` | 全程匀速 | ✅ 自然，像地球自转 |
| `ease`（默认） | 慢→快→慢 | ❌ 转一圈中间突快、两头慢，节奏诡异 |
| `ease-in-out` | 慢→快→慢 | ❌ 同上 |

自然界中匀速旋转的东西到处都是——地球、陀螺、风扇。旋转中用 `ease` 忽快忽慢，直觉上就是"卡顿"。

---

## 🎁 附赠：GPU 加速 —— 3D 的"赠品"

这不是 3D 本身，但太实用了，必须提一嘴。

当你给元素加上 3D transform，浏览器会自动把它提升到独立的**合成层（Compositor Layer）**，渲染丢给 GPU：

```css
/* 纯 2D 页面也能蹭 GPU 加速 */
.smooth-element {
  transform: translateZ(0);
  /* 或 translate3d(0, 0, 0)，效果一样 */
}
```

好处：
- 🚀 动画期间**不触发重排（reflow）和重绘（repaint）**，只做 GPU 合成。
- 📱 帧率更稳，在低端手机上差异尤其明显。

> ⚠️ 别滥用——每个合成层都占 GPU 显存，几百个元素全加 `translateZ(0)` 反而可能掉帧。

---

## 📦 完整代码

```css
/* ========== 全局重置 ========== */
* { margin: 0; padding: 0; }

/* ========== 页面居中 ========== */
html, body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ========== 外层：设置 3D 视距 ========== */
.box-wrap {
  width: 200px;
  height: 200px;
  perspective: 600px;       /* 核心 ①：视距 */
}

/* ========== 中层：3D 空间 + 旋转动画 ========== */
.box {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;   /* 核心 ②：3D 空间 */
  animation: rotate 5s linear infinite;
}

@keyframes rotate {
  0%   { transform: rotateY(0deg);   }
  100% { transform: rotateY(360deg); }
}

/* ========== 内层：六个面的公共样式 ========== */
.face {
  width: 200px;
  height: 200px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #fff;
  opacity: 0.8;
}

/* ========== 六个面各自的 3D 定位 ========== */
/* 核心 ③：transform 从右往左执行——先旋转朝向，再平移到目标位置 */

.front  { background: #4299e1; transform: translateZ(100px);                  }
/* 前：朝前是默认方向，直接向前推 */

.back   { background: #f5656f; transform: translateZ(-100px) rotateY(180deg); }
/* 后：转 180° 朝后（文字从背面看才不是反的），再向后推 */

.left   { background: #48bb78; transform: translateX(-100px) rotateY(-90deg); }
/* 左：逆时针转 90° 朝左，再向左推 */

.right  { background: #48bb78; transform: translateX(100px) rotateY(90deg);  }
/* 右：顺时针转 90° 朝右，再向右推 */

.top    { background: #9f7aea; transform: translateY(-100px) rotateX(90deg);  }
/* 上：绕 X 轴转 90° 朝上，再向上推（Y 负 = 上） */

.bottom { background: #ecc94b; transform: translateY(100px) rotateX(-90deg);  }
/* 下：绕 X 轴逆时针转 90° 朝下，再向下推 */
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>CSS 3D 旋转立方体</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="box-wrap">
    <div class="box">
      <div class="face front">前</div>
      <div class="face back">后</div>
      <div class="face left">左</div>
      <div class="face right">右</div>
      <div class="face top">上</div>
      <div class="face bottom">下</div>
    </div>
  </div>
</body>
</html>
```

两个文件放同一目录，浏览器打开 HTML 就能看到效果。

---

## 🧠 总结

整个立方体就是四个属性的协作：

```
perspective: 600px         →  ① 打开透视，让 Z 轴有"深度"
transform-style: preserve-3d →  ② 声明 3D 空间，六个面不被拍平
transform: translate + rotate →  ③ 把六个面推到立方体的六个位置
animation + @keyframes     →  ④ 绕 Y 轴匀速旋转
```

### 📝 背下来这几条就够了

1. 🔴 **perspective 和 preserve-3d 缺一不可** —— 一个管"能不能看到深度"，一个管"空间是不是 3D 的"。
2. 🔍 **perspective 值越小，3D 感越强** —— 200 = 广角镜头，1200 = 接近平面。
3. 🔄 **transform 从右往左执行** —— `translateX(100px) rotateY(90deg)` = 先旋转再平移。
4. 📍 **perspective 写在外层，preserve-3d 写在旋转层** —— 放错位置效果完全不对。
5. 🏃 **旋转动画用 linear** —— 匀速最自然，ease 忽快忽慢在旋转中很违和。
6. 🚀 **3D 自动触发 GPU 加速** —— 2D 页面加 `translateZ(0)` 也能白嫖。

---

> 🧪 最好的学习方式：复制代码 → 打开开发者工具 → 逐属性修改 → 亲眼看到变化。改 `perspective` 看变形程度，改 `transform-style` 看立体感开关，改各面的 `translate` 值看面的位置怎么变。改一遍比读十遍记得牢。
