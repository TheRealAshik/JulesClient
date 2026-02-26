# AI Agent Collaboration Guide

## Project Overview

**Jules Client** is a Kotlin Multiplatform (KMP) application for interacting with the Jules API. It supports Android, iOS, Desktop (JVM), and will support Web (Wasm) in the future.

### Tech Stack
- **Language**: Kotlin 2.0+
- **UI**: Compose Multiplatform
- **Networking**: Ktor Client
- **Database**: SQLDelight
- **Serialization**: kotlinx.serialization
- **Build**: Gradle with Kotlin DSL

## Project Structure

```
JulesClient/
├── julesSDK/                    # Unified SDK module
│   └── src/commonMain/kotlin/
│       └── dev/therealashik/jules/sdk/
│           ├── JulesClient.kt   # Main API client
│           ├── JulesException.kt # Exception hierarchy
│           └── model/Types.kt   # API data models
│
├── composeApp/                  # Main application
│   ├── src/
│   │   ├── commonMain/kotlin/   # Shared code
│   │   │   └── dev/therealashik/client/jules/
│   │   │       ├── api/         # API integration (deprecated, use SDK)
│   │   │       ├── cache/       # Cache manager
│   │   │       ├── data/        # Repository layer
│   │   │       ├── db/          # Database driver factory
│   │   │       ├── model/       # App data models
│   │   │       ├── storage/     # Settings storage (expect/actual)
│   │   │       ├── theme/       # Theme manager
│   │   │       ├── ui/          # UI components
│   │   │       ├── utils/       # Utilities
│   │   │       ├── viewmodel/   # ViewModels
│   │   │       ├── App.kt       # Main app composable
│   │   │       └── Settings.kt  # Settings (expect/actual)
│   │   │
│   │   ├── androidMain/kotlin/  # Android-specific code
│   │   ├── iosMain/kotlin/      # iOS-specific code
│   │   ├── jvmMain/kotlin/      # Desktop-specific code
│   │   └── wasmJsMain/kotlin/   # Web-specific code (future)
│   │
│   ├── src/commonMain/sqldelight/  # SQLDelight schema
│   │   └── dev/therealashik/client/jules/db/
│   │       └── JulesDatabase.sq
│   │
│   └── build.gradle.kts
│
├── web/                         # React web app (to be deprecated)
├── iosApp/                      # iOS app wrapper
├── gradle/                      # Gradle wrapper
├── WEB_MIGRATION.md            # Web migration guide
└── AGENTS.md                   # This file
```

## Code Style Guidelines

### Kotlin Conventions
- Use 4 spaces for indentation
- Max line length: 120 characters
- Use trailing commas in multi-line declarations
- Prefer `val` over `var`
- Use explicit types for public APIs
- Use type inference for local variables

### Naming Conventions
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private properties: `camelCase` (no underscore prefix)
- Composables: `PascalCase` (like classes)

### Composable Guidelines
```kotlin
// Good: Clear, single responsibility
@Composable
fun UserProfile(user: User, onEditClick: () -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(user.name)
        Button(onClick = onEditClick) {
            Text("Edit")
        }
    }
}

// Bad: Too much logic, side effects
@Composable
fun UserProfile(userId: String) {
    val user = remember { fetchUser(userId) } // Don't do this
    // ... rest of code
}
```

### State Management
- Use `StateFlow` for ViewModels
- Use `remember { mutableStateOf() }` for local UI state
- Use `LaunchedEffect` for side effects
- Use `derivedStateOf` for computed state

## Common Tasks

### Adding a New Screen

1. **Create the screen composable** in `ui/`:
```kotlin
@Composable
fun MyNewScreen(
    viewModel: MyViewModel = viewModel(),
    onNavigateBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    
    Scaffold(
        topBar = { /* AppBar */ }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Screen content
        }
    }
}
```

2. **Create ViewModel** in `viewmodel/`:
```kotlin
class MyViewModel(
    private val repository: JulesRepository
) : ViewModel() {
    private val _state = MutableStateFlow(MyState())
    val state: StateFlow<MyState> = _state.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            // Load data
        }
    }
}
```

3. **Add navigation** in `App.kt` or navigation setup

### Adding a New API Endpoint

1. **Add to SDK** (`julesSDK/src/commonMain/kotlin/.../JulesClient.kt`):
```kotlin
suspend fun myNewEndpoint(param: String): MyResponse {
    return authRequest("$baseUrl/my-endpoint?param=$param")
}
```

2. **Add response model** to `julesSDK/.../model/Types.kt`:
```kotlin
@Serializable
data class MyResponse(
    val data: String,
    val status: String
)
```

3. **Use in repository** (`composeApp/.../data/JulesRepository.kt`):
```kotlin
suspend fun getMyData(param: String): MyResponse {
    return withContext(Dispatchers.IO) {
        api.myNewEndpoint(param)
    }
}
```

### Adding a Database Table

1. **Update schema** (`JulesDatabase.sq`):
```sql
CREATE TABLE myTable (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

insertMyEntity:
INSERT OR REPLACE INTO myTable(id, name, created_at)
VALUES (?, ?, ?);

getMyEntity:
SELECT * FROM myTable WHERE id = ?;

getAllMyEntities:
SELECT * FROM myTable ORDER BY created_at DESC;
```

2. **Use in repository**:
```kotlin
suspend fun saveMyEntity(entity: MyEntity) {
    withContext(Dispatchers.IO) {
        queries.insertMyEntity(entity.id, entity.name, entity.createdAt)
    }
}
```

### Adding Platform-Specific Code

1. **Define expect** in `commonMain`:
```kotlin
expect class MyPlatformFeature() {
    fun doSomething(): String
}
```

2. **Implement actual** in each platform:

**Android** (`androidMain`):
```kotlin
actual class MyPlatformFeature {
    actual fun doSomething(): String = "Android implementation"
}
```

**iOS** (`iosMain`):
```kotlin
actual class MyPlatformFeature {
    actual fun doSomething(): String = "iOS implementation"
}
```

**JVM** (`jvmMain`):
```kotlin
actual class MyPlatformFeature {
    actual fun doSomething(): String = "Desktop implementation"
}
```

### Adding a New Theme

1. **Add to ThemePreset enum** (`model/ThemeSettings.kt`):
```kotlin
CUSTOM_NAME("Display Name", Theme(
    background = "#000000",
    surface = "#111111",
    surfaceHighlight = "#222222",
    border = "#333333",
    primary = "#4444ff",
    textMain = "#ffffff",
    textMuted = "#aaaaaa"
))
```

2. Theme will automatically appear in settings

### Adding Cache Support for New Data

1. **Use CacheManager** in repository:
```kotlin
suspend fun getDataWithCache(id: String, forceRefresh: Boolean = false): MyData {
    val cacheKey = "mydata_$id"
    
    if (!forceRefresh) {
        val cached = cacheManager.get(cacheKey)
        if (cached != null) {
            return json.decodeFromString(cached)
        }
    }
    
    val fresh = api.getData(id)
    cacheManager.set(cacheKey, json.encodeToString(fresh))
    return fresh
}
```

## Testing Guidelines

### Unit Tests
```kotlin
class MyViewModelTest {
    @Test
    fun `test data loading`() = runTest {
        val viewModel = MyViewModel(fakeRepository)
        viewModel.loadData()
        
        val state = viewModel.state.value
        assertEquals(expected, state.data)
    }
}
```

### Repository Tests
```kotlin
class JulesRepositoryTest {
    private lateinit var db: JulesDatabase
    private lateinit var repository: JulesRepository
    
    @BeforeTest
    fun setup() {
        db = createInMemoryDatabase()
        repository = JulesRepository(db, fakeApi)
    }
    
    @Test
    fun `test caching behavior`() = runTest {
        // Test implementation
    }
}
```

## Build & Run Commands

### Android
```bash
./gradlew :composeApp:assembleDebug
./gradlew :composeApp:installDebug
```

### iOS
```bash
# Open in Xcode
open iosApp/iosApp.xcodeproj

# Or use Gradle
./gradlew :composeApp:iosSimulatorArm64Test
```

### Desktop
```bash
./gradlew :composeApp:run
```

### SDK Module
```bash
./gradlew :julesSDK:build
./gradlew :julesSDK:test
```

## Troubleshooting

### Build Failures

**Issue**: `Unresolved reference: julesSDK`
**Solution**: Run `./gradlew :julesSDK:build` first, then sync Gradle

**Issue**: SQLDelight compilation errors
**Solution**: Check `.sq` file syntax, ensure all queries have names

**Issue**: Ktor client not found
**Solution**: Check platform-specific ktor-client dependency is added

### Runtime Issues

**Issue**: `API Key not set` exception
**Solution**: Ensure `JulesClient.setApiKey()` is called before any API calls

**Issue**: Database migration errors
**Solution**: Increment database version, add migration logic

**Issue**: Theme not applying
**Solution**: Ensure `ThemeManager.init()` is called on app start

### Platform-Specific Issues

**Android**: 
- Check `AndroidManifest.xml` for required permissions
- Verify `minSdk` and `targetSdk` compatibility

**iOS**:
- Check `Info.plist` for required permissions
- Verify framework is properly linked

**Desktop**:
- Check Java version (requires JVM 11+)
- Verify native libraries are included

## Useful Prompts for AI Agents

### For New Features
```
"Add a new screen to display [feature] with the following requirements:
- Show [data] from the API
- Allow users to [action]
- Cache the results for [duration]
- Follow the existing architecture pattern"
```

### For Bug Fixes
```
"Fix the issue where [description of bug].
The error occurs in [file/component].
Expected behavior: [description]
Current behavior: [description]"
```

### For Refactoring
```
"Refactor [component/class] to:
- Improve [aspect]
- Follow [pattern]
- Maintain existing functionality
- Add tests for [scenarios]"
```

### For Documentation
```
"Document the [feature/class/function] including:
- Purpose and usage
- Parameters and return values
- Example code
- Edge cases and limitations"
```

## Best Practices

### Do's ✅
- Use the unified SDK (`julesSDK`) for all API calls
- Implement caching for expensive operations
- Use `StateFlow` for reactive state
- Write tests for business logic
- Use `expect/actual` for platform-specific code
- Follow Material Design 3 guidelines
- Handle errors gracefully with proper user feedback
- Use `Dispatchers.IO` for database/network operations

### Don'ts ❌
- Don't use the old `api/GeminiService.kt` (use SDK instead)
- Don't block the main thread with heavy operations
- Don't hardcode colors (use theme system)
- Don't ignore cache configuration
- Don't mix UI logic with business logic
- Don't use `GlobalScope` (use `viewModelScope` or `CoroutineScope`)
- Don't forget to handle loading and error states

## Resources

- [Kotlin Docs](https://kotlinlang.org/docs/home.html)
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Ktor](https://ktor.io/)
- [SQLDelight](https://cashapp.github.io/sqldelight/)
- [Material Design 3](https://m3.material.io/)
- [SDK Documentation](docs/SDK.md) - Complete Jules SDK API reference

## Getting Help

1. Check this guide first
2. Review existing code for patterns
3. Check official documentation
4. Search for similar issues in the codebase
5. Ask specific questions with context

## Version History

- **v1.0.0** (2026-02-26): Initial version with SDK extraction, theme system, and cache management
