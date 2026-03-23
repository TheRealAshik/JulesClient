## 2024-03-15 - Interactive Toggle Accessibility
**Learning:** Custom UI switches built with `div` or `button` elements need specific ARIA roles (`role="switch"`) and states (`aria-checked`) to communicate correctly to screen readers. Relying solely on visual cues or generic `button` roles hides the current toggle state from assistive technologies.
**Action:** Always verify custom toggle or switch components include `role="switch"` and bind `aria-checked` to the boolean state of the toggle.
## 2024-03-16 - Accessible Custom Toggle Switches
**Learning:** When implementing custom toggle switches (e.g., div elements styled as switches instead of native checkbox inputs), assigning `role="switch"` and `aria-checked` is not enough for complete accessibility. They also require `tabIndex={0}` to be focusable via keyboard, an `onKeyDown` handler to toggle state via 'Enter' and 'Space' keys, clear `focus-visible` styles, and explicit `aria-labelledby` / `aria-describedby` attributes to associate them with adjacent text.
**Action:** Always ensure custom interactive controls receive keyboard event handlers, tab navigation support, and correct label associations, rather than just ARIA roles and visual styling.
## 2024-03-22 - [Toggle Switch Accessibility Pattern]
**Learning:** Native `<button>` elements naturally receive keyboard focus and natively respond to 'Enter' and 'Space' keypresses to trigger their `onClick` handlers. When implementing custom ARIA components (like `role="switch"` toggles) using buttons, adding `tabIndex={0}` or custom `onKeyDown` handlers for these keys is redundant and an anti-pattern. Instead, rely on native semantic HTML capabilities while focusing custom styling (like `focus-visible`) and `aria-labelledby`/`aria-describedby` (via `useId()`) for a clean implementation.
**Action:** When creating custom accessible interactive elements, use semantic HTML tags first and rely on their native keyboard/focus behaviors instead of re-implementing them.

## 2026-03-18 - ARIA labels for icon-only buttons
**Learning:** Icon-only buttons or links (e.g. download, external link, copy) must have an `aria-label` for screen readers. A `title` attribute alone is sometimes insufficient for accessibility purposes.
**Action:** Ensure that all icon-only interactive elements contain a descriptive `aria-label` alongside any `title` attributes.
