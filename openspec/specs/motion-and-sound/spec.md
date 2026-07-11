# motion-and-sound Specification

## Purpose

TBD - created by archiving change 'polish'. Update Purpose after archive.

## Requirements

### Requirement: Spring motion vocabulary

Question-card transitions SHALL use a waiting cross-fade-slide (one card, and exactly one stem heading, in the DOM at any instant) with focus moving to the new stem only after the entrance completes, without scrolling the page. Stars SHALL pop once when their question becomes answered, match lines SHALL draw in, and option selection SHALL scale no more than 1.02. All motion SHALL come from the shared spring presets and SHALL collapse to instant transitions for reduced-motion users.

#### Scenario: Single heading during transition

- **WHEN** the user navigates between questions while the exit animation plays
- **THEN** the DOM never contains two stem headings and focus lands on the new stem after the entrance finishes

#### Scenario: Reduced motion is instant

- **WHEN** a reduced-motion user navigates questions
- **THEN** the card changes with no positional animation and focus moves immediately


<!-- @trace
source: polish
updated: 2026-07-11
code:
  - src/components/quiz/SubmitDialog.tsx
  - src/audio/blip.ts
  - src/App.tsx
  - src/components/quiz/StarTrack.tsx
  - src/stores/quiz.ts
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/ReviewList.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/ui-text.gen.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/StartScreen.tsx
  - src/components/quiz/QuizScreen.tsx
  - e2e/helpers.ts
  - scripts/gen-ui-text.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/motion/presets.ts
  - src/stores/settings.ts
  - happydom.ts
  - src/components/quiz/LeaderboardList.tsx
  - docs/rules/ui-style.md
  - src/components/ui/SoundToggle.tsx
  - src/components/quiz/ResultScreen.tsx
tests:
  - e2e/screens.spec.ts
  - e2e/theme-smoke.spec.ts
  - src/components/quiz/StarTrack.test.tsx
  - src/ui-text.test.ts
  - e2e/quiz-flow.spec.ts
  - src/components/ui/SoundToggle.test.tsx
  - src/components/quiz/ReviewList.test.tsx
  - src/components/quiz/SubmitDialog.test.tsx
  - e2e/a11y.spec.ts
  - src/App.test.tsx
  - src/components/quiz/widgets/widgets.test.tsx
  - src/components/quiz/ResultScreen.test.tsx
  - e2e/results.spec.ts
  - src/audio/blip.test.ts
  - src/components/quiz/QuizScreen.test.tsx
-->

---
### Requirement: Gentle audio feedback, off by default

Audio SHALL be off by default and controlled by a persisted sound preference with an unambiguous toggle (muted-bell versus bell iconography, aria-pressed). All tones SHALL be synthesized sine blips capped at low gain with attack and release envelopes, in the 400–900Hz band for interaction sounds. Interaction triggers are: newly selecting an option (deselection is silent), completing a match pair, submitting, and a short result melody only at sixty percent or above. The audio context SHALL be a lazy singleton resumed within a user gesture, playing only when running, and every audio API SHALL no-op when Web Audio is unavailable.

#### Scenario: Deselection stays silent

- **WHEN** sound is on and the user unchecks a multi-choice option
- **THEN** no tone plays

#### Scenario: Result melody gated by score and context state

- **WHEN** the result screen mounts with sound on but the audio context is not running
- **THEN** no melody attempt throws and the screen renders normally

<!-- @trace
source: polish
updated: 2026-07-11
code:
  - src/components/quiz/SubmitDialog.tsx
  - src/audio/blip.ts
  - src/App.tsx
  - src/components/quiz/StarTrack.tsx
  - src/stores/quiz.ts
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/ReviewList.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/ui-text.gen.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/StartScreen.tsx
  - src/components/quiz/QuizScreen.tsx
  - e2e/helpers.ts
  - scripts/gen-ui-text.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/motion/presets.ts
  - src/stores/settings.ts
  - happydom.ts
  - src/components/quiz/LeaderboardList.tsx
  - docs/rules/ui-style.md
  - src/components/ui/SoundToggle.tsx
  - src/components/quiz/ResultScreen.tsx
tests:
  - e2e/screens.spec.ts
  - e2e/theme-smoke.spec.ts
  - src/components/quiz/StarTrack.test.tsx
  - src/ui-text.test.ts
  - e2e/quiz-flow.spec.ts
  - src/components/ui/SoundToggle.test.tsx
  - src/components/quiz/ReviewList.test.tsx
  - src/components/quiz/SubmitDialog.test.tsx
  - e2e/a11y.spec.ts
  - src/App.test.tsx
  - src/components/quiz/widgets/widgets.test.tsx
  - src/components/quiz/ResultScreen.test.tsx
  - e2e/results.spec.ts
  - src/audio/blip.test.ts
  - src/components/quiz/QuizScreen.test.tsx
-->