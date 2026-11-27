interface PlaceholderScreenProps {
  title: string;
  description: string;
  milestone: string;
}

/** 아직 만들지 않은 화면에 무엇이 들어올지 미리 알려 주는 임시 화면입니다. */
export function PlaceholderScreen({ title, description, milestone }: PlaceholderScreenProps) {
  return (
    <main className="screen" aria-labelledby="screen-title">
      <h1 id="screen-title">{title}</h1>
      <p>{description}</p>
      <p className="badge">준비 중 · {milestone}</p>
    </main>
  );
}
