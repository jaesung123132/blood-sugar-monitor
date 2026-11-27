// PNG 인코더 — 외부 패키지 없이 Node 내장 zlib만 씁니다.
// 앱 아이콘을 빌드할 때 만들기 위한 것으로, 저장소에 이미지 파일을 올리지 않아도 됩니다.
import { deflateSync } from 'node:zlib';

const PNG_SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/**
 * CRC-32 (PNG 규격과 같은 다항식)
 * @param {Uint8Array} bytes
 * @returns {number}
 */
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.set(Buffer.from(type, 'ascii'), 4);
  out.set(data, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/**
 * RGBA(채널당 8비트) 픽셀 배열을 PNG 파일 바이트로 만듭니다.
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} rgba 길이 width * height * 4
 * @returns {Buffer}
 */
export function encodePng(width, height, rgba) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError(`잘못된 크기: ${width}x${height}`);
  }
  if (rgba.length !== width * height * 4) {
    throw new RangeError(`픽셀 데이터 길이가 맞지 않습니다: ${rgba.length} (필요: ${width * height * 4})`);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // 채널당 8비트
  header[9] = 6; // RGBA
  header[10] = 0; // 압축 방식(deflate)
  header[11] = 0; // 필터 방식
  header[12] = 0; // 인터레이스 없음

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // 이 줄은 필터 없음
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), rowStart + 1);
  }

  return Buffer.concat([
    Buffer.from(PNG_SIGNATURE),
    makeChunk('IHDR', header),
    makeChunk('IDAT', deflateSync(raw, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}
