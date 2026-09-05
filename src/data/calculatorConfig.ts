/**
 * Конфигурация и прайс калькулятора.
 *
 * Ни одна цифра не живёт внутри компонентов: ставки, коэффициенты
 * и надбавки правятся только здесь.
 *
 * ⚠️ СТАВКИ ДЕМОНСТРАЦИОННЫЕ. Прайса от заказчика нет, значения ниже —
 * ориентир по рынку, чтобы калькулятор считал и его можно было показать.
 * Перед публикацией заказчик обязан заменить их своими. Результат
 * намеренно показывается диапазоном и сопровождается оговоркой:
 * это предварительная оценка, а не коммерческое предложение.
 */

export const pricingEnabled = true;

/** Разброс итогового диапазона: ±15% от расчётной суммы. */
export const RANGE_SPREAD = 0.15;

export type ObjectTypeId = "apartment" | "house" | "works" | "windows" | "other";

/** Единица измерения объёма — у окон это конструкции, а не метры. */
export type Unit = "sqm" | "piece" | "none";

export type ScopeOption = {
  id: string;
  label: string;
  hint?: string;
  /** Ставка за единицу объёма, ₽. null — считать нельзя, нужен разговор. */
  rate: number | null;
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
  unit: Unit;
  unitLabel: string;
  /** Диапазон объёма для слайдера. */
  range: { min: number; max: number; step: number; default: number };
  /** Спрашивать ли уровень отделки. */
  askLevel: boolean;
  scopes: ScopeOption[];
};

const FINISH_WORKS = ["Демонтаж", "Черновые работы", "Электрика", "Сантехника", "Отделка"];

export const objectTypes: ObjectType[] = [
  {
    id: "apartment",
    label: "Квартира",
    hint: "Под ключ и отдельные работы",
    unit: "sqm",
    unitLabel: "м²",
    range: { min: 20, max: 400, step: 1, default: 82 },
    askLevel: true,
    scopes: [
      {
        id: "cosmetic",
        label: "Косметический ремонт",
        hint: "Без замены коммуникаций",
        rate: 6500,
        works: ["Подготовка поверхностей", "Отделка", "Финишные работы"],
      },
      {
        id: "capital",
        label: "Капитальный ремонт",
        hint: "С заменой коммуникаций",
        rate: 11500,
        works: FINISH_WORKS,
      },
      {
        id: "turnkey",
        label: "Под ключ",
        hint: "Полный цикл с комплектацией",
        rate: 14500,
        works: [...FINISH_WORKS, "Комплектация"],
      },
      {
        id: "premium",
        label: "Дизайнерский / премиальный",
        hint: "По дизайн-проекту",
        rate: 21000,
        works: [...FINISH_WORKS, "Работа по дизайн-проекту", "Комплектация"],
      },
    ],
  },
  {
    id: "house",
    label: "Дом / коттедж",
    hint: "Строительство и отделка",
    unit: "sqm",
    unitLabel: "м²",
    range: { min: 40, max: 800, step: 5, default: 180 },
    askLevel: true,
    scopes: [
      {
        id: "repair",
        label: "Ремонт",
        hint: "Отделка готового дома",
        rate: 9500,
        works: ["Демонтаж", "Черновые работы", "Отделка"],
      },
      {
        id: "construction",
        label: "Строительные работы",
        hint: "Коробка и инженерия",
        rate: 26000,
        works: ["Подготовка участка", "Строительные работы", "Инженерные системы"],
      },
      {
        id: "turnkey",
        label: "Под ключ",
        hint: "От участка до готового дома",
        rate: 38000,
        works: ["Строительные работы", "Инженерные системы", "Отделка", "Комплектация"],
      },
      {
        id: "terrace",
        label: "Терраса",
        hint: "Площадь террасы",
        rate: 14000,
        works: ["Основание", "Каркас", "Настил и отделка"],
      },
    ],
  },
  {
    id: "works",
    label: "Отдельные работы",
    hint: "Без полного ремонта",
    unit: "sqm",
    unitLabel: "м²",
    range: { min: 10, max: 500, step: 5, default: 60 },
    askLevel: false,
    scopes: [
      { id: "demolition", label: "Демонтаж", rate: 1800, works: ["Демонтаж", "Вывоз мусора"] },
      { id: "rough", label: "Черновые работы", rate: 4200, works: ["Стяжка", "Штукатурка", "Выравнивание"] },
      { id: "electric", label: "Электрика", rate: 2600, works: ["Разводка", "Монтаж оборудования"] },
      { id: "plumbing", label: "Сантехника", rate: 2900, works: ["Разводка", "Установка приборов"] },
      { id: "finishing", label: "Отделка", rate: 5400, works: ["Подготовка", "Финишная отделка"] },
    ],
  },
  {
    id: "windows",
    label: "Окна",
    hint: "Монтаж, замена, ремонт",
    unit: "piece",
    unitLabel: "шт.",
    range: { min: 1, max: 40, step: 1, default: 5 },
    askLevel: false,
    scopes: [
      { id: "install", label: "Монтаж", rate: 9500, works: ["Замер", "Монтаж", "Отделка откосов"] },
      { id: "replace", label: "Замена", rate: 12500, works: ["Демонтаж", "Монтаж", "Отделка откосов"] },
      { id: "repair", label: "Ремонт", rate: 4500, works: ["Диагностика", "Ремонт", "Регулировка"] },
      { id: "service", label: "Обслуживание", rate: 2500, works: ["Регулировка", "Замена уплотнителей"] },
    ],
  },
  {
    id: "other",
    label: "Другое",
    hint: "Нестандартная задача",
    unit: "none",
    unitLabel: "",
    range: { min: 0, max: 0, step: 1, default: 0 },
    askLevel: false,
    scopes: [
      {
        id: "custom",
        label: "Нестандартная задача",
        // Считать вслепую нельзя: объём определяется только после разговора.
        rate: null,
        works: ["Состав работ определяется после обсуждения"],
      },
    ],
  },
];

/** Уровень отделки — множитель к ставке работ. */
export const levels = [
  { id: "standard", label: "Стандарт", hint: "Практичные решения", factor: 1 },
  { id: "comfort", label: "Комфорт", hint: "Более качественные материалы", factor: 1.25 },
  { id: "premium", label: "Премиум", hint: "Сложные решения и отделка", factor: 1.6 },
];

/**
 * Дополнительные услуги.
 * kind: "perUnit" — цена за м²/шт., "percent" — процент от стоимости работ,
 * "fixed" — фиксированная сумма за объект.
 */
export const extraOptions = [
  {
    id: "materials",
    label: "Закупка материалов",
    hint: "Подбор, закупка и доставка",
    kind: "percent" as const,
    value: 0.12,
    work: "Комплектация",
  },
  {
    id: "demolition",
    label: "Демонтаж",
    hint: "Если помещение не подготовлено",
    kind: "perUnit" as const,
    value: 1800,
    work: "Демонтаж",
  },
  {
    id: "electric",
    label: "Электрика",
    hint: "Полная разводка",
    kind: "perUnit" as const,
    value: 2600,
    work: "Электрика",
  },
  {
    id: "plumbing",
    label: "Сантехника",
    hint: "Разводка и приборы",
    kind: "perUnit" as const,
    value: 2900,
    work: "Сантехника",
  },
  {
    id: "windows",
    label: "Окна",
    hint: "Монтаж или замена",
    kind: "fixed" as const,
    value: 60000,
    work: "Окна",
  },
  {
    id: "design",
    label: "Дизайн-проект",
    hint: "Планировки и визуализации",
    kind: "perUnit" as const,
    value: 2200,
    work: "Работа по дизайн-проекту",
  },
];

export type ExtraOption = (typeof extraOptions)[number];

export type PriceLine = { label: string; amount: number; note?: string };

export type Estimate = {
  /** Расчёт возможен: тип работ имеет ставку и задан объём. */
  calculable: boolean;
  lines: PriceLine[];
  total: number;
  min: number;
  max: number;
};

/**
 * Расчёт сметы. Чистая функция без побочных эффектов — её легко
 * проверить и переиспользовать вне компонента.
 */
export function estimate(input: {
  objectType: ObjectType | null;
  scope: ScopeOption | null;
  amount: number;
  levelId: string | null;
  extraIds: string[];
}): Estimate {
  const { objectType, scope, amount, levelId, extraIds } = input;
  const empty: Estimate = { calculable: false, lines: [], total: 0, min: 0, max: 0 };

  if (!objectType || !scope || scope.rate === null) return empty;
  if (objectType.unit !== "none" && amount <= 0) return empty;

  const level = levels.find((item) => item.id === levelId);
  const levelFactor = objectType.askLevel && level ? level.factor : 1;
  const units = objectType.unit === "none" ? 1 : amount;

  const base = Math.round(scope.rate * units * levelFactor);
  const lines: PriceLine[] = [
    {
      label: scope.label,
      amount: base,
      note:
        objectType.unit === "none"
          ? undefined
          : `${scope.rate.toLocaleString("ru-RU")} ₽ × ${units} ${objectType.unitLabel}` +
            (levelFactor !== 1 && level ? ` · ${level.label}` : ""),
    },
  ];

  extraIds.forEach((id) => {
    const extra = extraOptions.find((item) => item.id === id);
    if (!extra) return;
    if (extra.kind === "percent") {
      lines.push({
        label: extra.label,
        amount: Math.round(base * extra.value),
        note: `${Math.round(extra.value * 100)}% от стоимости работ`,
      });
      return;
    }
    if (extra.kind === "fixed") {
      lines.push({ label: extra.label, amount: extra.value, note: "фиксированная стоимость" });
      return;
    }
    lines.push({
      label: extra.label,
      amount: Math.round(extra.value * units),
      note: `${extra.value.toLocaleString("ru-RU")} ₽ × ${units} ${objectType.unitLabel}`,
    });
  });

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  // Округляем границы до десятков тысяч: точность до рубля здесь ложная.
  const round = (value: number) => Math.round(value / 10000) * 10000;

  return {
    calculable: true,
    lines,
    total,
    min: round(total * (1 - RANGE_SPREAD)),
    max: round(total * (1 + RANGE_SPREAD)),
  };
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}
