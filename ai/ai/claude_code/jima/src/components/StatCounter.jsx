import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function StatCounter({ end, suffix = '', label, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="glass text-center p-6">
      <div className="text-3xl sm:text-4xl font-bold gradient-text">
        {count}
        <span className="text-xl">{suffix}</span>
      </div>
      <div className="text-gray-400 text-sm mt-2">{label}</div>
    </div>
  );
}
