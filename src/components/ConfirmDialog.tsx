interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-[#1a1a1a] border-2 border-red-500 rounded-2xl p-6 w-full max-w-sm">
        <p className="text-white text-base mb-6 text-center leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[#2a2a2a] text-white font-semibold text-sm active:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm active:opacity-70"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
