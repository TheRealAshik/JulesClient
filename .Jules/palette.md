## 2024-03-15 - Interactive Toggle Accessibility
**Learning:** Custom UI switches built with `div` or `button` elements need specific ARIA roles (`role="switch"`) and states (`aria-checked`) to communicate correctly to screen readers. Relying solely on visual cues or generic `button` roles hides the current toggle state from assistive technologies.
**Action:** Always verify custom toggle or switch components include `role="switch"` and bind `aria-checked` to the boolean state of the toggle.
