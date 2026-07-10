## ADDED Requirements

### Requirement: Button component variants and states

The system SHALL provide a shared Button component with `primary`, `secondary`, and `ghost` variants, forwarding native button attributes. Each variant SHALL present distinct hover feedback, a visible focus ring in the primary token color, and a non-interactive disabled state (reduced opacity, `not-allowed` cursor, unclickable).

#### Scenario: Disabled button

- **WHEN** a Button has the `disabled` attribute and the user clicks it
- **THEN** no click handler fires and the button shows its disabled styling

#### Scenario: Keyboard focus

- **WHEN** the user tabs onto any Button variant
- **THEN** a visible focus ring in the primary color surrounds it

### Requirement: Card surface container

The system SHALL provide a Card component rendering a surface-colored container with the shared border, radius, and theme-aware card shadow tokens, accepting arbitrary children.

#### Scenario: Card in both themes

- **WHEN** a Card renders under `data-theme="dark"` and `data-theme="light"`
- **THEN** it uses the respective surface, border, and shadow token values of each theme

### Requirement: Theme toggle control

The system SHALL provide a ThemeToggle rendered as a native button that switches the effective theme between light and dark on activation. It SHALL expose an aria-label describing the action for the current state (switching to the other theme), update that label after toggling, and be operable with Enter and Space. Activating the toggle SHALL store the chosen theme as a manual preference.

#### Scenario: Toggle via keyboard

- **WHEN** the user tabs to ThemeToggle and presses Enter
- **THEN** `data-theme` on the root element flips, the stored preference becomes the chosen theme, and the aria-label updates to describe switching back

### Requirement: Minimum touch target

Every interactive element shipped by this capability (Button, ThemeToggle) SHALL have a hit area of at least 44×44 CSS pixels.

#### Scenario: Toggle hit area

- **WHEN** ThemeToggle is measured in the rendered page
- **THEN** its width and height are each at least 44 pixels
