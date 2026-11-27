/**
 * 주간 운동 계산 — 순수 함수만 둡니다.
 * 목표값(예: 주 150분)은 이 파일에 쓰지 않고, 원문 확인된 근거에서 꺼낸 값을 호출하는 쪽이 넘깁니다.
 */

/** 한국 표준시(UTC+9). 한국은 일광절약시간을 쓰지 않아 항상 9시간 차이입니다. */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ActivityRecord {
  /** 운동한 시간(분) */
  readonly minutes: number;
  /** 운동을 시작한 시각 */
  readonly startedAt: Date;
}

function assertNonNegativeFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label}은(는) 0 이상의 유한한 숫자여야 합니다: ${String(value)}`);
  }
}

/** 주어진 시각이 속한 주의 월요일 0시(한국 시간)를 돌려줍니다. */
export function startOfWeekKst(date: Date): Date {
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    throw new RangeError('올바른 날짜가 아닙니다.');
  }
  const shifted = new Date(time + KST_OFFSET_MS);
  const daysSinceMonday = (shifted.getUTCDay() + 6) % 7;
  const midnightShifted = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return new Date(midnightShifted - daysSinceMonday * DAY_MS - KST_OFFSET_MS);
}

/** [from, to) 기간에 시작한 활동의 분을 더합니다(시작 시각 포함, 끝 시각 제외). */
export function sumMinutesInRange(records: readonly ActivityRecord[], from: Date, to: Date): number {
  const start = from.getTime();
  const end = to.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    throw new RangeError('기간의 시작이 끝보다 앞서야 합니다.');
  }
  let total = 0;
  for (const record of records) {
    assertNonNegativeFinite(record.minutes, '운동 시간(분)');
    const startedAt = record.startedAt.getTime();
    if (startedAt >= start && startedAt < end) {
      total += record.minutes;
    }
  }
  return total;
}

/**
 * 목표까지 남은 양입니다. 목표를 넘겨도 음수가 되지 않으며,
 * 앱은 목표를 채운 뒤에는 운동을 더 권하지 않습니다(과한 운동 방지).
 */
export function remainingTowardGoal(goal: number, done: number): number {
  assertNonNegativeFinite(goal, '목표');
  assertNonNegativeFinite(done, '한 양');
  return Math.max(goal - done, 0);
}
