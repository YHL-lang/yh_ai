# 🎨 HTML5 Canvas 从入门到实战：画布绘图 · 帧动画 · 小游戏 · 数据可视化

HTML5 Canvas 是前端领域一块真正的"画布"——它赋予开发者在浏览器中**任意绘制**的能力。无论是 2D 游戏、数据可视化图表，还是酷炫的交互动效，Canvas 都是核心基石。

本文将从最基础的 API 出发，逐步深入到帧动画、完整小游戏开发，最后结合 ECharts 完成数据可视化报表，带你系统掌握 Canvas 技术栈。

---

## 一、🔰 认识 Canvas：浏览器里的画布

### 1.1 `<canvas>` 标签

Canvas 的一切从一个 HTML 标签开始：

```html
<canvas id="myCanvas" width="600" height="400" style="border: 1px solid #333;">
  您的浏览器不支持 canvas（旧 IE 会显示这段文字）
</canvas>
```

📌 几个关键点：
- `width` 和 `height` 是 Canvas 的**像素尺寸**（默认为 300×150），不要用 CSS 来设置——CSS 宽高只会拉伸画布而不会改变分辨率。
- 标签内的文字是**降级内容**：当浏览器不支持 Canvas 时才会显示。对于极老旧的浏览器，可以使用 polyfill 库来做兼容。

### 1.2 🔗 获取绘制上下文

Canvas 本身只是一个"容器"，真正绘图靠的是**绘制上下文（Context）**：

```javascript
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d'); // 2D 绘制上下文
// canvas.getContext('webgl')        // 3D 绘制上下文，激发 GPU
```

拿到 `ctx` 之后，你就拥有了一套完整的 JS 绘图 API，可以随心所欲地绘制任何图形。

### 1.3 📍 Canvas 坐标系

Canvas 坐标系以**左上角为原点 (0, 0)**，x 轴向右延伸，y 轴向下延伸。理解这一点对后续所有绘制都至关重要。

```
(0,0) ──────────────────────────────── x 轴（向右为正）
  │
  │    ┌──────────────────────┐
  │    │                      │
  │    │   Canvas 绘制区域    │  width = 600
  │    │                      │
  │    │     · (x, y)         │
  │    │                      │
  │    └──────────────────────┘
  │
  y 轴（向下为正）             height = 400
```

> 💡 **记忆技巧**：Canvas 的坐标原点在左上角，这和 CSS 的盒模型方向一致，但和数学中的笛卡尔坐标系（左下角为原点，y 轴向上）不同。

### 1.4 🖌️ 基础绘制 API

下面这段代码涵盖了最核心的几个 API——绘制矩形、描边矩形、清除区域、设置颜色：

```javascript
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d');

// 设置填充颜色，绘制一个实心矩形
ctx.fillStyle = '#4299e1';
ctx.fillRect(20, 20, 100, 80);   // fillRect(x, y, width, height)

// 设置描边颜色与线宽，绘制一个空心矩形
ctx.strokeStyle = '#f56565';
ctx.lineWidth = 4;
ctx.strokeRect(150, 20, 100, 80);

// 清除指定矩形区域（变成透明）
ctx.clearRect(50, 50, 40, 30);   // clearRect(x, y, width, height)
```

| API | 作用 |
|---|---|
| `fillRect(x, y, w, h)` | 绘制实心矩形 |
| `strokeRect(x, y, w, h)` | 绘制空心矩形（描边） |
| `clearRect(x, y, w, h)` | 清除指定区域 |
| `fillStyle` | 填充颜色 |
| `strokeStyle` | 边框（描边）颜色 |
| `lineWidth` | 线条宽度 |

### 1.5 🧰 更多常用 API

除了矩形，Canvas 还提供了丰富的 2D 绘图 API，核心模式始终不变：**先设置样式 → 再调用绘制方法**。

```javascript
// === 路径与形状 ===
ctx.beginPath();                                    // 开始新路径
ctx.moveTo(50, 50);                                 // 移动画笔
ctx.lineTo(150, 50);                                // 画直线
ctx.arc(100, 75, 50, 0, Math.PI * 2);               // 画圆弧（圆心x, 圆心y, 半径, 起始角, 结束角）
ctx.quadraticCurveTo(280, 150, 350, 250);           // 二次贝塞尔曲线
ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);   // 三次贝塞尔曲线

// === 文字渲染 ===
ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
ctx.fillText('Hello Canvas!', 50, 100);             // 实心文字
ctx.strokeText('Hello Canvas!', 50, 160);           // 空心文字

// === 图片绘制 ===
ctx.drawImage(image, 0, 0);                         // 原尺寸绘制
ctx.drawImage(image, 0, 0, 100, 80);                // 指定宽高
ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh); // 裁剪绘制（精灵图）

// === 渐变 ===
const grad = ctx.createLinearGradient(0, 0, 200, 0);  // 线性渐变
grad.addColorStop(0, '#ff0000');
grad.addColorStop(1, '#0000ff');
ctx.fillStyle = grad;

const rGrad = ctx.createRadialGradient(x, y, r1, x, y, r2); // 径向渐变

// === 变换与状态 ===
ctx.save();                  // 💾 保存当前绘图状态
ctx.translate(x, y);         // 平移坐标系
ctx.rotate(angle);           // 旋转（弧度）
ctx.scale(sx, sy);           // 缩放
ctx.restore();               // 🔄 恢复到上次 save 的状态
ctx.setTransform(a,b,c,d,e,f); // 直接设置变换矩阵

// === 合成与透明度 ===
ctx.globalAlpha = 0.5;                            // 全局透明度
ctx.globalCompositeOperation = 'lighter';          // 混合模式（屏幕叠加发光）
ctx.globalCompositeOperation = 'source-over';      // 恢复默认混合
```

> ⚠️ **关键提醒**：每次绘制新形状前，记得调用 `beginPath()`，否则新路径会叠加在旧路径上，导致意外样式覆盖。每次变换操作前调用 `save()`，绘制完后调用 `restore()`，避免变换状态污染后续绘制。

---

## 二、🎞️ 让画面动起来：帧动画与 requestAnimationFrame

### 2.1 🚫 为什么不用 setInterval？

很多人一开始会用 `setInterval` 来做动画：

```javascript
// ❌ 不推荐
setInterval(() => {
  // 更新 + 绘制
}, 16); // 约 60fps
```

但这有两个致命问题：
1. **时机不同步**：`setInterval` 的回调时机与显示器刷新率没有关联，可能出现画面撕裂。
2. **后台继续执行**：即使页面切到后台标签页，定时器依然在跑，浪费 CPU。

### 2.2 ✔️ requestAnimationFrame —— 与屏幕刷帧率同步

`requestAnimationFrame` 由浏览器调度，**在每次屏幕刷新前执行回调**，天然匹配显示器的刷新率（通常 60Hz）。页面不可见时自动暂停。

下面是一个简单的水平移动动画：

```javascript
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d');

let x = 20;
const speed = 3;

function animate() {
  // 🔹 第一步：清空整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔹 第二步：在新位置绘制矩形
  ctx.fillStyle = '#4299e1';
  ctx.fillRect(x, 20, 100, 80);

  // 🔹 第三步：更新位置
  x += speed;
  if (x > canvas.width) x = -100;

  // 🔹 递归请求下一帧
  requestAnimationFrame(animate);
}

animate(); // ▶️ 启动动画循环
```

这就是帧动画的核心三步骤：

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  clear   │ → │  draw    │ → │  update  │ → 下一帧...
└──────────┘    └──────────┘    └──────────┘
```

---

## 三、🎮 进阶实战：雷霆战机 —— Canvas 射击游戏

有了前面的基础，我们来看一个完整的实战项目——**"雷霆战机"**，一款由原生 Canvas 驱动的 2D 竖版射击小游戏。

> 📂 完整源码位于 [airplane/](airplane/) 目录。

### 3.1 📦 工程化搭建

项目使用 **Vite** 构建，模块化拆分：

```
airplane/
├── index.html          # 入口页面
├── package.json        # 依赖配置
└── src/
    ├── main.js         # 🕹️ 游戏主逻辑（状态机、输入、碰撞、游戏循环）
    ├── render.js       # 🖼️ 渲染模块（全部 Canvas 绘制函数）
    ├── audio.js        # 🔊 音效模块（Web Audio API）
    └── style.css       # 🎨 全屏布局、星空背景动画
```

### 3.2 📏 核心 Canvas 技巧：逻辑坐标系与自适应

游戏定义了一个**逻辑坐标系**（固定高度 750px），通过 `setTransform` 统一缩放到任意屏幕：

```javascript
const BASE_H = 750;
let GAME_W, GAME_H, viewScale;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  viewScale = canvas.height / BASE_H; // 缩放因子
  GAME_H = BASE_H;
  GAME_W = Math.ceil(canvas.width / viewScale);
}

// 渲染时，一行代码完成所有坐标映射
ctx.setTransform(viewScale, 0, 0, viewScale, sx, sy);
```

> 💡 `setTransform` 后面跟的 `sx, sy` 是屏幕震动偏移量——被击中时加入随机抖动，产生受击反馈。

### 3.3 🔁 游戏循环与状态机

游戏分为 MENU → PLAYING → GAMEOVER 三个状态，每帧执行：

```javascript
function gameLoop() {
  update();   // 🔄 更新：输入 → 移动 → 碰撞 → 粒子衰减
  render();   // 🖼️ 渲染：背景 → 对象 → 特效 → HUD
  requestAnimationFrame(gameLoop);
}
```

### 3.4 🪜 Canvas 分层渲染

渲染采用**从背景到前景**的分层策略，每一层用到不同的 Canvas API：

```javascript
function render() {
  ctx.setTransform(viewScale, 0, 0, viewScale, sx, sy);

  // 🌌 第 1 层：深空背景
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // 🌌 第 2 层：星云（径向渐变 createRadialGradient）
  drawNebula(ctx, nebulaBlobs);

  // 🌌 第 3 层：双层星空视差（远星慢、近星快）
  drawStars(ctx, farStars);
  drawStars(ctx, nearStars);

  // 🛸 第 4 层：游戏对象（战机、敌机、子弹）
  drawPlayer(ctx, player, frameCount, invincibleTimer);
  for (const e of enemies) drawEnemy(ctx, e);
  for (const b of bullets) drawBullet(ctx, b);

  // 💫 第 5 层：爆炸粒子 + Bloom 发光
  drawParticles(ctx, particles);
  drawBloomPass(ctx, player, particles, GAME_W, GAME_H);

  // 📊 第 6 层：HUD（分数、生命、连击） + 虚拟摇杆
  drawHUD(ctx, score, highScore, lives, combo, ...);
  drawVirtualControls(ctx, joystick, fireBtn, GAME_W, GAME_H);
}
```

**战机完全用 Canvas API 手绘**，不依赖任何图片资源——从能量护盾光晕（`createRadialGradient`）到金属机身渐变（`createLinearGradient`），再到翼刃发光（`shadowBlur` + `bezierCurveTo`），总计十余层细节层层叠加。

### 3.5 💥 碰撞检测与视觉反馈

**碰撞检测**使用 AABB（轴对齐包围盒）算法，本质是坐标值的纯数学运算：

```javascript
function hitTest(a, b) {
  return (
    a.x - a.w/2 < b.x + b.w/2 &&
    a.x + a.w/2 > b.x - b.w/2 &&
    a.y - a.h/2 < b.y + b.h/2 &&
    a.y + a.h/2 > b.y - b.h/2
  );
}
```

击中敌机后，Canvas 层面的反馈层层递进：

| 💢 反馈 | 🖼️ Canvas 实现 |
|---|---|
| 💥 爆炸粒子 | 四类粒子（内环慢速、外环爆发、碎片、火花环），每帧位置 += 速度，`life` 衰减至 0 后移除 |
| 🔢 浮动分数 | `fillText` 绘制文字，`globalAlpha` 渐隐，字号随 `life` 动态缩小 |
| 📳 屏幕震动 | `setTransform` 末尾两个参数加入随机偏移，`shakeIntensity` 每帧衰减 |
| 🌟 Bloom 发光 | `globalCompositeOperation = 'lighter'` 累加高亮像素 |

### 3.6 ✨ 游戏亮点一览

| ⚡ 功能 | 🧩 技术实现 |
|---|---|
| 📱 多端适配 | 键盘（方向键/WASD）+ 移动端虚拟摇杆 + Pointer Events |
| 🔊 音效 | Web Audio API 振荡器合成（无需加载音频文件） |
| 💾 存档 | `localStorage` 持久化最高分 |
| ✨ 无敌闪烁 | `globalAlpha` 周期性切换 |

---

## 四、📈 数据可视化：ECharts 快速上手 —— Canvas 的另一种打开方式

Canvas 的另一个重要应用领域是**数据可视化**。ECharts 是百度开源的高性能图表库，**底层基于 Canvas**渲染，封装了数十种常用图表类型。它的存在证明了 Canvas 不仅能做游戏，在数据密集型场景同样强大。

> 📂 完整源码位于 [echart/](echart/) 目录。

### 4.1 🚶 三步上手

```bash
npm install echarts
```

ECharts 的使用模式简洁到极致——**初始化实例 → 配置 option → setOption 渲染**：

```javascript
import * as echarts from 'echarts';

const myChart = echarts.init(document.getElementById('chart'));

myChart.setOption({
  title:   { text: '赖氏电商 — 2025年运动鞋月度销售' },
  tooltip: { trigger: 'axis' },
  xAxis:   { type: 'category', data: ['1月','2月','3月','4月','5月','6月',
                                      '7月','8月','9月','10月','11月','12月'] },
  yAxis:   { type: 'value' },
  series:  [{
    name: '销售额', type: 'bar',
    data: [2.83, 1.96, 3.45, 3.78, 4.12, 3.89,
           4.56, 4.91, 4.27, 3.64, 5.18, 6.35],
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#83bff6' },
        { offset: 1, color: '#188df0' },
      ]),
    },
  }],
});

window.addEventListener('resize', () => myChart.resize());
```

### 4.2 🔍 从 Canvas 视角看 ECharts

从 Canvas 开发者的角度，ECharts 本质上是把下面这些手工操作封装成了声明式配置：

| 🖐️ 手工 Canvas | ⚡ ECharts 替你做的事 |
|---|---|
| `fillRect` 逐个画柱体 | 根据 `series.data`，自动计算柱宽、间距、位置 |
| `createLinearGradient` 手动构造渐变 | `itemStyle.color` 配一个渐变对象即可 |
| `fillText` 画坐标轴标签 | `xAxis.data` / `yAxis` 自动布局 |
| 鼠标坐标换算 + 碰撞检测 | `tooltip` 开箱即用 |
| 监听 `resize` + 重绘 | `myChart.resize()` 一行搞定 |
| `requestAnimationFrame` 动画插值 | 内置平滑过渡动画 |
| 手动计算图例位置和水晶球交互 | `legend` / `dataZoom` 声明即用 |

> 💡 **一句话理解**：ECharts 就像 Canvas 的"高级封装层"——你描述想要什么，它帮你在 Canvas 上画出来。省掉了所有坐标计算、重绘调度和交互细节。

---

## 五、🏁 总结与思考

### 学习路径回顾

| 📍 阶段 | 📖 内容 | 🎯 核心收获 |
|---|---|---|
| ① Canvas 基础 | 标签、坐标系、`fillRect` / `arc` / `drawImage` 等核心 API | 理解画布与绘制上下文 |
| ② 帧动画 | `requestAnimationFrame` + `clear → draw → update` | 掌握动画循环机制 |
| ③ 游戏实战 | 雷霆战机（状态机、碰撞、粒子、音效） | 模块化架构、Canvas 分层渲染、视觉特效 |
| ④ 数据可视化 | ECharts + Vite 工程化开发 | 声明式图表配置、Canvas 的工程化封装 |

### Canvas vs DOM vs SVG

| 特性 | 🎨 Canvas | 🧱 DOM | ✒️ SVG |
|---|---|---|---|
| 渲染方式 | 像素级位图 | 元素树 | 矢量图形 |
| 大量对象性能 | ⭐⭐⭐ 优秀 | ⭐ 较差 | ⭐⭐ 中等 |
| 交互能力 | 需手动实现 | ⭐⭐⭐ 天然支持 | ⭐⭐⭐ 天然支持 |
| 适用场景 | 游戏、粒子、图像处理 | 常规 UI 界面 | 图标、可缩放图形 |

### 🔭 技术展望

随着 AI 时代的到来，Canvas 正在迎来新的爆发点：

- **🤖 AI 游戏**：结合物理大模型，Canvas 作为渲染层生成实时画面
- **🌐 WebGL / Three.js**：`getContext('webgl')` 打开三维世界大门，浏览器 3D 游戏与元宇宙成为可能
- **🖼️ 生成式艺术**：AI 模型输出绘图指令，Canvas 实时呈现

> 💡 **一句话总结**：Canvas 是一张白纸，JS 是你的画笔，`requestAnimationFrame` 是时间的节拍器——三者合一，就能在浏览器里创造出无限可能。

---

*📁 代码示例来源于实际项目，完整源码可参考 [airplane/](airplane/) 和 [echart/](echart/) 目录。*
