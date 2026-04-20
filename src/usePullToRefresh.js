import { useEffect, useRef, useState } from "react";

const THRESHOLD = 80;
const FADEOUT_DELAY = 300;

export default function usePullToRefresh(onRefresh) {
  const startY = useRef(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef(null);

  function show() {
    clearTimeout(fadeTimer.current);
    setFading(false);
    setVisible(true);
  }

  function hide() {
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, FADEOUT_DELAY);
  }

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    }

    function onTouchMove(e) {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > THRESHOLD) show();
      else if (visible) hide();
    }

    function onTouchEnd() {
      if (visible && !fading) onRefresh();
      hide();
      startY.current = null;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [visible, fading, onRefresh]);

  return { visible, fading };
}
