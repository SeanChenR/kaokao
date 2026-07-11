## MODIFIED Requirements

### Requirement: Ruby rendering of rich zhuyin text

The system SHALL provide a single shared ZhuyinText component that renders rich zhuyin content. When zhuyin display is enabled, every Chinese-character token SHALL render as `<ruby lang="zh-TW">` with its reading in an `<rt aria-hidden="true">`; non-Chinese tokens SHALL render as plain text nodes with no rt element. Each word segment SHALL be wrapped so a line break cannot occur inside the segment. The reading SHALL be laid out Taiwan-textbook style: a vertical bopomofo column to the RIGHT of the base character (top to bottom), with trailing tone marks (ˊˇˋ) centered to the right of that column and the neutral-tone dot (˙) at the top of the column. The column SHALL not exceed the base character's line box in a way that overlaps adjacent lines.

#### Scenario: Enabled rendering contract

- **WHEN** ZhuyinText renders 「水果」 with zhuyin enabled
- **THEN** the DOM contains two ruby elements with rt children marked aria-hidden, each reading rendered as a vertical column to the right of its character, wrapped in a no-wrap segment container

#### Scenario: Screen reader skips readings

- **WHEN** a screen reader traverses rendered zhuyin text
- **THEN** only the base characters are announced; rt content is excluded from the accessibility tree

#### Scenario: Tone placement

- **WHEN** a character reads ㄒㄩㄢˇ and another reads ˙ㄉㄜ
- **THEN** the ˇ renders centered beside the right of the ㄒㄩㄢ column, and the ˙ renders at the top of the ㄉㄜ column
