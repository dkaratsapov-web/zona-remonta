"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Кадр, который следует за курсором при наведении на строку услуги.
 *
 * Только для точного указателя: на тач-устройствах наведения нет,
 * а лишний слой изображений там только тратил бы трафик.
 */
export function HoverPreview({ src }: { src: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const onMove = (event: PointerEvent) => {
      tx = event.clientX + 28;
      ty = event.clientY - 90;
    };
    const loop = () => {
      // Небольшая инерция: кадр «догоняет» курсор, а не приклеен к нему
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled || !src) return null;

  return (
    <div className="hover-preview hover-preview--on" ref={ref} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(src)} alt="" />
    </div>
  );
}
