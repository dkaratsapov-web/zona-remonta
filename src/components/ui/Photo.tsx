import type { CSSProperties } from "react";

export type PhotoVariant = "warm" | "cool" | "night" | "stone" | "raw";

type Props = {
  variant?: PhotoVariant;
  /** Нижняя плоскость «пола» — уместна на интерьерных кадрах. */
  floor?: boolean;
  /** Технические направляющие внутри кадра. */
  edges?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Метка «демо» поверх кадра. */
  demoLabel?: string;
};

/**
 * Заглушка под фотографию.
 *
 * Реального портфолио от заказчика нет, а сток брать нельзя: он создаёт
 * ложное впечатление о работах и тянет за собой вопрос лицензии. Поэтому
 * кадр рисуется градиентами — ноль килобайт трафика и ноль юридических рисков.
 *
 * ЗАМЕНА НА РЕАЛЬНОЕ ФОТО: подставить <img src=... alt=...> внутрь этого
 * компонента. Все размеры задаёт контейнер снаружи, поэтому вёрстка
 * ни в одной секции не поедет. Список нужных кадров — CONTENT-REPLACEMENT.md.
 */
export function Photo({
  variant = "warm",
  floor = false,
  edges = false,
  className = "",
  style,
  demoLabel,
}: Props) {
  return (
    <div className={`photo photo--${variant} ${className}`} style={style} aria-hidden="true">
      <i className="base" />
      <i className="glow" />
      <i className="beam" />
      {edges ? <i className="edge" /> : null}
      {floor ? <i className="floor" /> : null}
      <i className="vig" />
      {demoLabel ? <span className="demo-tag">{demoLabel}</span> : null}
    </div>
  );
}
