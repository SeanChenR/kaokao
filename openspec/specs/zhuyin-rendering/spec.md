# zhuyin-rendering Specification

## Purpose

TBD - created by archiving change 'question-bank'. Update Purpose after archive.

## Requirements

### Requirement: Ruby rendering of rich zhuyin text

The system SHALL provide a single shared ZhuyinText component that renders rich zhuyin content. When zhuyin display is enabled, every Chinese-character token SHALL render as `<ruby lang="zh-TW">` with its reading in an `<rt aria-hidden="true">`; non-Chinese tokens SHALL render as plain text nodes with no rt element. Each word segment SHALL be wrapped so a line break cannot occur inside the segment. The reading SHALL be laid out Taiwan-textbook style: a vertical bopomofo column to the RIGHT of the base character (top to bottom), with trailing tone marks (ˊˇˋ) centered to the right of that column and the neutral-tone dot (˙) at the top of the column. The column SHALL not exceed the base character's line box in a way that overlaps adjacent lines. Every annotated character block SHALL occupy a uniform advance width — the reading gutter has a fixed width regardless of how many bopomofo symbols or tone marks it holds — so inter-character spacing stays visually even (Sean, 2026-07-11).

#### Scenario: Enabled rendering contract

- **WHEN** ZhuyinText renders 「水果」 with zhuyin enabled
- **THEN** the DOM contains two ruby elements with rt children marked aria-hidden, each reading rendered as a vertical column to the right of its character, wrapped in a no-wrap segment container

#### Scenario: Screen reader skips readings

- **WHEN** a screen reader traverses rendered zhuyin text
- **THEN** only the base characters are announced; rt content is excluded from the accessibility tree

#### Scenario: Uniform character rhythm

- **WHEN** a line mixes syllables of one, two, and three bopomofo symbols
- **THEN** all annotated character blocks have the same advance width and the gaps between characters are equal

#### Scenario: Tone placement

- **WHEN** a character reads ㄒㄩㄢˇ and another reads ˙ㄉㄜ
- **THEN** the ˇ renders centered beside the right of the ㄒㄩㄢ column, and the ˙ renders at the top of the ㄉㄜ column


<!-- @trace
source: zhuyin-side-layout
updated: 2026-07-11
code:
  - docs/rules/ui-style.md
  - src/components/quiz/ResultScreen.tsx
  - src/components/quiz/StarTrack.tsx
  - src/components/quiz/SubmitDialog.tsx
  - src/data/schema.ts
  - src/components/quiz/QuizScreen.tsx
  - src/components/quiz/StartScreen.tsx
  - src/components/ZhuyinText.tsx
  - src/components/quiz/LeaderboardList.tsx
  - src/components/quiz/widgets/FillBlank.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/ReviewList.tsx
  - src/components/quiz/widgets/shared.ts
  - src/styles/theme.css
tests:
  - e2e/a11y.spec.ts
  - src/components/ZhuyinText.test.tsx
  - src/styles/theme.test.ts
-->

---
### Requirement: Zhuyin display toggle

The system SHALL provide a global zhuyin display preference, default on, persisted with the other settings. When disabled, ZhuyinText SHALL render plain text only — the DOM SHALL contain no ruby or rt elements. A ZhuyinToggle control SHALL expose this preference as a native button with `aria-pressed` reflecting the current state, a hit area of at least 44×44 pixels, and a visible focus ring; it SHALL be reachable from the app shell.

#### Scenario: Toggle off strips ruby

- **WHEN** the user activates ZhuyinToggle while zhuyin is on
- **THEN** aria-pressed becomes false, all ZhuyinText instances re-render as plain text without rt elements, and the preference survives a reload

#### Scenario: Legacy settings payload upgrades

- **WHEN** a stored settings payload containing only the theme key is rehydrated
- **THEN** the zhuyin preference initializes to true and the stored theme is preserved