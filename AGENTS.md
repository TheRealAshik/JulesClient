# AGENTS.md

## 🚀 Setup Commands

### Web Application
The web application is a React PWA located in the `web/` directory.

```bash
cd web
pnpm install
# Start development server
pnpm dev
```

### Mobile & Desktop Application (Kotlin Multiplatform)
The native application is built with Kotlin Multiplatform and Compose Multiplatform.

**Android:**
```bash
./gradlew :composeApp:installDebug
```

**Desktop (JVM):**
```bash
./gradlew :composeApp:run
```

**iOS:**
Open `iosApp/iosApp.xcodeproj` in Xcode or run via Android Studio configuration.

---

## 🎨 Code Style

### Kotlin Multiplatform (KMP)
- **Package Name**: `dev.therealashik.client.jules`
- **UI Framework**: Compose Multiplatform (Material 3)
- **Shared Code**: Located in `composeApp/src/commonMain/kotlin`
- **Conventions**:
  - Use `expect`/`actual` for platform-specific implementations.
  - Follow standard Kotlin coding conventions.
  - Use "Filled" or "Solid" style icons for visual weight.

### Web Application (React)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Guidelines**:
  - Refer to `web/AGENTS.md` for detailed "Premium UI" and accessibility guidelines.
  - Use `pnpm` for package management.

---

## 🧪 Testing Instructions

### Web Application
```bash
cd web
# Run unit tests (Vitest)
pnpm test

# Run E2E/Visual tests (Playwright)
npx playwright test
```

### Kotlin Multiplatform
```bash
# Run all tests
./gradlew allTests

# Run specific module tests
./gradlew :composeApp:testDebugUnitTest
```

---

## 🏗️ Architecture

The repository is a monorepo containing:

- **`composeApp/`**: The core Kotlin Multiplatform shared module.
  - `src/commonMain`: Shared UI and business logic for Android, iOS, and Desktop.
  - `src/androidMain`, `src/iosMain`, `src/jvmMain`: Platform-specific implementations.
- **`web/`**: A standalone React Progressive Web App (PWA) designed to interact with the Jules Google AI coding agent.
- **`iosApp/`**: The iOS entry point project (Swift/SwiftUI) that consumes the shared KMP framework.

### Integration
- The projects share design principles (e.g., color palettes in `web/.Jules/palette.md` and `composeApp` theme) but currently operate as separate build artifacts.
- Both clients interact with the Jules Google AI API.
