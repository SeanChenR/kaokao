## ADDED Requirements

### Requirement: Per-type correctness judgement

Scoring SHALL judge each answer only after submission: single and image are correct when the chosen index equals the answer; multi when the chosen index array equals the answer array exactly; fill when the trimmed input matches any accepted string; match when every left item maps to its correct right index. Unanswered questions SHALL count as incorrect. No correctness information SHALL be exposed during the quiz phase.

#### Scenario: Fill accepts alternate spellings

- **WHEN** a fill question accepts ["12", "十二"] and the user submits " 十二 "
- **THEN** the question is judged correct after trimming

##### Example: Judgement matrix

| type | answer | given | correct |
| ---- | ------ | ----- | ------- |
| single | 2 | 2 | yes |
| single | 2 | null | no |
| multi | [0,2] | [0,2] | yes |
| multi | [0,2] | [0] | no |
| match | [1,0] | [1,0] | yes |
| match | [1,0] | [1,null] | no |
| image | 1 | 0 | no |

### Requirement: Elapsed time recording

Submission SHALL record a finish timestamp; for automatic submission at the deadline the finish timestamp SHALL equal the deadline itself, so elapsed time never exceeds the quiz duration. Elapsed seconds SHALL derive from finish minus start.

#### Scenario: Auto submit caps elapsed

- **WHEN** the countdown reaches zero and auto-submits
- **THEN** the recorded elapsed time is exactly ten minutes
