import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { drawBowlIcon } from './icon-art.mjs';
import { crc32, encodePng } from './png.mjs';

const GREEN = [0x0b, 0x5d, 0x3b];

describe('PNG 인코더', () => {
  it('CRC-32 표준 검사값을 맞춘다', () => {
    expect(crc32(Buffer.from('123456789', 'ascii'))).toBe(0xcbf43926);
  });

  it('PNG 서명, 헤더, 끝 표시를 규격대로 쓴다', () => {
    const png = encodePng(2, 3, new Uint8Array(2 * 3 * 4));
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(png.readUInt32BE(16)).toBe(2);
    expect(png.readUInt32BE(20)).toBe(3);
    expect(png[24]).toBe(8);
    expect(png[25]).toBe(6);
    // IEND 덩어리는 항상 같은 12바이트입니다.
    expect([...png.subarray(png.length - 12)]).toEqual([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  });

  it('압축을 풀면 줄마다 필터 바이트 1개와 원래 픽셀이 나온다', () => {
    const width = 4;
    const height = 2;
    const rgba = new Uint8Array(width * height * 4).map((_, index) => index % 256);
    const png = encodePng(width, height, rgba);
    // 서명(8) + IHDR(25) 다음이 IDAT입니다.
    const idatLength = png.readUInt32BE(33);
    expect(png.subarray(37, 41).toString('ascii')).toBe('IDAT');
    const raw = inflateSync(png.subarray(41, 41 + idatLength));
    expect(raw.length).toBe((width * 4 + 1) * height);
    expect(raw[0]).toBe(0);
    expect([...raw.subarray(1, 1 + width * 4)]).toEqual([...rgba.subarray(0, width * 4)]);
    expect(raw[width * 4 + 1]).toBe(0);
    expect([...raw.subarray(width * 4 + 2)]).toEqual([...rgba.subarray(width * 4)]);
  });

  it('픽셀 길이나 크기가 잘못되면 거부한다', () => {
    expect(() => encodePng(2, 2, new Uint8Array(3))).toThrow(RangeError);
    expect(() => encodePng(0, 2, new Uint8Array(0))).toThrow(RangeError);
  });
});

describe('앱 아이콘 그림', () => {
  const pixelAt = (pixels, size, x, y) => [...pixels.subarray((y * size + x) * 4, (y * size + x) * 4 + 4)];

  it('일반 아이콘은 모서리가 투명하고, 그릇은 흰색, 위쪽 바탕은 초록이다', () => {
    const size = 64;
    const pixels = drawBowlIcon(size);
    expect(pixelAt(pixels, size, 0, 0)[3]).toBe(0);
    expect(pixelAt(pixels, size, 32, 40)).toEqual([255, 255, 255, 255]);
    expect(pixelAt(pixels, size, 32, 6)).toEqual([...GREEN, 255]);
  });

  it('maskable 아이콘은 모서리까지 초록으로 꽉 찬다', () => {
    const size = 64;
    const pixels = drawBowlIcon(size, { maskable: true });
    expect(pixelAt(pixels, size, 0, 0)).toEqual([...GREEN, 255]);
    expect(pixelAt(pixels, size, size - 1, size - 1)).toEqual([...GREEN, 255]);
  });

  it('그림은 maskable 안전 영역(가운데 지름 80% 원) 안에만 있다', () => {
    const size = 128;
    const pixels = drawBowlIcon(size, { maskable: true });
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const u = (x + 0.5) / size - 0.5;
        const v = (y + 0.5) / size - 0.5;
        if (Math.hypot(u, v) > 0.41) {
          expect(pixelAt(pixels, size, x, y)).toEqual([...GREEN, 255]);
        }
      }
    }
  });
});
