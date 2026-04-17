import { Screen } from '../types';

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const tabs: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'setup', label: 'Home', icon: '⛳' },
  { screen: 'history', label: 'History', icon: '📋' },
  { screen: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function Navigation({ currentScreen, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] border-t-2 border-red-500 flex pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ screen, label, icon }) => (
        <button
          key={screen}
          onClick={() => onNavigate(screen)}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${
            currentScreen === screen ? 'text-red-500' : 'text-gray-500 active:text-gray-300'
          }`}
        >
          <span className="text-2xl leading-none">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}
