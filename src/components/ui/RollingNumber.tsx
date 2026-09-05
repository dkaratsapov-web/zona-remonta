"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";

type Props = {
  /** Значение вида «03». Каждая цифра крутится своей лентой. */
  value: string;
  className?: string;
};

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Счётчик-одометр: цифра не подменяется, а уезжает вверх, а на её место
 * приезжает следующая.
 *
 * Разряды крутятся независимо, поэтому при переходе 09 → 10 двигаются оба,
 * а при 01 → 02 — только правый, как в настоящем счётчике.
 *
 * Значение целиком лежит в разметке для скринридера: лента из десяти цифр
 * ему не нужна и только мешала бы.
 */
export function RollingNumber({ value, className = "" }: Props) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={`roller ${className}`}>
      <span className="roller__sr">{value}</span>
      {Array.from(value).map((char, index) => {
        const digit = Number(char);
        if (Number.isNaN(digit)) {
          return (
            <span className="roller__static" key={index} aria-hidden="true">
              {char}
            </span>
          );
        }
        return (
          <span className="roller__slot" key={index} aria-hidden="true">
            <span className="roller__strip" style={{ transform: `translateY(${-digit * 10}%)` }}>
              {DIGITS.map((d) => (
                <span className="roller__digit" key={d}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
