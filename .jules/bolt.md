## 2024-03-16 - Virtualizing Code Diffs with React Window
**Learning:** Rendering large lists natively using `.map` block blocks the main thread, causing severe lag when large un-virtualized patches (e.g., git patch diffs) expand or collapse in `CodeChangeArtifact`.
**Action:** Always employ virtualized components (e.g., `react-window` combined with `react-virtualized-auto-sizer`) when rendering lists of unknown lengths (like diffs, messages, logs) in performance-critical sections to preserve UI reactivity.
