"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Единая точка инициализации GSAP. Анимации не разбросаны по проекту:
 * каждая секция вызывает свой сетап внутри gsap.context и корректно
 * уничтожает его при размонтировании.
 */
export function initGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // На мобильных высота вьюпорта скачет при сворачивании адресной строки.
    // Пересчитываем пины только при изменении ШИРИНЫ — иначе на iOS
    // страница дёргается на каждом скролле.
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return gsap;
}

export { ScrollTrigger };

/** Мягкое проявление блока при входе в вьюпорт. */
export function revealOnScroll(
  target: gsap.TweenTarget,
  options: { y?: number; delay?: number; stagger?: number; trigger?: Element } = {},
): void {
  const { delay = 0, stagger = 0.08, trigger } = options;
  gsap.to(target, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    delay,
    stagger,
    scrollTrigger: {
      trigger: trigger ?? (target as Element),
      start: "top 85%",
      once: true,
    },
  });
}
