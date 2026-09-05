import { chromium } from 'playwright';
const SP = process.env.SP;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:4321/', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${SP}/s-hero.png` });

const ids = ['about','services','projects','before-after','calculator','process','materials','other-works','faq','final-cta','contacts'];
for (const id of ids) {
  await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${SP}/s-${id}.png` });
}
// проверка горизонтального переполнения
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
await mp.goto('http://localhost:4321/', { waitUntil: 'load' });
await mp.waitForTimeout(2500);
await mp.screenshot({ path: `${SP}/m-hero.png` });
for (const id of ['services','projects','calculator']) {
  await mp.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
  await mp.waitForTimeout(1200);
  await mp.screenshot({ path: `${SP}/m-${id}.png` });
}
const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

console.log('desktop overflow px:', overflow);
console.log('mobile overflow px:', mOverflow);
console.log('console errors:', errors.length ? errors.slice(0,8) : 'нет');
await browser.close();
