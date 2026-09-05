/**
 * Путь к файлу из public с учётом basePath.
 *
 * На GitHub Pages сайт живёт в подпапке, и обычный "/images/..." ушёл бы
 * в корень домена — то есть в 404. next/image и next/link подставляют
 * префикс сами, обычный <img> — нет.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
