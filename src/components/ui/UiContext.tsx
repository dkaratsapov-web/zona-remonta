"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ObjectTypeId } from "@/data/calculatorConfig";

/**
 * Единая точка управления модальными окнами.
 *
 * Кнопки по всему сайту не прокручивают страницу к форме — они сразу
 * открывают нужное окно. Поэтому состояние окон живёт над деревом,
 * а не внутри отдельных секций.
 */
type LeadTopic = { formId: string; title: string; text: string; sourceSection: string };

type UiValue = {
  calculator: { open: boolean; objectType: ObjectTypeId | null };
  lead: LeadTopic | null;
  openCalculator: (objectType?: ObjectTypeId | null) => void;
  closeCalculator: () => void;
  openLead: (topic: LeadTopic) => void;
  closeLead: () => void;
};

const UiContext = createContext<UiValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [calculator, setCalculator] = useState<UiValue["calculator"]>({
    open: false,
    objectType: null,
  });
  const [lead, setLead] = useState<LeadTopic | null>(null);

  const openCalculator = useCallback((objectType: ObjectTypeId | null = null) => {
    setCalculator({ open: true, objectType });
  }, []);
  const closeCalculator = useCallback(() => setCalculator({ open: false, objectType: null }), []);
  const openLead = useCallback((topic: LeadTopic) => setLead(topic), []);
  const closeLead = useCallback(() => setLead(null), []);

  const value = useMemo(
    () => ({ calculator, lead, openCalculator, closeCalculator, openLead, closeLead }),
    [calculator, lead, openCalculator, closeCalculator, openLead, closeLead],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiValue {
  const value = useContext(UiContext);
  if (!value) throw new Error("useUi вызван вне UiProvider");
  return value;
}

/** Готовые темы обращений — чтобы формулировки не расползались по коду. */
export const LEAD_TOPICS = {
  discuss: {
    formId: "header_cta",
    title: "Обсудить проект",
    text: "Опишите задачу — подскажем возможный формат работ и подготовим предварительный расчёт.",
    sourceSection: "header",
  },
  messenger: (channel: string): LeadTopic => ({
    formId: `messenger_${channel.toLowerCase()}`,
    title: `Написать в ${channel}`,
    text: `Аккаунт компании в ${channel} ещё подключается. Оставьте контакты — специалист свяжется с вами в удобном мессенджере.`,
    sourceSection: `header_${channel.toLowerCase()}`,
  }),
  service: (serviceTitle: string, serviceId: string): LeadTopic => ({
    formId: `service_${serviceId}`,
    title: serviceTitle,
    text: "Расскажите про объект — вернёмся с предложением по составу работ.",
    sourceSection: `service_modal_${serviceId}`,
  }),
} as const;
