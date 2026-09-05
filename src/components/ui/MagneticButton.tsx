"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

/**
 * CTA слегка притягивается к курсору. Только desktop с точным указателем:
 * на тач-устройствах эффекта нет вовсе, как и при prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className = "btn",
  type = "button",
  disabled,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    // Амплитуда намеренно маленькая — кнопка не должна «убегать».
    ref.current.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  const shared = {
    ref: ref as never,
    className,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    style: { transition: "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)" },
  };

  if (href) {
    return (
      <a {...shared} href={href} onClick={onClick} data-cursor="cta">
        {children}
      </a>
    );
  }

  return (
    <button {...shared} type={type} onClick={onClick} disabled={disabled} data-cursor="cta">
      {children}
    </button>
  );
}
