import sharp from 'sharp';
import { writeFileSync } from 'fs';

const SRC = 'design/logo/zona-remonta-logo-variant-10.png';
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const at = (x, y) => {
  const i = (y * W + x) * C;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
};

// Границы знака: ищем светлые и красные пиксели в верхней половине,
// где ещё нет текста «ЗОНА РЕМОНТА».
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < Math.floor(H * 0.5); y += 1) {
  for (let x = 0; x < W; x += 1) {
    const { r, g, b } = at(x, y);
    const white = r > 170 && g > 170 && b > 170;
    const red = r > 120 && g < 90 && b < 90;
    if (white || red) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('знак найден:', `${minX},${minY} → ${maxX},${maxY}`, `(${maxX - minX + 1}×${maxY - minY + 1})`);
writeFileSync('/tmp/bbox.json', JSON.stringify({ minX, minY, maxX, maxY }));
