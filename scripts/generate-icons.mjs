// 빌드할 때 앱 아이콘 PNG를 public/icons/ 에 만듭니다. (만든 파일은 저장소에 올리지 않습니다)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drawBowlIcon } from './icon-art.mjs';
import { encodePng } from './png.mjs';

const ICONS = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon-180.png', size: 180, maskable: true },
];

const outDir = fileURLToPath(new URL('../public/icons/', import.meta.url));
mkdirSync(outDir, { recursive: true });

for (const { file, size, maskable } of ICONS) {
  const png = encodePng(size, size, drawBowlIcon(size, { maskable }));
  writeFileSync(join(outDir, file), png);
  console.log(`아이콘 생성: public/icons/${file} (${size}x${size}, ${png.length} bytes)`);
}
