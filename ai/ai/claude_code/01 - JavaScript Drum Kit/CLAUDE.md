# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Wes Bos JavaScript30 鼓机项目 — 纯 HTML/CSS/JS 应用，按下键盘按键即可播放鼓声。无构建工具，无依赖。

## 文件说明

- `index-START.html` — 教学起始文件（`<script>` 标签为空）
- `index-FINISHED.html` — 完整实现，用浏览器打开这个文件
- `style.css` — 所有样式，包括 `.playing` 视觉反馈类
- `sounds/` — 9 个 WAV 鼓声音采样
- `background.jpg` — 背景图片

## 如何运行

直接用浏览器打开 `index-FINISHED.html`。无需服务器或构建步骤。

## 架构

**声音触发** 通过可见的 `.key` div 和隐藏的 `<audio>` 元素上的 `data-key` 属性（键盘事件的 `keyCode` 值）来匹配。`window` 上的单个 `keydown` 监听器驱动整个交互：

1. `playSound(e)` — 将 `e.keyCode` 匹配到 `<audio data-key="...">`，重置 `audio.currentTime = 0`（无需等待音频播放完毕即可重复触发），调用 `audio.play()`，并为对应的 `.key` div 添加 `.playing` CSS 类
2. `removeTransition(e)` — 监听每个 `.key` 元素的 `transitionend` 事件，当 `transform` 过渡结束时移除 `.playing` 类

**视觉反馈** — `.playing` 类将按键放大（`transform: scale(1.1)`）并添加黄色边框/发光效果（`border-color: #ffc600`、`box-shadow: 0 0 1rem #ffc600`），配合 0.07s 的 CSS 过渡动画。
