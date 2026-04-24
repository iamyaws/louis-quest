import React from 'react';
import TeachBreathBeat, { ONBOARDING_FLAME_COPY } from './TeachBreathBeat';

/**
 * TeachFireStep — onboarding's "Der erste Funke" beat.
 *
 * Phase 2 refactor (24 Apr 2026): the 2-round mechanic + chibi + fire/
 * smoke puff + mouth glow are extracted to TeachBreathBeat.jsx so the
 * same beat can be reused by post-onboarding unlock rituals (Herzfeuer,
 * Funkenstern, Glut, Regenbogenfeuer). This file just provides the
 * onboarding chrome: teal background, ProgressBar at the top, safe-
 * area paddings.
 *
 * Still the onboarding entry point — Onboarding.jsx mounts this at
 * step 6. Preserves the pre-refactor prop signature (variant, t,
 * ProgressBar, onComplete) so no parent changes needed.
 *
 * Generative for the time-stack journey tier — onboarding persists
 * `state.taughtSignature` + `state.taughtAt` + `state.taughtBreaths.flame`
 * at completion (see TaskContext.completeOnboarding) so Wave-3 farewell
 * can later render "Weißt du noch, wie du mir das beigebracht hast?".
 */

const base = import.meta.env.BASE_URL;

export default function TeachFireStep({ variant, t, ProgressBar, onComplete }) {
  return (
    <div className="fixed inset-0 overflow-y-auto font-body">
      {/* Background — same teal as the surrounding onboarding steps */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      <main
        className="relative z-10 min-h-full flex flex-col px-8 text-center"
        style={{
          paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <ProgressBar />

        <div className="my-auto flex flex-col items-center gap-5">
          <TeachBreathBeat
            variant={variant}
            t={t}
            targetFlavor="flame"
            copyKeys={ONBOARDING_FLAME_COPY}
            onComplete={onComplete}
          />
        </div>
      </main>
    </div>
  );
}
