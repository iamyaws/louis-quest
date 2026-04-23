# Handoff prompt — Onboarding refresh + teach beat

Paste this into a fresh Claude design session. Spec lives next to this file.

---

## Prompt

> Build the spec at `docs/superpowers/specs/2026-04-23-onboarding-refresh-and-teach-beat-design.md`.
>
> Two bundled changes:
>
> 1. **Art refresh** — swap the three painted-sprite `<img src={base + selectedVariant.spritePath}>` callsites in `src/components/Onboarding.jsx` (lines ~477, ~527, ~672) for `<MoodChibi variant={selectedVariant.id} stage={1} mood={...} />`. Mood per callsite is in the spec table. Eggs at step 3 are CSS gradients — do NOT swap. Do NOT delete `dragon-young.webp` (legacy refs may exist).
>
> 2. **New teach step at index 6** — `TeachFireStep`. Hold-and-release mechanic: kid holds button → Ronki visibly inhales (animate `scale: 1 → 1.08` over 2s on the chibi wrapper, eyes don't need to close — cheap version per spec §4.3) → release after ≥1.5s → `FireBreathPuff` fires → 1s later Ronki does it solo with a smaller second puff. Releasing <1.5s shows soft retry copy; after 2 retries, auto-pass. No skip button. Bump `TOTAL_STEPS` 7 → 8.
>
> 3. **Persist** `taughtSignature: 'fire'` and `taughtAt: '<ISO date>'` on `completeOnboarding` (extend cfg type + State interface in `TaskContext.tsx`). These are anchors for the deferred Wave-3 callback — leave a `// Wave-3 callback anchor` comment near the field. Build no Wave-3 surface.
>
> 4. **Add** `src/utils/companionRepertoire.ts` with `pickRonkiMove(occasion)` per spec §5.1. Wire into:
>    - `Hub.jsx` → mount `<RonkiGreeting occasion="launch" />` (new component) on Hub mount
>    - `QuestEater.jsx` (or wherever quest celebration fires) → branch on `pickRonkiMove('questDone')`
>    - Boss win celebration → force fire (`FireBreathPuff`)
>
>    Wave + wiggle animations are placeholders (whole-body rotate ±12° three times for wave; existing `mc-bounce` keyframe for wiggle). Proper hand-wave is deferred to chibi expansion backlog.
>
> 5. **Copy** — add `onboarding.teach.*` keys to `src/i18n/de.json` and `en.json` per spec §4.1.
>
> **Acceptance:**
> - Walking `?onboardingPreview=1` from step 0 to launch shows the chibi at every Ronki appearance — zero painted sprites
> - Pill bar shows 8 pills (clickable behavior already landed)
> - Hold ≥1.5s + release → full `FireBreathPuff` + solo follow-up after ~1s + Continue button
> - Hold <1.5s → soft retry copy; 2 retries max then auto-pass
> - After onboarding: `state.taughtSignature === 'fire'`, `state.taughtAt === '<today>'`
> - Hub mount triggers RonkiGreeting (wave most often)
> - Quest done sometimes triggers wiggle
> - Boss win triggers fire breath
> - No new TS errors, no new console errors during walkthrough
> - Run typecheck before reporting done
>
> **~3-4h estimate.** File-by-file change list is in spec §9.

---

## What's in the spec that's not in this prompt

- Frame-by-frame storyboard for the teach beat (§4.2)
- Full state additions code stub (§5.2)
- Weight table for `pickRonkiMove` (§5.1)
- Out-of-scope list (§8) — important to enforce
- Wave-3 callback explanation (§6) — context for *why* the anchor fields matter
