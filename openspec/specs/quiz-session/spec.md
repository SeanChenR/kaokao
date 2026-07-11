# quiz-session Specification

## Purpose

TBD - created by archiving change 'quiz-flow'. Update Purpose after archive.

## Requirements

### Requirement: Quiz session state machine

The quiz session SHALL progress through the phases start, quiz, and result. Starting a session SHALL require a trimmed name of 1 to 12 characters, draw the questions, record the start timestamp, and store the name for next-visit prefill. Answer mutations and submissions SHALL be no-ops outside the quiz phase, and submitting SHALL be idempotent — concurrent manual and automatic triggers produce exactly one transition to result.

#### Scenario: Double submit collapses to one

- **WHEN** the countdown reaches zero at the same moment the user confirms the submit dialog
- **THEN** the session transitions to result exactly once and later answer edits are ignored


<!-- @trace
source: quiz-flow
updated: 2026-07-11
code:
  - src/stores/settings.ts
  - src/data/validate.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/CountdownTimer.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/styles/theme.css
  - src/quiz/answers.ts
  - src/components/quiz/StartScreen.tsx
  - src/App.tsx
  - src/data/questions.json
  - docs/rules/ui-style.md
  - bun.lock
  - src/data/schema.ts
  - src/components/ui/ZhuyinToggle.tsx
  - src/quiz/draw.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/drafts/bank.txt
  - package.json
  - src/components/quiz/StarTrack.tsx
  - scripts/annotate-zhuyin.ts
  - src/stores/quiz.ts
  - src/components/quiz/QuizScreen.tsx
  - docs/roadmap.md
  - README.md
  - src/quiz/time.ts
tests:
  - src/components/ZhuyinText.test.tsx
  - src/data/polyphone.test.ts
  - e2e/screens.spec.ts
  - src/components/quiz/StartScreen.test.tsx
  - src/quiz/answers.test.ts
  - src/quiz/draw.test.ts
  - src/App.test.tsx
  - e2e/quiz-flow.spec.ts
  - src/components/ui/ZhuyinToggle.test.tsx
  - src/components/quiz/StarTrack.test.tsx
  - src/stores/quiz.test.ts
  - src/styles/theme.test.ts
  - src/data/validate.test.ts
  - src/data/bank.test.ts
  - src/components/quiz/QuizScreen.test.tsx
  - src/components/quiz/CountdownTimer.test.tsx
  - src/stores/settings.test.ts
  - src/quiz/time.test.ts
  - src/data/charset-coverage.test.ts
  - src/data/annotate-zhuyin.test.ts
  - src/components/quiz/SubmitDialog.test.tsx
-->

---
### Requirement: Question drawing

Drawing SHALL select exactly one random question per type from the bank, with equal probability within each type, and return them in the fixed order single, multi, fill, match, image. The random source SHALL be injectable for deterministic tests.

#### Scenario: One of each type in fixed order

- **WHEN** a session starts against a bank with three or more questions per type
- **THEN** exactly five questions are drawn, their types follow the fixed order, and repeated draws with different seeds select different same-type questions


<!-- @trace
source: quiz-flow
updated: 2026-07-11
code:
  - src/stores/settings.ts
  - src/data/validate.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/CountdownTimer.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/styles/theme.css
  - src/quiz/answers.ts
  - src/components/quiz/StartScreen.tsx
  - src/App.tsx
  - src/data/questions.json
  - docs/rules/ui-style.md
  - bun.lock
  - src/data/schema.ts
  - src/components/ui/ZhuyinToggle.tsx
  - src/quiz/draw.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/drafts/bank.txt
  - package.json
  - src/components/quiz/StarTrack.tsx
  - scripts/annotate-zhuyin.ts
  - src/stores/quiz.ts
  - src/components/quiz/QuizScreen.tsx
  - docs/roadmap.md
  - README.md
  - src/quiz/time.ts
tests:
  - src/components/ZhuyinText.test.tsx
  - src/data/polyphone.test.ts
  - e2e/screens.spec.ts
  - src/components/quiz/StartScreen.test.tsx
  - src/quiz/answers.test.ts
  - src/quiz/draw.test.ts
  - src/App.test.tsx
  - e2e/quiz-flow.spec.ts
  - src/components/ui/ZhuyinToggle.test.tsx
  - src/components/quiz/StarTrack.test.tsx
  - src/stores/quiz.test.ts
  - src/styles/theme.test.ts
  - src/data/validate.test.ts
  - src/data/bank.test.ts
  - src/components/quiz/QuizScreen.test.tsx
  - src/components/quiz/CountdownTimer.test.tsx
  - src/stores/settings.test.ts
  - src/quiz/time.test.ts
  - src/data/charset-coverage.test.ts
  - src/data/annotate-zhuyin.test.ts
  - src/components/quiz/SubmitDialog.test.tsx
-->

---
### Requirement: Deadline-based countdown with auto submit

The session deadline SHALL be the start timestamp plus ten minutes, and remaining time SHALL always be recomputed from the deadline and current clock rather than decremented. When the deadline passes, the session SHALL auto-submit: any open confirm dialog closes, the submission is marked automatic, and the result view announces the automatic hand-in.

#### Scenario: Background tab does not skew the clock

- **WHEN** the tab is backgrounded for two minutes during a session
- **THEN** the displayed remaining time on return reflects true wall-clock elapsed time

#### Scenario: Deadline wins over an open dialog

- **WHEN** the unanswered-questions dialog is open and the deadline passes
- **THEN** the dialog closes and the session auto-submits with the automatic flag set


<!-- @trace
source: quiz-flow
updated: 2026-07-11
code:
  - src/stores/settings.ts
  - src/data/validate.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/CountdownTimer.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/styles/theme.css
  - src/quiz/answers.ts
  - src/components/quiz/StartScreen.tsx
  - src/App.tsx
  - src/data/questions.json
  - docs/rules/ui-style.md
  - bun.lock
  - src/data/schema.ts
  - src/components/ui/ZhuyinToggle.tsx
  - src/quiz/draw.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/drafts/bank.txt
  - package.json
  - src/components/quiz/StarTrack.tsx
  - scripts/annotate-zhuyin.ts
  - src/stores/quiz.ts
  - src/components/quiz/QuizScreen.tsx
  - docs/roadmap.md
  - README.md
  - src/quiz/time.ts
tests:
  - src/components/ZhuyinText.test.tsx
  - src/data/polyphone.test.ts
  - e2e/screens.spec.ts
  - src/components/quiz/StartScreen.test.tsx
  - src/quiz/answers.test.ts
  - src/quiz/draw.test.ts
  - src/App.test.tsx
  - e2e/quiz-flow.spec.ts
  - src/components/ui/ZhuyinToggle.test.tsx
  - src/components/quiz/StarTrack.test.tsx
  - src/stores/quiz.test.ts
  - src/styles/theme.test.ts
  - src/data/validate.test.ts
  - src/data/bank.test.ts
  - src/components/quiz/QuizScreen.test.tsx
  - src/components/quiz/CountdownTimer.test.tsx
  - src/stores/settings.test.ts
  - src/quiz/time.test.ts
  - src/data/charset-coverage.test.ts
  - src/data/annotate-zhuyin.test.ts
  - src/components/quiz/SubmitDialog.test.tsx
-->

---
### Requirement: Session survives a reload

Session state (phase, drawn question ids, answers, name, start timestamp) SHALL persist in sessionStorage so an accidental reload resumes the same questions with the same remaining time. When persisted question ids no longer exist in the bank, the session SHALL reset to start. When sessionStorage is unavailable, the quiz SHALL still run within the page lifetime.

#### Scenario: Accidental reload resumes

- **WHEN** the user reloads mid-quiz
- **THEN** the same five questions, given answers, and a remaining time consistent with the original deadline are restored


<!-- @trace
source: quiz-flow
updated: 2026-07-11
code:
  - src/stores/settings.ts
  - src/data/validate.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/CountdownTimer.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/styles/theme.css
  - src/quiz/answers.ts
  - src/components/quiz/StartScreen.tsx
  - src/App.tsx
  - src/data/questions.json
  - docs/rules/ui-style.md
  - bun.lock
  - src/data/schema.ts
  - src/components/ui/ZhuyinToggle.tsx
  - src/quiz/draw.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/drafts/bank.txt
  - package.json
  - src/components/quiz/StarTrack.tsx
  - scripts/annotate-zhuyin.ts
  - src/stores/quiz.ts
  - src/components/quiz/QuizScreen.tsx
  - docs/roadmap.md
  - README.md
  - src/quiz/time.ts
tests:
  - src/components/ZhuyinText.test.tsx
  - src/data/polyphone.test.ts
  - e2e/screens.spec.ts
  - src/components/quiz/StartScreen.test.tsx
  - src/quiz/answers.test.ts
  - src/quiz/draw.test.ts
  - src/App.test.tsx
  - e2e/quiz-flow.spec.ts
  - src/components/ui/ZhuyinToggle.test.tsx
  - src/components/quiz/StarTrack.test.tsx
  - src/stores/quiz.test.ts
  - src/styles/theme.test.ts
  - src/data/validate.test.ts
  - src/data/bank.test.ts
  - src/components/quiz/QuizScreen.test.tsx
  - src/components/quiz/CountdownTimer.test.tsx
  - src/stores/settings.test.ts
  - src/quiz/time.test.ts
  - src/data/charset-coverage.test.ts
  - src/data/annotate-zhuyin.test.ts
  - src/components/quiz/SubmitDialog.test.tsx
-->

---
### Requirement: Answer-state contract

The session SHALL own the answer value shapes per question type (single and image: nullable index; multi: index array; fill: string; match: nullable index array allowing partial progress) and a single isAnswered predicate: single and image answered when non-null, multi when non-empty, fill when non-blank after trim, match only when every pair is connected. All consumers (progress display, star track, submit dialog count) SHALL use this predicate.

#### Scenario: Partial match counts as unanswered

- **WHEN** a match question has two of three pairs connected
- **THEN** isAnswered reports false and the unanswered count includes that question

<!-- @trace
source: quiz-flow
updated: 2026-07-11
code:
  - src/stores/settings.ts
  - src/data/validate.ts
  - src/components/ZhuyinText.tsx
  - src/components/quiz/CountdownTimer.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/styles/theme.css
  - src/quiz/answers.ts
  - src/components/quiz/StartScreen.tsx
  - src/App.tsx
  - src/data/questions.json
  - docs/rules/ui-style.md
  - bun.lock
  - src/data/schema.ts
  - src/components/ui/ZhuyinToggle.tsx
  - src/quiz/draw.ts
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/drafts/bank.txt
  - package.json
  - src/components/quiz/StarTrack.tsx
  - scripts/annotate-zhuyin.ts
  - src/stores/quiz.ts
  - src/components/quiz/QuizScreen.tsx
  - docs/roadmap.md
  - README.md
  - src/quiz/time.ts
tests:
  - src/components/ZhuyinText.test.tsx
  - src/data/polyphone.test.ts
  - e2e/screens.spec.ts
  - src/components/quiz/StartScreen.test.tsx
  - src/quiz/answers.test.ts
  - src/quiz/draw.test.ts
  - src/App.test.tsx
  - e2e/quiz-flow.spec.ts
  - src/components/ui/ZhuyinToggle.test.tsx
  - src/components/quiz/StarTrack.test.tsx
  - src/stores/quiz.test.ts
  - src/styles/theme.test.ts
  - src/data/validate.test.ts
  - src/data/bank.test.ts
  - src/components/quiz/QuizScreen.test.tsx
  - src/components/quiz/CountdownTimer.test.tsx
  - src/stores/settings.test.ts
  - src/quiz/time.test.ts
  - src/data/charset-coverage.test.ts
  - src/data/annotate-zhuyin.test.ts
  - src/components/quiz/SubmitDialog.test.tsx
-->