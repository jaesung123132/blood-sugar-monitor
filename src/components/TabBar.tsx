export type TabId = 'today' | 'meal' | 'exercise' | 'labs' | 'settings';

export interface TabDefinition {
  readonly id: TabId;
  readonly label: string;
}

export const TABS: readonly TabDefinition[] = [
  { id: 'today', label: '오늘' },
  { id: 'meal', label: '식사' },
  { id: 'exercise', label: '운동' },
  { id: 'labs', label: '검사' },
  { id: 'settings', label: '설정' },
];

interface TabBarProps {
  current: TabId;
  onSelect: (id: TabId) => void;
}

export function TabBar({ current, onSelect }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="주 메뉴">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === current ? 'tab tab-active' : 'tab'}
          aria-current={tab.id === current ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
