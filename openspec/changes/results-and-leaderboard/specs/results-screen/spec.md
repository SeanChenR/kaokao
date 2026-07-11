## ADDED Requirements

### Requirement: Result reveal accessibility

When the session enters the result phase, focus SHALL move to the result heading and a status region SHALL announce the score (correct count out of five). The lit star track and confetti SHALL be decorative (aria-hidden); the textual score is the source of truth.

#### Scenario: Screen reader hears the score

- **WHEN** the user submits and the result screen mounts
- **THEN** a role=status region contains the announced score and focus is on the result heading

### Requirement: Tiered feedback without blame

The result screen SHALL show one of four encouragement tiers (all correct; three or more; at least one; none), never blaming language. Confetti SHALL fire fully only for a perfect score, lightly for three or four correct, and not at all below that; users with reduced motion SHALL get no confetti at any score.

#### Scenario: Zero score stays gentle

- **WHEN** a student scores zero
- **THEN** the screen shows the gentle tier text with no confetti, and the review list is available for learning

### Requirement: Structured answer review

The review SHALL be a semantic list with one entry per question showing a textual verdict badge (not color alone). Per type: single, image, and fill show the student's answer (「(沒有作答)」 when blank) plus the correct answer only when wrong; multi marks each option as correctly chosen, missed, or wrongly chosen; match lists each left item with the student's connection (partial connections shown as-is) and the correct pairing when wrong. All content text SHALL render through the zhuyin component.

#### Scenario: Multi review shows the delta

- **WHEN** the answer is [0,2] and the student chose [0,3]
- **THEN** the review marks option 0 as correct, option 2 as missed, and option 3 as wrongly chosen

#### Scenario: Unanswered question review

- **WHEN** a question was never answered
- **THEN** its review row shows 「(沒有作答)」 as the student answer and displays the correct answer
