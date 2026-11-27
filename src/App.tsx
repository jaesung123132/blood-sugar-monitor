import { useState } from 'react';
import { TabBar } from './components/TabBar';
import type { TabId } from './components/TabBar';
import { readFlag, writeFlag } from './lib/storage';
import { DisclaimerScreen } from './screens/DisclaimerScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';

/** 면책 고지 문구가 바뀌면 키의 버전을 올려서 다시 동의를 받습니다. */
const CONSENT_KEY = 'bsm.consent.v1';

interface ScreenCopy {
  readonly title: string;
  readonly description: string;
  readonly milestone: string;
}

const SCREENS: Record<TabId, ScreenCopy> = {
  today: {
    title: '오늘',
    description: '오늘 드신 것과 운동, 그리고 오늘의 추천을 한눈에 보여 드리는 화면입니다.',
    milestone: 'M4',
  },
  meal: {
    title: '식사 기록',
    description:
      '사진을 찍거나 음식 이름을 검색해서 기록하는 화면입니다. 영양소 숫자는 식약처 공식 자료만 씁니다.',
    milestone: 'M2~M3',
  },
  exercise: {
    title: '운동',
    description: '식후 걷기 타이머와 이번 주에 남은 운동 시간을 보여 드리는 화면입니다.',
    milestone: 'M4',
  },
  labs: {
    title: '검사 기록',
    description: '병원에서 받은 당화혈색소, 공복혈당, 체중을 기록하고 변화를 보는 화면입니다.',
    milestone: 'M5',
  },
  settings: {
    title: '설정',
    description: '부모님 정보, 주치의 권고값, 가족 공유를 설정하는 화면입니다.',
    milestone: 'M2·M6',
  },
};

export function App() {
  const [agreed, setAgreed] = useState<boolean>(() => readFlag(CONSENT_KEY));
  const [tab, setTab] = useState<TabId>('today');

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

  const screen = SCREENS[tab];

  return (
    <div className="app">
      <header className="app-header">혈당 도우미</header>
      <PlaceholderScreen title={screen.title} description={screen.description} milestone={screen.milestone} />
      <TabBar current={tab} onSelect={setTab} />
    </div>
  );
}
