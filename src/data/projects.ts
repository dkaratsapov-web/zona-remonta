import type { PhotoVariant } from "@/components/ui/Photo";

/**
 * DEMO PROJECTS — replace with real projects.
 *
 * Ни адресов, ни бюджетов, ни сроков: этих данных от заказчика нет,
 * а выдумывать их запрещено. Поля площади и работ намеренно пустые —
 * компонент выводит прочерк, пока значения не заполнены.
 */
export type Project = {
  id: string;
  number: string;
  title: string;
  titleLines: string[];
  type: string;
  area: string | null;
  works: string | null;
  photo: PhotoVariant;
  /** Реальное фото из public. Задано — рисуется вместо заглушки. */
  image?: string;
  imageAlt?: string;
  isDemo: boolean;
};

export const projects: Project[] = [
  {
    id: "project-01",
    number: "01",
    title: "Современная квартира",
    titleLines: ["Современная", "квартира"],
    type: "Квартира",
    area: null,
    works: null,
    photo: "warm",
    image: "/images/projects/project-01.webp",
    imageAlt: "Гостиная и кухня-столовая после ремонта: панорамное остекление, тёплая подсветка, тёмная отделка",
    isDemo: true,
  },
  {
    id: "project-02",
    number: "02",
    title: "Загородный дом",
    titleLines: ["Загородный", "дом"],
    type: "Дом",
    area: null,
    works: null,
    photo: "cool",
    isDemo: true,
  },
  {
    id: "project-03",
    number: "03",
    title: "Минималистичный интерьер",
    titleLines: ["Минималистичный", "интерьер"],
    type: "Квартира",
    area: null,
    works: null,
    photo: "night",
    isDemo: true,
  },
];
