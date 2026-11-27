/**
 * 영양 계산 엔진 — 순수 함수만 둡니다.
 *
 * 의학·영양 기준값(예: 탄수화물 1 g의 열량, 밥 1공기의 탄수화물 양, 권장 비율)은 이 파일에 쓰지 않습니다.
 * 원문 확인이 끝난 근거에서 requireVerified()로 꺼낸 값을 호출하는 쪽이 인자로 넘깁니다.
 * 그래서 이 파일은 근거 확인 전에도 계산식만 따로 검증할 수 있습니다.
 */

const NUTRIENT_KEY_FLAGS = {
  energyKcal: true,
  carbohydrateG: true,
  sugarsG: true,
  fiberG: true,
  proteinG: true,
  fatG: true,
  sodiumMg: true,
} as const;

export type NutrientKey = keyof typeof NUTRIENT_KEY_FLAGS;

export const NUTRIENT_KEYS = Object.keys(NUTRIENT_KEY_FLAGS) as NutrientKey[];

/**
 * 영양소 값. null은 '정보 없음'으로 0과 다릅니다.
 * (0은 '없다고 확인됨', null은 '자료에 값이 없음' — null을 0으로 바꾸면 합계가 실제보다 작아 보입니다.)
 */
export type Nutrients = Readonly<Record<NutrientKey, number | null>>;

export interface NutrientTotal {
  /** 값이 있는 항목만 더한 합계 */
  readonly sum: number;
  /** 값이 없어 합계에서 빠진 항목 수. 0보다 크면 합계는 '최소값'으로 보여 줘야 합니다. */
  readonly missingItems: number;
}

export type NutrientTotals = Readonly<Record<NutrientKey, NutrientTotal>>;

export interface MealItem {
  readonly name: string;
  /** 먹은 양(g) */
  readonly grams: number;
  /** 공식 DB 또는 제품 표기의 100 g당 값 */
  readonly per100g: Nutrients;
  /** 사람이 음식 종류와 양을 확인했는지 — 확인된 항목만 합계에 들어갑니다. */
  readonly confirmed: boolean;
}

export interface ConfirmedTotals {
  readonly totals: NutrientTotals;
  readonly confirmedItems: number;
  /** 확인 전이라 합계에서 뺀 항목 수 */
  readonly unconfirmedItems: number;
}

function assertNonNegativeFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label}은(는) 0 이상의 유한한 숫자여야 합니다: ${String(value)}`);
  }
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label}은(는) 0보다 큰 유한한 숫자여야 합니다: ${String(value)}`);
  }
}

/** 100 g당 영양값을 실제로 먹은 양(g)에 맞게 바꿉니다. 값이 없는(null) 영양소는 그대로 null입니다. */
export function scaleFromPer100g(per100g: Nutrients, grams: number): Nutrients {
  assertNonNegativeFinite(grams, '먹은 양(g)');
  const factor = grams / 100;
  const scaled = {} as Record<NutrientKey, number | null>;
  for (const key of NUTRIENT_KEYS) {
    const value = per100g[key];
    if (value !== null) {
      assertNonNegativeFinite(value, `100 g당 ${key}`);
    }
    scaled[key] = value === null ? null : value * factor;
  }
  return scaled;
}

/** 사람이 확인한 항목만 더합니다. 확인 전 항목은 개수만 따로 솅니다. */
export function totalConfirmed(items: readonly MealItem[]): ConfirmedTotals {
  const sums = {} as Record<NutrientKey, NutrientTotal>;
  for (const key of NUTRIENT_KEYS) {
    sums[key] = { sum: 0, missingItems: 0 };
  }
  let confirmedItems = 0;
  let unconfirmedItems = 0;
  for (const item of items) {
    if (!item.confirmed) {
      unconfirmedItems += 1;
      continue;
    }
    confirmedItems += 1;
    const scaled = scaleFromPer100g(item.per100g, item.grams);
    for (const key of NUTRIENT_KEYS) {
      const value = scaled[key];
      const current = sums[key];
      sums[key] =
        value === null
          ? { sum: current.sum, missingItems: current.missingItems + 1 }
          : { sum: current.sum + value, missingItems: current.missingItems };
    }
  }
  return { totals: sums, confirmedItems, unconfirmedItems };
}

/**
 * 섭취 열량 중 한 영양소가 차지하는 비율(%)입니다.
 * @param nutrientG 영양소 양(g)
 * @param kcalPerGram 영양소 1 g당 열량 — 원문 확인된 근거 값을 넘깁니다.
 * @param totalKcal 같은 기간의 총 섭취 열량(kcal)
 * @returns 비율(%). 총 열량이 0이면 비율을 정할 수 없으므로 null
 */
export function energySharePercent(nutrientG: number, kcalPerGram: number, totalKcal: number): number | null {
  assertNonNegativeFinite(nutrientG, '영양소 양(g)');
  assertPositiveFinite(kcalPerGram, '1 g당 열량');
  assertNonNegativeFinite(totalKcal, '총 열량');
  if (totalKcal === 0) {
    return null;
  }
  return ((nutrientG * kcalPerGram) / totalKcal) * 100;
}

/**
 * 탄수화물 양을 '밥 몇 공기 분량'으로 바꿉니다(탄수화물 양만 비교한 값).
 * @param carbohydratePerBowlG 밥 1공기의 탄수화물(g) — 원문 확인된 근거 값을 넘깁니다.
 */
export function bowlEquivalent(carbohydrateG: number, carbohydratePerBowlG: number): number {
  assertNonNegativeFinite(carbohydrateG, '탄수화물(g)');
  assertPositiveFinite(carbohydratePerBowlG, '밥 1공기의 탄수화물(g)');
  return carbohydrateG / carbohydratePerBowlG;
}

export interface ReductionInput {
  /** 현재 영양소 양(g) */
  readonly nutrientG: number;
  /** 현재 총 열량(kcal) */
  readonly totalKcal: number;
  /** 줄일 영양소 양(g) */
  readonly reduceNutrientG: number;
  /** 줄일 열량(kcal) */
  readonly reduceKcal: number;
  /** 영양소 1 g당 열량 — 원문 확인된 근거 값을 넘깁니다. */
  readonly kcalPerGram: number;
}

/**
 * "이만큼 줄이면 비율이 얼마가 되나"를 계산합니다(오늘의 코치의 다음 식사 제안).
 * @returns 줄인 뒤 비율(%). 줄인 뒤 총 열량이 0 이하이면 null
 */
export function energyShareAfterReduction(input: ReductionInput): number | null {
  const { nutrientG, totalKcal, reduceNutrientG, reduceKcal, kcalPerGram } = input;
  assertNonNegativeFinite(nutrientG, '현재 영양소 양(g)');
  assertNonNegativeFinite(totalKcal, '현재 총 열량');
  assertNonNegativeFinite(reduceNutrientG, '줄일 영양소 양(g)');
  assertNonNegativeFinite(reduceKcal, '줄일 열량');
  if (reduceNutrientG > nutrientG) {
    throw new RangeError('줄일 양이 현재 양보다 많습니다.');
  }
  if (reduceKcal >= totalKcal) {
    return null;
  }
  return energySharePercent(nutrientG - reduceNutrientG, kcalPerGram, totalKcal - reduceKcal);
}

/** 화면 표시용 반올림(소수점 digits자리). -0은 0으로 바꿉니다. */
export function roundForDisplay(value: number, digits = 0): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`표시할 수 없는 값: ${String(value)}`);
  }
  if (!Number.isInteger(digits) || digits < 0 || digits > 3) {
    throw new RangeError(`소수점 자릿수는 0~3이어야 합니다: ${String(digits)}`);
  }
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}
