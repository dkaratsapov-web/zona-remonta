"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/animations";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { siteConfig } from "@/data/siteConfig";
import { heroFacts } from "@/data/content";
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
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      /*
        Вход отличается по ширине экрана.

        Десктоп: кадр «выдыхает» из 1.08 в 1, слова выезжают из-под маски.

        Телефон: заголовок гравируется — луч проходит по надписи, и за ним
        буквы наливаются светом. Это делает CSS, поэтому сдвиг строк здесь
        отключён: два движения на одних и тех же буквах читались бы как
        сбой. Подписи под заголовком появляются после прохода луча.
      */
      mm.add(
        { desktop: "(min-width: 768px)", phone: "(max-width: 767px)" },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean; phone: boolean };
          const tl = gsap.timeline({ delay: 0.15 });
          tl.fromTo(photo.current, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: "power2.out" }, 0);

          if (desktop) {
            tl.fromTo(
              "[data-hero-line]",
              { yPercent: 110 },
              { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.08 },
              0.15,
            ).fromTo("[data-hero-fade]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.5);
          } else {
            // Надстрочник появляется сразу — он «подписывает» стену до
            // того, как по ней пройдёт луч. Остальное — после гравировки.
            tl.fromTo(".eyebrow", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3).fromTo(
              ".hero__lead, .hero__sub, .hero__actions",
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
              2,
            );
          }
        },
      );

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

    return () => {
      mm.revert();
      ctx.revert();
    };
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
          {/*
            Луч строительного лазера: линия проходит по надписи и
            «размечает» её. Чистый CSS — на телефоне это дешевле
            анимации на JS и не мешает входной анимации GSAP,
            та работает с transform, а блик — с background-position.
          */}
          <span className="hero__scan" aria-hidden="true" />
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

      <div className="hero__facts">
        <div className="container hero__facts-inner">
          {heroFacts.map((fact) => (
            <div className="fact" key={fact.title}>
              <p className="fact__value">
                {fact.value}
                {fact.unit ? <span className="fact__unit">{fact.unit}</span> : null}
              </p>
              <p className="fact__title">{fact.title}</p>
              <p className="fact__text">{fact.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
