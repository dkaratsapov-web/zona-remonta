"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Минималистичный курсор-кружок. Появляется только на устройствах
 * с точным указателем — тач-устройства не получают его никогда.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      setVisible(true);
      const el = (event.target as HTMLElement | null)?.closest?.("[data-cursor]");
      const kind = el?.getAttribute("data-cursor") ?? null;
      setLabel(kind === "project" ? "СМОТРЕТЬ" : kind === "cta" ? "" : null);
    };

    const loop = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 90,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          transform: "translate(-50%, -50%)",
          width: label !== null ? 84 : 8,
          height: label !== null ? 84 : 8,
          borderRadius: "50%",
          background: label ? "rgba(229,32,42,0.92)" : label === "" ? "rgba(255,255,255,0.16)" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "#fff",
          transition: "width 0.3s ease, height 0.3s ease, background 0.3s ease",
        }}
      >
        {label}
      </div>
    </div>
  );
}
