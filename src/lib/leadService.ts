"use client";

import { z } from "zod";
import { siteConfig } from "@/data/siteConfig";
import { getLeadContext, type LeadContext } from "./attribution";

/**
 * Единственная точка отправки заявок. UI ничего не знает о канале доставки:
 * провайдер переключается одной строкой в siteConfig.leadProvider.
 *
 * ВАЖНО про статику: сайт раздаётся с GitHub Pages, серверного /api/lead нет.
 * Значит нет и серверной валидации, rate-limit и секретов. Антиспам здесь —
 * honeypot и проверка времени заполнения; это отсекает простых ботов,
 * но не заменяет серверную защиту. Перед боевым запуском канал доставки
 * должен быть за собственным прокси — см. README, раздел «Приём заявок».
 */

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(6, "Укажите телефон")
    .max(24, "Проверьте номер")
    // Международный формат не ломаем: только цифры, плюс, пробелы и скобки.
    .regex(/^\+?[\d\s()-]{6,24}$/u, "Проверьте номер"),
  comment: z.string().trim().max(1500).optional(),
  consent: z.literal(true, { message: "Без согласия отправить нельзя" }),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadPayload = LeadInput & {
  formId: string;
  sourceSection: string;
  /** Данные калькулятора, если заявка пришла оттуда. */
  calculator?: Record<string, string | number | string[]>;
  context: LeadContext;
};

export type SubmitResult = { ok: true } | { ok: false; reason: "spam" | "network" | "config" };

type AntiSpam = {
  /** Скрытое поле: заполнено — перед нами бот. */
  honeypot: string;
  /** Время открытия формы. Меньше 2 секунд на заполнение — бот. */
  startedAt: number;
};

const MIN_FILL_MS = 2000;

export async function submitLead(
  input: LeadInput,
  meta: { formId: string; sourceSection: string; calculator?: LeadPayload["calculator"] },
  antiSpam: AntiSpam,
): Promise<SubmitResult> {
  if (antiSpam.honeypot.trim().length > 0) return { ok: false, reason: "spam" };
  if (Date.now() - antiSpam.startedAt < MIN_FILL_MS) return { ok: false, reason: "spam" };

  const payload: LeadPayload = {
    ...input,
    formId: meta.formId,
    sourceSection: meta.sourceSection,
    calculator: meta.calculator,
    context: getLeadContext(),
  };

  switch (siteConfig.leadProvider) {
    case "webhook":
      return sendWebhook(payload);
    case "telegram":
      // Прямой вызов Bot API из браузера раскрыл бы токен в бандле.
      console.error(
        "[lead] Провайдер telegram требует серверного прокси и не работает на статике. См. README.",
      );
      return { ok: false, reason: "config" };
    case "mock":
    default:
      return sendMock(payload);
  }
}

async function sendMock(payload: LeadPayload): Promise<SubmitResult> {
  // Демо-режим: заявка никуда не уходит, но полностью формируется —
  // видно, что именно получит CRM после подключения реального канала.
  console.info("[lead:mock] заявка сформирована и НЕ отправлена:", payload);
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: true };
}

async function sendWebhook(payload: LeadPayload): Promise<SubmitResult> {
  const url = siteConfig.leadWebhookUrl;
  if (!url) {
    console.error("[lead] leadProvider=webhook, но NEXT_PUBLIC_LEAD_WEBHOOK_URL пуст.");
    return { ok: false, reason: "config" };
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, reason: "network" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}
