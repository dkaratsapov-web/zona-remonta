"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { siteConfig } from "@/data/siteConfig";

const SEEN_KEY = "zr_preloader_seen";

/**
 * Прелоадер не задерживает сайт искусственно: он живёт ровно столько,
 * сколько идёт реальная загрузка, и показывается один раз за сессию.
 * Разметка hero присутствует в HTML под ним — SEO и доступность не страдают.
 *
 * Скрытие идёт классом на DOM-узле, а не состоянием React: это внешняя
 * по отношению к дереву анимация, которой не нужен перерендер страницы.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const finish = () => {
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* запись может быть запрещена */
      }
      node.classList.add("preloader--done");
    };

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* приватный режим — считаем, что не видели */
    }

    if (reduced || seen) {
      finish();
      return;
    }

    if (document.readyState === "complete") {
      const timer = window.setTimeout(finish, 420);
      return () => window.clearTimeout(timer);
    }

    window.addEventListener("load", finish, { once: true });
    // Страховка: если событие load не придёт, экран всё равно откроется.
    const guard = window.setTimeout(finish, 2500);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(guard);
    };
  }, [reduced]);

  return (
    <div className="preloader" ref={ref} aria-hidden="true">
      <div className="preloader__line" />
      <div className="preloader__word">{siteConfig.shortName}</div>
    </div>
  );
}
