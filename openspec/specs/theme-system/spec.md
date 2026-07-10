# theme-system Specification

## Purpose

TBD - created by archiving change 'design-tokens-and-theme'. Update Purpose after archive.

## Requirements

### Requirement: Theme resolution with three-state preference

The system SHALL resolve the effective theme from a stored preference of `auto | light | dark`. When the preference is `auto`, the effective theme SHALL follow the OS `prefers-color-scheme`. When the preference is `light` or `dark`, the effective theme SHALL be that value regardless of the OS setting. The resolution rule SHALL exist as a single exported function `resolveTheme(stored, systemDark)` and every consumer (store, pre-paint script) SHALL apply the same rule.

#### Scenario: Auto follows the system

- **WHEN** the stored preference is `auto` and the OS reports dark mode
- **THEN** the effective theme is `dark`, and it switches to `light` immediately when the OS preference changes to light

#### Scenario: Manual choice overrides the system

- **WHEN** the stored preference is `dark` and the OS reports light mode
- **THEN** the effective theme is `dark`, and later OS preference changes do not alter it

##### Example: Resolution table

| stored | systemDark | effective |
| ------ | ---------- | --------- |
| auto   | true       | dark      |
| auto   | false      | light     |
| light  | true       | light     |
| light  | false      | light     |
| dark   | true       | dark      |
| dark   | false      | dark      |


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Theme persistence

The system SHALL persist the theme preference in localStorage under the key `kaokao-settings` and restore it on page load. When localStorage is unavailable or its content is corrupted, the system SHALL fall back to `auto` without throwing.

#### Scenario: Preference survives reload

- **WHEN** the user selects dark mode and reloads the page
- **THEN** the page renders in dark mode

#### Scenario: Private browsing fallback

- **WHEN** localStorage access throws
- **THEN** the page renders following the OS preference and no error is surfaced


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Flash-free first paint

The application HTML SHALL contain a blocking inline script in the head that resolves the effective theme and sets `data-theme` on the root element before first paint, so the initial paint already uses the correct theme colors.

#### Scenario: Dark-OS user reloads

- **WHEN** a user whose OS is in dark mode loads the page
- **THEN** the first painted frame uses dark background with no light flash


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Single CSS theme source

All theme-dependent CSS SHALL key off `html[data-theme="light"]` and `html[data-theme="dark"]` exclusively. CSS media queries SHALL NOT be used to define color values. Tailwind utilities for token colors (such as `bg-surface`, `text-primary`) SHALL resolve through CSS custom properties so the same utility renders both themes.

#### Scenario: Utility flips with theme

- **WHEN** an element uses `bg-surface` and `data-theme` changes from `dark` to `light`
- **THEN** the element background changes from `#1f1d2b` to the light surface value without any class change


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Token contrast compliance

The finalized token values SHALL satisfy WCAG AA in both themes: body-text pairs (text, muted on bg and surface) at contrast ratio ≥ 4.5, and UI accent colors (primary, success, error, warning, info, accent on surface) at ≥ 3.0. An automated test SHALL compute the ratios from the token source and fail when any pair drops below its threshold.

#### Scenario: Contrast gate

- **WHEN** the token contrast test runs against the finalized values
- **THEN** every listed pair meets its minimum ratio in both themes


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Self-hosted subset font

The system SHALL serve jf open 粉圓 (Huninn) weight 400 as a self-hosted woff2 file subset to a static charset (the upstream release ships Regular only; bold text SHALL render via browser font-synthesis) covering common Traditional Chinese characters, ASCII, zhuyin symbols (ㄅ–ㄩ plus tone marks), and full-width punctuation. The page SHALL make no requests to external font CDNs, and `font-display: swap` SHALL keep text visible while fonts load.

#### Scenario: Offline-capable fonts

- **WHEN** the production build is inspected
- **THEN** woff2 files are emitted into the bundle output and no reference to fonts.googleapis.com or fonts.gstatic.com exists


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Starfield background layer

The system SHALL render a purely decorative starfield background implemented as layered CSS radial-gradients on a fixed element marked `aria-hidden="true"`, with distinct variants per theme. Body text SHALL always sit on surface-colored containers, keeping star dots out of text areas.

#### Scenario: Decorative only

- **WHEN** a screen reader traverses the page
- **THEN** the starfield layer is skipped entirely


<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->

---
### Requirement: Reduced-motion theme transition

Color transitions applied for theme switching SHALL be disabled when the user has `prefers-reduced-motion: reduce`.

#### Scenario: Reduced motion switch

- **WHEN** a reduced-motion user toggles the theme
- **THEN** colors change instantly with no animated transition

<!-- @trace
source: design-tokens-and-theme
updated: 2026-07-11
code:
  - src/theme/resolve.ts
  - docs/rules/ui-style.md
  - src/components/ui/Card.tsx
  - bun.lock
  - scripts/charset.txt
  - src/components/StarField.tsx
  - src/stores/settings.ts
  - assets-src/fonts/OFL.txt
  - happydom.ts
  - src/styles/fonts.css
  - scripts/subset-font.d.ts
  - src/index.ts
  - assets-src/fonts/jf-openhuninn-2.1.ttf
  - src/App.tsx
  - package.json
  - src/styles/theme.css
  - src/components/ui/Button.tsx
  - scripts/subset-fonts.ts
  - src/components/ui/ThemeToggle.tsx
  - src/index.html
  - playwright.config.ts
  - bunfig.toml
  - src/assets/fonts/huninn-400.woff2
  - README.md
  - src/index.css
tests:
  - src/theme/resolve.test.ts
  - src/App.test.tsx
  - src/components/ui/ThemeToggle.test.tsx
  - src/components/ui/Card.test.tsx
  - src/components/ui/Button.test.tsx
  - src/theme/prepaint.test.ts
  - src/styles/theme-contrast.test.ts
  - e2e/theme-smoke.spec.ts
  - src/stores/settings.test.ts
  - src/styles/theme.test.ts
-->