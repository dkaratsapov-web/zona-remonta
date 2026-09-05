"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionLabel } from "@/components/ui/SectionLabel";

const TEXT =
  "Ремонт — это не набор отдельных работ. Это один процесс, за который должен отвечать один подрядчик.";

/** Красным подсвечивается ровно словосочетание «один процесс». */
const ACCENT_FROM = TEXT.indexOf("один процесс");
const ACCENT_TO = ACCENT_FROM + "один процесс".length;

const CHARS = Array.from(TEXT).map((char, index) => ({
  char,
  accent: index >= ACCENT_FROM && index < ACCENT_TO,
}));

/**
 * Ритм печати.
 *
 * Равномерная выдача символов читается как машина. Человек печатает
 * рывками: внутри слова быстро, на знаках препинания задумывается,
 * иногда сбивается на долю секунды. Эти три правила и заданы ниже —
 * из них складывается ощущение живого набора.
 */
function delayFor(char: string, next: string | undefined): number {
  const base = 26 + Math.random() * 26;
  if (char === "." || char === "!" || char === "?") return base + 380 + Math.random() * 140;
  if (char === "," || char === "—") return base + 200 + Math.random() * 120;
  if (char === " ") return base + (next && next === next.toUpperCase() ? 90 : 24);
  // Редкая запинка — примерно раз на двадцать символов
  if (Math.random() < 0.05) return base + 110 + Math.random() * 90;
  return base;
}

/**
 * Манифест печатается по мере появления в кадре.
 *
 * Текст целиком лежит в разметке: скринридер читает его как обычный
 * абзац, поисковик видит полностью, а без JS он просто виден сразу —
 * скрытие символов навешено под классом .js.
 */
export function Manifest() {
  const root = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = root.current;
    // При reduced-motion печати нет вовсе: текст показывается сразу,
    // значение берётся при отрисовке, а не через состояние.
    if (!node || reduced) return;

    let timer = 0;
    let index = 0;

    const step = () => {
      index += 1;
      setTyped(index);
      if (index >= CHARS.length) return;
      timer = window.setTimeout(step, delayFor(CHARS[index - 1].char, CHARS[index]?.char));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(step, 260);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduced]);

  const shown = reduced ? CHARS.length : typed;
  const done = shown >= CHARS.length;

  return (
    <section className="section manifest" id="about" ref={root}>
      <span className="manifest__rail" aria-hidden="true">
        <span
          data-manifest-line
          style={{ transform: `scaleY(${Math.max(0.06, shown / CHARS.length)})` }}
        />
      </span>

      <div className="container">
        <SectionLabel number="02" title="Манифест" />

        <p className="manifest__headline">
          {CHARS.map((item, index) => (
            <span
              key={index}
              className={`ch${index < shown ? " ch--on" : ""}${
                !done && index === shown - 1 ? " ch--caret" : ""
              }`}
              style={item.accent ? { color: "var(--accent-text)" } : undefined}
            >
              {item.char === " " ? " " : item.char}
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
