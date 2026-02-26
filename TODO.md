# TODO/FIXME Tracker

This document tracks all TODO and FIXME comments in the codebase that need attention.

## High Priority

### SDK (julesSDK)

**File:** `julesSDK/src/commonMain/kotlin/dev/therealashik/jules/sdk/JulesClient.kt`

- **TODO:** Add support for repoless sessions (omit sourceContext when sourceName is empty)
  - Location: `createSession()` method
  - Impact: Enables creating sessions without GitHub repository context
  
- **TODO:** Add request/response interceptors for logging and monitoring
  - Location: HttpClient initialization
  - Impact: Better debugging and observability

- **TODO:** Implement rate limiting to prevent API quota exhaustion
  - Location: HttpClient initialization
  - Impact: Prevents hitting API limits

- **TODO:** Add WebSocket support for real-time activity streaming
  - Location: HttpClient initialization
  - Impact: Real-time updates without polling

### Cache Management

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/cache/CacheManager.kt`

- **FIXME:** SQLite doesn't have a direct way to delete by prefix efficiently
  - Location: `clearByPrefix()` method
  - Impact: Current implementation is incomplete and inefficient
  - Suggested fix: Add proper LIKE query in SQLDelight schema

### Repository Layer

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/data/JulesRepository.kt`

- **TODO:** Add selective cache warming for frequently accessed sessions
  - Location: `warmCache()` method
  - Impact: Improves performance for commonly used data

- **TODO:** Implement background cache refresh strategy
  - Location: `warmCache()` method
  - Impact: Keeps data fresh without user intervention

## Medium Priority

### Architecture

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/viewmodel/SharedViewModel.kt`

- **TODO:** Split this ViewModel into smaller, feature-specific ViewModels
  - Location: Class definition
  - Impact: Better separation of concerns, easier testing

- **TODO:** Add proper error handling with retry mechanisms
  - Location: Class definition
  - Impact: More robust error recovery

- **TODO:** Implement offline mode support
  - Location: Class definition
  - Impact: App works without network connection

### Navigation

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/App.kt`

- **TODO:** Implement proper navigation with Compose Navigation library
  - Location: `App()` composable
  - Impact: Better navigation management, type safety

- **TODO:** Add deep linking support
  - Location: `App()` composable
  - Impact: Direct navigation to specific screens from external links

### Storage

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/storage/SettingsStorage.kt`

- **TODO:** Add encrypted storage support for sensitive data (API keys)
  - Location: Interface definition
  - Impact: Better security for user credentials

- **TODO:** Implement data migration strategy for version upgrades
  - Location: Interface definition
  - Impact: Smooth upgrades without data loss

### Settings

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/model/AppSettings.kt`

- **TODO:** Add user preferences (language, notifications, auto-refresh intervals)
  - Location: Data class definition
  - Impact: More customization options

- **TODO:** Add multi-account support
  - Location: Data class definition
  - Impact: Users can manage multiple Jules accounts

## Low Priority

### File Picker

**File:** `composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/utils/FilePicker.kt`

- **TODO:** Add support for multiple file selection
  - Location: Interface definition
  - Impact: Better UX for bulk operations

- **TODO:** Add file type filtering (e.g., images, documents)
  - Location: Interface definition
  - Impact: Better UX, prevents invalid file selection

### Build Configuration

**File:** `composeApp/build.gradle.kts`

- **TODO:** Add WebAssembly (Wasm) target support
  - Location: Kotlin multiplatform configuration
  - Impact: Enables web platform support
  - Note: Commented code is already present, needs testing and dependencies

## Roadmap Alignment

These TODOs align with the project roadmap in README.md:

- [x] Unified SDK module
- [x] Android support
- [x] iOS support
- [x] Desktop support
- [x] Theme system
- [x] Cache management
- [ ] **WebAssembly support** ← TODO in build.gradle.kts
- [ ] **Offline mode** ← TODO in SharedViewModel
- [ ] Push notifications
- [ ] **Multi-account support** ← TODO in AppSettings
- [ ] Plugin system

## Contributing

When working on these TODOs:

1. Check this document for context
2. Update the TODO comment when starting work
3. Remove the TODO/FIXME when completed
4. Update this document to reflect completion
5. Add tests for new functionality

## Priority Guidelines

- **High Priority:** Affects core functionality or has security implications
- **Medium Priority:** Improves architecture, UX, or maintainability
- **Low Priority:** Nice-to-have features or minor enhancements
