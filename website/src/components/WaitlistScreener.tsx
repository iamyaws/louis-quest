import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  submitScreener,
  type ChildAge,
  type Challenge,
  type WillingToTest,
} from '../lib/waitlist';

interface Props {
  email: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

type Status = 'idle' | 'submitting' | 'done';

const AGE_OPTIONS: { value: ChildAge; label: string }[] = [
  { value: '5-6', label: '5–6' },
  { value: '7-8', label: '7–8' },
  { value: '9-10', label: '9–10' },
  { value: 'älter', label: 'älter' },
];

const CHALLENGE_OPTIONS: { value: Challenge; label: string }[] = [
  { value: 'morgen', label: 'Morgenroutine' },
  { value: 'abend', label: 'Abendroutine' },
  { value: 'hausaufgaben', label: 'Hausaufgaben' },
  { value: 'bildschirmzeit', label: 'Bildschirmzeit' },
  { value: 'anderes', label: 'Etwas anderes' },
];

const TEST_OPTIONS: { value: WillingToTest; label: string }[] = [
  { value: 'ja', label: 'Ja, gern' },
  { value: 'vielleicht', label: 'Vielleicht' },
  { value: 'später', label: 'Lieber später' },
];

export function WaitlistScreener({ email, onComplete, onSkip }: Props) {
  const [childAge, setChildAge] = useState<ChildAge | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [willingToTest, setWillingToTest] = useState<WillingToTest | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const canSubmit = childAge && challenge && willingToTest && status === 'idle';

  async function handleSubmit() {
    if (!canSubmit || !childAge || !challenge || !willingToTest) return;
    setStatus('submitting');
    await submitScreener({ email, childAge, challenge, willingToTest });
    setStatus('done');
    onComplete?.();
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <p className="text-sm font-display font-semibold">Danke! Das hilft uns sehr.</p>
        <p className="mt-1 text-xs opacity-60">Wir melden uns, wenn es für euch losgeht.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-4 rounded-2xl border border-current/10 bg-current/[0.03] p-5 sm:p-6"
    >
      <p className="text-xs uppercase tracking-[0.15em] opacity-50 font-medium mb-1">
        30 Sekunden, optional
      </p>
      <h3 className="font-display font-bold text-lg leading-tight mb-5">
        Magst du uns helfen, Ronki besser zu machen?
      </h3>

      <div className="flex flex-col gap-5">
        <Question label="Wie alt ist dein Kind?">
          <PillGroup
            options={AGE_OPTIONS}
            value={childAge}
            onChange={setChildAge}
          />
        </Question>

        <Question label="Wobei würde Ronki euch am meisten helfen?">
          <PillGroup
            options={CHALLENGE_OPTIONS}
            value={challenge}
            onChange={setChallenge}
          />
        </Question>

        <Question label="Würdest du eine frühe Version testen?">
          <PillGroup
            options={TEST_OPTIONS}
            value={willingToTest}
            onChange={setWillingToTest}
          />
        </Question>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.02 } : undefined}
            whileTap={canSubmit ? { scale: 0.97 } : undefined}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-cream font-display font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow"
          >
            {status === 'submitting' ? '…' : 'Abschicken'}
            <span>→</span>
          </motion.button>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs opacity-50 hover:opacity-80 transition-opacity"
          >
            Überspringen
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-display font-semibold opacity-70 mb-2">{label}</p>
      {children}
    </div>
  );
}

interface PillGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}

function PillGroup<T extends string>({ options, value, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-display font-semibold transition-all ${
                selected
                  ? 'bg-teal text-cream shadow-sm'
                  : 'bg-current/10 hover:bg-current/20'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
