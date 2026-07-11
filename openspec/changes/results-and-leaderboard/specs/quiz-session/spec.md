## MODIFIED Requirements

### Requirement: Quiz session state machine

The quiz session SHALL progress through the phases start, quiz, and result. Starting a session SHALL require a trimmed name of 1 to 12 characters, draw the questions, record the start timestamp, and store the name for next-visit prefill. Answer mutations and submissions SHALL be no-ops outside the quiz phase, and submitting SHALL be idempotent — concurrent manual and automatic triggers produce exactly one transition to result. Submission SHALL additionally record the finish timestamp (equal to the deadline for automatic submission) and write exactly one leaderboard entry for the run, remembering that entry's id for highlighting.

#### Scenario: Double submit collapses to one

- **WHEN** the countdown reaches zero at the same moment the user confirms the submit dialog
- **THEN** the session transitions to result exactly once, later answer edits are ignored, and exactly one leaderboard entry is written

### Requirement: Session survives a reload

Session state (phase, drawn question ids, answers, name, start timestamp, finish timestamp, and the current run's leaderboard entry id) SHALL persist in sessionStorage so an accidental reload resumes the same questions with the same remaining time, and a reload on the result page keeps the same score, elapsed time, and highlighted leaderboard row. When persisted question ids no longer exist in the bank, the session SHALL reset to start. When sessionStorage is unavailable, the quiz SHALL still run within the page lifetime.

#### Scenario: Accidental reload resumes

- **WHEN** the user reloads mid-quiz
- **THEN** the same five questions, given answers, and a remaining time consistent with the original deadline are restored

#### Scenario: Result page reload keeps the outcome

- **WHEN** the user reloads on the result screen
- **THEN** the score, elapsed time, and highlighted leaderboard entry remain unchanged and no duplicate entry is written
