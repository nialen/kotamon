'use client';

import { useEffect, useState } from 'react';

// Keep the header's layout slot stable; only its visible surface shrinks/moves.
export function useHeaderScroll(menuOpen: boolean) {
  const [state, setState] = useState({ compact: false, hidden: false });
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mobile = window.matchMedia('(max-width: 959px)');
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;
    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      setState(previous => {
        const compact = mobile.matches && y > 48;
        const hidden = mobile.matches && !menuOpen && y > 112
          ? (Math.abs(delta) >= 8 ? delta > 0 : previous.hidden)
          : false;
        return previous.compact === compact && previous.hidden === hidden ? previous : { compact, hidden };
      });
      if (Math.abs(delta) >= 8 || y <= 48) lastY = y;
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    mobile.addEventListener('change', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      mobile.removeEventListener('change', schedule);
    };
  }, [menuOpen]);
  return { compact: state.compact, hidden: state.hidden && !menuOpen };
}
