# answer-widgets Specification

## Purpose

TBD - created by archiving change 'question-types'. Update Purpose after archive.

## Requirements

### Requirement: Widget accessibility contract

Every answer widget SHALL follow the fixed role mapping: single and image render a radiogroup labelled by the stem heading containing radio options with aria-checked; multi renders a labelled group of checkbox-role options with aria-checked; fill renders a text input whose accessible name is the stem text; match renders a labelled group where left items are toggle buttons with aria-pressed and pairing changes are announced through a polite live region. All option text (including image shape labels and match items) SHALL render through the shared zhuyin component and follow the global zhuyin toggle.

#### Scenario: Zhuyin toggle reaches options

- **WHEN** the user turns zhuyin display off while a single-choice question is shown
- **THEN** option cards re-render without ruby elements, and turning it back on restores them

#### Scenario: Radiogroup is labelled by the stem

- **WHEN** a screen reader enters the single-choice option list
- **THEN** the group's accessible name is the question stem


<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->

---
### Requirement: Selection behavior per type

Single and image selection SHALL move to the clicked option and never clear back to unanswered (null exists only before first interaction). Multi SHALL toggle options independently, reporting an ascending unique index array. Fill SHALL write the input value to the store on every change. All emitted values SHALL match the AnswerValueMap types with no string leakage from underlying primitives.

#### Scenario: Multi toggle reports ascending indexes

- **WHEN** the user checks option 3 then option 1 of a multi question
- **THEN** onChange first reports [3], then reports [1, 3] in ascending order


<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->

---
### Requirement: Matching interaction state machine

Matching SHALL support: selecting a left item (highlighted, aria-pressed true), then a right item to form a pair drawn as an accent-colored SVG line; activating an already-paired left item SHALL remove that pair; activating an occupied right item while a left item is selected SHALL reassign it to the selected left item. All items SHALL be native buttons operable with Enter and Space in document tab order. Each pairing or unpairing SHALL be announced via a polite live region naming both items.

#### Scenario: Reassign an occupied right item

- **WHEN** left A is paired to right X and the user selects left B then activates right X
- **THEN** the pair A–X is removed, B–X is created, and the value reports A as null and B as X's index


<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->

---
### Requirement: Connection lines stay anchored

Matching SVG lines SHALL be measured relative to the widget container and re-measured after container resize, after web font loading completes, after the zhuyin display toggles, and after any pairing change, so lines stay visually attached to their buttons. A restored session SHALL show its existing pairs' lines after first layout.

#### Scenario: Font swap does not detach lines

- **WHEN** the self-hosted font finishes loading after first paint with pairs already drawn
- **THEN** the lines re-measure and stay attached to the item buttons


<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->

---
### Requirement: Image options render recognizable shapes

Image options SHALL render the six shape codes as lucide iconography with color rotation limited to primary, success, and info (accent is reserved for match lines), color carrying no answer information. Selection and focus feedback SHALL use silhouette-hugging drop-shadow glow. Each option's accessible name SHALL be its shape label text.

#### Scenario: Shape option accessible name

- **WHEN** a screen reader focuses the triangle option
- **THEN** it announces the label 三角形 (with its zhuyin excluded from the accessible name)


<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->

---
### Requirement: Child-friendly touch targets

Option cards SHALL be at least 48 CSS pixels tall with at least 10 pixels between cards; match columns SHALL be separated by at least 24 pixels.

#### Scenario: Option card sizing

- **WHEN** option cards render on a 375px viewport
- **THEN** every card's hit area is at least 48px tall with visible spacing between adjacent cards

<!-- @trace
source: question-types
updated: 2026-07-11
code:
  - src/components/quiz/widgets/ImageChoice.tsx
  - src/components/quiz/widgets/MultiChoice.tsx
  - src/components/quiz/widgets/Matching.tsx
  - src/components/quiz/QuestionCard.tsx
  - src/components/quiz/QuestionSlot.tsx
  - src/components/quiz/widgets/ShapeIcon.tsx
  - src/components/quiz/widgets/SingleChoice.tsx
  - src/components/quiz/widgets/shared.ts
  - src/components/quiz/widgets/FillBlank.tsx
tests:
  - src/components/quiz/widgets/widgets.test.tsx
  - e2e/screens.spec.ts
  - src/components/quiz/widgets/ShapeIcon.test.tsx
  - e2e/quiz-flow.spec.ts
-->