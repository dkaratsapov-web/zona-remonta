"use client";

import { useEffect, useRef, useState } from "react";
import { initGsap, ScrollTrigger } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { processSteps } from "@/data/content";
import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RollingNumber } from "@/components/ui/RollingNumber";

const PHOTOS = ["warm", "cool", "night", "stone", "warm"] as const;

/**
 * Desktop — закреплённая сцена: номер и описание меняются на месте,
 * красная линия заполняется. Mobile — обычный вертикальный timeline.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        /*
          Закрепление сделано через CSS position: sticky, а не через pin.
          Пин вырывает блок из потока и держит его по координатам, снятым
          один раз: стоило соседней секции изменить высоту — например,
          конфигуратору раскрыть категории — и закреплённая сцена наезжала
          на неё. Sticky остаётся частью потока и наехать не может.
          ScrollTrigger здесь только считает активный шаг.
        */
        const trigger = ScrollTrigger.create({
          trigger: node,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const index = Math.min(
              processSteps.length - 1,
              Math.floor(self.progress * processSteps.length),
            );
            setActive(index);
          },
        });

        return () => trigger.kill();
      });
    }, node);

    return () => ctx.revert();
  }, [reduced]);

  const step = processSteps[active];
  const fill = ((active + 1) / processSteps.length) * 100;

  return (
    <section className="section process" id="process" ref={root}>
      <div className="container">
        <SectionLabel number="07" title="Как мы работаем" />
      </div>

      {/* Desktop-сцена: липкая внутри своей дорожки прокрутки */}
      <div className="process__scroll">
      <div className="process__stage">
        <div className="container process__grid">
          <div className="process__current">
            <p className="process__num">
              <RollingNumber value={step.number} />
            </p>
            <h3 className="process__title">{step.title}</h3>
            <p className="lead" style={{ marginTop: 20, maxWidth: 420 }}>
              {step.text}
            </p>
          </div>

          <div className="process__rail" aria-hidden="true">
            <span className="process__rail-fill" style={{ height: `${fill}%` }} />
          </div>

          <ol className="process__list">
            {processSteps.map((item, index) => (
              <li key={item.number} className={index === active ? "is-active" : ""}>
                <span className="label">{item.number}</span>
                <span>{item.title.charAt(0) + item.title.slice(1).toLowerCase()}</span>
              </li>
            ))}
          </ol>

          <div className="process__media">
            <Photo variant={PHOTOS[active]} edges />
          </div>
        </div>
      </div>
      </div>

      {/* Mobile-таймлайн */}
      <ol className="container process__timeline">
        {processSteps.map((item) => (
          <li key={item.number}>
            <span className="process__timeline-num">{item.number}</span>
            <h3 className="process__timeline-title">{item.title}</h3>
            <p className="process__timeline-text">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
