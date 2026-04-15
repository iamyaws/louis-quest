import { useState, FormEvent } from 'react';
import { submitWaitlistEmail, isValidEmail } from '../lib/waitlist';
import { getLaunchCopy, LaunchState } from '../config/launch-state';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'duplicate' }
  | { kind: 'invalid' }
  | { kind: 'error' };

type Props = {
  launchState: LaunchState;
  appUrl?: string;
};

export function WaitlistCTA({ launchState, appUrl = '/app' }: Props) {
  const copy = getLaunchCopy(launchState);

  if (launchState === 'live') {
    return (
      <div className="flex flex-col items-start gap-2">
        <a
          href={appUrl}
          className="inline-block rounded-xl bg-moss px-6 py-3 text-cream font-display text-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {copy.ctaLabel}
        </a>
        <p className="text-sm opacity-75">{copy.ctaHelper}</p>
      </div>
    );
  }

  return <WaitlistForm copy={copy} />;
}

function WaitlistForm({ copy }: { copy: ReturnType<typeof getLaunchCopy> }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validate email locally first
    if (!isValidEmail(email)) {
      setStatus({ kind: 'invalid' });
      return;
    }

    setStatus({ kind: 'submitting' });
    const result = await submitWaitlistEmail(email);
    if (result.ok) {
      setStatus({ kind: 'success' });
      setEmail('');
      return;
    }
    if (result.reason === 'invalid') setStatus({ kind: 'invalid' });
    else if (result.reason === 'duplicate') setStatus({ kind: 'duplicate' });
    else setStatus({ kind: 'error' });
  }

  if (status.kind === 'success') {
    return (
      <p role="status" className="text-lg font-display">
        Danke — wir melden uns einmal, am Start-Tag.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md w-full" noValidate>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-Mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="rounded-lg border border-ink/20 bg-cream px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-moss"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status.kind === 'submitting'}
        className="rounded-xl bg-moss px-6 py-3 text-cream font-display text-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-shadow"
      >
        {status.kind === 'submitting' ? '…' : copy.ctaLabel}
      </button>
      <p className="text-sm opacity-75">{copy.ctaHelper}</p>
      {status.kind === 'invalid' && (
        <p role="alert" className="text-sm text-plum">Bitte gib eine gültige E-Mail-Adresse ein.</p>
      )}
      {status.kind === 'duplicate' && (
        <p role="alert" className="text-sm text-plum">Bist du schon auf der Liste — wir melden uns am Start-Tag.</p>
      )}
      {status.kind === 'error' && (
        <p role="alert" className="text-sm text-plum">Etwas ist schiefgegangen. Bitte versuch's gleich noch mal.</p>
      )}
    </form>
  );
}
