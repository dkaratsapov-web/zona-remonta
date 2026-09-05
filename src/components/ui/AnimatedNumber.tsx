"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Props = { value: number; duration?: number; className?: string };

/**
 * Плавный счётчик на requestAnimationFrame.
 *
 * Анимация не блокирует быстрые клики: при новом значении текущая
 * стартует с той цифры, на которой остановилась предыдущая, поэтому
 * серия быстрых выборов не выстраивается в очередь и не отстаёт.
 */
export function AnimatedNumber({ value, duration = 420, className = "" }: Props) {
  const [display, setDisplay] = useState(value);
  const frame = useRef(0);
  const from = useRef(value);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Значение подставляется при отрисовке, состояние здесь не трогаем
      from.current = value;
      return;
    }

    const start = performance.now();
    const startValue = from.current;
    const delta = value - startValue;
    if (delta === 0) return;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo: быстрый старт и мягкая остановка, без отскока
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + delta * eased);
      from.current = current;
      setDisplay(current);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, reduced]);

  const shown = reduced ? value : display;

  return (
    <span className={className}>
      {Math.max(0, shown).toLocaleString("ru-RU")} ₽
    </span>
  );
}
