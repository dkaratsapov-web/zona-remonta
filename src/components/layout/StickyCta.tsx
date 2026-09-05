"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Мобильная плавающая кнопка. Появляется после первого экрана
 * и исчезает, когда виден калькулятор, — чтобы не спорить с ним.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const calculator = document.getElementById("calculator");

    const onScroll = () => {
      const passedHero = window.scrollY > window.innerHeight * 0.9;
      let calculatorVisible = false;
      if (calculator) {
        const rect = calculator.getBoundingClientRect();
        calculatorVisible = rect.top < window.innerHeight && rect.bottom > 0;
      }
      setVisible(passedHero && !calculatorVisible);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#calculator"
      className={`sticky-cta ${visible ? "sticky-cta--visible" : ""}`}
      onClick={() => track("hero_cta_click", { place: "sticky" })}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      Рассчитать стоимость
    </a>
  );
}
