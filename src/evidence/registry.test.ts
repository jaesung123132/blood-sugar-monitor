import { describe, expect, it } from 'vitest';
import { requireVerified, UnverifiedEvidenceError } from './gate';
import { EVIDENCE } from './registry';

describe('근거 등록부', () => {
  it('ID가 서로 겹치지 않는다', () => {
    const ids = EVIDENCE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('제외 항목이 아니면 https 출처가 1개 이상 있다', () => {
    for (const entry of EVIDENCE) {
      if (entry.status === 'excluded') {
        continue;
      }
      expect(entry.sources.length, entry.id).toBeGreaterThan(0);
      for (const source of entry.sources) {
        expect(source.url.startsWith('https://'), `${entry.id}: ${source.url}`).toBe(true);
      }
    }
  });

  it('제외 항목에는 쓰지 않는 이유가 적혀 있다', () => {
    for (const entry of EVIDENCE.filter((item) => item.status === 'excluded')) {
      expect(entry.note?.trim().length ?? 0, entry.id).toBeGreaterThan(0);
    }
  });

  it('원문 확인 완료 항목은 인용, 위치, 확인일을 모두 갖는다', () => {
    for (const entry of EVIDENCE.filter((item) => item.status === 'verified-primary')) {
      expect(entry.quote?.trim().length ?? 0, entry.id).toBeGreaterThan(0);
      expect(entry.location?.trim().length ?? 0, entry.id).toBeGreaterThan(0);
      expect(entry.checkedOn ?? '', entry.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('원문 확인 전 항목은 기준값으로 꺼내 쓸 수 없다', () => {
    for (const entry of EVIDENCE.filter((item) => item.status !== 'verified-primary')) {
      expect(() => requireVerified(entry.id), entry.id).toThrow(UnverifiedEvidenceError);
    }
  });

  it('등록되지 않은 근거는 꺼내 쓸 수 없다', () => {
    expect(() => requireVerified('not-registered')).toThrow(UnverifiedEvidenceError);
  });
});
