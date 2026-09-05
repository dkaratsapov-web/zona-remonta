"use client";

import { siteConfig } from "@/data/siteConfig";

/**
 * Тонкая обёртка над Метрикой и GA. ID берутся из env, а не из кода.
 * Пока ID не заданы — события просто уходят в консоль в dev-режиме,
 * что позволяет проверить воронку до подключения счётчиков.
 */
export type AnalyticsEvent =
  | "hero_cta_click"
  | "calculator_start"
  | "calculator_step"
  | "calculator_complete"
  | "calculator_abandon_step"
  | "phone_click"
  | "messenger_click"
  | "project_view"
  | "form_submit"
  | "form_error"
  | "final_cta_click";

type Params = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    ym?: (id: number, action: string, ...rest: unknown[]) => void;
    gtag?: (command: string, ...rest: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;

  const ymId = Number(siteConfig.analytics.yandexMetrikaId);
  if (ymId && typeof window.ym === "function") {
    window.ym(ymId, "reachGoal", event, params);
  }
  if (siteConfig.analytics.googleAnalyticsId && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, params);
  }
}
