package dev.therealashik.client.jules.viewmodel

import kotlin.test.Test
import kotlin.test.assertTrue
import kotlinx.coroutines.*
import kotlinx.coroutines.test.runTest

class PollingBenchmark {

    // Mock API simulating network delay
    class MockApi {
        suspend fun listActivities(): String {
            delay(100) // 100ms latency
            return "activities"
        }

        suspend fun getSession(): String {
            delay(100) // 100ms latency
            return "session"
        }
    }

    @Test
    fun benchmarkPolling() = runTest {
        val api = MockApi()

        // Sequential (Current Implementation)
        val startSequential = testScheduler.currentTime
        val act = api.listActivities()
        val sess = api.getSession()
        val endSequential = testScheduler.currentTime
        val durationSequential = endSequential - startSequential

        println("Sequential Duration: $durationSequential")

        // Parallel (Optimized Implementation)
        val startParallel = testScheduler.currentTime
        val actDeferred = async { api.listActivities() }
        val sessDeferred = async { api.getSession() }
        val act2 = actDeferred.await()
        val sess2 = sessDeferred.await()
        val endParallel = testScheduler.currentTime
        val durationParallel = endParallel - startParallel

        println("Parallel Duration: $durationParallel")

        assertTrue(durationParallel < durationSequential, "Parallel fetch should be faster ($durationParallel < $durationSequential)")
    }
}
