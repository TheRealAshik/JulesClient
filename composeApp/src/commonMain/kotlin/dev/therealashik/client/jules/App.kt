package dev.therealashik.client.jules

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import kotlinx.coroutines.launch

import dev.therealashik.client.jules.api.GeminiService
import dev.therealashik.client.jules.model.*
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesTheme
import dev.therealashik.client.jules.ui.LoginScreen
import dev.therealashik.client.jules.ui.components.Drawer
import dev.therealashik.client.jules.ui.components.Header
import dev.therealashik.client.jules.ui.screens.HomeView
import dev.therealashik.client.jules.ui.screens.SessionView

@Composable
fun App() {
    JulesTheme {
        var apiKey by remember { mutableStateOf<String?>(null) } // TODO: Persist this

        if (apiKey == null) {
            LoginScreen(onApiKeyEntered = { key ->
                if (key.isNotBlank()) {
                    GeminiService.setApiKey(key)
                    apiKey = key
                }
            })
        } else {
            JulesAppContent()
        }
    }
}

@Composable
fun JulesAppContent() {
    // Global State
    var currentSource by remember { mutableStateOf<JulesSource?>(null) }
    var sources by remember { mutableStateOf<List<JulesSource>>(emptyList()) }
    var currentSession by remember { mutableStateOf<JulesSession?>(null) }
    var sessions by remember { mutableStateOf<List<JulesSession>>(emptyList()) }
    var activities by remember { mutableStateOf<List<JulesActivity>>(emptyList()) }
    
    // UI State
    var isDrawerOpen by remember { mutableStateOf(false) }
    var isProcessing by remember { mutableStateOf(false) }
    var isLoadingSources by remember { mutableStateOf(false) }
    
    // Polling Coroutine Scope
    val scope = rememberCoroutineScope()
    
    // Load Initial Data
    LaunchedEffect(Unit) {
        isLoadingSources = true
        try {
            val sourcesResp = GeminiService.listSources()
            sources = sourcesResp.sources
            if (sources.isNotEmpty()) {
                currentSource = sources[0]
            }
            sessions = GeminiService.listAllSessions()
        } catch (e: Exception) {
            println("Error loading initial data: $e")
        } finally {
            isLoadingSources = false
        }
    }

    // Polling for Active Session
    LaunchedEffect(currentSession) {
        if (currentSession != null) {
            while (true) {
                try {
                    val actResp = GeminiService.listActivities(currentSession!!.name)
                    activities = actResp.activities
                    
                    // Update session state
                    val updatedSession = GeminiService.getSession(currentSession!!.name)
                    if (updatedSession.state != currentSession?.state) {
                         // Update session in list if changed
                         sessions = sessions.map { if (it.name == updatedSession.name) updatedSession else it }
                    }
                    
                    // Determine processing state
                    isProcessing = listOf("QUEUED", "PLANNING", "IN_PROGRESS").contains(updatedSession.state)
                    
                } catch (e: Exception) {
                    println("Polling error: $e")
                }
                kotlinx.coroutines.delay(2000)
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(JulesBackground)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Header(
                onOpenDrawer = { isDrawerOpen = true },
                currentSource = currentSource,
                sources = sources,
                onSourceChange = { currentSource = it },
                isLoading = isLoadingSources || isProcessing
            )

            Box(modifier = Modifier.weight(1f)) {
                if (currentSession != null) {
                    SessionView(
                        session = currentSession!!,
                        activities = activities,
                        isProcessing = isProcessing,
                        onSendMessage = { text ->
                            scope.launch {
                                try {
                                    isProcessing = true
                                    GeminiService.sendMessage(currentSession!!.name, text)
                                } catch (e: Exception) {
                                    println("Send error: $e")
                                    isProcessing = false
                                }
                            }
                        }
                    )
                } else {
                    HomeView(
                        currentSource = currentSource,
                        onSendMessage = { text, config ->
                             scope.launch {
                                try {
                                    isProcessing = true
                                    val session = GeminiService.createSession(text, currentSource!!.name, config)
                                    currentSession = session
                                    sessions = listOf(session) + sessions
                                } catch (e: Exception) {
                                    println("Create session error: $e")
                                    isProcessing = false
                                }
                            }
                        },
                        isProcessing = isProcessing
                    )
                }
            }
        }
        
        Drawer(
            isOpen = isDrawerOpen,
            onClose = { isDrawerOpen = false },
            sessions = sessions,
            currentSessionId = currentSession?.name,
            onSelectSession = { 
                currentSession = it
                activities = emptyList() // Clear momentarily
                isDrawerOpen = false 
            },
            onDeleteSession = { sessionName ->
                scope.launch {
                    try {
                        GeminiService.deleteSession(sessionName)
                        sessions = sessions.filter { it.name != sessionName }
                        if (currentSession?.name == sessionName) {
                            currentSession = null
                        }
                    } catch (e: Exception) {
                         println("Delete error: $e")
                    }
                }
            }
        )
    }
}