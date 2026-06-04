/**
 * Demo 项目 - 主逻辑入口
 */

(function () {
  'use strict';

  // ==========================================
  // DOM 元素
  // ==========================================
  const demoBtn = document.getElementById('demo-btn');
  const demoOutput = document.getElementById('demo-output');

  // ==========================================
  // 工具函数
  // ==========================================

  /**
   * 获取当前时间字符串
   */
  function getTimeString() {
    return new Date().toLocaleTimeString('zh-CN');
  }

  /**
   * 设置输出文本
   */
  function setOutput(text) {
    if (demoOutput) {
      demoOutput.textContent = text;
    }
  }

  // ==========================================
  // 事件绑定
  // ==========================================

  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      setOutput(`[${getTimeString()}] 按钮被点击了！`);
    });
  }

  // ==========================================
  // 页面初始化
  // ==========================================
  console.log('Demo 项目已就绪');
})();
