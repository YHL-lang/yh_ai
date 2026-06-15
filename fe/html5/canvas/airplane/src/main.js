// ============================================================
//  雷霆战机 — 原生 Canvas 射击小游戏 v2.0
//  键盘：方向键/WASD 移动 | 空格射击
//  移动端：左侧摇杆移动 | 右侧按钮射击
// ============================================================

import './style.css'
import { initAudio, sfxShoot, sfxExplosion, sfxGameOver, sfxHit, sfxCombo } from './audio.js'
import {
  drawStars, drawNebula, drawPlayer, drawEnemy, drawBullet,
  drawParticles, drawFloatingTexts, drawHUD, drawMenu, drawGameOver,
  drawVirtualControls, drawBloomPass,
} from './render.js'

// ---------- Canvas 初始化 ----------
const app = document.querySelector('#app')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
app.appendChild(canvas)

const BASE_H = 750
let GAME_W, GAME_H, viewScale

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'

  viewScale = canvas.height / BASE_H
  GAME_H = BASE_H
  GAME_W = Math.ceil(canvas.width / viewScale)

  // 初始化背景层
  initNebula()
  initStarLayers()

  // 修正 / 初始化玩家位置
  if (isNaN(player.x) || player.x > GAME_W - player.w / 2) player.x = GAME_W / 2
  if (isNaN(player.y) || player.y > GAME_H - player.h / 2) player.y = GAME_H - 100

  updateCanvasRect()
}

// ---------- 常量 ----------
const PLAYER_SPEED = 5
const BULLET_SPEED = 9
const ENEMY_BASE_SPEED = 2
const BULLET_COOLDOWN = 8
const ENEMY_SPAWN_RATE = 50
const MAX_LIVES = 3
const INVINCIBLE_DURATION = 90
const COMBO_TIMEOUT = 90

// ---------- 游戏状态 ----------
const STATE = { MENU: 'menu', PLAYING: 'playing', GAMEOVER: 'gameover' }
let gameState = STATE.MENU

let score = 0
let highScore = loadHighScore()
let lives = MAX_LIVES
let invincibleTimer = 0
let combo = 0
let comboTimer = 0
let maxCombo = 0
let gameOverTimer = 0
let frameCount = 0

const player = {
  x: GAME_W / 2,
  y: GAME_H - 100,
  w: 56,
  h: 72,
  speed: PLAYER_SPEED,
}

let bullets = []
let enemies = []
let particles = []
let floatingTexts = []
let bulletCooldown = 0
let enemySpawnTimer = 0

// ---------- 视觉特效状态 ----------
let shakeIntensity = 0
let shakeDuration = 0

// 背景层
let nebulaBlobs = []
let farStars = []
let nearStars = []

// ---------- 输入状态 ----------
const keys = {}

window.addEventListener('keydown', e => {
  keys[e.key] = true
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault()
  }
})

window.addEventListener('keyup', e => {
  keys[e.key] = false
})

// ---------- 触摸 / 指针控制 ----------
let pointerActive = false
let pointerX = 0
let pointerY = 0
let canvasRect = null

// 虚拟控件
let joystickActive = false
let joystickDir = { x: 0, y: 0 }
let joystickTouchId = null
let fireBtnActive = false
let fireBtnTouchId = null

function updateCanvasRect() {
  canvasRect = canvas.getBoundingClientRect()
}
updateCanvasRect()
window.addEventListener('resize', updateCanvasRect)

function getGamePos(clientX, clientY) {
  return {
    x: (clientX - canvasRect.left) / canvasRect.width * GAME_W,
    y: (clientY - canvasRect.top) / canvasRect.height * BASE_H,
  }
}

function getJoystickCenter() {
  return { x: GAME_W * 0.17, y: GAME_H * 0.75 }
}

function getFireBtnCenter() {
  return { x: GAME_W * 0.83, y: GAME_H * 0.75 }
}

canvas.addEventListener('pointerdown', e => {
  initAudio()
  const pos = getGamePos(e.clientX, e.clientY)

  // 菜单状态 — 检测开始按钮
  if (gameState === STATE.MENU) {
    handleMenuClick(pos)
    e.preventDefault()
    return
  }

  // Game Over 状态 — 重新开始
  if (gameState === STATE.GAMEOVER && gameOverTimer > 30) {
    resetGame()
    gameState = STATE.PLAYING
    e.preventDefault()
    return
  }

  // 检测射击按钮区域
  const fbc = getFireBtnCenter()
  const distFb = Math.hypot(pos.x - fbc.x, pos.y - fbc.y)
  if (distFb < 40) {
    fireBtnActive = true
    fireBtnTouchId = e.pointerId
    e.preventDefault()
    return
  }

  // 检测摇杆区域
  const jc = getJoystickCenter()
  const distJs = Math.hypot(pos.x - jc.x, pos.y - jc.y)
  if (distJs < 50) {
    joystickActive = true
    joystickTouchId = e.pointerId
    updateJoystickDir(pos, jc)
    e.preventDefault()
    return
  }

  // 其他区域 — 传统触摸跟随
  pointerActive = true
  pointerX = pos.x
  pointerY = pos.y
  e.preventDefault()
})

canvas.addEventListener('pointermove', e => {
  const pos = getGamePos(e.clientX, e.clientY)

  if (joystickActive && e.pointerId === joystickTouchId) {
    updateJoystickDir(pos, getJoystickCenter())
    return
  }

  if (pointerActive) {
    pointerX = pos.x
    pointerY = pos.y
  }
  e.preventDefault()
})

canvas.addEventListener('pointerup', e => {
  if (e.pointerId === joystickTouchId) {
    joystickActive = false
    joystickDir = { x: 0, y: 0 }
    joystickTouchId = null
  }
  if (e.pointerId === fireBtnTouchId) {
    fireBtnActive = false
    fireBtnTouchId = null
  }
  pointerActive = false
})

canvas.addEventListener('pointerleave', e => {
  if (e.pointerId === joystickTouchId) {
    joystickActive = false
    joystickDir = { x: 0, y: 0 }
    joystickTouchId = null
  }
  if (e.pointerId === fireBtnTouchId) {
    fireBtnActive = false
    fireBtnTouchId = null
  }
  pointerActive = false
})

canvas.addEventListener('pointercancel', () => {
  joystickActive = false
  joystickDir = { x: 0, y: 0 }
  joystickTouchId = null
  fireBtnActive = false
  fireBtnTouchId = null
  pointerActive = false
})

function updateJoystickDir(pos, center) {
  const dx = pos.x - center.x
  const dy = pos.y - center.y
  const dist = Math.hypot(dx, dy)
  const maxDist = 40
  if (dist > maxDist) {
    joystickDir.x = dx / dist
    joystickDir.y = dy / dist
  } else if (dist > 5) {
    joystickDir.x = dx / maxDist
    joystickDir.y = dy / maxDist
  } else {
    joystickDir.x = 0
    joystickDir.y = 0
  }
}

function handleMenuClick(pos) {
  const btnW = 200, btnH = 54
  const btnX = GAME_W / 2 - btnW / 2
  const btnY = GAME_H * 0.44
  if (pos.x >= btnX && pos.x <= btnX + btnW &&
      pos.y >= btnY && pos.y <= btnY + btnH) {
    startGame()
  }
}

// 键盘菜单/重开
window.addEventListener('keydown', e => {
  initAudio()
  if (gameState === STATE.MENU && (e.key === ' ' || e.key === 'Enter')) {
    startGame()
  }
  if (gameState === STATE.GAMEOVER && gameOverTimer > 30 && (e.key === ' ' || e.key === 'r' || e.key === 'R')) {
    resetGame()
    gameState = STATE.PLAYING
  }
})

// ---------- 背景初始化 ----------

function initNebula() {
  nebulaBlobs = []
  const colors = [
    'rgba(20, 40, 120, 0.04)',
    'rgba(40, 10, 80, 0.03)',
    'rgba(10, 30, 100, 0.05)',
    'rgba(30, 20, 90, 0.03)',
    'rgba(0, 50, 130, 0.04)',
    'rgba(50, 10, 70, 0.03)',
    'rgba(10, 40, 110, 0.04)',
    'rgba(20, 30, 100, 0.03)',
  ]
  for (let i = 0; i < 8; i++) {
    nebulaBlobs.push({
      x: Math.random() * GAME_W,
      y: Math.random() * GAME_H,
      radius: rand(120, 280),
      color: colors[i],
      speed: rand(0.08, 0.25),
      phase: Math.random() * Math.PI * 2,
      driftAmp: rand(0.15, 0.45),
    })
  }
}

function initStarLayers() {
  farStars = []
  nearStars = []
  for (let i = 0; i < 60; i++) {
    farStars.push({
      x: Math.random() * GAME_W,
      y: Math.random() * GAME_H,
      speed: 0.08 + Math.random() * 0.6,
      radius: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.35 + 0.12,
    })
  }
  for (let i = 0; i < 80; i++) {
    nearStars.push({
      x: Math.random() * GAME_W,
      y: Math.random() * GAME_H,
      speed: 0.3 + Math.random() * 2.5,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.6 + 0.4,
    })
  }
}

// ---------- 工具函数 ----------
function rand(min, max) {
  return Math.random() * (max - min) + min
}

function hitTest(a, b) {
  const ahw = a.w / 2
  const ahh = a.h / 2
  const bhw = b.w / 2
  const bhh = b.h / 2
  return (
    a.x - ahw < b.x + bhw &&
    a.x + ahw > b.x - bhw &&
    a.y - ahh < b.y + bhh &&
    a.y + ahh > b.y - bhh
  )
}

function loadHighScore() {
  try { return parseInt(localStorage.getItem('thunderFighterHighScore') || '0', 10) }
  catch { return 0 }
}

function saveHighScore(s) {
  try { localStorage.setItem('thunderFighterHighScore', String(s)) }
  catch { /* ignore */ }
}

// ---------- 屏幕震动 ----------
function triggerShake(intensity, duration) {
  shakeIntensity = Math.max(shakeIntensity, intensity)
  shakeDuration = Math.max(shakeDuration, duration)
}

// ---------- 生成 ----------
function spawnEnemy() {
  const size = rand(28, 44)
  enemies.push({
    x: rand(size, GAME_W - size),
    y: -size,
    w: size,
    h: size,
    speed: rand(ENEMY_BASE_SPEED * 0.6, ENEMY_BASE_SPEED * 1.6),
    points: 100,
  })
}

function spawnExplosion(x, y, color, size = 1) {
  // 内环 — 白黄慢速
  for (let i = 0; i < 8; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(0.8, 3)
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.025, 0.06),
      color: '255, 240, 180',
      radius: rand(1.5, 3),
      shape: 'circle',
    })
  }
  // 外环 — 橙红
  const count = Math.floor(14 * size)
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(1.5, 6 * size)
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.015, 0.05),
      color,
      radius: rand(2, 5),
      shape: 'circle',
    })
  }
  // 碎片 — 暗色方块
  for (let i = 0; i < 4; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(3, 8)
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.02, 0.06),
      color: '120, 30, 20',
      radius: rand(3, 7),
      shape: 'rect',
    })
  }
  // 火花环
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i + rand(-0.2, 0.2)
    const speed = rand(2, 5)
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.05, 0.1),
      color: '255, 255, 200',
      radius: rand(1, 2.5),
      shape: 'circle',
    })
  }
}

function fireBullets() {
  const bx = player.x
  const by = player.y - player.h / 2 - 6
  bullets.push({ x: bx,       y: by,     w: 4, h: 14, speed: BULLET_SPEED })
  bullets.push({ x: bx - 10,  y: by + 8, w: 4, h: 11, speed: BULLET_SPEED })
  bullets.push({ x: bx + 10,  y: by + 8, w: 4, h: 11, speed: BULLET_SPEED })
}

function startGame() {
  gameState = STATE.PLAYING
  resetGame()
}

function resetGame() {
  score = 0
  lives = MAX_LIVES
  invincibleTimer = 0
  combo = 0
  comboTimer = 0
  maxCombo = 0
  gameOverTimer = 0
  frameCount = 0
  player.x = GAME_W / 2
  player.y = GAME_H - 100
  bullets = []
  enemies = []
  particles = []
  floatingTexts = []
  bulletCooldown = 0
  enemySpawnTimer = 0
  shakeIntensity = 0
  shakeDuration = 0
  gameOver = false
}

// ==================== 更新逻辑 ====================

function updateNebula() {
  for (const b of nebulaBlobs) {
    b.y += b.speed
    b.x += Math.sin(frameCount * 0.003 + b.phase) * b.driftAmp
    if (b.y > GAME_H + b.radius) {
      b.y = -b.radius
      b.x = Math.random() * GAME_W
    }
  }
}

function updateStarLayer(stars) {
  for (const s of stars) {
    s.y += s.speed
    if (s.y > GAME_H) {
      s.y = -2
      s.x = Math.random() * GAME_W
    }
  }
}

function updatePlayer() {
  let dx = 0, dy = 0

  // 虚拟摇杆
  if (joystickActive) {
    dx = joystickDir.x
    dy = joystickDir.y
    player.x += dx * PLAYER_SPEED * 1.15
    player.y += dy * PLAYER_SPEED * 1.15
  } else if (pointerActive) {
    // 传统触摸跟随
    const targetX = pointerX
    const targetY = pointerY
    const diffX = targetX - player.x
    const diffY = targetY - player.y
    const dist = Math.hypot(diffX, diffY)
    if (dist > 2) {
      dx = diffX / dist
      dy = diffY / dist
      const touchSpeed = Math.min(dist * 0.3, PLAYER_SPEED * 1.4)
      player.x += dx * touchSpeed
      player.y += dy * touchSpeed
    }
  } else {
    // 键盘
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx = -1
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy = -1
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy = 1

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707
      dy *= 0.707
    }
    player.x += dx * player.speed
    player.y += dy * player.speed
  }

  // 边界限制
  const hw = player.w / 2
  const hh = player.h / 2
  player.x = Math.max(hw, Math.min(GAME_W - hw, player.x))
  player.y = Math.max(hh, Math.min(GAME_H - hh, player.y))
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed
    if (bullets[i].y < -bullets[i].h) {
      bullets.splice(i, 1)
    }
  }
}

function updateEnemies() {
  if (gameState !== STATE.PLAYING) return

  enemySpawnTimer++
  const rate = Math.max(15, ENEMY_SPAWN_RATE - Math.floor(score / 500) * 5)
  if (enemySpawnTimer >= rate) {
    enemySpawnTimer = 0
    spawnEnemy()
    if (score > 1000 && Math.random() < 0.3) spawnEnemy()
    if (score > 2500 && Math.random() < 0.3) spawnEnemy()
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed
    if (enemies[i].y > GAME_H + enemies[i].h) {
      enemies.splice(i, 1)
    }
  }
}

function updateCollisions() {
  if (gameState !== STATE.PLAYING) return

  // 子弹 vs 敌机
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    let hit = false
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (hitTest(bullets[bi], enemies[ei])) {
        const enemy = enemies[ei]

        // 连击
        combo++
        comboTimer = COMBO_TIMEOUT
        if (combo > maxCombo) maxCombo = combo

        // 分数计算（连击加成）
        const multiplier = 1 + Math.floor(combo / 5) * 0.5
        const points = Math.floor(enemy.points * multiplier)
        score += points

        // 浮动文字
        const comboColor = combo > 10 ? '#ff4444' : combo > 5 ? '#ffdd00' : '#ffffff'
        floatingTexts.push({
          x: enemy.x,
          y: enemy.y,
          text: `+${points}`,
          life: 1,
          vy: -1.2,
          color: comboColor,
        })

        // 大爆炸
        spawnExplosion(enemy.x, enemy.y, '255, 160, 40', combo > 5 ? 1.4 : 1)
        triggerShake(4 + Math.min(combo, 10) * 0.5, 8)

        enemies.splice(ei, 1)
        hit = true
        sfxExplosion()
        if (combo > 1 && combo % 5 === 0) sfxCombo()
        break
      }
    }
    if (hit) bullets.splice(bi, 1)
  }

  // 玩家 vs 敌机（考虑无敌状态）
  if (invincibleTimer > 0) return

  for (let ei = enemies.length - 1; ei >= 0; ei--) {
    if (hitTest(player, enemies[ei])) {
      spawnExplosion(player.x, player.y, '80, 180, 255', 1.3)
      spawnExplosion(enemies[ei].x, enemies[ei].y, '255, 100, 40', 1)
      enemies.splice(ei, 1)

      lives--
      invincibleTimer = INVINCIBLE_DURATION
      triggerShake(14, 24)
      sfxHit()

      if (lives <= 0) {
        gameOver = true
        gameOverTimer = 0
        sfxGameOver()
        // 检查新高分
        if (score > highScore) {
          highScore = score
          saveHighScore(highScore)
        }
      }
      break
    }
  }
}

let gameOver = false // 内部标志，用于触发 game over 的帧

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.03 // 轻微重力
    p.life -= p.decay
    if (p.life <= 0) particles.splice(i, 1)
  }
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i]
    ft.y += ft.vy
    ft.life -= 0.018
    if (ft.life <= 0) floatingTexts.splice(i, 1)
  }
}

function update() {
  frameCount++

  // 仅在 PLAYING 状态下运行游戏逻辑
  if (gameState === STATE.PLAYING) {
    updatePlayer()

    // 引擎尾焰粒子
    spawnEngineParticles()

    updateEnemies()

    // 射击
    if (bulletCooldown > 0) bulletCooldown--
    const wantShoot = keys[' '] || fireBtnActive || joystickActive || (pointerActive && !joystickActive)
    if (wantShoot && bulletCooldown <= 0) {
      fireBullets()
      bulletCooldown = BULLET_COOLDOWN
      sfxShoot()
    }

    updateBullets()
    updateCollisions()
    updateParticles()
    updateFloatingTexts()

    // 无敌计时器
    if (invincibleTimer > 0) invincibleTimer--

    // 连击计时器
    if (comboTimer > 0) {
      comboTimer--
      if (comboTimer <= 0) combo = 0
    }

    // 震动衰减
    if (shakeDuration > 0) {
      shakeDuration--
      shakeIntensity *= 0.88
      if (shakeDuration <= 0) shakeIntensity = 0
    }

    // 检测 game over
    if (gameOver) {
      gameState = STATE.GAMEOVER
      gameOver = false
      gameOverTimer = 0
    }
  }

  // 背景始终更新
  updateNebula()
  updateStarLayer(farStars)
  updateStarLayer(nearStars)

  // Game Over 状态计时
  if (gameState === STATE.GAMEOVER) {
    gameOverTimer++
  }
}

function spawnEngineParticles() {
  const engs = [
    { x: player.x - player.w * 0.16, y: player.y + player.h * 0.34, color: '255, 180, 40', prob: 0.5 },
    { x: player.x,                      y: player.y + player.h * 0.34, color: '180, 200, 255', prob: 0.85 },
    { x: player.x + player.w * 0.16, y: player.y + player.h * 0.34, color: '255, 180, 40', prob: 0.5 },
  ]

  // 玩家移动方向偏移
  let driftX = 0
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || joystickDir.x < -0.2) driftX = 1.5
  if (keys['ArrowRight'] || keys['d'] || keys['D'] || joystickDir.x > 0.2) driftX = -1.5

  for (const eng of engs) {
    if (Math.random() < eng.prob) {
      particles.push({
        x: eng.x + rand(-2, 2),
        y: eng.y,
        vx: rand(-0.5, 0.5) + driftX + rand(-0.3, 0.3),
        vy: rand(1.5, 4),
        life: 1,
        decay: rand(0.04, 0.1),
        color: eng.color,
        radius: rand(1, 3),
        shape: 'circle',
      })
    }
  }
}

// ==================== 渲染 ====================

function render() {
  // 屏幕震动偏移
  let sx = 0, sy = 0
  if (shakeIntensity > 0.3) {
    sx = (Math.random() - 0.5) * shakeIntensity * 1.5
    sy = (Math.random() - 0.5) * shakeIntensity * 1.5
  }

  ctx.setTransform(viewScale, 0, 0, viewScale, sx, sy)
  ctx.fillStyle = '#0a0a1e'
  ctx.fillRect(0, 0, GAME_W, GAME_H)

  // 背景
  drawNebula(ctx, nebulaBlobs)
  drawStars(ctx, farStars)
  drawStars(ctx, nearStars)

  if (gameState === STATE.MENU) {
    drawMenu(ctx, GAME_W, GAME_H, frameCount, highScore)
  } else {
    // 游戏对象
    drawPlayer(ctx, player, frameCount, invincibleTimer)
    for (const e of enemies) drawEnemy(ctx, e)
    for (const b of bullets) drawBullet(ctx, b)
    drawParticles(ctx, particles)

    // Bloom 发光
    drawBloomPass(ctx, player, particles, GAME_W, GAME_H)

    // 浮动文字
    drawFloatingTexts(ctx, floatingTexts)

    // HUD
    drawHUD(ctx, score, highScore, lives, combo, comboTimer, frameCount, GAME_W)

    // 虚拟控件
    if (gameState === STATE.PLAYING) {
      drawVirtualControls(
        ctx,
        { active: joystickActive, dir: joystickDir },
        { active: fireBtnActive },
        GAME_W, GAME_H,
      )
    }

    // Game Over 遮罩
    if (gameState === STATE.GAMEOVER) {
      drawGameOver(ctx, score, highScore, score >= highScore && score > 0, gameOverTimer, frameCount, GAME_W, GAME_H)
    }
  }
}

// ==================== 游戏循环 ====================

function gameLoop() {
  update()
  render()
  requestAnimationFrame(gameLoop)
}

// ==================== 启动 ====================

resize()
window.addEventListener('resize', resize)

gameLoop()
