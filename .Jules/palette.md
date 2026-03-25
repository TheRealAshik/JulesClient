## 2024-03-05 - Fixing div onClick accessibility
**Learning:** In React, using a `<div>` with `onClick` for expandable sections (like terminal output or code diffs) prevents keyboard users from accessing the content since it lacks focusability and keyboard event handlers.
**Action:** Always prefer semantic HTML elements like `<button>` or `<details>/<summary>` for expandable/collapsible areas to ensure built-in keyboard accessibility and ARIA support.
