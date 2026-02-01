## 2025-05-23 - [O(N^2) List Rendering Pattern]
**Learning:** `ChatHistory` was calculating derived state for each item by iterating over the rest of the array (`slice` + `some`), leading to O(N^2) complexity. This scales poorly with long sessions.
**Action:** Always check loop conditions in `map` renderings. If a condition depends on "other items", pre-calculate it in O(N) using `useMemo` before the loop.

## 2025-05-24 - [Expensive Filtering on Every Render]
**Learning:** `Drawer` was re-filtering and re-sorting the entire session list (which involves Date parsing) on every render, including every keystroke in the search input.
**Action:** Use `useMemo` for derived lists like filtered/sorted arrays to ensure expensive operations only run when dependencies change.

## 2025-05-25 - [O(N log N) Sort Comparator Overhead]
**Learning:** `sortSessions` was instantiating `new Date()` inside the sort comparator. For N items, this results in O(N log N) allocations, which is expensive for large lists.
**Action:** Pre-calculate sort keys (like timestamps) into a Map (O(N)) before sorting, then look them up in the comparator.
