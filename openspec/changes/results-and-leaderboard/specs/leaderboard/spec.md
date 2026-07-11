## ADDED Requirements

### Requirement: Leaderboard ordering and retention

The leaderboard SHALL persist locally, ordered by score descending then elapsed seconds ascending, retaining only the top ten entries. Every entry SHALL carry a unique id; duplicate names are allowed. New entries are written exactly once per submission, using the quiz session name (not the remembered prefill name).

#### Scenario: Tie broken by time

- **WHEN** two entries share a score and one finished faster
- **THEN** the faster entry ranks higher

### Requirement: Current-run highlight

The result screen SHALL highlight exactly the entry written by the current submission, identified by its unique id (never by name), and the highlight SHALL survive a reload of the result page. When the current run does not reach the top ten, the screen SHALL show the run's overall rank below the board instead.

#### Scenario: Same-name sibling does not highlight

- **WHEN** the board already holds an entry with the same name and the current run lands on the board
- **THEN** only the current run's row is highlighted

### Requirement: Demo seed entries

The board SHALL ship with five demo entries as the store's initial state (persisted on first use, never re-seeded), visually marked as 示範 with muted styling so real records are distinguishable. Demo entries SHALL never be highlighted as the current run.

#### Scenario: Seeding happens once

- **WHEN** the app loads for the first time and again after real entries exist
- **THEN** demo entries appear once and are never duplicated by later loads

### Requirement: Start screen preview

The start screen SHALL show the top five leaderboard entries with the same demo marking, giving returning students a goal before starting.

#### Scenario: Preview reflects new records

- **WHEN** a student finishes a run and returns to the start screen
- **THEN** the preview includes the new record in its sorted position when it ranks in the top five
