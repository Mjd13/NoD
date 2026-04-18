import { Screen } from '../types';

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M2.5 8.5L10 2l7.5 6.5V17a1 1 0 01-1 1H13v-4H7v4H3.5a1 1 0 01-1-1V8.5z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-full h-full">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6.5V10l2.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2.5" y="11" width="3.5" height="6.5" rx="0.5" />
      <rect x="8.25" y="6.5" width="3.5" height="11" rx="0.5" />
      <rect x="14" y="2.5" width="3.5" height="15" rx="0.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-full h-full">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 2.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5" />
      <line x1="2.5" y1="10" x2="17.5" y2="10" />
    </svg>
  );
}

const tabs: { screen: Screen; label: string; icon: React.ReactNode }[] = [
  { screen: 'setup',     label: 'Home',    icon: <HomeIcon /> },
  { screen: 'history',   label: 'History', icon: <HistoryIcon /> },
  { screen: 'analytics', label: 'Stats',   icon: <StatsIcon /> },
  { screen: 'global',    label: 'Global',  icon: <GlobeIcon /> },
];

export default function Navigation({ currentScreen, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-1 border-t border-line-subtle flex pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ screen, label, icon }) => {
        const isActive = currentScreen === screen;
        return (
          <button
            key={screen}
            onClick={() => onNavigate(screen)}
            className={`flex-1 pt-3 pb-2 flex flex-col items-center gap-1.5 transition-colors touch-manipulation
              ${isActive ? 'text-accent' : 'text-ink-muted active:text-ink-secondary'}`}
          >
            <div className="w-5 h-5">{icon}</div>
            <span className="label-caps" style={{ letterSpacing: '0.06em' }}>{label}</span>
            <div className={`w-1 h-1 rounded-full transition-all duration-200 ${
              isActive ? 'bg-accent scale-100' : 'scale-0'
            }`} />
          </button>
        );
      })}
    </nav>
  );
}
