"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";

const POINTS = [
  ["Подбор под задачу", "и бюджет"],
  ["Организация закупки", "и доставки"],
  ["Одна точка", "ответственности"],
];

/** Три плана глубины. Амплитуда маленькая: глубина должна ощущаться, а не бросаться в глаза. */
export function Materials() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      node.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = Number(layer.dataset.depth ?? 1);
        gsap.to(layer, {
          yPercent: -8 * depth,
          ease: "none",
          scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, node);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="section materials" id="materials" ref={root}>
      <div className="container materials__grid">
        <div>
          <SectionLabel number="08" title="Материалы и комплектация" />
          <h2 className="materials__title">
            Не только
            <br />
            делаем.
            <br />
            <span style={{ color: "var(--accent-text)" }}>Комплектуем.</span>
          </h2>
          <p className="lead" style={{ marginTop: 32, maxWidth: 460 }}>
            Поможем подобрать и организовать закупку материалов под конкретные задачи
            и бюджет объекта.
          </p>
          <ul className="materials__points">
            {POINTS.map((point) => (
              <li key={point[0]}>
                <span aria-hidden="true" />
                {point[0]}
                <br />
                {point[1]}
              </li>
            ))}
          </ul>
        </div>

        <div className="materials__stack">
          <div className="materials__tile materials__tile--a" data-depth="0.8">
            <Photo variant="stone" />
          </div>
          <div className="materials__tile materials__tile--b" data-depth="1.2">
            <Photo variant="warm" />
          </div>
          <div className="materials__tile materials__tile--c" data-depth="1.5">
            <Photo variant="cool" />
          </div>
        </div>
      </div>
    </section>
  );
}
