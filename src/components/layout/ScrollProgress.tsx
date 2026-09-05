"use client";

import { useEffect, useState } from "react";
import { useFinePointer } from "@/lib/hooks";

/** Тонкий индикатор прогресса сбоку. Только desktop. */
export function ScrollProgress({ total }: { total: number }) {
  const [progress, setProgress] = useState(0);
  const fine = useFinePointer();

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!fine) return null;

  return (
    <div className="scroll-rail" aria-hidden="true">
      <span className="label" style={{ fontSize: 10 }}>
        01
      </span>
      <span className="scroll-rail__track">
        <span className="scroll-rail__fill" style={{ height: `${progress * 100}%` }} />
      </span>
      <span className="label" style={{ fontSize: 10, color: "var(--dim)" }}>
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
