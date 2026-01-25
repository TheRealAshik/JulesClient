package dev.therealashik.client.jules.api

import dev.therealashik.client.jules.model.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

object GeminiService {
    private const val BASE_URL = "https://jules-api.google.com/v1" // Placeholder URL, replace with actual
    
    private var apiKey: String? = null

    fun setApiKey(key: String) {
        apiKey = key
    }

    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
                isLenient = true
            })
        }
    }

    suspend fun listSources(): ListSourcesResponse {
        return client.get("$BASE_URL/sources") {
            header("X-Goog-Api-Key", apiKey)
        }.body()
    }

    suspend fun listAllSessions(): List<JulesSession> {
        val response: ListSessionsResponse = client.get("$BASE_URL/sessions") {
            header("X-Goog-Api-Key", apiKey)
        }.body()
        return response.sessions
    }

    suspend fun getSession(sessionName: String): JulesSession {
        return client.get("$BASE_URL/$sessionName") {
            header("X-Goog-Api-Key", apiKey)
        }.body()
    }

    suspend fun createSession(
        userInput: String, 
        sourceName: String, 
        config: SessionConfig
    ): JulesSession {
        return client.post("$BASE_URL/sessions") {
            header("X-Goog-Api-Key", apiKey)
            contentType(ContentType.Application.Json)
            setBody(CreateSessionRequest(userInput, sourceName, config))
        }.body()
    }

    suspend fun sendMessage(sessionName: String, text: String) {
        client.post("$BASE_URL/$sessionName:send") {
            header("X-Goog-Api-Key", apiKey)
            contentType(ContentType.Application.Json)
            setBody(SendMessageRequest(text))
        }
    }

    suspend fun listActivities(sessionName: String): ListActivitiesResponse {
         return client.get("$BASE_URL/$sessionName/activities") {
            header("X-Goog-Api-Key", apiKey)
        }.body()
    }

    suspend fun approvePlan(sessionName: String) {
        client.post("$BASE_URL/$sessionName:approvePlan") {
             header("X-Goog-Api-Key", apiKey)
             contentType(ContentType.Application.Json)
             setBody(ApprovePlanRequest())
        }
    }

    suspend fun deleteSession(sessionName: String) {
        client.delete("$BASE_URL/$sessionName") {
             header("X-Goog-Api-Key", apiKey)
        }
    }
}
