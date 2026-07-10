## ADDED Requirements

### Requirement: Ruby rendering of rich zhuyin text

The system SHALL provide a single shared ZhuyinText component that renders rich zhuyin content. When zhuyin display is enabled, every Chinese-character token SHALL render as `<ruby lang="zh-TW">` with its reading in an `<rt aria-hidden="true">` at 0.55em; non-Chinese tokens SHALL render as plain text nodes with no rt element. Each word segment SHALL be wrapped so a line break cannot occur inside the segment.

#### Scenario: Enabled rendering contract

- **WHEN** ZhuyinText renders 「水果」 with zhuyin enabled
- **THEN** the DOM contains two ruby elements with rt children marked aria-hidden, wrapped in a no-wrap segment container

#### Scenario: Screen reader skips readings

- **WHEN** a screen reader traverses rendered zhuyin text
- **THEN** only the base characters are announced; rt content is excluded from the accessibility tree

### Requirement: Zhuyin display toggle

The system SHALL provide a global zhuyin display preference, default on, persisted with the other settings. When disabled, ZhuyinText SHALL render plain text only — the DOM SHALL contain no ruby or rt elements. A ZhuyinToggle control SHALL expose this preference as a native button with `aria-pressed` reflecting the current state, a hit area of at least 44×44 pixels, and a visible focus ring; it SHALL be reachable from the app shell.

#### Scenario: Toggle off strips ruby

- **WHEN** the user activates ZhuyinToggle while zhuyin is on
- **THEN** aria-pressed becomes false, all ZhuyinText instances re-render as plain text without rt elements, and the preference survives a reload

#### Scenario: Legacy settings payload upgrades

- **WHEN** a stored settings payload containing only the theme key is rehydrated
- **THEN** the zhuyin preference initializes to true and the stored theme is preserved
