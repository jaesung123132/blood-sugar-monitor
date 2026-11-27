import { useEffect, useRef } from 'react';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  milestone: string;
  onBack: () => void;
}

/** 아직 만들지 않은 화면에 무엇이 들어올지 미리 알려 주는 임시 화면입니다. */
export function PlaceholderScreen({ title, description, milestone, onBack }: PlaceholderScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 화면이 바뀌면 제목으로 초점을 옮겨, 화면 읽기 기능이 새 화면을 바로 읽게 합니다.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="screen" aria-labelledby="screen-title">
      <button type="button" className="back-button" onClick={onBack}>
        ← 처음 화면으로
      </button>
      <h1 id="screen-title" ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      <p>{description}</p>
      <p className="badge">준비 중 · {milestone}</p>
    </main>
  );
}
