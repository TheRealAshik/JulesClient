## 2024-05-22 - Missing ARIA labels on interactive elements
**Learning:** Icon-only buttons in the input area (send, attach, mode toggle) were completely inaccessible to screen readers.
**Action:** Always check `InputArea` components for icon-only buttons and ensure `aria-label` is present.
