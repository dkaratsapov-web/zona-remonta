"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Подписка на media query. useSyncExternalStore — штатный способ читать
 * внешнее состояние: не даёт каскадных рендеров и корректно ведёт себя
 * при пререндере (на сервере всегда false, эффекты не запускаются).
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Уважаем системную настройку: при reduce анимации не запускаются вовсе. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Курсор и mouse-параллакс включаются только на устройствах с точным указателем. */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}

/**
 * Состояние переживает случайное обновление страницы.
 *
 * Значение из sessionStorage поднимается один раз после монтирования:
 * читать хранилище во время рендера нельзя — при статическом пререндере
 * это разошлось бы с разметкой и сломало гидратацию.
 */
export function useSessionState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    let stored: T | null = null;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) stored = JSON.parse(raw) as T;
    } catch {
      /* приватный режим — работаем с начальным значением */
    }
    if (stored !== null) {
      setValue(stored);
    }
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* запись может быть запрещена — не ломаем UI */
      }
    },
    [key],
  );

  return [value, update];
}
