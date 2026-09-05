/**
 * Единственный источник правды по контактам, юрлицу и каналу заявок.
 * Ничего из перечисленного НЕ хардкодится в компонентах.
 *
 * Пустая строка = данных от заказчика ещё нет. Компоненты обязаны
 * проверять значение и не выводить пустой контакт (см. hasContacts).
 */

export type LeadProvider = "mock" | "webhook" | "telegram";

export const siteConfig = {
  name: "Зона Ремонта",
  shortName: "ЗОНА РЕМОНТА",
  tagline: "Ремонт, строительство и комплексная реализация объектов под ключ.",
  description:
    "Ремонт квартир и домов, строительно-монтажные работы, монтаж и ремонт окон, подбор и закупка материалов.",

  /** PRODUCTION BLOCKER — заполнить перед публикацией. */
  contacts: {
    phone: "",
    phoneDisplay: "+7 (___) ___-__-__",
    email: "",
    telegram: "",
    whatsapp: "",
  },

  /** PRODUCTION BLOCKER — от региона зависят SEO, Schema.org и тексты. */
  serviceArea: {
    primaryCity: null as string | null,
    regions: [] as string[],
    radiusKm: null as number | null,
  },

  /** PRODUCTION BLOCKER — реквизиты для политики обработки ПД. */
  legal: {
    entity: "",
    inn: "",
    address: "",
  },

  /**
   * Куда уходит заявка.
   *
   * Сайт собирается статикой и раздаётся с GitHub Pages — серверного
   * рантайма нет. Поэтому:
   *   mock     — заявка валидируется и логируется в консоль, никуда не уходит.
   *              Единственный безопасный режим для демо.
   *   webhook  — POST на LEAD_WEBHOOK_URL прямо из браузера. URL попадает
   *              в бандл: годится только для эндпоинта, который не жалко
   *              светить и который сам проверяет входящее.
   *   telegram — ТОЛЬКО через собственный прокси. Класть токен бота
   *              в клиентский бандл нельзя ни при каких условиях.
   */
  leadProvider: "mock" as LeadProvider,
  leadWebhookUrl: process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL ?? "",

  analytics: {
    yandexMetrikaId: process.env.NEXT_PUBLIC_YM_ID ?? "",
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  },

  nav: [
    { label: "Услуги", href: "#services" },
    { label: "Проекты", href: "#projects" },
    { label: "Калькулятор", href: "#calculator" },
    { label: "Контакты", href: "#contacts" },
  ],
} as const;

export const hasPhone = siteConfig.contacts.phone.length > 0;
export const hasMessengers =
  siteConfig.contacts.telegram.length > 0 || siteConfig.contacts.whatsapp.length > 0;
