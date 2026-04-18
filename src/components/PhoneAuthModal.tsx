import { useState, useRef, useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthStage } from '../hooks/useAuth';

interface Props {
  stage: AuthStage;
  codeSent: boolean;
  busy: boolean;
  error: string | null;
  onSendCode: (phone: string, verifier: RecaptchaVerifier) => void;
  onVerifyCode: (code: string) => void;
  onSaveName: (name: string) => void;
  phoneNumber?: string;
}

function formatDisplay(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function PhoneStep({ busy, error, onSend }: {
  busy: boolean;
  error: string | null;
  onSend: (phone: string) => void;
}) {
  const [digits, setDigits] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDigits(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length === 10) onSend(`+1${digits}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label-caps text-ink-tertiary mb-2 block">Phone Number</label>
        <div className="flex items-center bg-surface-3 border border-line-default rounded-xl overflow-hidden focus-within:border-accent transition-colors">
          <span className="px-4 py-3.5 text-ink-secondary font-medium text-base border-r border-line-default shrink-0">
            +1
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={formatDisplay(digits)}
            onChange={handleChange}
            placeholder="(555) 000-0000"
            className="flex-1 bg-transparent px-4 py-3.5 text-ink-primary text-base
                       placeholder:text-ink-muted focus:outline-none"
            autoFocus
            disabled={busy}
          />
        </div>
        <p className="text-ink-muted text-xs mt-2">US &amp; Canada numbers only</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div id="recaptcha-container" />
      <button
        type="submit"
        disabled={busy || digits.length !== 10}
        className="btn-shimmer w-full py-4 rounded-xl font-bold text-base disabled:opacity-40"
      >
        {busy ? 'Sending…' : 'Send Code'}
      </button>
    </form>
  );
}

function OtpStep({ busy, error, onVerify, onBack }: {
  busy: boolean;
  error: string | null;
  onVerify: (code: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) onVerify(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label-caps text-ink-tertiary mb-2 block">Verification Code</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full bg-surface-3 border border-line-default rounded-xl px-4 py-3.5
                     text-ink-primary text-2xl tracking-[0.5em] text-center placeholder:text-ink-muted
                     focus:outline-none focus:border-accent transition-colors"
          autoFocus
          disabled={busy}
        />
        <p className="text-ink-muted text-xs mt-2 text-center">Enter the 6-digit code we texted you</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        className="btn-shimmer w-full py-4 rounded-xl font-bold text-base disabled:opacity-40"
      >
        {busy ? 'Verifying…' : 'Verify'}
      </button>
      <button type="button" onClick={onBack} className="text-ink-muted text-sm text-center">
        Wrong number? Go back
      </button>
    </form>
  );
}

function NameStep({ busy, onSave, phoneNumber }: {
  busy: boolean;
  onSave: (name: string) => void;
  phoneNumber?: string;
}) {
  const lastFour = phoneNumber ? phoneNumber.slice(-4) : '';
  const [name, setName] = useState(lastFour ? `Player${lastFour}` : '');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setNameError('At least 2 characters'); return; }
    if (name.trim().length > 24) { setNameError('24 characters max'); return; }
    onSave(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label-caps text-ink-tertiary mb-2 block">Your Display Name</label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(''); }}
          placeholder="Tiger Woods"
          maxLength={24}
          className="w-full bg-surface-3 border border-line-default rounded-xl px-4 py-3.5
                     text-ink-primary text-base placeholder:text-ink-muted
                     focus:outline-none focus:border-accent transition-colors"
          autoFocus
          disabled={busy}
        />
        {nameError
          ? <p className="text-red-400 text-xs mt-2">{nameError}</p>
          : <p className="text-ink-muted text-xs mt-2">This is how you appear on the global leaderboard</p>
        }
      </div>
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="btn-shimmer w-full py-4 rounded-xl font-bold text-base disabled:opacity-40"
      >
        {busy ? 'Saving…' : "Let's play"}
      </button>
    </form>
  );
}

export default function PhoneAuthModal({ stage, codeSent, busy, error, onSendCode, onVerifyCode, onSaveName, phoneNumber }: Props) {
  const [localStage, setLocalStage] = useState<'phone' | 'otp' | 'name'>(
    stage === 'no-name' ? 'name' : 'phone'
  );
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  // Create verifier once at modal level so it survives step transitions
  useEffect(() => {
    if (!auth) return;
    verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    return () => { verifierRef.current?.clear(); verifierRef.current = null; };
  }, []);

  // Advance to OTP only after sendCode resolves successfully
  useEffect(() => {
    if (codeSent) setLocalStage('otp');
  }, [codeSent]);

  // If parent moves to no-name after OTP verify, advance to name step
  useEffect(() => {
    if (stage === 'no-name') setLocalStage('name');
  }, [stage]);

  const stepLabel = localStage === 'phone' ? '1 of 3' : localStage === 'otp' ? '2 of 3' : '3 of 3';
  const stepTitle = localStage === 'phone' ? 'Sign in with Phone'
    : localStage === 'otp' ? 'Enter Your Code'
    : 'Choose Your Name';
  const stepSub = localStage === 'phone' ? "We'll send a one-time verification code"
    : localStage === 'otp' ? 'Check your messages'
    : 'Visible on the global leaderboard';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-ink-primary font-bold text-xl tracking-tight">{stepTitle}</h2>
            <span className="label-caps text-ink-muted">{stepLabel}</span>
          </div>
          <p className="text-ink-tertiary text-sm mb-6">{stepSub}</p>

          {localStage === 'phone' && (
            <PhoneStep
              busy={busy}
              error={error}
              onSend={(phone) => {
                if (verifierRef.current) onSendCode(phone, verifierRef.current);
              }}
            />
          )}

          {localStage === 'otp' && (
            <OtpStep
              busy={busy}
              error={error}
              onVerify={onVerifyCode}
              onBack={() => setLocalStage('phone')}
            />
          )}

          {localStage === 'name' && (
            <NameStep
              busy={busy}
              onSave={onSaveName}
              phoneNumber={phoneNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
}
