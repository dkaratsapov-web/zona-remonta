/**
 * Маска российского номера: +7 (999) 123-45-67.
 *
 * Работает с цифрами, а не с готовой строкой: так корректно
 * отрабатывают вставка из буфера, удаление посреди номера
 * и ввод в любом формате — 8, +7 или просто десять цифр.
 */

/** Оставляет только значащие цифры номера, максимум 11. */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  // Набранное «8» в начале — это тот же код страны
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  // Десять цифр без кода страны — дописываем семёрку
  else if (digits.length > 0 && !digits.startsWith("7")) digits = `7${digits}`;
  return digits.slice(0, 11);
}

/** Собирает номер в читаемый вид. Пустая строка остаётся пустой. */
export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 0) return "";

  const code = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);

  let out = "+7";
  if (code) out += ` (${code}`;
  if (code.length === 3) out += ")";
  if (first) out += ` ${first}`;
  if (second) out += `-${second}`;
  if (third) out += `-${third}`;
  return out;
}

/** Номер введён полностью: код страны и десять цифр. */
export function isPhoneComplete(value: string): boolean {
  return phoneDigits(value).length === 11;
}
