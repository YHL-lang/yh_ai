# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

雷霆战机 — 原生 Canvas 2D 射击小游戏。纯 JavaScript（无框架），Vite 构建，单文件架构。

## 常用命令

```bash
npm run dev       # 启动开发服务器（Vite，默认 localhost:5173）
npm run build     # 生产构建 → dist/
npm run preview   # 预览生产构建
```

无测试套件。

## 架构

整个游戏逻辑位于 `src/main.js`（~945 行），按区块组织：

| 区块 | 行号范围 | 职责 |
|------|---------|------|
| Canvas 初始化 + resize | 1-45 | 动态 canvas 尺寸、DPR 适配、逻辑坐标缩放 |
| 常量 + 输入状态 | 47-110 | 速度/冷却常量、键盘 + 触摸/指针输入 |
| 音频 | 125-150 | Web Audio API 振荡器音效（`sfxShoot`/`sfxExplosion`/`sfxGameOver`） |
| 游戏状态 | 152-242 | `player`、`bullets[]`、`enemies[]`、`particles[]`、生成/重置函数 |
| 绘制函数 | 244-728 | `drawPlayer`（复杂战机）、`drawEnemy`、`drawBullet`、`drawParticles`、`drawHUD`、`drawGameOver`、`drawStars` |
| 更新逻辑 | 731-897 | `updateStars`/`updatePlayer`/`updateBullets`/`updateEnemies`/`updateCollisions`/`updateParticles`/`update` |
| 渲染 + 游戏循环 | 899-944 | `render`（`ctx.setTransform` 缩放 → 各 draw 函数）、`gameLoop`（`requestAnimationFrame`） |

### 关键设计决策

- **逻辑坐标固定高度 750px**（`BASE_H`），通过 `viewScale = canvas.height / BASE_H` 映射到任意屏幕。所有游戏内坐标使用逻辑坐标系，绘制前通过 `ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0)` 缩放。
- **碰撞检测**：AABB，以物体中心为 (x, y) 坐标（`hitTest` 函数，行 178-189）。
- **难度递增**：敌人生成间隔 `ENEMY_SPAWN_RATE - floor(score/500)*5`，最低 15 帧。分数 >1000 和 >2500 时有概率额外生成敌人。
- **移动端适配**：触摸拖拽移动玩家 + 自动射击；`touch-action: none` 防止浏览器手势冲突。
- **音效需要在用户交互后初始化**（`initAudio` 在首次点击/按键时创建 `AudioContext`）。

### 文件结构

```
airplane/
├── index.html        # 入口，lang="zh-CN"，挂载 #app
├── package.json      # Vite 8.x，type: "module"
├── public/           # 空目录（无静态资源）
└── src/
    ├── main.js       # 全部游戏代码
    └── style.css     # 全屏 canvas 布局、禁用选择/缩放
```
