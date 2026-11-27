import { EVIDENCE } from './registry';
import type { EvidenceEntry } from './types';

export class UnverifiedEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnverifiedEvidenceError';
  }
}

/**
 * 원문 확인이 끝난 근거만 돌려줍니다.
 *
 * 앱의 기준값(예: 주 150분)은 반드시 이 함수로 근거를 꺼내서 정의합니다.
 * 원문 확인 전인 근거를 꺼내면 예외가 나므로, 그 기준값을 쓰는 코드의
 * 테스트와 빌드가 실패하고 배포되지 않습니다.
 */
export function requireVerified(id: string): EvidenceEntry {
  const entry = EVIDENCE.find((item) => item.id === id);
  if (entry === undefined) {
    throw new UnverifiedEvidenceError(`근거 '${id}'가 등록부에 없습니다.`);
  }
  if (entry.status !== 'verified-primary') {
    throw new UnverifiedEvidenceError(
      `근거 '${id}'는 아직 원문 확인 전(${entry.status})이라 앱 기준값으로 쓸 수 없습니다.`,
    );
  }
  return entry;
}
