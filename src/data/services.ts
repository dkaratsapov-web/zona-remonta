import type { PhotoVariant } from "@/components/ui/Photo";

export type Service = {
  id: string;
  number: string;
  title: string;
  /** Заголовок с ручным переносом строки — типографика важнее автопереноса. */
  titleLines: string[];
  description: string;
  /** Заглушка на градиентах — используется, пока нет реального кадра. */
  photo: PhotoVariant;
  /** Реальное фото из public. Задано — рисуется вместо заглушки. */
  image?: string;
  imageAlt?: string;
};

export const services: Service[] = [
  {
    id: "apartments",
    number: "01",
    title: "Квартиры под ключ",
    titleLines: ["КВАРТИРЫ", "ПОД КЛЮЧ"],
    description: "Обычный, дизайнерский и премиальный ремонт квартир.",
    photo: "warm",
    image: "/images/services/apartment.webp",
    imageAlt: "Гостиная современной квартиры после ремонта: панорамное остекление, тёмная отделка, кухня-столовая",
  },
  {
    id: "houses",
    number: "02",
    title: "Дома под ключ",
    titleLines: ["ДОМА", "ПОД КЛЮЧ"],
    description: "Коттеджи, частные дома, террасы и загородные объекты.",
    photo: "night",
    image: "/images/services/house.webp",
    imageAlt: "Современный загородный дом вечером: панорамное остекление, терраса с зоной отдыха, подсветка ступеней",
  },
  {
    id: "construction",
    number: "03",
    title: "Строительно-монтажные работы",
    titleLines: ["СТРОИТЕЛЬНО-", "МОНТАЖНЫЕ"],
    description: "Различные виды строительных и монтажных работ.",
    photo: "cool",
  },
  {
    id: "windows",
    number: "04",
    title: "Окна",
    titleLines: ["ОКНА"],
    description: "Монтаж, замена и ремонт оконных конструкций.",
    photo: "stone",
  },
  {
    id: "materials",
    number: "05",
    title: "Материалы",
    titleLines: ["МАТЕРИАЛЫ"],
    description: "Подбор и закупка материалов под задачи объекта.",
    photo: "warm",
  },
  {
    id: "other",
    number: "06",
    title: "Другие работы",
    titleLines: ["ДРУГИЕ", "РАБОТЫ"],
    description: "Не нашли нужной услуги? Расскажите задачу — найдём решение.",
    photo: "cool",
  },
];
