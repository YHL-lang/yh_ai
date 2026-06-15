// ============================================================
//  音效模块 — Web Audio API 简易振荡器
// ============================================================

let audioCtx = null

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
}

function playBeep(freq, duration, type = 'square', vol = 0.06) {
  if (!audioCtx) return
  const t = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(t)
  osc.stop(t + duration)
}

export function sfxShoot()     { playBeep(800, 0.08, 'square', 0.04) }
export function sfxExplosion() { playBeep(120, 0.2, 'sawtooth', 0.07) }
export function sfxGameOver()  { playBeep(60, 0.5, 'sawtooth', 0.1) }
export function sfxHit()       { playBeep(180, 0.15, 'sawtooth', 0.08) }
export function sfxCombo()     { playBeep(600, 0.06, 'square', 0.03) }
