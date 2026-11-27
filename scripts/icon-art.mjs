// 앱 아이콘 그림: 초록 바탕에 흰 밥그릇(밥 + 그릇 + 받침).
// 그림은 가운데 지름 80% 원(안드로이드 maskable 아이콘의 안전 영역) 안에 들어가도록 배치했습니다.

const GREEN = [0x0b, 0x5d, 0x3b];
const WHITE = [0xff, 0xff, 0xff];
const SAMPLES = 4; // 픽셀마다 4x4 표본으로 가장자리를 부드럽게

// 좌표는 아이콘 한 변을 1로 본 비율입니다.
const CX = 0.5;
const CY = 0.49; // 그릇 테두리 아래선
const BOWL_R = 0.27;
const RIM_HALF_WIDTH = BOWL_R + 0.02;
const RIM_TOP = CY - 0.035;
const RICE_BASE = CY - 0.055; // 밥과 테두리 사이에 초록 틈을 둠
const RICE_R = 0.2;
const FOOT_HALF_WIDTH = 0.09;
const FOOT_TOP = CY + BOWL_R - 0.02;
const FOOT_BOTTOM = CY + BOWL_R + 0.045;
const CORNER_R = 0.2;

function inRoundedSquare(u, v) {
  const dx = Math.max(CORNER_R - u, 0, u - (1 - CORNER_R));
  const dy = Math.max(CORNER_R - v, 0, v - (1 - CORNER_R));
  return dx * dx + dy * dy <= CORNER_R * CORNER_R;
}

function inArt(u, v) {
  const rice = v <= RICE_BASE && (u - CX) ** 2 + (v - RICE_BASE) ** 2 <= RICE_R ** 2;
  const rim = v >= RIM_TOP && v <= CY && Math.abs(u - CX) <= RIM_HALF_WIDTH;
  const bowl = v >= CY && (u - CX) ** 2 + (v - CY) ** 2 <= BOWL_R ** 2;
  const foot = v >= FOOT_TOP && v <= FOOT_BOTTOM && Math.abs(u - CX) <= FOOT_HALF_WIDTH;
  return rice || rim || bowl || foot;
}

/**
 * 밥그릇 아이콘을 RGBA 픽셀로 그립니다.
 * @param {number} size 아이콘 한 변의 픽셀 수
 * @param {{ maskable?: boolean }} [options] maskable이면 바탕을 가장자리까지 꽉 채웁니다.
 * @returns {Uint8Array}
 */
export function drawBowlIcon(size, { maskable = false } = {}) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(`잘못된 크기: ${size}`);
  }
  const pixels = new Uint8Array(size * size * 4);
  const total = SAMPLES * SAMPLES;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let background = 0;
      let art = 0;
      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const u = (x + (sx + 0.5) / SAMPLES) / size;
          const v = (y + (sy + 0.5) / SAMPLES) / size;
          if (maskable || inRoundedSquare(u, v)) {
            background += 1;
            if (inArt(u, v)) {
              art += 1;
            }
          }
        }
      }
      const offset = (y * size + x) * 4;
      const whiteRatio = background === 0 ? 0 : art / background;
      for (let c = 0; c < 3; c += 1) {
        pixels[offset + c] = Math.round(GREEN[c] + (WHITE[c] - GREEN[c]) * whiteRatio);
      }
      pixels[offset + 3] = Math.round((background / total) * 255);
    }
  }
  return pixels;
}
