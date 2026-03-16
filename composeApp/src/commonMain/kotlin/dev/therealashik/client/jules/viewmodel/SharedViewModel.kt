package dev.therealashik.client.jules.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.therealashik.client.jules.Settings
import dev.therealashik.client.jules.api.JulesApi
import dev.therealashik.client.jules.api.RealJulesApi
import dev.therealashik.client.jules.data.JulesData
import dev.therealashik.client.jules.data.JulesRepository
import dev.therealashik.jules.sdk.model.*
import dev.therealashik.client.jules.model.ThemePreset
import dev.therealashik.client.jules.model.CreateSessionConfig
import dev.therealashik.client.jules.model.Account
import dev.therealashik.client.jules.model.AppSettings
import dev.therealashik.client.jules.utils.TimeUtils
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.Instant
import kotlinx.datetime.minus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.IO
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// ==================== UI STATE ====================

sealed class Screen {
    data object Home : Screen()
    data class Session(val sessionId: String) : Screen()
    data class Repository(val sourceId: String) : Screen()
    data object Settings : Screen()
}

data class JulesUiState(
    val accounts: List<Account> = emptyList(),
    val activeAccountId: String? = null,
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
    val isLoading: Boolean = false,
    val defaultCardState: Boolean = false, // false = Collapsed, true = Expanded
    val currentTheme: ThemePreset = ThemePreset.MIDNIGHT
)

// ==================== VIEW MODEL ====================

// TODO: Split this ViewModel into smaller, feature-specific ViewModels
// TODO: Add proper error handling with retry mechanisms
// TODO: Implement offline mode support
class SharedViewModel(
    private val api: JulesApi = RealJulesApi,
    private val repository: JulesRepository = JulesData.repository
) : ViewModel() {

    private val _uiState = MutableStateFlow(JulesUiState())
    val uiState: StateFlow<JulesUiState> = _uiState.asStateFlow()

    private var pollJob: Job? = null
    private var activitiesJob: Job? = null

    init {
        loadInitialData()

        // Observe sessions and sources from DB
        repository.sessions.onEach { sessions ->
            _uiState.update {
                it.copy(
                    sessions = sessions,
                    sessionsUsed = calculateSessionsUsed(sessions)
                )
            }
        }.launchIn(viewModelScope)

        repository.sources.onEach { sources ->
            _uiState.update {
                val current = it.currentSource ?: sources.firstOrNull()
                it.copy(
                    sources = sources,
                    currentSource = current
                )
            }
        }.launchIn(viewModelScope)
    }

    // --- Initialization ---


    // --- AppSettings Management ---

    private fun loadAppSettings(): AppSettings {
        val json = Settings.getString("app_settings", "")
        return if (json.isBlank()) {
            AppSettings()
        } else {
            try {
                kotlinx.serialization.json.Json.decodeFromString(AppSettings.serializer(), json)
            } catch (e: Exception) {
                AppSettings()
            }
        }
    }

    private fun saveAppSettings(settings: AppSettings) {
        try {
            val json = kotlinx.serialization.json.Json.encodeToString(AppSettings.serializer(), settings)
            Settings.saveString("app_settings", json)
        } catch (e: Exception) {
            // Ignore encoding errors
        }
    }

    // --- Account Management ---

    fun addAccount(name: String, apiKey: String) {
        val newAccount = Account(
            id = kotlinx.datetime.Clock.System.now().toEpochMilliseconds().toString(),
            name = name,
            apiKey = apiKey
        )

        val currentSettings = loadAppSettings()
        val updatedAccounts = currentSettings.accounts.toMutableList()
        updatedAccounts.add(newAccount)
        
        val updatedSettings = currentSettings.copy(
            accounts = updatedAccounts,
            activeAccountId = newAccount.id
        )

        saveAppSettings(updatedSettings)

        api.setApiKey(apiKey)
        _uiState.update { it.copy(accounts = updatedAccounts, activeAccountId = newAccount.id) }

        refreshAll()
    }

    fun switchAccount(accountId: String) {
        val currentSettings = loadAppSettings()
        val account = currentSettings.accounts.find { it.id == accountId }

        if (account != null) {
            val updatedSettings = currentSettings.copy(activeAccountId = accountId)
            saveAppSettings(updatedSettings)
            saveAppSettings(updatedSettings)

            api.setApiKey(account.apiKey)
            _uiState.update { it.copy(activeAccountId = accountId, error = null) }
            refreshAll()
        }
    }

    fun removeAccount(accountId: String) {
        val currentSettings = loadAppSettings()
        val updatedAccounts = currentSettings.accounts.toMutableList()
        updatedAccounts.removeAll { it.id == accountId }

        var nextActiveId = currentSettings.activeAccountId
        if (currentSettings.activeAccountId == accountId) {
            val nextActive = updatedAccounts.firstOrNull()
            nextActiveId = nextActive?.id
            if (nextActive != null) {
                api.setApiKey(nextActive.apiKey)
                _uiState.update { it.copy(accounts = updatedAccounts, activeAccountId = nextActive.id) }
                refreshAll()
            } else {
                api.setApiKey("")
                _uiState.update { it.copy(accounts = updatedAccounts, activeAccountId = null, sessions = emptyList(), sources = emptyList(), currentSession = null, currentSource = null) }
            }
        } else {
            _uiState.update { it.copy(accounts = updatedAccounts) }
        }

        val updatedSettings = currentSettings.copy(
            accounts = updatedAccounts,
            activeAccountId = nextActiveId
        )
        saveAppSettings(updatedSettings)
    }

    fun resetActiveAccount() {
        val currentSettings = loadAppSettings()
        val updatedSettings = currentSettings.copy(activeAccountId = null)
        saveAppSettings(updatedSettings)

        api.setApiKey("")
        _uiState.update { it.copy(activeAccountId = null, sessions = emptyList(), sources = emptyList(), currentSession = null, currentSource = null) }
    }


    private fun loadInitialData() {
        var appSettings = loadAppSettings()

        // Migrate legacy settings if AppSettings is new
        if (appSettings.accounts.isEmpty()) {
            val oldKey = Settings.getString("api_key", "")
            if (oldKey.isNotBlank()) {
                val migratedAccount = Account(id = "default", name = "Default", apiKey = oldKey)
                appSettings = appSettings.copy(
                    accounts = listOf(migratedAccount),
                    activeAccountId = "default"
                )
                saveAppSettings(appSettings)
                // Clear old key
                Settings.saveString("api_key", "")
            }
        }

        // Ensure default properties from legacy settings are merged if needed
        val savedCardState = Settings.getBoolean("default_card_state", false)
        val savedThemeStr = Settings.getString("theme", ThemePreset.MIDNIGHT.name)
        val savedTheme = try {
            ThemePreset.valueOf(savedThemeStr)
        } catch (e: Exception) {
            ThemePreset.MIDNIGHT
        }
        
        val activeAccount = appSettings.accounts.find { it.id == appSettings.activeAccountId } ?: appSettings.accounts.firstOrNull()

        if (activeAccount != null) {
            if (appSettings.activeAccountId != activeAccount.id) {
                appSettings = appSettings.copy(activeAccountId = activeAccount.id)
                saveAppSettings(appSettings)
            }
            api.setApiKey(activeAccount.apiKey)
        } else {
            if (appSettings.activeAccountId != null) {
                appSettings = appSettings.copy(activeAccountId = null)
                saveAppSettings(appSettings)
            }
            api.setApiKey("")
        }

        _uiState.update { it.copy(
            defaultCardState = savedCardState,
            currentTheme = savedTheme,
            accounts = appSettings.accounts,
            activeAccountId = appSettings.activeAccountId
        ) }

        if (api.getApiKey().isBlank()) {
             return
        }

        refreshAll()
    }

    private fun refreshAll() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                // If no key, don't try to fetch data yet
                if (api.getApiKey().isBlank()) {
                     _uiState.update { it.copy(isLoading = false) }
                     return@launch
                }

                // Execute network calls on IO dispatcher
                val (sourcesResp, allSessions) = withContext(Dispatchers.IO) {
                    val srcDeferred = async { api.listSources() }
                    val sessDeferred = async { api.listAllSessions() }
                    srcDeferred.await() to sessDeferred.await()
                }

                // Auto-select first source if none selected
                val firstSource = sourcesResp.sources.firstOrNull()

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

    fun navigateToSettings() {
        _uiState.update { it.copy(currentScreen = Screen.Settings) }
    }

    fun updateDefaultCardState(expanded: Boolean) {
        Settings.saveBoolean("default_card_state", expanded)
        _uiState.update { it.copy(defaultCardState = expanded) }
    }

    fun setTheme(theme: ThemePreset) {
        Settings.saveString("theme", theme.name)
        _uiState.update { it.copy(currentTheme = theme) }
    }

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

        // Observe activities for this session
        activitiesJob?.cancel()
        activitiesJob = repository.getActivities(session.name).onEach { activities ->
            _uiState.update { it.copy(activities = activities) }
        }.launchIn(viewModelScope)

        startPolling(session.name)
    }

    fun navigateBack() {
        _uiState.update { state ->
            when (state.currentScreen) {
                is Screen.Session, is Screen.Repository, is Screen.Settings -> {
                    // Stop polling when leaving session
                    stopPolling()
                    activitiesJob?.cancel()
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
                val session = repository.createSession(prompt, config, source)

                // Select the new session
                // Note: sessions list will update via flow automatically
                selectSession(session)

                _uiState.update {
                    it.copy(isProcessing = false)
                }
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
                 repository.sendMessage(session.name, text)
                 // Processing status will be updated via polling/refresh
             } catch (e: Exception) {
                 _uiState.update { it.copy(error = "Failed to send: ${e.message}", isProcessing = false) }
             }
        }
    }

    fun approvePlan(sessionId: String, planId: String? = null) {
         viewModelScope.launch {
             _uiState.update { it.copy(isProcessing = true) }
             try {
                 repository.approvePlan(sessionId, planId)
             } catch (e: Exception) {
                  _uiState.update { it.copy(error = "Failed to approve: ${e.message}", isProcessing = false) }
             }
         }
    }

    fun deleteSession(sessionId: String) {
        viewModelScope.launch {
            try {
                repository.deleteSession(sessionId)

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
        try {
            val now = TimeUtils.nowInstant()
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
    }

    private fun stopPolling() {
        pollJob?.cancel()
        pollJob = null
    }

    private fun startPolling(sessionName: String) {
        stopPolling()
        pollJob = viewModelScope.launch {
            var currentDelay = 2000L
            while (true) {
                val success = refreshSession(sessionName)
                if (success) {
                    currentDelay = 2000L
                } else {
                    currentDelay = (currentDelay * 2).coerceAtMost(30000L)
                }
                delay(currentDelay)
            }
        }
    }

    private suspend fun refreshSession(sessionName: String): Boolean {
        try {
            // Check if we are still looking at this session
            if (_uiState.value.currentSession?.name != sessionName) return true

            // Execute concurrent requests to reduce latency
            val (activitiesResp, session) = withContext(Dispatchers.IO) {
                val actDeferred = async { api.listActivities(sessionName) }
                val sessDeferred = async { api.getSession(sessionName) }
                actDeferred.await() to sessDeferred.await()
            }

            val isProcessing = session.state == SessionState.QUEUED ||
                               session.state == SessionState.PLANNING ||
                               session.state == SessionState.IN_PROGRESS

            if (session.state == SessionState.COMPLETED || session.state == SessionState.FAILED) {
                stopPolling()
            }

            _uiState.update { state ->
                state.copy(
                    currentSession = session,
                    isProcessing = isProcessing
                )
            }
            return true
        } catch (e: Exception) {
            println("Polling error: $e")
            return false
        }
    }
}

// Moved to model package
