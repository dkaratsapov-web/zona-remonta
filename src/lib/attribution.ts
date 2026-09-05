"use client";

/**
 * Сбор источника лида.
 *
 * Правило по согласию: до того как посетитель принял обработку данных,
 * пишем только в sessionStorage и НЕ заводим стойкий идентификатор.
 * Стойкий visitorId появляется лишь после согласия — см. grantPersistence().
 *
 * Храним first-touch и last-touch раздельно: иначе повторный заход
 * по брендовому запросу затрёт исходный источник и вся аналитика
 * покажет, что лиды пришли из брендового трафика.
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_IDS = ["yclid", "gclid", "fbclid"] as const;

const FIRST_KEY = "zr_attr_first";
const LAST_KEY = "zr_attr_last";
const SESSION_KEY = "zr_session_id";
const VISITOR_KEY = "zr_visitor_id";
const CONSENT_KEY = "zr_persist_ok";

export type Attribution = Record<string, string>;

export type LeadContext = {
  firstTouch: Attribution;
  lastTouch: Attribution;
  referrer: string;
  landingUrl: string;
  sessionId: string;
  visitorId: string | null;
  timestamp: string;
};

function safeGet(store: Storage | null, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(store: Storage | null, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    /* приватный режим или заблокированные site data — молча продолжаем */
  }
}

function stores(): { session: Storage | null; local: Storage | null } {
  if (typeof window === "undefined") return { session: null, local: null };
  let session: Storage | null = null;
  let local: Storage | null = null;
  try {
    session = window.sessionStorage;
  } catch {
    /* доступ к sessionStorage может кидать исключение */
  }
  try {
    local = window.localStorage;
  } catch {
    /* то же самое для localStorage */
  }
  return { session, local };
}

function readParams(): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Attribution = {};
  for (const key of [...UTM_KEYS, ...CLICK_IDS]) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 200);
  }
  return out;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Вызывается один раз при монтировании страницы. */
export function initAttribution(): void {
  if (typeof window === "undefined") return;
  const { session, local } = stores();

  if (!safeGet(session, SESSION_KEY)) safeSet(session, SESSION_KEY, randomId());

  const current = readParams();
  const hasSource = Object.keys(current).length > 0;
  const payload = JSON.stringify({
    ...current,
    referrer: document.referrer || "",
    landing: window.location.pathname + window.location.search,
    at: new Date().toISOString(),
  });

  // first-touch фиксируем один раз за сессию и только при наличии меток
  if (hasSource || !safeGet(session, FIRST_KEY)) {
    if (!safeGet(session, FIRST_KEY)) safeSet(session, FIRST_KEY, payload);
  }
  if (hasSource) safeSet(session, LAST_KEY, payload);

  // Стойкий идентификатор — только если согласие уже дано ранее
  if (safeGet(local, CONSENT_KEY) === "1" && !safeGet(local, VISITOR_KEY)) {
    safeSet(local, VISITOR_KEY, randomId());
  }
}

/** Вызывается после того, как посетитель принял обработку данных. */
export function grantPersistence(): void {
  const { local } = stores();
  safeSet(local, CONSENT_KEY, "1");
  if (!safeGet(local, VISITOR_KEY)) safeSet(local, VISITOR_KEY, randomId());
}

function parse(raw: string | null): Attribution {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}

export function getLeadContext(): LeadContext {
  const { session, local } = stores();
  return {
    firstTouch: parse(safeGet(session, FIRST_KEY)),
    lastTouch: parse(safeGet(session, LAST_KEY)),
    referrer: typeof document === "undefined" ? "" : document.referrer || "",
    landingUrl: typeof window === "undefined" ? "" : window.location.href,
    sessionId: safeGet(session, SESSION_KEY) ?? "",
    visitorId: safeGet(local, VISITOR_KEY),
    timestamp: new Date().toISOString(),
  };
}
