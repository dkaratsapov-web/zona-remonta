/**
 * Версии файлов из public.
 *
 * Картинки заменяются под теми же именами: браузер и CDN GitHub Pages
 * держат прежний файл в кэше и показывают старый кадр даже после
 * успешного деплоя. Хеш содержимого в адресе снимает вопрос — меняется
 * файл, меняется ссылка.
 *
 * Запускается перед dev и build, результат коммитится: CI проверяет
 * типы до сборки, и файл должен существовать в репозитории.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const target = join(root, "src", "lib", "assetManifest.ts");

/** Служебные файлы, которым версия не нужна и вредна. */
const SKIP = new Set(["robots.txt", "sitemap.xml", "CNAME", ".nojekyll"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const entries = walk(publicDir)
  .filter((file) => !SKIP.has(relative(publicDir, file)))
  .map((file) => {
    const url = `/${relative(publicDir, file).split("\\").join("/")}`;
    const hash = createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 8);
    return [url, hash];
  })
  .sort(([a], [b]) => a.localeCompare(b));

const body = entries.map(([url, hash]) => `  "${url}": "${hash}",`).join("\n");

writeFileSync(
  target,
  `// СГЕНЕРИРОВАНО scripts/asset-manifest.mjs — не править вручную.\n` +
    `// Хеш содержимого каждого файла из public: подставляется в адрес,\n` +
    `// чтобы замена картинки под тем же именем доходила до браузера.\n` +
    `export const assetManifest: Record<string, string> = {\n${body}\n};\n`,
  "utf8",
);

console.log(`asset-manifest: ${entries.length} файлов`);
