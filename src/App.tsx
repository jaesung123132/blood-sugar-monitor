import { useState } from 'react';
import { readFlag, writeFlag } from './lib/storage';
import { DisclaimerScreen } from './screens/DisclaimerScreen';
import { HomeScreen } from './screens/HomeScreen';
import type { HomeAction } from './screens/HomeScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

/** 면책 고지 문구가 바뀌면 키의 버전을 올려서 다시 동의를 받습니다. */
const CONSENT_KEY = 'bsm.consent.v1';

type Screen = 'home' | HomeAction;

interface PlaceholderCopy {
  readonly title: string;
  readonly description: string;
  readonly milestone: string;
}

const PLACEHOLDERS: Record<HomeAction, PlaceholderCopy> = {
  meal: {
    title: '식사 사진 찍기',
    description: '드실 음식을 위에서 한 장 찍으면, 무엇을 얼마나 드시는지 알려 드릴 거예요.',
    milestone: 'M3',
  },
  walk: {
    title: '식후 걷기',
    description: '버튼 하나로 걷기 시간을 재고, 끝나면 자동으로 기록해 드릴 거예요.',
    milestone: 'M4',
  },
  family: {
    title: '가족 관리 (자녀용)',
    description:
      '처음 설정, 부모님 정보, 병원 검사 결과, 주치의 권고값, 가족 공유, 월간 요약, 사용 요금을 여기서 관리합니다.',
    milestone: 'M2·M5·M6',
  },
};

export function App() {
  const [agreed, setAgreed] = useState<boolean>(() => readFlag(CONSENT_KEY));
  const [screen, setScreen] = useState<Screen>('home');

  if (!agreed) {
    return (
      <DisclaimerScreen
        onAgree={() => {
          writeFlag(CONSENT_KEY, true);
          setAgreed(true);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">혈당 도우미</header>
      {screen === 'home' ? (
        <HomeScreen onSelect={setScreen} />
      ) : (
        <PlaceholderScreen {...PLACEHOLDERS[screen]} onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
