import type { NextConfig } from "next";

/**
 * Проект собирается статическим экспортом и раздаётся с GitHub Pages.
 * Серверного рантайма нет: API-роуты недоступны, отправка заявок идёт
 * из браузера через провайдер, выбранный в src/data/siteConfig.ts.
 *
 * basePath нужен, потому что сайт живёт в подпапке репозитория:
 * https://<user>.github.io/zona-remonta
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    // На Pages нет сервера оптимизации изображений.
    unoptimized: true,
  },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
