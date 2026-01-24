# Performance Benchmark: Polling Mechanism

## Issue
The original `setInterval` implementation caused request overlaps when the API response time exceeded the polling interval (2000ms). This led to wasted resources and potential race conditions.

## Methodology
Two benchmark scripts were created to simulate the polling behavior:
1. `benchmark.js`: Simulates the original `setInterval` behavior with a 2500ms API latency.
2. `benchmark_optimized.js`: Simulates the proposed recursive `setTimeout` behavior with the same latency.

## Results

### Baseline (setInterval)
- **Total Requests Initiated (10s):** 4
- **Max Concurrent Requests:** 2
- **Result:** FAIL - Request overlap detected.

### Optimized (recursive setTimeout)
- **Total Requests Initiated (10s):** 2
- **Max Concurrent Requests:** 1
- **Result:** PASS - No overlap.

## Conclusion
Replacing `setInterval` with a recursive `setTimeout` pattern eliminates request overlap, ensuring that a new request is only initiated after the previous one has completed. This improves efficiency and correctness.
