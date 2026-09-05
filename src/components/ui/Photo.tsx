import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";

export type PhotoVariant = "warm" | "cool" | "night" | "stone" | "raw";

type Props = {
  variant?: PhotoVariant;
  /** Реальное фото. Если задано — рисуется вместо градиентной заглушки. */
  src?: string;
  /** Обязателен вместе с src: без описания кадр недоступен для скринридера. */
  alt?: string;
  /** Приоритетная загрузка — только для кадра первого экрана. */
  priority?: boolean;
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
 * Кадр секции.
 *
 * Есть src — выводится настоящее фото. Нет — рисуется заглушка на
 * градиентах: сток брать нельзя (создаёт ложное впечатление о работах
 * и тянет вопрос лицензии), а пустое место выглядело бы дырой.
 *
 * Размеры в обоих случаях задаёт контейнер снаружи, поэтому подстановка
 * реального фото не двигает вёрстку ни в одной секции.
 * Список нужных кадров — CONTENT-REPLACEMENT.md.
 */
export function Photo({
  variant = "warm",
  src,
  alt,
  priority = false,
  floor = false,
  edges = false,
  className = "",
  style,
  demoLabel,
}: Props) {
  if (src) {
    return (
      <div className={`photo photo--image ${className}`} style={style}>
        {/*
          next/image здесь ничего не даст: на статическом экспорте
          images.unoptimized = true, сервера оптимизации нет, и компонент
          вывел бы тот же самый файл. Размер, кадр и формат подготовлены
          заранее (WebP ~80 КБ вместо исходных 2.3 МБ).
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(src)}
          alt={alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
        />
        <i className="vig" aria-hidden="true" />
        {edges ? <i className="edge" aria-hidden="true" /> : null}
      </div>
    );
  }

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
