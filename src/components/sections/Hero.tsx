"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/animations";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/data/siteConfig";
import { Photo } from "@/components/ui/Photo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useUi } from "@/components/ui/UiContext";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const { openCalculator } = useUi();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;

    const gsap = initGsap();
    const ctx = gsap.context(() => {
      // Вход: кадр «выдыхает» из 1.08 в 1, заголовок раскрывается маской
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(photo.current, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
        .fromTo(
          "[data-hero-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.08 },
          0.15,
        )
        .fromTo("[data-hero-fade]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.5);

      // Уход: кадр темнеет и слегка увеличивается, слова расходятся
      gsap.to(photo.current, {
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-veil]", {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });
      // Параллакс висит на маске, а входная анимация — на слове внутри неё.
      // Иначе scrub-твин запомнил бы стартовым значением yPercent 110,
      // выставленный входной анимацией, и слово навсегда осталось бы под маской.
      gsap.to("[data-hero-word='zona']", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-word='remonta']", {
        yPercent: 5,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });
    }, node);

    return () => ctx.revert();
  }, [reduced]);

  // Микро-параллакс от курсора — только точный указатель
  useEffect(() => {
    const node = root.current;
    if (!node || !fine || reduced) return;

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX / window.innerWidth - 0.5;
      const dy = event.clientY / window.innerHeight - 0.5;
      if (photo.current) photo.current.style.translate = `${dx * -18}px ${dy * -12}px`;
      const line = node.querySelector<HTMLElement>("[data-hero-track]");
      if (line) line.style.translate = `0 ${dy * 26}px`;
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    return () => node.removeEventListener("pointermove", onMove);
  }, [fine, reduced]);

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__media" ref={photo}>
        <Photo variant="warm" floor edges demoLabel="DEMO / INTERIOR — заменить реальным фото" />
      </div>
      <div className="hero__scrim" />
      <div className="hero__veil" data-hero-veil />

      <div className="container hero__inner">
        <div className="eyebrow" data-hero-fade>
          <i />
          <span className="label">Ремонт · Строительство · Комплектация</span>
        </div>

        <h1 className="hero__title wordmark">
          <span className="hero__mask" data-hero-word="zona">
            <span data-hero-line>ЗОНА</span>
          </span>
          <span className="hero__mask" data-hero-word="remonta">
            <span data-hero-line>РЕМОНТА</span>
          </span>
        </h1>

        <p className="hero__lead" data-hero-fade>
          {siteConfig.tagline}
        </p>
        <p className="hero__sub" data-hero-fade>
          От квартиры до загородного дома.
        </p>

        <div className="hero__actions" data-hero-fade>
          <MagneticButton
            onClick={() => {
              track("hero_cta_click", { place: "hero" });
              openCalculator();
            }}
          >
            Рассчитать стоимость <span aria-hidden="true">→</span>
          </MagneticButton>
          <a href="#projects" className="link-underline">
            Смотреть работы
          </a>
        </div>
      </div>

      <div className="hero__track" data-hero-track aria-hidden="true">
        <span className="hero__track-tick" />
      </div>

      <div className="container hero__bottom" aria-hidden="true">
        <span className="label hero__hint">
          <i />
          Листайте вниз
        </span>
        <span className="label" style={{ color: "var(--dim)" }}>
          ZONE / 01
        </span>
      </div>
    </section>
  );
}
