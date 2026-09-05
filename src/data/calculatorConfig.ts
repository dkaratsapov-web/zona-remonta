/**
 * Конфигурация конфигуратора стоимости.
 *
 * В компонентах нет ни одной цены: всё, что влияет на расчёт, живёт здесь.
 *
 * pricingStatus: "demo" — прайса заказчика ещё нет, значения ориентировочные
 * и в интерфейсе помечены. Переключение на "production" убирает пометку.
 */

export type PricingStatus = "demo" | "production";
export const pricingStatus: PricingStatus = "demo";

export type ObjectTypeId = "apartment" | "house" | "works" | "windows" | "other";

/**
 * Как считается услуга:
 *  per_m2      — ставка × площадь
 *  per_unit    — ставка × количество единиц (окна)
 *  fixed       — фиксированная сумма за объект, площадь не влияет
 *  percentage  — процент от стоимости остальных выбранных работ
 */
export type PricingMode = "per_m2" | "per_unit" | "fixed" | "percentage";

export type CategoryId = "preparation" | "engineering" | "finishing" | "completion";

export type Category = { id: CategoryId; number: string; title: string };

export const categories: Category[] = [
  { id: "preparation", number: "01", title: "Подготовка" },
  { id: "engineering", number: "02", title: "Инженерия" },
  { id: "finishing", number: "03", title: "Отделка" },
  { id: "completion", number: "04", title: "Комплектация" },
];

export type Service = {
  id: string;
  category: CategoryId;
  title: string;
  /** Короткое пояснение в строке — что именно входит. */
  hint?: string;
  priceType: PricingMode;
  price: number;
  availableFor: ObjectTypeId[];
  /** Услуги, которые часто берут вместе с этой. */
  suggests?: string[];
};

export const services: Service[] = [
  // ── Подготовка ──────────────────────────────────────────────
  {
    id: "demolition",
    category: "preparation",
    title: "Демонтаж",
    hint: "Снос перегородок, снятие покрытий",
    priceType: "per_m2",
    price: 950,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "waste",
    category: "preparation",
    title: "Вывоз мусора",
    hint: "Погрузка и вывоз",
    priceType: "per_m2",
    price: 380,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "base",
    category: "preparation",
    title: "Подготовка основания",
    hint: "Стяжка, выравнивание пола",
    priceType: "per_m2",
    price: 1450,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "partitions",
    category: "preparation",
    title: "Возведение перегородок",
    hint: "Новая планировка",
    priceType: "per_m2",
    price: 1200,
    availableFor: ["apartment", "house", "works"],
  },

  // ── Инженерия ───────────────────────────────────────────────
  {
    id: "electrical",
    category: "engineering",
    title: "Электромонтажные работы",
    hint: "Разводка, щит, точки",
    priceType: "per_m2",
    price: 1500,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "plumbing",
    category: "engineering",
    title: "Сантехнические работы",
    hint: "Разводка и приборы",
    priceType: "per_m2",
    price: 1250,
    availableFor: ["apartment", "house", "works"],
    suggests: ["waterproofing"],
  },
  {
    id: "heating",
    category: "engineering",
    title: "Отопление",
    hint: "Контуры и радиаторы",
    priceType: "per_m2",
    price: 1350,
    availableFor: ["house", "works"],
  },
  {
    id: "ventilation",
    category: "engineering",
    title: "Вентиляция и кондиционирование",
    priceType: "per_m2",
    price: 1100,
    availableFor: ["apartment", "house"],
  },

  // ── Отделка ─────────────────────────────────────────────────
  {
    id: "walls",
    category: "finishing",
    title: "Отделка стен",
    hint: "Выравнивание и финиш",
    priceType: "per_m2",
    price: 1850,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "ceiling",
    category: "finishing",
    title: "Потолки",
    hint: "Выравнивание, короба, подсветка",
    priceType: "per_m2",
    price: 1200,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "floors",
    category: "finishing",
    title: "Напольные покрытия",
    hint: "Укладка и плинтус",
    priceType: "per_m2",
    price: 1400,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "tiles",
    category: "finishing",
    title: "Плитка",
    hint: "Санузлы и кухня",
    priceType: "per_m2",
    price: 1650,
    availableFor: ["apartment", "house", "works"],
    suggests: ["waterproofing", "base"],
  },
  {
    id: "waterproofing",
    category: "finishing",
    title: "Гидроизоляция",
    hint: "Мокрые зоны",
    priceType: "per_m2",
    price: 620,
    availableFor: ["apartment", "house", "works"],
  },

  // ── Комплектация ────────────────────────────────────────────
  {
    id: "doors",
    category: "completion",
    title: "Монтаж дверей",
    hint: "Межкомнатные и входные",
    priceType: "fixed",
    price: 36000,
    availableFor: ["apartment", "house", "works"],
  },
  {
    id: "windows",
    category: "completion",
    title: "Окна",
    hint: "Монтаж или замена конструкций",
    priceType: "per_unit",
    price: 12500,
    availableFor: ["apartment", "house", "works", "windows"],
  },
  {
    id: "delivery",
    category: "completion",
    title: "Доставка на объект",
    priceType: "fixed",
    price: 28000,
    availableFor: ["apartment", "house", "works", "windows"],
  },
  {
    id: "materials",
    category: "completion",
    title: "Закупка материалов",
    hint: "Подбор, закупка и приёмка",
    priceType: "percentage",
    price: 12,
    availableFor: ["apartment", "house", "works", "windows"],
  },
];

export type ObjectType = {
  id: ObjectTypeId;
  label: string;
  /** Коэффициент сложности объекта. */
  coefficient: number;
  /** Спрашивать ли площадь. */
  askArea: boolean;
  /** Единица объёма для услуг с per_unit. */
  unitLabel: string;
  area: { min: number; max: number; step: number; default: number };
  /** Количество конструкций — для типа «Окна». */
  units?: { min: number; max: number; step: number; default: number };
};

export const objectTypes: ObjectType[] = [
  {
    id: "apartment",
    label: "Квартира",
    coefficient: 1,
    askArea: true,
    unitLabel: "шт.",
    area: { min: 20, max: 500, step: 1, default: 82 },
  },
  {
    id: "house",
    label: "Дом",
    coefficient: 1.2,
    askArea: true,
    unitLabel: "шт.",
    area: { min: 40, max: 800, step: 5, default: 180 },
  },
  {
    id: "works",
    label: "Отдельные работы",
    coefficient: 1,
    askArea: true,
    unitLabel: "шт.",
    area: { min: 10, max: 500, step: 5, default: 40 },
  },
  {
    id: "windows",
    label: "Окна",
    coefficient: 1,
    askArea: false,
    unitLabel: "шт.",
    area: { min: 0, max: 0, step: 1, default: 0 },
    units: { min: 1, max: 40, step: 1, default: 5 },
  },
  {
    id: "other",
    label: "Другое",
    coefficient: 1,
    askArea: false,
    unitLabel: "",
    area: { min: 0, max: 0, step: 1, default: 0 },
  },
];

/** Количество окон по умолчанию, когда услуга «Окна» выбрана на другом объекте. */
export const DEFAULT_WINDOW_UNITS = 5;

export type TotalBreakdown = {
  works: number;
  materials: number;
  total: number;
  selectedCount: number;
  /** Стоимость каждой выбранной услуги — для строки и для заявки. */
  perService: Record<string, number>;
};

/**
 * Расчёт стоимости. Чистая функция: её можно проверить отдельно
 * от интерфейса и переиспользовать в заявке.
 *
 * Порядок важен: процентные услуги считаются от суммы остальных,
 * иначе процент от процента давал бы неверный итог.
 */
export function calculateTotal(input: {
  objectType: ObjectType | null;
  area: number;
  units: number;
  selectedIds: string[];
}): TotalBreakdown {
  const { objectType, area, units, selectedIds } = input;
  const empty: TotalBreakdown = {
    works: 0,
    materials: 0,
    total: 0,
    selectedCount: 0,
    perService: {},
  };
  if (!objectType || selectedIds.length === 0) return empty;

  const selected = services.filter((service) => selectedIds.includes(service.id));
  const perService: Record<string, number> = {};
  let works = 0;

  selected
    .filter((service) => service.priceType !== "percentage")
    .forEach((service) => {
      let amount = 0;
      if (service.priceType === "per_m2") amount = service.price * area;
      else if (service.priceType === "per_unit") amount = service.price * units;
      else amount = service.price;

      amount = Math.round(amount * objectType.coefficient);
      perService[service.id] = amount;
      works += amount;
    });

  let materials = 0;
  selected
    .filter((service) => service.priceType === "percentage")
    .forEach((service) => {
      const amount = Math.round((works * service.price) / 100);
      perService[service.id] = amount;
      materials += amount;
    });

  return {
    works,
    materials,
    total: works + materials,
    selectedCount: selected.length,
    perService,
  };
}

/** Предварительная стоимость одной услуги — для строки списка. */
export function servicePrice(
  service: Service,
  objectType: ObjectType | null,
  area: number,
  units: number,
  worksSubtotal: number,
): number {
  if (!objectType) return 0;
  if (service.priceType === "percentage") {
    return Math.round((worksSubtotal * service.price) / 100);
  }
  const base =
    service.priceType === "per_m2"
      ? service.price * area
      : service.priceType === "per_unit"
        ? service.price * units
        : service.price;
  return Math.round(base * objectType.coefficient);
}

export function formatMoney(value: number): string {
  return `${Math.max(0, Math.round(value)).toLocaleString("ru-RU")} ₽`;
}
