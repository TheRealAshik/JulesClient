## 2024-03-16 - Virtualizing Code Diffs with React Window
**Learning:** Rendering large lists natively using `.map` block blocks the main thread, causing severe lag when large un-virtualized patches (e.g., git patch diffs) expand or collapse in `CodeChangeArtifact`.
**Action:** Always employ virtualized components (e.g., `react-window` combined with `react-virtualized-auto-sizer`) when rendering lists of unknown lengths (like diffs, messages, logs) in performance-critical sections to preserve UI reactivity.
## 2024-05-18 - [Optimizing Hook Performance with Promise.all]
**Learning:** The polling mechanism in `useActiveSession.ts` previously fetched `listActivities` and then `getSession` sequentially. These operations are independent and can be parallelized, significantly cutting latency. However, modifying this affected the `useJulesSession.bench.test.tsx` because of how `GeminiService` mocking was set up (passing a string `'api-key'` into `useJulesSession` instead of a service instance context/mock when checking concurrency tests).
**Action:** Used `Promise.all` to fetch both API requests concurrently in `useActiveSession.ts`, ensuring lower latency. Fixed the `tests/performance/useJulesSession.bench.test.tsx` test mock argument (`JulesApi as any`) so it behaves like the `GeminiService` class and passes successfully.
## 2024-03-17 - React-Window Mocking Edge Case in Vitest
**Learning:** When virtualizing lists like `RepositoryView` using `react-window`, passing a complex object (e.g., `{ sessions, activeSessionId, ... }`) via `itemData` broke the global test mock in `web/tests/setup.ts`, which previously only expected arrays or objects with an `items` array property for `Drawer`. This caused unrelated test failures in the suite.
**Action:** When implementing new virtualized lists, always check and update the `react-window` global mock in `tests/setup.ts` to accommodate the specific `itemData` structure used by the new component so that the test suite remains stable.
## 2024-05-18 - [Optimizing Date Parsing in React Re-renders]
**Learning:** Parsing `new Date(ISOString)` continuously inside a `useMemo` block that executes `sort` or `filter` on a large array scales poorly because creating `Date` objects is CPU intensive and the sort callback runs $O(N \log N)$ times.
**Action:** When filtering or sorting data locally on the frontend by standard ISO 8601 timestamps, prefer lexical string comparison (e.g., `dateStringA > dateStringB ? 1 : ...`) and statically pre-calculating the relative boundary strings (e.g., `const cutOffIso = cutOffDate.toISOString()`) to avoid constant parsing overhead inside iteration blocks.

## 2024-10-27 - O(N log N) Date Parsing Bottleneck
**Learning:** Instantiating `new Date()` inside an array `sort()` callback evaluates in O(N log N) time, creating significant CPU and memory overhead for large lists. Furthermore, pre-computing a Map to cache these parsed dates is unnecessary memory allocation if the raw date strings are ISO 8601 formatted.
**Action:** Always prefer direct lexical string comparison (`>` or `<`) for sorting ISO 8601 strings. This achieves the exact same chronological sorting order with O(1) property access and no memory allocation overhead.

## 2024-05-19 - [Fixing AutoSizer and ResizeObserver Mocks for Testing]
**Learning:** When using components like `react-virtualized-auto-sizer` alongside `ResizeObserver` in tests (e.g., `Drawer`), checking `ref.current.clientHeight` returns `0` because DOM layout isn't fully rendered in JSDom. This causes the test's `react-window` `List` mock to render with `0` height and not render items, failing assertions like `findByText`.
**Action:** When initializing size in custom wrappers like `AutoSizer`, always provide fallback heights and widths during tests (e.g. `ref.current.clientHeight || (typeof window !== 'undefined' && window.process && window.process.env.NODE_ENV === 'test' ? 800 : 0)`).
