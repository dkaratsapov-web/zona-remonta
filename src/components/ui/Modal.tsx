"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * Доступное модальное окно.
 *
 * Клавиатура здесь не «на всякий случай»: без ловушки фокуса Tab уводит
 * за пределы окна на страницу под ним, и человек теряется. Поэтому —
 * фокус внутрь при открытии, цикл по Tab, Esc на закрытие и возврат
 * фокуса на элемент, который окно вызвал.
 */
export function Modal({ open, onClose, labelledBy, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const scrollLocked = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = panel.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;

      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = scrollLocked;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" role="presentation" onClick={onClose}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={panel}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть окно">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
