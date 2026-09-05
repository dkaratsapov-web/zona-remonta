"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { beforeAfter } from "@/data/content";

/**
 * Сравнение «до/после». Управляется мышью, пальцем и клавиатурой:
 * ручка — полноценный role="slider", стрелки двигают на 2%, Home/End —
 * в края. Без этого секцией нельзя пользоваться с клавиатуры вообще.
 */
export function BeforeAfter() {
  const [value, setValue] = useState(46);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      event.preventDefault();
      setFromClientX(event.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromClientX]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") setValue((v) => Math.max(0, v - step));
    else if (event.key === "ArrowRight") setValue((v) => Math.min(100, v + step));
    else if (event.key === "Home") setValue(0);
    else if (event.key === "End") setValue(100);
    else return;
    event.preventDefault();
  };

  return (
    <section className="before-after" id="before-after">
      <div
        className="before-after__frame"
        ref={frame}
        onPointerDown={(event) => {
          dragging.current = true;
          setFromClientX(event.clientX);
        }}
      >
        <div className="before-after__side before-after__side--before">
          <Photo variant="raw" src={beforeAfter.before.src} alt={beforeAfter.before.alt} />
          <span className="before-after__tag before-after__tag--left label">До</span>
        </div>

        <div className="before-after__side before-after__side--after" style={{ clipPath: `inset(0 0 0 ${value}%)` }}>
          <Photo variant="warm" src={beforeAfter.after.src} alt={beforeAfter.after.alt} />
          <span className="before-after__tag before-after__tag--right label">После</span>
        </div>

        <div className="before-after__divider" style={{ left: `${value}%` }} aria-hidden="true" />

        <button
          type="button"
          className="before-after__handle"
          style={{ left: `${value}%` }}
          role="slider"
          aria-label="Сравнение до и после"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-valuetext={`После — ${Math.round(100 - value)}%`}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            event.stopPropagation();
            dragging.current = true;
          }}
        >
          <span aria-hidden="true">‹ ›</span>
        </button>

        <div className="before-after__scrim" aria-hidden="true" />
      </div>

      <div className="container before-after__caption">
        <SectionLabel number="05" title="До и после" />
        <h2 className="h2" style={{ marginTop: 18 }}>
          Один и тот же объект
        </h2>
        <p className="lead" style={{ marginTop: 16 }}>
          Потяните разделитель — мышью, пальцем или стрелками клавиатуры.
        </p>
      </div>
    </section>
  );
}
