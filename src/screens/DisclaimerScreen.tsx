import { useState } from 'react';

interface DisclaimerScreenProps {
  onAgree: () => void;
}

export function DisclaimerScreen({ onAgree }: DisclaimerScreenProps) {
  const [checked, setChecked] = useState(false);

  return (
    <main className="screen" aria-labelledby="disclaimer-title">
      <h1 id="disclaimer-title">시작하기 전에 꼭 읽어 주세요</h1>
      <ul className="notice-list">
        <li>
          이 앱은 <strong>의료기기가 아니며</strong>, 진단이나 치료를 대신하지 않습니다.
        </li>
        <li>
          약, 검사 주기, 운동 범위는 <strong>담당 의사의 안내</strong>를 따르세요.
        </li>
        <li>
          음식 사진 분석에는 오차가 있습니다. 음식 종류와 양을 <strong>직접 확인한 값만</strong> 계산에 씁니다.
        </li>
        <li>
          운동 중 몸에 이상이 느껴지면 <strong>바로 멈추세요</strong>. 증상이 계속되면 119에 연락하세요.
        </li>
      </ul>
      <label className="checkbox-row">
        <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
        <span>위 내용을 읽고 이해했습니다.</span>
      </label>
      <button type="button" className="button-primary" disabled={!checked} onClick={onAgree}>
        동의하고 시작하기
      </button>
    </main>
  );
}
