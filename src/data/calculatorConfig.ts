/**
 * Конфигурация калькулятора. Ни одна цена и ни один коэффициент
 * не живут внутри компонентов.
 *
 * pricingEnabled: false — прайса от заказчика нет, поэтому пользователю
 * НЕ показывается никакая сумма. Вместо неё — честная формулировка
 * и полезный результат: состав работ по выбранному объекту.
 *
 * Когда заказчик даст вилки: заполнить basePricePerSqm / коэффициенты
 * и переключить pricingEnabled в true. Вёрстка не меняется.
 */
export const pricingEnabled = false;

export type ObjectTypeId = "apartment" | "house" | "works" | "windows" | "other";

export type ScopeOption = {
  id: string;
  label: string;
  /** Множитель к базовой ставке. Применяется только при pricingEnabled. */
  factor: number;
  /**
   * Состав работ, который увидит пользователь.
   * ФАКТИЧЕСКОЕ УТВЕРЖДЕНИЕ О КОМПАНИИ — подтверждается заказчиком.
   */
  works: string[];
};

export type ObjectType = {
  id: ObjectTypeId;
  label: string;
  hint?: string;
  /** Спрашивать ли площадь на шаге 2. */
  askArea: boolean;
  scopes: ScopeOption[];
};

const FINISH_WORKS = ["Демонтаж", "Черновые работы", "Электрика", "Сантехника", "Отделка"];

export const objectTypes: ObjectType[] = [
  {
    id: "apartment",
    label: "Квартира",
    hint: "Под ключ и отдельные работы",
    askArea: true,
    scopes: [
      { id: "cosmetic", label: "Косметический ремонт", factor: 1, works: ["Подготовка поверхностей", "Отделка", "Финишные работы"] },
      { id: "capital", label: "Капитальный", factor: 1.45, works: FINISH_WORKS },
      { id: "turnkey", label: "Под ключ", factor: 1.7, works: [...FINISH_WORKS, "Комплектация"] },
      { id: "premium", label: "Дизайнерский / премиальный", factor: 2.2, works: [...FINISH_WORKS, "Работа по дизайн-проекту", "Комплектация"] },
    ],
  },
  {
    id: "house",
    label: "Дом / коттедж",
    hint: "Строительство и отделка",
    askArea: true,
    scopes: [
      { id: "repair", label: "Ремонт", factor: 1.2, works: ["Демонтаж", "Черновые работы", "Отделка"] },
      { id: "construction", label: "Строительные работы", factor: 1.6, works: ["Подготовка участка", "Строительные работы", "Инженерные системы"] },
      { id: "turnkey", label: "Под ключ", factor: 1.9, works: ["Строительные работы", "Инженерные системы", "Отделка", "Комплектация"] },
      { id: "terrace", label: "Терраса", factor: 1.1, works: ["Основание", "Каркас", "Настил и отделка"] },
      { id: "other", label: "Другое", factor: 1, works: ["Состав работ уточняется по объекту"] },
    ],
  },
  {
    id: "works",
    label: "Отдельные работы",
    hint: "Без полного ремонта",
    askArea: false,
    scopes: [
      { id: "demolition", label: "Демонтаж", factor: 1, works: ["Демонтаж", "Вывоз"] },
      { id: "electric", label: "Электрика", factor: 1, works: ["Разводка", "Монтаж оборудования"] },
      { id: "plumbing", label: "Сантехника", factor: 1, works: ["Разводка", "Установка приборов"] },
      { id: "finishing", label: "Отделка", factor: 1, works: ["Подготовка", "Отделка"] },
      { id: "other", label: "Другое", factor: 1, works: ["Состав работ уточняется по задаче"] },
    ],
  },
  {
    id: "windows",
    label: "Окна",
    hint: "Монтаж, замена, ремонт",
    askArea: false,
    scopes: [
      { id: "install", label: "Монтаж", factor: 1, works: ["Замер", "Монтаж", "Отделка откосов"] },
      { id: "replace", label: "Замена", factor: 1, works: ["Демонтаж", "Монтаж", "Отделка откосов"] },
      { id: "repair", label: "Ремонт", factor: 1, works: ["Диагностика", "Ремонт", "Регулировка"] },
      { id: "service", label: "Обслуживание", factor: 1, works: ["Регулировка", "Замена уплотнителей"] },
    ],
  },
  {
    id: "other",
    label: "Другое",
    hint: "Опишем задачу словами",
    askArea: false,
    scopes: [{ id: "custom", label: "Нестандартная задача", factor: 1, works: ["Состав работ определяется после обсуждения"] }],
  },
];

export const extraOptions = [
  { id: "materials", label: "Закупка материалов", factor: 0.1, work: "Комплектация" },
  { id: "demolition", label: "Демонтаж", factor: 0.08, work: "Демонтаж" },
  { id: "electric", label: "Электрика", factor: 0.12, work: "Электрика" },
  { id: "plumbing", label: "Сантехника", factor: 0.12, work: "Сантехника" },
  { id: "windows", label: "Окна", factor: 0.09, work: "Окна" },
];

export const areaRange = { min: 20, max: 400, step: 1, default: 82 } as const;

/** Заполняется вместе с pricingEnabled. Пока не используется. */
export const basePricePerSqm: Record<ObjectTypeId, number | null> = {
  apartment: null,
  house: null,
  works: null,
  windows: null,
  other: null,
};
