"use client";

import { useEffect } from "react";
import { ScrollTrigger, initGsap } from "@/lib/animations";

/**
 * Пересчёт закреплённых сцен при изменении высоты страницы.
 *
 * ScrollTrigger запоминает координаты пинов один раз. Конфигуратор
 * меняет свою высоту на лету — раскрывает категории, показывает итог, —
 * и без пересчёта закреплённая сцена «Как мы работаем» оставалась
 * на старых координатах и наезжала на соседнюю секцию.
 *
 * Следим именно за высотой: ширина уже обрабатывается отдельно,
 * а на мобильных высота вьюпорта скачет при появлении адресной строки,
 * поэтому сравниваем высоту документа, а не окна.
 */
export function ScrollRefresher() {
  useEffect(() => {
    initGsap();

    let lastHeight = document.documentElement.scrollHeight;
    let timer = 0;

    const schedule = () => {
      window.clearTimeout(timer);
      // Небольшая задержка: за одно раскрытие категории размер меняется
      // несколько раз, пересчитывать на каждый кадр незачем.
      timer = window.setTimeout(() => {
        const height = document.documentElement.scrollHeight;
        if (Math.abs(height - lastHeight) < 8) return;
        lastHeight = height;
        ScrollTrigger.refresh();
      }, 160);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
