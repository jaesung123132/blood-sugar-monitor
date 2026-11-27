/**
 * 근거의 확인 상태
 * - verified-primary: 원문(1차 출처)에서 인용과 위치를 확인함 → 앱 기준값으로 쓸 수 있음
 * - secondary: 2차 출처로만 확인함 → 쓸 수 없음 (원문 확인 필요)
 * - unverified: 아직 확인하지 못함 → 쓸 수 없음
 * - excluded: 불확실하거나 해로울 수 있어 쓰지 않기로 결정함
 */
export type EvidenceStatus = 'verified-primary' | 'secondary' | 'unverified' | 'excluded';

export interface EvidenceSource {
  readonly title: string;
  readonly url: string;
}

export interface EvidenceEntry {
  /** 코드에서 근거를 가리키는 고유 ID */
  readonly id: string;
  /** 근거가 뒷받침하는 내용(한국어) */
  readonly claim: string;
  readonly sources: readonly EvidenceSource[];
  readonly status: EvidenceStatus;
  /** 원문 인용 — verified-primary이면 필수 */
  readonly quote?: string;
  /** 원문 위치(쪽, 표, 권고 번호) — verified-primary이면 필수 */
  readonly location?: string;
  /** 원문을 확인한 날짜(YYYY-MM-DD) — verified-primary이면 필수 */
  readonly checkedOn?: string;
  /** 참고 사항 — excluded이면 쓰지 않는 이유를 반드시 적음 */
  readonly note?: string;
}
