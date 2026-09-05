"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionLabel } from "@/components/ui/SectionLabel";

const HEADLINE = [
  { text: "Ремонт — это не набор", accent: false },
  { text: "отдельных работ. Это ", accent: false },
  { text: "один процесс", accent: true },
  { text: ", за который должен", accent: false },
  { text: "отвечать один подрядчик.", accent: false },
];

/**
 * Текст не «выезжает» абзацем: по мере прокрутки слова перекрашиваются
 * из приглушённого в белый — красная линия слева работает индикатором чтения.
 */
export function Manifest() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      gsap.to("[data-word]", {
        color: "#F5F5F5",
        stagger: 0.06,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top 72%", end: "bottom 65%", scrub: true },
      });
      gsap.fromTo(
        "[data-manifest-line]",
        { scaleY: 0.08 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: node, start: "top 80%", end: "bottom 60%", scrub: true },
        },
      );
    }, node);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="section manifest" id="about" ref={root}>
      <span className="manifest__rail" aria-hidden="true">
        <span data-manifest-line />
      </span>

      <div className="container">
        <SectionLabel number="02" title="Манифест" />

        <p className="manifest__headline">
          {HEADLINE.map((chunk, index) => (
            <span
              key={index}
              data-word=""
              style={{ color: chunk.accent ? "var(--accent-text)" : "#3A3A3A" }}
            >
              {chunk.text}
            </span>
          ))}
        </p>

        <div className="manifest__foot">
          <span className="manifest__dash" aria-hidden="true" />
          <p className="lead">
            «Зона Ремонта» выполняет полный комплекс строительных, ремонтных и монтажных
            работ — от подготовки объекта и закупки материалов до финальной отделки.
          </p>
        </div>
      </div>
    </section>
  );
}
