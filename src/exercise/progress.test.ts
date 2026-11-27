import { describe, expect, it } from 'vitest';
import { remainingTowardGoal, startOfWeekKst, sumMinutesInRange } from './progress';

// 주의: 아래 목표값(150분 등)은 계산식을 검증하기 위한 입력값입니다.
// 앱의 실제 목표값은 근거 등록부에서 원문 확인이 끝난 뒤에만 가져옵니다.

describe('startOfWeekKst', () => {
  it('금요일 오전 10시(한국) → 그 주 월요일 0시(한국)', () => {
    expect(startOfWeekKst(new Date('2026-11-27T01:00:00Z')).toISOString()).toBe('2026-11-22T15:00:00.000Z');
  });

  it('일요일 밤 11시 30분(한국)은 아직 같은 주다', () => {
    expect(startOfWeekKst(new Date('2026-11-29T14:30:00Z')).toISOString()).toBe('2026-11-22T15:00:00.000Z');
  });

  it('월요일 0시 10분(한국)부터는 새 주다', () => {
    expect(startOfWeekKst(new Date('2026-11-29T15:10:00Z')).toISOString()).toBe('2026-11-29T15:00:00.000Z');
  });

  it('잘못된 날짜는 거부한다', () => {
    expect(() => startOfWeekKst(new Date('invalid'))).toThrow(RangeError);
  });
});

describe('sumMinutesInRange', () => {
  const weekStart = new Date('2026-11-22T15:00:00Z');
  const nextWeekStart = new Date('2026-11-29T15:00:00Z');

  it('기간 안에서 시작한 기록만 더한다(시작 포함, 끝 제외)', () => {
    const records = [
      { minutes: 15, startedAt: new Date('2026-11-22T15:00:00Z') },
      { minutes: 20, startedAt: new Date('2026-11-25T10:00:00Z') },
      { minutes: 30, startedAt: new Date('2026-11-29T15:00:00Z') },
      { minutes: 40, startedAt: new Date('2026-11-20T10:00:00Z') },
    ];
    expect(sumMinutesInRange(records, weekStart, nextWeekStart)).toBe(35);
  });

  it('기간이 거꾸로면 거부한다', () => {
    expect(() => sumMinutesInRange([], nextWeekStart, weekStart)).toThrow(RangeError);
  });

  it('음수 운동 시간은 거부한다', () => {
    expect(() =>
      sumMinutesInRange([{ minutes: -5, startedAt: new Date('2026-11-25T10:00:00Z') }], weekStart, nextWeekStart),
    ).toThrow(RangeError);
  });
});

describe('remainingTowardGoal', () => {
  it('남은 양을 계산한다', () => {
    expect(remainingTowardGoal(150, 95)).toBe(55);
  });

  it('목표를 넘기면 0 — 더 하라고 하지 않는다', () => {
    expect(remainingTowardGoal(150, 160)).toBe(0);
  });

  it('잘못된 값은 거부한다', () => {
    expect(() => remainingTowardGoal(-1, 0)).toThrow(RangeError);
    expect(() => remainingTowardGoal(150, Number.NaN)).toThrow(RangeError);
  });
});
