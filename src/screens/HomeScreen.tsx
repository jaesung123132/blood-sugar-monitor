export type HomeAction = 'meal' | 'walk' | 'family';

interface HomeScreenProps {
  onSelect: (action: HomeAction) => void;
}

/**
 * 부모님이 매일 보는 첫 화면입니다.
 * IT에 익숙하지 않은 분도 바로 쓸 수 있도록 오늘의 한마디 한 줄과
 * 큰 버튼 두 개(식사 사진, 식후 걷기)만 둡니다.
 * 설정과 기록 관리는 맨 아래 '가족 관리(자녀용)'로 따로 분리했습니다.
 */
export function HomeScreen({ onSelect }: HomeScreenProps) {
  return (
    <main className="screen" aria-labelledby="home-title">
      <h1 id="home-title">안녕하세요</h1>

      <section className="coach-card" aria-label="오늘의 한마디">
        <p className="coach-label">오늘의 한마디</p>
        <p className="coach-text">식사를 기록하시면 여기에 오늘의 추천이 나와요.</p>
      </section>

      <div className="big-actions">
        <button type="button" className="big-action" onClick={() => onSelect('meal')}>
          <span className="big-action-icon" aria-hidden="true">
            📷
          </span>
          <span>식사 사진 찍기</span>
        </button>
        <button type="button" className="big-action" onClick={() => onSelect('walk')}>
          <span className="big-action-icon" aria-hidden="true">
            🚶
          </span>
          <span>식후 걷기 시작</span>
        </button>
      </div>

      <button type="button" className="quiet-button" onClick={() => onSelect('family')}>
        가족 관리 (자녀용)
      </button>
    </main>
  );
}
