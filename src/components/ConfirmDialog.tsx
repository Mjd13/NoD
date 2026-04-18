interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="card-glass shadow-modal p-6 w-full max-w-sm">
        <p className="text-ink-primary text-base mb-6 text-center leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-surface-3 text-ink-primary font-semibold text-sm
                       border border-line-default active:bg-surface-4 active:scale-[0.97] transition-transform touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm
                       active:bg-red-600 active:scale-[0.97] transition-transform touch-manipulation"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
