# ship-readiness Specification

## Purpose

TBD - created by archiving change 'e2e-and-ship'. Update Purpose after archive.

## Requirements

### Requirement: Mobile viewport regression coverage

The end-to-end suite SHALL run core quiz flows on both a desktop project and a mobile-device project, with screenshot specs excluded from the mobile project (they manage their own viewports). The suite SHALL support pointing at a deployed base URL through an environment variable for production smoke runs.

#### Scenario: Mobile project runs core flows

- **WHEN** the Playwright suite runs
- **THEN** quiz-flow, results, and a11y specs execute under a mobile device profile in addition to desktop, all green


<!-- @trace
source: e2e-and-ship
updated: 2026-07-11
code:
  - README.md
  - playwright.config.ts
-->

---
### Requirement: Submission-grade README

The README SHALL contain: the live demo link up front, quick-start commands, an architecture overview, the design rationale (visual concept, zhuyin engineering including polyphone safeguards, accessibility, motion restraint), a bonus-item mapping against the assignment, the testing strategy, a future-work list, and font licensing attribution.

#### Scenario: A reviewer can start and understand the project

- **WHEN** a reviewer follows the README top to bottom
- **THEN** they can run the app locally with the stated commands and find the rationale for every major technical choice

<!-- @trace
source: e2e-and-ship
updated: 2026-07-11
code:
  - README.md
  - playwright.config.ts
-->