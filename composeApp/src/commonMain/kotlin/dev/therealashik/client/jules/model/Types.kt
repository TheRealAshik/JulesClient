package dev.therealashik.client.jules.model

import kotlinx.serialization.Serializable

@Serializable
data class JulesSource(
    val name: String,
    val displayName: String,
    // Add other fields as necessary from typescript definition
)

@Serializable
data class JulesSession(
    val name: String,
    val state: String,
    val createTime: String,
    val outputs: List<JulesOutput> = emptyList()
)

@Serializable
data class JulesOutput(
    val text: String? = null
)

@Serializable
data class JulesActivity(
    val name: String,
    val type: String, // "thought", "tool_use", "output" etc
    val text: String? = null,
    val toolCall: String? = null
)

@Serializable
data class ListSourcesResponse(
    val sources: List<JulesSource> = emptyList()
)

@Serializable
data class ListSessionsResponse(
    val sessions: List<JulesSession> = emptyList()
)

@Serializable
data class ListActivitiesResponse(
    val activities: List<JulesActivity> = emptyList()
)

@Serializable
data class CreateSessionRequest(
    val userInput: String,
    val sourceName: String,
    val sessionConfig: SessionConfig
)

@Serializable
data class SessionConfig(
    val title: String?,
    val requirePlanApproval: Boolean,
    val startingBranch: String,
    val automationMode: String
)

@Serializable
data class SendMessageRequest(
    val userInput: String
)

@Serializable
data class ApprovePlanRequest(
    val approved: Boolean = true
)
