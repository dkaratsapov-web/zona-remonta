/**
 * Путь к файлу из public с учётом basePath и версии содержимого.
 *
 * На GitHub Pages сайт живёт в подпапке, и обычный "/images/..." ушёл бы
 * в корень домена — то есть в 404. next/image и next/link подставляют
 * префикс сами, обычный <img> — нет.
 *
 * Второе: картинки заменяются под теми же именами, поэтому к адресу
 * добавляется хеш содержимого (src/lib/assetManifest.ts, генерируется
 * перед сборкой). Без него браузер показывает старый кадр из кэша
 * даже после успешного деплоя.
 */
import { assetManifest } from "@/lib/assetManifest";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  const url = path.startsWith("/") ? path : `/${path}`;
  const version = assetManifest[url];
  return `${basePath}${url}${version ? `?v=${version}` : ""}`;
}
