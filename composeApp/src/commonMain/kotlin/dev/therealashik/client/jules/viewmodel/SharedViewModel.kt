package dev.therealashik.client.jules.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.therealashik.client.jules.api.GeminiService
import dev.therealashik.client.jules.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.Instant
import kotlinx.datetime.minus

// ==================== UI STATE ====================

sealed class Screen {
    data object Home : Screen()
    data class Session(val sessionId: String) : Screen()
    data class Repository(val sourceId: String) : Screen()
}

data class JulesUiState(
    val apiKey: String? = null,
    val sources: List<JulesSource> = emptyList(),
    val currentSource: JulesSource? = null,
    val sessions: List<JulesSession> = emptyList(),
    val currentSession: JulesSession? = null,
    val activities: List<JulesActivity> = emptyList(),
    val sessionsUsed: Int = 0,
    val dailyLimit: Int = 100, // Hardcoded for now
    val isProcessing: Boolean = false,
    val currentScreen: Screen = Screen.Home,
    val error: String? = null,
    val isLoading: Boolean = false
)

// ==================== VIEW MODEL ====================

class SharedViewModel : ViewModel() {

    private val api = GeminiService

    private val _uiState = MutableStateFlow(JulesUiState())
    val uiState: StateFlow<JulesUiState> = _uiState.asStateFlow()

    private var pollJob: Job? = null

    // --- Initialization ---

    fun setApiKey(key: String) {
        if (key.isBlank()) return
        api.setApiKey(key)
        _uiState.update { it.copy(apiKey = key) }
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val sourcesResp = api.listSources()
                // Auto-select first source if none selected
                val firstSource = sourcesResp.sources.firstOrNull()

                val allSessions = api.listAllSessions()

                _uiState.update {
                    it.copy(
                        sources = sourcesResp.sources,
                        currentSource = it.currentSource ?: firstSource,
                        sessions = allSessions,
                        sessionsUsed = calculateSessionsUsed(allSessions),
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }

    // --- Navigation & Selection ---

    fun selectSource(source: JulesSource) {
        _uiState.update {
            it.copy(
                currentSource = source,
                currentScreen = Screen.Repository(source.name)
            )
        }
    }

    fun selectSession(session: JulesSession) {
        _uiState.update {
            it.copy(
                currentSession = session,
                currentScreen = Screen.Session(session.name),
                activities = emptyList() // Clear old activities immediately
            )
        }
        startPolling(session.name)
    }

    fun navigateBack() {
        _uiState.update { state ->
            when (state.currentScreen) {
                is Screen.Session, is Screen.Repository -> {
                    // Stop polling when leaving session
                    stopPolling()
                    state.copy(currentScreen = Screen.Home, currentSession = null)
                }
                else -> state // Already at home or can't go back
            }
        }
    }

    // --- Actions ---

    fun createSession(prompt: String, config: CreateSessionConfig) {
        val source = _uiState.value.currentSource ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isProcessing = true, error = null) }
            try {
                val session = api.createSession(
                    prompt = prompt,
                    sourceName = source.name,
                    title = config.title,
                    requirePlanApproval = config.requirePlanApproval,
                    automationMode = config.automationMode,
                    startingBranch = config.startingBranch
                )

                // Prepend new session
                val updatedSessions = listOf(session) + _uiState.value.sessions

                _uiState.update {
                    it.copy(
                        sessions = updatedSessions,
                        sessionsUsed = calculateSessionsUsed(updatedSessions),
                        currentSession = session,
                        currentScreen = Screen.Session(session.name),
                        isProcessing = false // Polling will take over
                    )
                }
                startPolling(session.name)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Failed to create: ${e.message}", isProcessing = false) }
            }
        }
    }

    fun sendMessage(text: String) {
        val session = _uiState.value.currentSession ?: return
        viewModelScope.launch {
             _uiState.update { it.copy(isProcessing = true, error = null) }
             try {
                 api.sendMessage(session.name, text)
                 // Force immediate refresh
                 refreshSession(session.name)
             } catch (e: Exception) {
                 _uiState.update { it.copy(error = "Failed to send: ${e.message}", isProcessing = false) }
             }
        }
    }

    fun approvePlan(sessionId: String, planId: String? = null) {
         viewModelScope.launch {
             _uiState.update { it.copy(isProcessing = true) }
             try {
                 api.approvePlan(sessionId, planId)
                 refreshSession(sessionId)
             } catch (e: Exception) {
                  _uiState.update { it.copy(error = "Failed to approve: ${e.message}", isProcessing = false) }
             }
         }
    }

    fun deleteSession(sessionId: String) {
        viewModelScope.launch {
            try {
                api.deleteSession(sessionId)
                val updatedSessions = _uiState.value.sessions.filter { it.name != sessionId }

                _uiState.update {
                    it.copy(
                        sessions = updatedSessions,
                        sessionsUsed = calculateSessionsUsed(updatedSessions)
                    )
                }

                // If we are in the deleted session, go home
                if (_uiState.value.currentSession?.name == sessionId) {
                    navigateBack()
                }
            } catch (e: Exception) {
                 _uiState.update { it.copy(error = "Failed to delete: ${e.message}") }
            }
        }
    }

    fun updateSession(sessionId: String) {
        // Placeholder as per plan
        _uiState.update { it.copy(error = "Update Session not supported yet") }
    }

    // --- Internals ---

    private fun calculateSessionsUsed(sessions: List<JulesSession>): Int {
        /*
        try {
            val now = Clock.System.now()
            val twentyFourHoursAgo = now.minus(24, DateTimeUnit.HOUR)
            return sessions.count {
                try {
                    val instant = Instant.parse(it.createTime)
                    instant > twentyFourHoursAgo
                } catch (e: Exception) {
                    false
                }
            }
        } catch (e: Exception) {
            return sessions.size
        }
        */
        return sessions.size
    }

    private fun stopPolling() {
        pollJob?.cancel()
        pollJob = null
    }

    private fun startPolling(sessionName: String) {
        stopPolling()
        pollJob = viewModelScope.launch {
            while(true) {
                refreshSession(sessionName)
                delay(2000)
            }
        }
    }

    private suspend fun refreshSession(sessionName: String) {
        try {
            // Parallel fetch could be better but sequential is safer for now
            val activitiesResp = api.listActivities(sessionName)
            val session = api.getSession(sessionName)

            // Check if we are still looking at this session
            if (_uiState.value.currentSession?.name != sessionName) return

            val isProcessing = session.state == SessionState.QUEUED ||
                               session.state == SessionState.PLANNING ||
                               session.state == SessionState.IN_PROGRESS

            _uiState.update { state ->
                // Update session in the main list too if changed
                val updatedList = state.sessions.map { if (it.name == session.name) session else it }

                state.copy(
                    activities = activitiesResp.activities,
                    currentSession = session,
                    sessions = updatedList,
                    isProcessing = isProcessing
                )
            }
        } catch (e: Exception) {
            println("Polling error: $e")
        }
    }
}

data class CreateSessionConfig(
    val title: String? = null,
    val requirePlanApproval: Boolean = true,
    val automationMode: AutomationMode = AutomationMode.AUTO_CREATE_PR,
    val startingBranch: String = "main"
)
