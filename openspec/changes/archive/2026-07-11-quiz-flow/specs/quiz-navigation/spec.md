## ADDED Requirements

### Requirement: Star track progress and jumping

The quiz screen SHALL show a five-star arc as the single jump-to-question control: unanswered questions render as dim outline stars, answered ones light up in rotating theme accents, and the current question pulses (respecting reduced motion) and carries `aria-current="step"`. Each star SHALL be a native button with an accessible label naming the question number and answered state, and a hit area of at least 44×44 pixels. A textual progress line (current question number and answered count out of five) SHALL accompany the track.

#### Scenario: Jump via star

- **WHEN** the user activates the third star
- **THEN** the view shows question three and focus moves to its stem heading

### Requirement: Sequential navigation with focus management

The quiz screen SHALL provide previous and next controls (previous disabled on the first question; next replaced by a submit control on the last). After any question change, focus SHALL move to the new question's stem heading so keyboard and screen-reader users keep their place.

#### Scenario: Keyboard user advances

- **WHEN** the user activates next with the keyboard
- **THEN** the next question renders and its stem heading receives focus

### Requirement: Submit confirmation for unanswered questions

Activating submit with unanswered questions SHALL open a modal alert dialog stating how many questions remain, with focus trapped inside, Escape and backdrop closing it, and initial focus on the go-back action. Confirming SHALL submit with the current answers; going back SHALL return to the quiz with focus restored to the trigger. Submitting with all questions answered SHALL skip the dialog.

#### Scenario: Dialog defaults to the safe action

- **WHEN** the user submits with two unanswered questions
- **THEN** an alert dialog announces two remaining and pressing Enter without tabbing activates go-back, not submit

### Requirement: Countdown display accessibility

The countdown SHALL render minutes and seconds in tabular numerals inside a `role="timer"` container, switch to the warning color with a motion-safe pulse during the final minute, and announce once via a polite live region at the one-minute and ten-second marks that time is running out and the quiz will auto-submit.

#### Scenario: One-time warnings, no per-second spam

- **WHEN** the countdown crosses sixty seconds remaining
- **THEN** a single polite announcement occurs and subsequent ticks produce no further announcements until the ten-second mark
