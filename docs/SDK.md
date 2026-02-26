# Jules SDK Documentation

The Jules SDK provides a type-safe, cross-platform Kotlin client for the Jules API. Built with Kotlin Multiplatform, it works seamlessly across Android, iOS, Desktop, and Web platforms.

## Installation

Add the SDK module to your project:

```kotlin
// settings.gradle.kts
include(":julesSDK")

// build.gradle.kts
dependencies {
    implementation(project(":julesSDK"))
}
```

## Quick Start

```kotlin
import dev.therealashik.jules.sdk.JulesClient
import dev.therealashik.jules.sdk.model.*

// Initialize the client
val client = JulesClient(
    apiKey = "your-api-key",
    baseUrl = "https://jules.googleapis.com/v1alpha"
)

// Or set the API key later
client.setApiKey("your-api-key")

// List all sessions
val sessions = client.listAllSessions()

// Get a specific session
val session = client.getSession("sessions/abc123")
```

## Configuration

### Constructor Parameters

```kotlin
JulesClient(
    apiKey: String = "",                    // API key (can be set later)
    baseUrl: String = "https://...",        // API base URL
    maxRetries: Int = 3,                    // Max retry attempts
    timeoutMs: Long = 30000,                // Request timeout (30s)
    debugMode: Boolean = false              // Enable debug logging
)
```

### Setting API Key

```kotlin
// Set after initialization
client.setApiKey("your-api-key")

// Get current API key
val key = client.getApiKey()
```

## API Reference

### Sources

Sources represent GitHub repositories connected to Jules.

#### List Sources

```kotlin
// Paginated
val response: ListSourcesResponse = client.listSources(
    pageSize = 50,
    pageToken = null
)

// Get all sources (handles pagination automatically)
val allSources: List<JulesSource> = client.listAllSources()
```

#### Get Source

```kotlin
val source: JulesSource = client.getSource("sources/abc123")
// Or with full name
val source = client.getSource("sources/abc123")
```

**JulesSource Model:**
```kotlin
data class JulesSource(
    val name: String,              // "sources/abc123"
    val id: String?,               // "abc123"
    val displayName: String?,      // "owner/repo"
    val githubRepo: GitHubRepoInfo?
)

data class GitHubRepoInfo(
    val owner: String,
    val repo: String,
    val isPrivate: Boolean?,
    val defaultBranch: BranchInfo?,
    val branches: List<BranchInfo>
)
```

### Sessions

Sessions represent Jules work sessions on a repository.

#### List Sessions

```kotlin
// Paginated
val response: ListSessionsResponse = client.listSessions(
    pageSize = 20,
    pageToken = null
)

// Get all sessions
val allSessions: List<JulesSession> = client.listAllSessions()
```

#### Get Session

```kotlin
val session: JulesSession = client.getSession("sessions/xyz789")
```

#### Create Session

```kotlin
val session: JulesSession = client.createSession(
    prompt = "Add user authentication",
    sourceName = "sources/abc123",
    title = "Auth Feature",                    // Optional
    requirePlanApproval = true,                 // Default: true
    automationMode = AutomationMode.AUTO_CREATE_PR,
    startingBranch = "main"                     // Default: "main"
)
```

**AutomationMode Options:**
- `AUTO_CREATE_PR` - Automatically create PR when complete
- `NONE` - No automation
- `AUTO_MERGE` - Automatically merge PR

#### Update Session

```kotlin
val updated: JulesSession = client.updateSession(
    sessionName = "sessions/xyz789",
    updates = mapOf(
        "title" to "New Title",
        "requirePlanApproval" to false
    ),
    updateMask = listOf("title", "requirePlanApproval")
)
```

#### Delete Session

```kotlin
client.deleteSession("sessions/xyz789")
```

**JulesSession Model:**
```kotlin
data class JulesSession(
    val name: String,                  // "sessions/xyz789"
    val id: String?,                   // "xyz789"
    val title: String?,
    val prompt: String,
    val state: SessionState,
    val priority: Int?,
    val createTime: String,
    val updateTime: String?,
    val sourceContext: SourceContext?,
    val automationMode: AutomationMode?,
    val requirePlanApproval: Boolean?,
    val outputs: List<SessionOutput>
)
```

**SessionState Enum:**
- `QUEUED` - Waiting to start
- `PLANNING` - Generating plan
- `AWAITING_PLAN_APPROVAL` - Waiting for plan approval
- `AWAITING_USER_FEEDBACK` - Waiting for user input
- `IN_PROGRESS` - Actively working
- `PAUSED` - Temporarily paused
- `COMPLETED` - Successfully completed
- `FAILED` - Failed with error

### Activities

Activities represent events and actions within a session.

#### List Activities

```kotlin
val response: ListActivitiesResponse = client.listActivities(
    sessionName = "sessions/xyz789",
    pageSize = 50,
    pageToken = null
)
```

**JulesActivity Model:**
```kotlin
data class JulesActivity(
    val name: String,
    val id: String?,
    val originator: String?,
    val description: String?,
    val createTime: String,
    val userMessaged: MessageContent?,
    val agentMessaged: MessageContent?,
    val planGenerated: PlanGenerated?,
    val planApproved: PlanApproved?,
    val progressUpdated: ProgressUpdate?,
    val sessionCompleted: SessionCompleted?,
    val sessionFailed: SessionFailed?,
    val artifacts: List<ActivityArtifact>
)
```

### Session Actions

#### Send Message

```kotlin
client.sendMessage(
    sessionName = "sessions/xyz789",
    prompt = "Please add error handling"
)
```

#### Approve Plan

```kotlin
// Approve the latest plan
client.approvePlan("sessions/xyz789")

// Approve specific plan
client.approvePlan("sessions/xyz789", planId = "plan123")
```

## Error Handling

The SDK uses a sealed exception hierarchy for type-safe error handling:

```kotlin
try {
    val session = client.getSession("sessions/xyz789")
} catch (e: JulesException) {
    when (e) {
        is JulesException.AuthError -> {
            // Authentication failed (401, 403)
            println("Auth error: ${e.message}")
        }
        is JulesException.ValidationError -> {
            // Invalid request (400)
            println("Validation error: ${e.message}")
        }
        is JulesException.ServerError -> {
            // Server error (5xx)
            println("Server error ${e.statusCode}: ${e.message}")
        }
        is JulesException.NetworkError -> {
            // Network/connection error
            println("Network error: ${e.message}")
            e.cause?.printStackTrace()
        }
    }
}
```

### Exception Types

| Exception | Description | HTTP Status |
|-----------|-------------|-------------|
| `AuthError` | Authentication/authorization failed | 401, 403 |
| `ValidationError` | Invalid request parameters | 400 |
| `ServerError` | Server-side error | 500-599 |
| `NetworkError` | Network/connection issues | N/A |

## Advanced Features

### Retry Logic

The SDK automatically retries failed requests with exponential backoff:

```kotlin
val client = JulesClient(
    maxRetries = 3,        // Retry up to 3 times
    debugMode = true       // Log retry attempts
)
```

Retry delays: 100ms, 200ms, 400ms

### Timeout Configuration

```kotlin
val client = JulesClient(
    timeoutMs = 60000  // 60 second timeout
)
```

### Debug Mode

Enable debug logging to see retry attempts and request details:

```kotlin
val client = JulesClient(debugMode = true)
```

## Usage Examples

### Complete Workflow

```kotlin
suspend fun createAndMonitorSession() {
    val client = JulesClient(apiKey = "your-key")
    
    // 1. List available sources
    val sources = client.listAllSources()
    val source = sources.first()
    
    // 2. Create a new session
    val session = client.createSession(
        prompt = "Add unit tests for UserService",
        sourceName = source.name,
        title = "Add Tests",
        requirePlanApproval = true
    )
    
    // 3. Wait for plan generation
    var currentSession = session
    while (currentSession.state == SessionState.PLANNING) {
        delay(2000)
        currentSession = client.getSession(session.name)
    }
    
    // 4. Review and approve plan
    if (currentSession.state == SessionState.AWAITING_PLAN_APPROVAL) {
        val activities = client.listActivities(session.name)
        val planActivity = activities.activities.find { 
            it.planGenerated != null 
        }
        
        planActivity?.planGenerated?.plan?.steps?.forEach { step ->
            println("${step.index}. ${step.title}")
            println("   ${step.description}")
        }
        
        client.approvePlan(session.name)
    }
    
    // 5. Monitor progress
    while (currentSession.state == SessionState.IN_PROGRESS) {
        delay(5000)
        currentSession = client.getSession(session.name)
        println("Status: ${currentSession.state}")
    }
    
    // 6. Check results
    if (currentSession.state == SessionState.COMPLETED) {
        currentSession.outputs.forEach { output ->
            output.pullRequest?.let { pr ->
                println("PR created: ${pr.url}")
                println("Title: ${pr.title}")
            }
        }
    }
}
```

### Handling User Feedback

```kotlin
suspend fun interactWithSession(sessionName: String) {
    val client = JulesClient(apiKey = "your-key")
    
    val session = client.getSession(sessionName)
    
    if (session.state == SessionState.AWAITING_USER_FEEDBACK) {
        // Get latest agent message
        val activities = client.listActivities(sessionName)
        val lastMessage = activities.activities
            .firstOrNull { it.agentMessaged != null }
            ?.agentMessaged?.text
        
        println("Jules: $lastMessage")
        
        // Send response
        client.sendMessage(
            sessionName = sessionName,
            prompt = "Yes, please proceed with that approach"
        )
    }
}
```

### Batch Operations

```kotlin
suspend fun batchCreateSessions(tasks: List<String>, sourceName: String) {
    val client = JulesClient(apiKey = "your-key")
    
    val sessions = tasks.map { task ->
        async {
            client.createSession(
                prompt = task,
                sourceName = sourceName,
                requirePlanApproval = false,
                automationMode = AutomationMode.AUTO_CREATE_PR
            )
        }
    }.awaitAll()
    
    println("Created ${sessions.size} sessions")
}
```

## Platform-Specific Notes

### Android

```kotlin
// In your Application or Activity
class MyApp : Application() {
    val julesClient = JulesClient(apiKey = BuildConfig.JULES_API_KEY)
}
```

### iOS

```kotlin
// In your iOS app
class JulesManager {
    private val client = JulesClient(
        apiKey = NSBundle.mainBundle.objectForInfoDictionaryKey("JULES_API_KEY") as? String ?: ""
    )
}
```

### Desktop

```kotlin
// In your desktop app
fun main() = application {
    val client = JulesClient(
        apiKey = System.getenv("JULES_API_KEY") ?: ""
    )
    
    Window(onCloseRequest = ::exitApplication) {
        App(client)
    }
}
```

## Best Practices

1. **API Key Security**
   - Never hardcode API keys
   - Use environment variables or secure storage
   - Rotate keys regularly

2. **Error Handling**
   - Always wrap API calls in try-catch
   - Handle specific exception types
   - Provide user-friendly error messages

3. **Pagination**
   - Use `listAll*()` methods for small datasets
   - Use paginated methods for large datasets
   - Implement proper loading states

4. **State Management**
   - Poll session state for updates
   - Use appropriate delay intervals (2-5 seconds)
   - Cache responses when appropriate

5. **Resource Cleanup**
   - The SDK manages HTTP client lifecycle
   - No manual cleanup required

## Troubleshooting

### Common Issues

**"API Key not set" error:**
```kotlin
// Ensure API key is set before making requests
client.setApiKey("your-key")
```

**Network timeout:**
```kotlin
// Increase timeout for slow connections
val client = JulesClient(timeoutMs = 60000)
```

**Serialization errors:**
```kotlin
// Enable debug mode to see raw responses
val client = JulesClient(debugMode = true)
```

## Version History

- **v1.0.0** - Initial release with full API support

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/JulesClient/issues)
- **Documentation**: [Project README](../README.md)
- **Development Guide**: [AGENTS.md](../AGENTS.md)
