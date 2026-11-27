import { describe, expect, it } from 'vitest';
import {
  bowlEquivalent,
  energyShareAfterReduction,
  energySharePercent,
  roundForDisplay,
  scaleFromPer100g,
  totalConfirmed,
} from './calc';
import type { MealItem, Nutrients } from './calc';

// 주의: 이 파일의 숫자(예: 1 g당 4 kcal, 1공기 69 g, 아래 100 g당 값)는 '계산식'을 검증하기 위한 입력값입니다.
// 앱의 실제 기준값은 근거 등록부(src/evidence)에서 원문 확인이 끝난 뒤에만 가져옵니다.

const SAMPLE_PER_100G: Nutrients = {
  energyKcal: 100,
  carbohydrateG: 30,
  sugarsG: null,
  fiberG: 1,
  proteinG: 2,
  fatG: 0,
  sodiumMg: 10,
};

describe('scaleFromPer100g', () => {
  it('먹은 양에 비례해 바꾼다', () => {
    const scaled = scaleFromPer100g(SAMPLE_PER_100G, 250);
    expect(scaled.energyKcal).toBeCloseTo(250);
    expect(scaled.carbohydrateG).toBeCloseTo(75);
    expect(scaled.fatG).toBe(0);
  });

  it('정보 없음(null)은 0으로 바꾸지 않는다', () => {
    expect(scaleFromPer100g(SAMPLE_PER_100G, 250).sugarsG).toBeNull();
  });

  it('잘못된 양은 거부한다', () => {
    expect(() => scaleFromPer100g(SAMPLE_PER_100G, -1)).toThrow(RangeError);
    expect(() => scaleFromPer100g(SAMPLE_PER_100G, Number.NaN)).toThrow(RangeError);
  });

  it('음수 영양값 자료는 거부한다', () => {
    expect(() => scaleFromPer100g({ ...SAMPLE_PER_100G, fatG: -1 }, 100)).toThrow(RangeError);
  });
});

describe('totalConfirmed', () => {
  const items: MealItem[] = [
    { name: '음식 A', grams: 200, per100g: SAMPLE_PER_100G, confirmed: true },
    { name: '음식 B', grams: 100, per100g: { ...SAMPLE_PER_100G, sugarsG: 5 }, confirmed: true },
    { name: '음식 C', grams: 300, per100g: SAMPLE_PER_100G, confirmed: false },
  ];

  it('사람이 확인한 항목만 더한다', () => {
    const result = totalConfirmed(items);
    expect(result.confirmedItems).toBe(2);
    expect(result.unconfirmedItems).toBe(1);
    expect(result.totals.carbohydrateG.sum).toBeCloseTo(90);
    expect(result.totals.energyKcal.sum).toBeCloseTo(300);
  });

  it('정보가 없는 항목 수를 따로 센다', () => {
    expect(totalConfirmed(items).totals.sugarsG).toEqual({ sum: 5, missingItems: 1 });
  });

  it('빈 목록이면 모두 0이다', () => {
    const result = totalConfirmed([]);
    expect(result.totals.energyKcal).toEqual({ sum: 0, missingItems: 0 });
    expect(result.confirmedItems).toBe(0);
    expect(result.unconfirmedItems).toBe(0);
  });
});

describe('energySharePercent', () => {
  it('계획서 예시 A: 255 g × 4 kcal ÷ 1,500 kcal = 68%', () => {
    expect(energySharePercent(255, 4, 1500)).toBeCloseTo(68, 10);
  });

  it('총 열량이 0이면 계산하지 않는다', () => {
    expect(energySharePercent(0, 4, 0)).toBeNull();
  });

  it('잘못된 값은 거부한다', () => {
    expect(() => energySharePercent(10, 0, 100)).toThrow(RangeError);
    expect(() => energySharePercent(-1, 4, 100)).toThrow(RangeError);
    expect(() => energySharePercent(10, 4, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('bowlEquivalent', () => {
  it('계획서 예시 A: 255 g ÷ 69 g ≈ 3.7공기', () => {
    expect(roundForDisplay(bowlEquivalent(255, 69), 1)).toBe(3.7);
  });

  it('1공기 기준이 0이면 거부한다', () => {
    expect(() => bowlEquivalent(10, 0)).toThrow(RangeError);
  });
});

describe('energyShareAfterReduction', () => {
  it('계획서 예시 A: 밥 2/3공기(46 g, 200 kcal)를 줄이면 약 64%', () => {
    const after = energyShareAfterReduction({
      nutrientG: 255,
      totalKcal: 1500,
      reduceNutrientG: 46,
      reduceKcal: 200,
      kcalPerGram: 4,
    });
    expect(after).not.toBeNull();
    expect(roundForDisplay(after ?? Number.NaN)).toBe(64);
  });

  it('줄인 뒤 열량이 0 이하이면 계산하지 않는다', () => {
    expect(
      energyShareAfterReduction({ nutrientG: 10, totalKcal: 100, reduceNutrientG: 5, reduceKcal: 100, kcalPerGram: 4 }),
    ).toBeNull();
  });

  it('현재보다 많이 줄일 수는 없다', () => {
    expect(() =>
      energyShareAfterReduction({ nutrientG: 10, totalKcal: 100, reduceNutrientG: 20, reduceKcal: 10, kcalPerGram: 4 }),
    ).toThrow(RangeError);
  });
});

describe('roundForDisplay', () => {
  it('반올림하고 -0은 0으로 바꾼다', () => {
    expect(roundForDisplay(64.307)).toBe(64);
    expect(roundForDisplay(3.6957, 1)).toBe(3.7);
    expect(roundForDisplay(-0.0001)).toBe(0);
  });

  it('잘못된 값이나 자릿수는 거부한다', () => {
    expect(() => roundForDisplay(Number.NaN)).toThrow(RangeError);
    expect(() => roundForDisplay(1, 4)).toThrow(RangeError);
  });
});
