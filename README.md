# Jules Client

<div align="center">

**A beautiful, cross-platform client for the Jules API**

[![Kotlin](https://img.shields.io/badge/Kotlin-2.0+-7F52FF.svg?logo=kotlin)](https://kotlinlang.org)
[![Compose Multiplatform](https://img.shields.io/badge/Compose-Multiplatform-4285F4.svg)](https://www.jetbrains.com/lp/compose-multiplatform/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Contributing](#contributing)

</div>

---

## Overview

Jules Client is a modern, cross-platform application built with Kotlin Multiplatform and Compose Multiplatform. It provides a seamless interface to interact with the Jules API across Android, iOS, Desktop, and Web platforms.

### Supported Platforms

- 🤖 **Android** - Native Android app (API 24+)
- 🍎 **iOS** - Native iOS app (iOS 14+)
- 💻 **Desktop** - JVM-based desktop app (Windows, macOS, Linux)
- 🌐 **Web** - WebAssembly support (coming soon)

## Features

### Core Functionality
- ✨ **Unified SDK** - Type-safe API client with comprehensive error handling
- 🎨 **Customizable Themes** - Multiple built-in themes with custom theme support
- 💾 **Smart Caching** - Intelligent cache management for optimal performance
- 🗄️ **Local Database** - SQLDelight-powered offline storage
- 🔄 **Reactive State** - StateFlow-based reactive architecture
- 🌍 **Cross-Platform** - Single codebase for all platforms

### User Experience
- 🎯 **Material Design 3** - Modern, beautiful UI following Material Design guidelines
- ⚡ **Fast & Responsive** - Optimized performance with efficient caching
- 🔒 **Secure** - API key management with secure storage
- 📱 **Native Feel** - Platform-specific implementations where it matters

## Installation

### Prerequisites

- **JDK 11+** for Desktop and Android builds
- **Android Studio** (latest stable) for Android development
- **Xcode 14+** for iOS development
- **Gradle 8.0+** (included via wrapper)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/JulesClient.git
   cd JulesClient
   ```

2. **Build the project**
   ```bash
   ./gradlew build
   ```

3. **Run on your platform**

   **Android:**
   ```bash
   ./gradlew :composeApp:installDebug
   ```

   **iOS:**
   ```bash
   open iosApp/iosApp.xcodeproj
   # Then run from Xcode
   ```

   **Desktop:**
   ```bash
   ./gradlew :composeApp:run
   ```

## Usage

### Setting Up API Access

```kotlin
import dev.therealashik.jules.sdk.JulesClient

// Initialize the client
val client = JulesClient(baseUrl = "https://api.jules.example.com")

// Set your API key
client.setApiKey("your-api-key-here")

// Make API calls
val response = client.getSessions()
```

### Using the SDK

The Jules SDK provides a clean, type-safe interface to the Jules API:

```kotlin
// Get sessions
val sessions = client.getSessions()

// Get session details
val session = client.getSession(sessionId = "123")

// Send a message
val response = client.sendMessage(
    sessionId = "123",
    message = "Hello, Jules!"
)
```

### Customizing Themes

```kotlin
// Apply a built-in theme
ThemeManager.setTheme(ThemePreset.DARK)

// Create a custom theme
val customTheme = Theme(
    background = "#000000",
    surface = "#111111",
    surfaceHighlight = "#222222",
    border = "#333333",
    primary = "#4444ff",
    textMain = "#ffffff",
    textMuted = "#aaaaaa"
)
ThemeManager.setCustomTheme(customTheme)
```

## Architecture

### Project Structure

```
JulesClient/
├── julesSDK/              # Unified SDK module
│   └── src/commonMain/    # API client & models
├── composeApp/            # Main application
│   ├── src/commonMain/    # Shared code
│   │   ├── api/           # API integration (deprecated)
│   │   ├── cache/         # Cache manager
│   │   ├── data/          # Repository layer
│   │   ├── db/            # Database
│   │   ├── model/         # Data models
│   │   ├── ui/            # UI components
│   │   └── viewmodel/     # ViewModels
│   ├── src/androidMain/   # Android-specific
│   ├── src/iosMain/       # iOS-specific
│   └── src/jvmMain/       # Desktop-specific
├── iosApp/                # iOS app wrapper
└── web/                   # React web app (legacy)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Kotlin 2.0+ |
| **UI Framework** | Compose Multiplatform |
| **Networking** | Ktor Client |
| **Database** | SQLDelight |
| **Serialization** | kotlinx.serialization |
| **Build System** | Gradle with Kotlin DSL |
| **Architecture** | MVVM with Repository pattern |

### Key Components

- **JulesClient** - Main SDK client for API interactions
- **JulesRepository** - Data layer with caching and database
- **CacheManager** - Intelligent caching with TTL support
- **ThemeManager** - Dynamic theme management
- **ViewModels** - UI state management with StateFlow

## Development

### Building from Source

```bash
# Build all modules
./gradlew build

# Build SDK only
./gradlew :julesSDK:build

# Build app only
./gradlew :composeApp:build
```

### Running Tests

```bash
# Run all tests
./gradlew test

# Run SDK tests
./gradlew :julesSDK:test

# Run app tests
./gradlew :composeApp:test
```

### Code Style

This project follows standard Kotlin conventions:
- 4 spaces for indentation
- 120 character line limit
- Trailing commas in multi-line declarations
- Explicit types for public APIs

### Adding New Features

See [AGENTS.md](AGENTS.md) for detailed development guidelines, including:
- Adding new screens
- Implementing API endpoints
- Creating database tables
- Platform-specific code
- Theme customization

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all platforms build successfully
- Use the unified SDK for API calls

See [AGENTS.md](AGENTS.md) for comprehensive development guidelines.

## Documentation

- **[SDK Documentation](docs/SDK.md)** - Complete SDK API reference and usage guide
- **[AGENTS.md](AGENTS.md)** - Comprehensive development guide for AI agents and developers
- **[WEB_MIGRATION.md](WEB_MIGRATION.md)** - Guide for migrating from the legacy web app

## Roadmap

- [x] Unified SDK module
- [x] Android support
- [x] iOS support
- [x] Desktop support
- [x] Theme system
- [x] Cache management
- [ ] WebAssembly support
- [ ] Offline mode
- [ ] Push notifications
- [ ] Multi-account support
- [ ] Plugin system

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)
- UI powered by [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- Networking via [Ktor](https://ktor.io/)
- Database by [SQLDelight](https://cashapp.github.io/sqldelight/)

---

<div align="center">

**Made with ❤️ using Kotlin Multiplatform**

[Report Bug](https://github.com/yourusername/JulesClient/issues) • [Request Feature](https://github.com/yourusername/JulesClient/issues)

</div>
