"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initGsap, ScrollTrigger } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Props = {
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Появление блока при скролле. Начальное состояние живёт в CSS под классом
 * .js — если скрипт не загрузился, контент виден без анимации.
 */
export function Reveal({ children, y = 28, delay = 0, className = "", as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const Tag = as;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced) {
      node.style.opacity = "1";
      node.style.transform = "none";
      return;
    }

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: node, start: "top 88%", once: true },
        },
      );
    }, node);

    return () => ctx.revert();
  }, [reduced, y, delay]);

  return (
    <Tag ref={ref as never} className={className} data-reveal-y="">
      {children}
    </Tag>
  );
}

export { ScrollTrigger };
