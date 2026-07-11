## ADDED Requirements

### Requirement: Spring motion vocabulary

Question-card transitions SHALL use a waiting cross-fade-slide (one card, and exactly one stem heading, in the DOM at any instant) with focus moving to the new stem only after the entrance completes, without scrolling the page. Stars SHALL pop once when their question becomes answered, match lines SHALL draw in, and option selection SHALL scale no more than 1.02. All motion SHALL come from the shared spring presets and SHALL collapse to instant transitions for reduced-motion users.

#### Scenario: Single heading during transition

- **WHEN** the user navigates between questions while the exit animation plays
- **THEN** the DOM never contains two stem headings and focus lands on the new stem after the entrance finishes

#### Scenario: Reduced motion is instant

- **WHEN** a reduced-motion user navigates questions
- **THEN** the card changes with no positional animation and focus moves immediately

### Requirement: Gentle audio feedback, off by default

Audio SHALL be off by default and controlled by a persisted sound preference with an unambiguous toggle (muted-bell versus bell iconography, aria-pressed). All tones SHALL be synthesized sine blips capped at low gain with attack and release envelopes, in the 400–900Hz band for interaction sounds. Interaction triggers are: newly selecting an option (deselection is silent), completing a match pair, submitting, and a short result melody only at sixty percent or above. The audio context SHALL be a lazy singleton resumed within a user gesture, playing only when running, and every audio API SHALL no-op when Web Audio is unavailable.

#### Scenario: Deselection stays silent

- **WHEN** sound is on and the user unchecks a multi-choice option
- **THEN** no tone plays

#### Scenario: Result melody gated by score and context state

- **WHEN** the result screen mounts with sound on but the audio context is not running
- **THEN** no melody attempt throws and the screen renders normally
