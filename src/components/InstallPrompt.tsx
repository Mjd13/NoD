import { isIosBrowser } from '../hooks/useInstallPrompt';

interface Props {
  canNativeInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 inline-block align-middle">
      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function AppIcon() {
  return (
    <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-xl shadow-accent/30 mx-auto">
      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function IosInstructions() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 bg-surface-3 rounded-xl p-3">
        <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
        <p className="text-ink-secondary text-sm leading-relaxed">
          Tap the <span className="inline-flex items-center gap-1 text-accent font-semibold"><ShareIcon /> Share</span> button at the bottom of Safari
        </p>
      </div>
      <div className="flex items-start gap-3 bg-surface-3 rounded-xl p-3">
        <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
        <p className="text-ink-secondary text-sm leading-relaxed">
          Scroll down and tap <span className="text-ink-primary font-semibold">"Add to Home Screen"</span>
        </p>
      </div>
      <div className="flex items-start gap-3 bg-surface-3 rounded-xl p-3">
        <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
        <p className="text-ink-secondary text-sm leading-relaxed">
          Tap <span className="text-ink-primary font-semibold">"Add"</span> in the top right — then open from your home screen
        </p>
      </div>
    </div>
  );
}

export default function InstallPrompt({ canNativeInstall, onInstall, onDismiss }: Props) {
  const ios = isIosBrowser();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-0/95 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <AppIcon />

        <div className="text-center">
          <h1 className="text-2xl font-black text-ink-primary tracking-tight mb-2">
            Add to Home Screen
          </h1>
          <p className="text-ink-tertiary text-sm leading-relaxed">
            Install Scorecards Pro for the full app experience — no browser bar, instant launch, works offline.
          </p>
        </div>

        {ios ? (
          <IosInstructions />
        ) : canNativeInstall ? (
          <button
            onClick={onInstall}
            className="btn-shimmer w-full py-4 rounded-2xl font-bold text-base"
          >
            Install App
          </button>
        ) : (
          // Chrome desktop or unsupported — show generic tip
          <div className="bg-surface-3 rounded-xl p-4 text-center">
            <p className="text-ink-secondary text-sm">
              Open this page in <span className="text-ink-primary font-semibold">Chrome on your phone</span> for the best install experience.
            </p>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="text-ink-muted text-sm text-center py-1 active:text-ink-secondary"
        >
          Continue in browser
        </button>
      </div>
    </div>
  );
}
