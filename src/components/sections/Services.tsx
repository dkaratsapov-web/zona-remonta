"use client";

import { useEffect, useRef } from "react";
import { initGsap, ScrollTrigger } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { services } from "@/data/services";
import { Photo } from "@/components/ui/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Desktop — закреплённая сцена: вертикальный скролл двигает ленту вбок.
 * Mobile — нативный горизонтальный свайп со snap, никакого пина.
 *
 * Две принципиально разные механики живут в gsap.matchMedia, а не в одном
 * transform на все случаи: попытка «растянуть» пин на телефон ломает скролл.
 */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    const track = trackRef.current;
    if (!node || !track || reduced) return;

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const distance = () => track.scrollWidth - window.innerWidth + 120;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.width = `${Math.max(8, self.progress * 100)}%`;
              }
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { x: 0 });
        };
      });
    }, node);

    // Пересчитываем только при смене ширины: на iOS высота вьюпорта
    // меняется при каждом сворачивании адресной строки.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section className="services" id="services" ref={root}>
      <div className="container services__head">
        <div>
          <SectionLabel number="03" title="Направления работ" />
          <h2 className="h2" style={{ marginTop: 18 }}>
            Что мы делаем
          </h2>
        </div>
        <div className="services__progress">
          <span className="label">01 — {String(services.length).padStart(2, "0")}</span>
          <span className="services__bar">
            <span className="services__bar-fill" ref={progressRef} />
          </span>
        </div>
      </div>

      <div className="services__viewport">
        <ul className="services__track" ref={trackRef}>
          {services.map((service) => (
            <li className="service-card" key={service.id} data-cursor="project">
              <div className="service-card__media">
                <Photo
                  variant={service.photo}
                  src={service.image}
                  alt={service.imageAlt}
                  edges
                />
              </div>
              <span className="service-card__scrim" aria-hidden="true" />
              <span className="service-card__num">{service.number}</span>
              <div className="service-card__body">
                <h3 className="service-card__title">
                  {service.titleLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                <p className="service-card__text">{service.description}</p>
                <span className="service-card__foot" aria-hidden="true">
                  <i />→
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
}
