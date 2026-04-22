import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitWaitlistEmail, isValidEmail } from '../../lib/waitlist';
import { getLaunchCopy, LaunchState } from '../../config/launch-state';

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

export function WaitlistCTAModern({ launchState, appUrl }: Props) {
  const copy = getLaunchCopy(launchState);
  const resolvedAppUrl = appUrl ?? copy.appUrl ?? '/app';

  if (copy.ctaAction === 'install') {
    return (
      <div className="flex flex-col items-start gap-2">
        <motion.a
          href={resolvedAppUrl}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative inline-flex items-center gap-3 rounded-full bg-[#f5ecd4] px-8 py-4 text-[#12100c] font-display text-lg overflow-hidden"
        >
          <span className="relative z-10">{copy.ctaLabel}</span>
          <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
        </motion.a>
        <p
          className="text-sm opacity-60"
          style={{
            hyphens: 'manual',
            WebkitHyphens: 'manual',
            MozHyphens: 'manual',
          }}
        >
          {copy.ctaHelper}
        </p>
      </div>
    );
  }

  return <WaitlistForm copy={copy} />;
}

function WaitlistForm({ copy }: { copy: ReturnType<typeof getLaunchCopy> }) {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      <motion.p
        role="status"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-lg font-display text-[#c48a3a]"
      >
        Danke. Wir melden uns einmal, am Start-Tag.
      </motion.p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md" noValidate>
      <div
        className={`relative flex items-center rounded-full border transition-all duration-300 ${
          focused ? 'border-[#c48a3a] bg-white/[0.04]' : 'border-white/15 bg-white/[0.02]'
        }`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="deine@email.de"
          aria-label="E-Mail"
          className="flex-1 bg-transparent pl-6 pr-2 py-4 text-base placeholder:text-white/30 focus:outline-none"
          required
        />
        <motion.button
          type="submit"
          disabled={status.kind === 'submitting'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="group relative m-1 inline-flex items-center gap-2 rounded-full bg-[#f5ecd4] px-5 py-3 text-[#12100c] font-display text-sm disabled:opacity-50"
        >
          {status.kind === 'submitting' ? '…' : copy.ctaLabel}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </motion.button>
      </div>
      <p className="text-xs opacity-75 pl-2">{copy.ctaHelper}</p>
      <AnimatePresence>
        {status.kind === 'invalid' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-[#e39a4e] pl-2"
          >
            Bitte gib eine gültige E-Mail-Adresse ein.
          </motion.p>
        )}
        {status.kind === 'duplicate' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-[#e39a4e] pl-2"
          >
            Bist du schon auf der Liste. Wir melden uns am Start-Tag.
          </motion.p>
        )}
        {status.kind === 'error' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-[#e39a4e] pl-2"
          >
            Etwas ist schiefgegangen. Bitte versuch's gleich noch mal.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
