import { useEffect, useRef } from 'react';

interface FamilyGateScreenProps {
  onConfirm: () => void;
  onBack: () => void;
}

/**
 * 자녀용 '가족 관리'에 들어가기 전 한 번 더 묻는 화면입니다.
 * 부모님이 실수로 누른 경우를 생각해, 크고 눈에 띄는 버튼은 '처음 화면으로'입니다.
 */
export function FamilyGateScreen({ onConfirm, onBack }: FamilyGateScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="screen" aria-labelledby="family-gate-title">
      <h1 id="family-gate-title" ref={headingRef} tabIndex={-1}>
        자녀용 화면이에요
      </h1>
      <p>설정과 기록 관리는 자녀가 하는 곳이에요. 부모님은 처음 화면으로 돌아가시면 돼요.</p>
      <div className="big-actions">
        <button type="button" className="big-action" onClick={onBack}>
          처음 화면으로
        </button>
      </div>
      <button type="button" className="quiet-button" onClick={onConfirm}>
        자녀입니다, 들어가기
      </button>
    </main>
  );
}
