// ============================================================
//  渲染模块 — 所有 Canvas 绘制函数
//  每个函数的第一个参数均为 CanvasRenderingContext2D
// ============================================================

// ---------- 工具 ----------

/** 兼容低版本浏览器的圆角矩形 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
}

// ---------- 背景 ----------

export function drawStars(ctx, stars) {
  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawNebula(ctx, blobs) {
  for (const b of blobs) {
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
    grad.addColorStop(0, b.color)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ---------- 玩家战机 ----------

export function drawPlayer(ctx, player, frameCount, invincibleTimer = 0) {
  const { x, y, w, h } = player
  const t = frameCount * 0.12
  const pulse = Math.sin(t * 2.5) * 0.3 + 0.7

  // 无敌闪烁
  if (invincibleTimer > 0 && Math.floor(invincibleTimer / 6) % 2 === 0) {
    ctx.globalAlpha = 0.35
  }

  ctx.save()
  ctx.translate(x, y)

  // ======== 0. 外层能量护盾光晕 ========
  const shieldGrad = ctx.createRadialGradient(0, -h * 0.02, h * 0.2, 0, -h * 0.02, h * 0.95)
  shieldGrad.addColorStop(0, `rgba(0, 220, 255, ${0.08 + pulse * 0.06})`)
  shieldGrad.addColorStop(0.5, 'rgba(0, 140, 255, 0.03)')
  shieldGrad.addColorStop(1, 'rgba(0, 60, 200, 0)')
  ctx.fillStyle = shieldGrad
  ctx.beginPath()
  ctx.arc(0, -h * 0.02, h * 0.95, 0, Math.PI * 2)
  ctx.fill()

  // ======== 1. 三发动机尾焰 ========
  const engs = [
    { ex: -w * 0.16, ey: h * 0.32 },
    { ex: 0,          ey: h * 0.38 },
    { ex: w * 0.16,  ey: h * 0.32 },
  ]
  for (const { ex, ey } of engs) {
    const flicker = Math.sin(t * 5.3 + ex * 10) * 0.3 + Math.sin(t * 8.7 + ex * 15) * 0.2 + 0.5
    const fl = h * 0.55 * flicker
    const fw = w * 0.1 * flicker

    ctx.save()
    ctx.translate(ex, ey)

    // 外焰 - 红色扩散
    const gOuter = ctx.createLinearGradient(0, 0, 0, fl)
    gOuter.addColorStop(0, '#ff3300')
    gOuter.addColorStop(0.15, '#ff5500')
    gOuter.addColorStop(0.5, '#ff660044')
    gOuter.addColorStop(1, 'transparent')
    ctx.fillStyle = gOuter
    ctx.beginPath()
    ctx.moveTo(-fw, 0)
    ctx.quadraticCurveTo(-fw * 1.5, fl * 0.45, 0, fl)
    ctx.quadraticCurveTo(fw * 1.5, fl * 0.45, fw, 0)
    ctx.closePath()
    ctx.fill()

    // 中焰 - 橙色
    const gMid = ctx.createLinearGradient(0, 0, 0, fl * 0.65)
    gMid.addColorStop(0, '#ff8800')
    gMid.addColorStop(0.25, '#ffaa00')
    gMid.addColorStop(1, 'transparent')
    ctx.fillStyle = gMid
    ctx.beginPath()
    ctx.moveTo(-fw * 0.55, 0)
    ctx.quadraticCurveTo(-fw * 0.7, fl * 0.3, 0, fl * 0.65)
    ctx.quadraticCurveTo(fw * 0.7, fl * 0.3, fw * 0.55, 0)
    ctx.closePath()
    ctx.fill()

    // 内焰 - 白热核心
    const gInner = ctx.createLinearGradient(0, 0, 0, fl * 0.35)
    gInner.addColorStop(0, '#ffffff')
    gInner.addColorStop(0.15, '#ffffcc')
    gInner.addColorStop(0.5, '#ffcc00')
    gInner.addColorStop(1, 'transparent')
    ctx.fillStyle = gInner
    ctx.beginPath()
    ctx.moveTo(-fw * 0.25, 0)
    ctx.quadraticCurveTo(-fw * 0.3, fl * 0.15, 0, fl * 0.35)
    ctx.quadraticCurveTo(fw * 0.3, fl * 0.15, fw * 0.25, 0)
    ctx.closePath()
    ctx.fill()

    // 喷口强光
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#ffaa00'
    ctx.shadowBlur = fw * 2
    ctx.beginPath()
    ctx.arc(0, 0, fw * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.restore()
  }

  // ======== 2. 机身主体 - 暗黑金属渐变 ========
  const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
  bodyGrad.addColorStop(0,    '#e8f4ff')
  bodyGrad.addColorStop(0.08, '#b0d0e8')
  bodyGrad.addColorStop(0.2,  '#507898')
  bodyGrad.addColorStop(0.4,  '#1e3a50')
  bodyGrad.addColorStop(0.6,  '#0e1e30')
  bodyGrad.addColorStop(0.8,  '#081520')
  bodyGrad.addColorStop(1,    '#040c14')
  ctx.fillStyle = bodyGrad

  ctx.beginPath()
  ctx.moveTo(0, -h * 0.5)
  ctx.lineTo(w * 0.08, -h * 0.38)
  ctx.lineTo(w * 0.12, -h * 0.18)
  ctx.bezierCurveTo(w * 0.22, -h * 0.08, w * 0.38, h * 0.1, w * 0.44, h * 0.34)
  ctx.lineTo(w * 0.36, h * 0.42)
  ctx.lineTo(w * 0.22, h * 0.38)
  ctx.lineTo(w * 0.08, h * 0.35)
  ctx.lineTo(-w * 0.08, h * 0.35)
  ctx.lineTo(-w * 0.22, h * 0.38)
  ctx.lineTo(-w * 0.36, h * 0.42)
  ctx.lineTo(-w * 0.44, h * 0.34)
  ctx.bezierCurveTo(-w * 0.38, h * 0.1, -w * 0.22, -h * 0.08, -w * 0.12, -h * 0.18)
  ctx.lineTo(-w * 0.08, -h * 0.38)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = `rgba(0, 210, 255, ${0.5 + pulse * 0.3})`
  ctx.lineWidth = 1.5
  ctx.shadowColor = '#00ccff'
  ctx.shadowBlur = 8
  ctx.stroke()
  ctx.shadowBlur = 0

  // ======== 3. 装甲板分划线 ========
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.moveTo(-w * 0.38, h * 0.08)
  ctx.lineTo(w * 0.38, h * 0.08)
  ctx.moveTo(-w * 0.34, -h * 0.05)
  ctx.lineTo(w * 0.34, -h * 0.05)
  ctx.moveTo(-w * 0.22, -h * 0.22)
  ctx.lineTo(w * 0.22, -h * 0.22)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w * 0.05, -h * 0.28)
  ctx.lineTo(w * 0.25, h * 0.25)
  ctx.moveTo(-w * 0.05, -h * 0.28)
  ctx.lineTo(-w * 0.25, h * 0.25)
  ctx.stroke()

  // ======== 4. 能量翼刃 ========
  for (const side of [-1, 1]) {
    ctx.strokeStyle = `rgba(0, 220, 255, ${0.6 + pulse * 0.4})`
    ctx.lineWidth = 3
    ctx.shadowColor = '#00ddff'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.moveTo(side * w * 0.1, -h * 0.15)
    ctx.lineTo(side * w * 0.38, h * 0.12)
    ctx.lineTo(side * w * 0.42, h * 0.2)
    ctx.stroke()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 0.8
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(side * w * 0.1, -h * 0.15)
    ctx.lineTo(side * w * 0.38, h * 0.12)
    ctx.stroke()
  }
  ctx.shadowBlur = 0

  // ======== 5. 机头能量集束器 ========
  const noseGlow = ctx.createRadialGradient(0, -h * 0.46, 0, 0, -h * 0.46, w * 0.18)
  noseGlow.addColorStop(0, 'rgba(200, 240, 255, 0.9)')
  noseGlow.addColorStop(0.3, 'rgba(0, 200, 255, 0.5)')
  noseGlow.addColorStop(0.7, 'rgba(0, 100, 255, 0.1)')
  noseGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = noseGlow
  ctx.beginPath()
  ctx.arc(0, -h * 0.46, w * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#88ddff'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.arc(0, -h * 0.47, w * 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // ======== 6. 进气口 ========
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#020810'
    ctx.beginPath()
    ctx.moveTo(side * w * 0.16, h * 0.0)
    ctx.lineTo(side * w * 0.3, h * 0.2)
    ctx.lineTo(side * w * 0.22, h * 0.19)
    ctx.lineTo(side * w * 0.11, h * 0.02)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.4 + pulse * 0.3})`
    ctx.lineWidth = 1
    ctx.shadowColor = '#0088ff'
    ctx.shadowBlur = 4
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // ======== 7. 发光座舱 ========
  const glassGrad = ctx.createLinearGradient(0, -h * 0.36, 0, -h * 0.02)
  glassGrad.addColorStop(0, '#e0f8ff')
  glassGrad.addColorStop(0.2, '#40d8ff')
  glassGrad.addColorStop(0.5, '#1088cc')
  glassGrad.addColorStop(1, '#043058')
  ctx.fillStyle = glassGrad
  ctx.beginPath()
  ctx.moveTo(0, -h * 0.38)
  ctx.bezierCurveTo(w * 0.09, -h * 0.32, w * 0.12, -h * 0.16, w * 0.07, -h * 0.04)
  ctx.lineTo(-w * 0.07, -h * 0.04)
  ctx.bezierCurveTo(-w * 0.12, -h * 0.16, -w * 0.09, -h * 0.32, 0, -h * 0.38)
  ctx.fill()
  ctx.fillStyle = `rgba(255,255,255,${0.35 + pulse * 0.2})`
  ctx.beginPath()
  ctx.ellipse(w * 0.015, -h * 0.27, w * 0.035, h * 0.06, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#88ddff'
  ctx.lineWidth = 1.2
  ctx.shadowColor = '#44bbff'
  ctx.shadowBlur = 5
  ctx.stroke()
  ctx.shadowBlur = 0

  // ======== 8. 机身能量节点（脊柱发光）========
  for (let i = 0; i < 3; i++) {
    const ny = -h * 0.1 + i * h * 0.16
    const na = 0.3 + Math.sin(t * 3 + i) * 0.2
    const ng = ctx.createRadialGradient(0, ny, 0, 0, ny, w * 0.06)
    ng.addColorStop(0, `rgba(0, 220, 255, ${na})`)
    ng.addColorStop(1, 'transparent')
    ctx.fillStyle = ng
    ctx.beginPath()
    ctx.arc(0, ny, w * 0.06, 0, Math.PI * 2)
    ctx.fill()
  }

  // ======== 9. 翼尖能量灯 ========
  for (const side of [-1, 1]) {
    const lx = side * w * 0.42
    const ly = h * 0.16
    const lp = Math.sin(t * 4 + side) * 0.35 + 0.65
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.14)
    lg.addColorStop(0, `rgba(0, 240, 255, ${0.7 * lp})`)
    lg.addColorStop(0.5, 'rgba(0, 160, 255, 0.2)')
    lg.addColorStop(1, 'transparent')
    ctx.fillStyle = lg
    ctx.beginPath()
    ctx.arc(lx, ly, w * 0.14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#00eeff'
    ctx.shadowBlur = 5
    ctx.beginPath()
    ctx.arc(lx, ly, w * 0.04, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }

  // ======== 10. 武器挂架 + 导弹 ========
  for (const side of [-1, 1]) {
    const px = side * w * 0.25
    const py = h * 0.16
    ctx.fillStyle = '#334'
    ctx.fillRect(px - 1, py - 3, 2, 8)
    const mg = ctx.createLinearGradient(0, py + 4, 0, py + 18)
    mg.addColorStop(0, '#888')
    mg.addColorStop(0.5, '#444')
    mg.addColorStop(1, '#111')
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.moveTo(side * w * 0.22, py + 4)
    ctx.lineTo(side * w * 0.28, py + 4)
    ctx.lineTo(side * w * 0.26, py + 16)
    ctx.lineTo(side * w * 0.24, py + 16)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ff3333'
    ctx.shadowColor = '#ff0000'
    ctx.shadowBlur = 3
    ctx.beginPath()
    ctx.arc(side * w * 0.25, py + 4.5, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath()
    ctx.moveTo(side * w * 0.23, py + 16)
    ctx.lineTo(side * w * 0.27, py + 16)
    ctx.lineTo(side * w * 0.25, py + 22 + Math.random() * 3)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

// ---------- 敌机 ----------

export function drawEnemy(ctx, enemy) {
  ctx.save()
  ctx.translate(enemy.x, enemy.y)

  const s = enemy.w / 2

  const glow = ctx.createRadialGradient(0, s * 0.1, s * 0.1, 0, s * 0.1, s * 0.95)
  glow.addColorStop(0, 'rgba(255, 60, 20, 0.3)')
  glow.addColorStop(0.6, 'rgba(200, 30, 10, 0.1)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(0, s * 0.1, s * 0.95, 0, Math.PI * 2)
  ctx.fill()

  const grad = ctx.createLinearGradient(0, s, 0, -s)
  grad.addColorStop(0, '#991111')
  grad.addColorStop(0.25, '#dd2222')
  grad.addColorStop(0.55, '#ee4444')
  grad.addColorStop(0.8, '#aa1111')
  grad.addColorStop(1, '#440000')
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(0, s)
  ctx.quadraticCurveTo(s * 0.75, s * 0.35, s * 0.9, -s * 0.25)
  ctx.quadraticCurveTo(s * 0.55, -s * 0.35, s * 0.4, -s * 0.9)
  ctx.lineTo(0, -s * 0.55)
  ctx.lineTo(-s * 0.4, -s * 0.9)
  ctx.quadraticCurveTo(-s * 0.55, -s * 0.35, -s * 0.9, -s * 0.25)
  ctx.quadraticCurveTo(-s * 0.75, s * 0.35, 0, s)
  ctx.fill()

  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(s * 0.2, -s * 0.3)
  ctx.lineTo(s * 0.45, s * 0.25)
  ctx.moveTo(-s * 0.2, -s * 0.3)
  ctx.lineTo(-s * 0.45, s * 0.25)
  ctx.moveTo(0, -s * 0.2)
  ctx.lineTo(0, s * 0.4)
  ctx.stroke()

  const coreGlow = ctx.createRadialGradient(0, s * 0.05, 0, 0, s * 0.05, s * 0.35)
  coreGlow.addColorStop(0, 'rgba(255, 255, 100, 0.8)')
  coreGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.3)')
  coreGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = coreGlow
  ctx.beginPath()
  ctx.arc(0, s * 0.05, s * 0.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffcc'
  ctx.beginPath()
  ctx.arc(0, s * 0.05, s * 0.12, 0, Math.PI * 2)
  ctx.fill()

  for (const side of [-1, 1]) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(side * s * 0.2, -s * 0.35, s * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(side * s * 0.2, -s * 0.35, s * 0.05, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// ---------- 子弹 ----------

export function drawBullet(ctx, bullet) {
  ctx.save()
  ctx.translate(bullet.x, bullet.y)

  const { w: bW, h: bH } = bullet

  // 拖尾光效
  const trail = ctx.createLinearGradient(0, bH * 0.3, 0, -bH * 1.5)
  trail.addColorStop(0, 'rgba(255, 180, 40, 0.6)')
  trail.addColorStop(0.3, 'rgba(255, 200, 80, 0.25)')
  trail.addColorStop(0.6, 'rgba(255, 220, 120, 0.06)')
  trail.addColorStop(1, 'transparent')
  ctx.fillStyle = trail
  ctx.fillRect(-bW * 1.5, -bH * 1.5, bW * 3, bH * 2)

  // 次级宽拖尾
  const wideTrail = ctx.createLinearGradient(0, bH * 0.1, 0, -bH * 0.9)
  wideTrail.addColorStop(0, 'rgba(255, 140, 30, 0.25)')
  wideTrail.addColorStop(1, 'transparent')
  ctx.fillStyle = wideTrail
  ctx.fillRect(-bW * 3, -bH * 0.9, bW * 6, bH * 1.2)

  // 外光晕
  const glow = ctx.createLinearGradient(0, -bH / 2, 0, bH / 2)
  glow.addColorStop(0, 'rgba(255, 255, 200, 0)')
  glow.addColorStop(0.5, 'rgba(255, 255, 120, 0.45)')
  glow.addColorStop(1, 'rgba(255, 160, 30, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(-bW * 2, -bH / 2, bW * 4, bH)

  // 核心弹体
  const core = ctx.createLinearGradient(0, -bH / 2, 0, bH / 2)
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.2, '#ffffcc')
  core.addColorStop(0.5, '#ffcc44')
  core.addColorStop(1, '#ff7700')
  ctx.fillStyle = core
  ctx.fillRect(-bW / 2, -bH / 2, bW, bH)

  // 弹头亮斑
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, -bH * 0.35, bW * 0.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// ---------- 粒子 ----------

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.fillStyle = `rgba(${p.color}, ${p.life})`
    ctx.beginPath()
    if (p.shape === 'rect') {
      const s = p.radius * p.life
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s * 1.6)
    } else {
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2)
    }
    ctx.fill()
  }
}

// ---------- 浮动文字 ----------

export function drawFloatingTexts(ctx, floatingTexts) {
  for (const ft of floatingTexts) {
    ctx.save()
    ctx.globalAlpha = ft.life
    ctx.fillStyle = ft.color
    ctx.font = `bold ${14 + ft.life * 8}px "Orbitron", "Courier New", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ft.text, ft.x, ft.y)
    ctx.restore()
  }
}

// ---------- HUD ----------

export function drawHUD(ctx, score, highScore, lives, combo, comboTimer, frameCount, GAME_W) {
  // --- 计分板（左上）---
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(10, 8, 180, 52)

  ctx.strokeStyle = 'rgba(0, 200, 255, 0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(10, 8, 180, 52)

  ctx.fillStyle = 'rgba(0, 200, 255, 0.85)'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('SCORE', 22, 14)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(String(score), 22, 28)

  if (highScore > 0) {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.75)'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('BEST ' + highScore, 178, 16)
    ctx.textAlign = 'left'
  }

  // --- 生命（右上）---
  for (let i = 0; i < 3; i++) {
    const hx = GAME_W - 30 - i * 36
    ctx.fillStyle = i < lives ? '#ff3366' : 'rgba(255,255,255,0.15)'
    ctx.font = '18px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(i < lives ? '♥' : '♡', hx, 14)
  }

  // --- 连击（顶部居中）---
  if (comboTimer > 0 && combo > 1) {
    const alpha = Math.min(1, comboTimer / 30)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = combo > 10 ? '#ff4444' : combo > 5 ? '#ffdd00' : '#ffffff'
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('COMBO x' + combo, GAME_W / 2, 14)
    ctx.restore()
  }
}

function drawHeart(ctx, x, y, filled) {
  ctx.save()
  ctx.translate(x, y)
  const s = 8
  ctx.beginPath()
  ctx.moveTo(0, s * 0.6)
  ctx.bezierCurveTo(-s, -s * 0.3, -s, s * 0.2, 0, s * 1.5)
  ctx.bezierCurveTo(s, s * 0.2, s, -s * 0.3, 0, s * 0.6)
  ctx.closePath()
  if (filled) {
    const g = ctx.createLinearGradient(0, -s, 0, s * 1.5)
    g.addColorStop(0, '#ff4466')
    g.addColorStop(1, '#cc0033')
    ctx.fillStyle = g
    ctx.fill()
    ctx.shadowColor = '#ff3366'
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.shadowBlur = 0
  }
  ctx.strokeStyle = filled ? '#ff6688' : 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
}

// ---------- 菜单 ----------

export function drawMenu(ctx, GAME_W, GAME_H, frameCount, highScore) {
  // 半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, 0, GAME_W, GAME_H)

  // 标题
  const titleScale = 1 + Math.sin(frameCount * 0.03) * 0.04
  ctx.save()
  ctx.translate(GAME_W / 2, GAME_H * 0.26)
  ctx.scale(titleScale, titleScale)

  ctx.fillStyle = '#00ddff'
  ctx.font = 'bold 46px "Orbitron", "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#00aaff'
  ctx.shadowBlur = 20
  ctx.fillText('雷霆战机', 0, 0)
  ctx.shadowBlur = 0

  ctx.restore()

  // 副标题
  ctx.fillStyle = 'rgba(150, 220, 255, 0.7)'
  ctx.font = '14px "Orbitron", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('THUNDER FIGHTER', GAME_W / 2, GAME_H * 0.35)

  // 开始按钮
  const btnW = 200, btnH = 54
  const btnX = GAME_W / 2 - btnW / 2
  const btnY = GAME_H * 0.44
  const btnPulse = Math.sin(frameCount * 0.04) * 0.5 + 0.5

  const btnGrad = ctx.createLinearGradient(0, btnY, 0, btnY + btnH)
  btnGrad.addColorStop(0, '#00aaff')
  btnGrad.addColorStop(1, '#0055cc')
  ctx.fillStyle = btnGrad
  ctx.shadowColor = `rgba(0, 170, 255, ${0.4 + btnPulse * 0.4})`
  ctx.shadowBlur = 20
  roundRect(ctx, btnX, btnY, btnW, btnH, 12)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px "Orbitron", monospace'
  ctx.fillText('开 始 游 戏', GAME_W / 2, btnY + btnH / 2)

  // 操作提示（延迟显示）
  if (frameCount > 90) {
    const hintAlpha = Math.min(1, (frameCount - 90) / 60)
    ctx.fillStyle = `rgba(180, 200, 220, ${hintAlpha * 0.7})`
    ctx.font = '12px "Orbitron", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('键盘: 方向键 / WASD 移动 | 空格 射击', GAME_W / 2, GAME_H * 0.62)
    ctx.fillText('移动端: 左侧摇杆移动 | 右侧按钮射击', GAME_W / 2, GAME_H * 0.66)

    ctx.fillStyle = `rgba(255, 255, 255, ${hintAlpha * 0.5})`
    ctx.font = '11px "Orbitron", monospace'
    ctx.fillText('按空格键或点击按钮开始', GAME_W / 2, GAME_H * 0.74)
  }

  // 最高分
  if (highScore > 0) {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.8)'
    ctx.font = '13px "Orbitron", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`最高分: ${highScore}`, GAME_W / 2, GAME_H * 0.82)
  }
}

// ---------- Game Over ----------

export function drawGameOver(ctx, score, highScore, isNewHigh, gameOverTimer, frameCount, GAME_W, GAME_H) {
  // 暗色遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  ctx.fillRect(0, 0, GAME_W, GAME_H)

  // GAME OVER 标题
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ff2222'
  ctx.font = 'bold 50px "Orbitron", "Courier New", monospace'
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 15
  ctx.fillText('GAME OVER', GAME_W / 2, GAME_H / 2 - 50)
  ctx.shadowBlur = 0

  // 最终分数
  ctx.fillStyle = '#ffffff'
  ctx.font = '22px "Orbitron", monospace'
  ctx.fillText(`最终得分: ${score}`, GAME_W / 2, GAME_H / 2 + 5)

  // 新纪录
  if (isNewHigh && gameOverTimer > 20) {
    const newAlpha = Math.sin(frameCount * 0.08) * 0.4 + 0.6
    ctx.fillStyle = `rgba(255, 215, 0, ${newAlpha})`
    ctx.font = 'bold 18px "Orbitron", monospace'
    ctx.shadowColor = '#ffaa00'
    ctx.shadowBlur = 12
    ctx.fillText('★ NEW HIGH SCORE! ★', GAME_W / 2, GAME_H / 2 + 40)
    ctx.shadowBlur = 0
  }

  // 最高分
  if (highScore > 0 && !isNewHigh) {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.8)'
    ctx.font = '13px "Orbitron", monospace'
    ctx.fillText(`最高分: ${highScore}`, GAME_W / 2, GAME_H / 2 + 40)
  }

  // 重新开始提示
  if (gameOverTimer > 30) {
    const alpha = Math.sin(frameCount * 0.06) * 0.5 + 0.5
    ctx.fillStyle = `rgba(255, 204, 0, ${alpha})`
    ctx.font = '14px "Orbitron", monospace'
    ctx.fillText('按 空格键 或 点击屏幕 重新开始', GAME_W / 2, GAME_H / 2 + 80)
  }
}

// ---------- 虚拟控件（移动端）----------

export function drawVirtualControls(ctx, joystick, fireBtn, GAME_W, GAME_H) {
  // 摇杆
  const jcx = GAME_W * 0.17, jcy = GAME_H * 0.75
  ctx.save()
  // 底座
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(jcx, jcy, 50, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // 内圈
  ctx.beginPath()
  ctx.arc(jcx, jcy, 36, 0, Math.PI * 2)
  ctx.stroke()
  // 拇指
  const tx = jcx + joystick.dir.x * 30
  const ty = jcy + joystick.dir.y * 30
  const thumbAlpha = joystick.active ? 0.55 : 0.2
  const thumbGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 18)
  thumbGrad.addColorStop(0, `rgba(0, 220, 255, ${thumbAlpha})`)
  thumbGrad.addColorStop(1, `rgba(0, 120, 255, ${thumbAlpha * 0.5})`)
  ctx.fillStyle = thumbGrad
  ctx.beginPath()
  ctx.arc(tx, ty, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = `rgba(255,255,255,${thumbAlpha + 0.15})`
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 射击按钮
  const fcx = GAME_W * 0.83, fcy = GAME_H * 0.75
  const fireScale = fireBtn.active ? 1.1 : 1
  ctx.save()
  ctx.translate(fcx, fcy)
  ctx.scale(fireScale, fireScale)
  // 外环
  const fba = fireBtn.active ? 0.5 : 0.15
  ctx.strokeStyle = `rgba(255, 80, 30, ${fba})`
  ctx.fillStyle = `rgba(255, 40, 10, ${fba * 0.3})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 36, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // 内圈
  ctx.fillStyle = `rgba(255, 120, 50, ${fba * 0.6})`
  ctx.beginPath()
  ctx.arc(0, 0, 22, 0, Math.PI * 2)
  ctx.fill()
  // 十字准星
  ctx.strokeStyle = `rgba(255, 255, 255, ${fba + 0.2})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -10); ctx.lineTo(0, 10)
  ctx.moveTo(-10, 0); ctx.lineTo(10, 0)
  ctx.stroke()
  ctx.restore()
}

// ---------- 发光增强（bloom 模拟）----------

export function drawBloomPass(ctx, player, particles, GAME_W, GAME_H) {
  // 使用 lighter 混合模式对亮点元素增强发光
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  // 引擎喷口光晕
  const engs = [
    { ex: 0, ey: player.h * 0.38 + player.y },
  ]
  for (const { ex, ey } of engs) {
    const gx = player.x + ex
    const gy = player.y + ey
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 28)
    grad.addColorStop(0, 'rgba(255, 150, 30, 0.12)')
    grad.addColorStop(0.5, 'rgba(255, 100, 20, 0.05)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(gx, gy, 28, 0, Math.PI * 2)
    ctx.fill()
  }

  // 翼尖光晕
  for (const side of [-1, 1]) {
    const lx = player.x + side * player.w * 0.42
    const ly = player.y + player.h * 0.16
    const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 16)
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.1)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(lx, ly, 16, 0, Math.PI * 2)
    ctx.fill()
  }

  // 爆炸亮点增强
  for (const p of particles) {
    if (p.life > 0.6 && p.radius > 2) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
      grad.addColorStop(0, `rgba(${p.color}, ${p.life * 0.15})`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}
