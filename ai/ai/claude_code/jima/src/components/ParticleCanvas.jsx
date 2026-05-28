import { useEffect, useRef } from 'react';

const COLORS = [
  'rgba(6,182,212,',
  'rgba(59,130,246,',
  'rgba(139,92,246,',
];

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const CONNECT_DIST = 100;

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 120 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 70;

    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    function animate(timestamp) {
      animationId = requestAnimationFrame(animate);

      const delta = timestamp - lastTime;
      if (delta < FRAME_INTERVAL) return;
      lastTime = timestamp - (delta % FRAME_INTERVAL);

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '0.6)';
        ctx.fill();

        const { x: mx, y: my, radius } = mouseRef.current;
        if (mx != null && my != null) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            const force = (radius - dist) / radius;
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
          }
        }

        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < CONNECT_DIST * CONNECT_DIST) {
              const dist = Math.sqrt(distSq);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = p.color + (0.12 * (1 - dist / CONNECT_DIST)) + ')';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
    }

    animationId = requestAnimationFrame(animate);

    let mouseThrottle;
    const handleMouse = (e) => {
      if (mouseThrottle) return;
      mouseThrottle = requestAnimationFrame(() => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseThrottle = null;
      });
    };
    const handleLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
}
