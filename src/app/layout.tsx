import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { siteConfig } from "@/data/siteConfig";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Зона Ремонта — ремонт квартир и домов под ключ",
  description: siteConfig.description,
  // Регион добавляется в title и description, как только заказчик его подтвердит.
  openGraph: {
    title: "Зона Ремонта — ремонт квартир и домов под ключ",
    description: siteConfig.description,
    type: "website",
    locale: "ru_RU",
    siteName: siteConfig.name,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <head>
        {/*
          Класс .js ставится до первой отрисовки. Все начальные состояния
          анимаций висят под ним, поэтому при отключённом или упавшем JS
          страница остаётся полностью читаемой (никаких opacity: 0).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
