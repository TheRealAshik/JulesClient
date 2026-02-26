# Web Migration Guide: React to Kotlin Multiplatform

## Overview

This document outlines the strategy for migrating the existing React-based web application to Kotlin Multiplatform (KMP) with Compose Multiplatform. This migration will unify the codebase across all platforms (Android, iOS, Desktop, and Web).

## Current Web App Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API + Hooks
- **Styling**: Tailwind CSS (via inline styles)
- **API Client**: Custom TypeScript service (`geminiService.ts`)
- **Storage**: localStorage for settings, no database

### Key Features
- Session management and creation
- Real-time activity streaming
- Source (repository) browsing
- Theme customization
- Settings management
- Responsive mobile/desktop UI

### File Structure
```
web/
├── components/
│   ├── ChatHistory.tsx
│   ├── Drawer.tsx
│   ├── Header.tsx
│   ├── HomeView.tsx
│   ├── InputArea.tsx
│   ├── LoginScreen.tsx
│   ├── RepositoryView.tsx
│   ├── SessionView.tsx
│   └── SettingsView.tsx
├── contexts/
│   └── ThemeContext.tsx
├── hooks/
│   ├── useActiveSession.ts
│   ├── useJulesSession.ts
│   ├── useSessionList.ts
│   └── useSources.ts
├── services/
│   └── geminiService.ts
├── types/
│   └── themeTypes.ts
└── App.tsx
```

## KMP Web (Wasm) Setup

### Prerequisites
- Kotlin 2.0.0+
- Compose Multiplatform 1.6.0+
- Gradle 8.5+

### Adding Web Target

1. **Update `build.gradle.kts`** in `composeApp`:

```kotlin
kotlin {
    // Existing targets...
    
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        moduleName = "julesClient"
        browser {
            commonWebpackConfig {
                outputFileName = "julesClient.js"
            }
        }
        binaries.executable()
    }

    sourceSets {
        // Existing sourceSets...
        
        val wasmJsMain by creating {
            dependencies {
                implementation(libs.ktor.client.js)
            }
        }
    }
}
```

2. **Create HTML entry point** at `composeApp/src/wasmJsMain/resources/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jules Client</title>
</head>
<body>
<div id="root"></div>
<script src="julesClient.js"></script>
</body>
</html>
```

3. **Create web entry point** at `composeApp/src/wasmJsMain/kotlin/main.kt`:

```kotlin
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.CanvasBasedWindow
import dev.therealashik.client.jules.App

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    CanvasBasedWindow(canvasElementId = "root") {
        App()
    }
}
```

## Component Migration Map

### React → Compose Equivalents

| React Component | Compose Equivalent | Notes |
|----------------|-------------------|-------|
| `<div>` | `Box`, `Column`, `Row` | Use layout composables |
| `useState` | `remember { mutableStateOf() }` | Local state |
| `useEffect` | `LaunchedEffect`, `DisposableEffect` | Side effects |
| `useContext` | `CompositionLocalProvider` | Shared state |
| `useCallback` | `remember { }` | Memoized functions |
| `useMemo` | `remember(keys) { }` | Memoized values |
| Custom hooks | `@Composable` functions | Reusable logic |
| CSS classes | `Modifier` | Styling |
| `onClick` | `Modifier.clickable` | Event handling |
| `onChange` | `onValueChange` | Input handling |

### State Management Migration

**React Context:**
```typescript
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
```

**Compose Equivalent:**
```kotlin
val LocalTheme = compositionLocalOf { ThemePreset.MIDNIGHT.theme }

@Composable
fun ThemeProvider(content: @Composable () -> Unit) {
    val themeManager = remember { ThemeManager(db, storage) }
    val theme by themeManager.activeTheme.collectAsState()
    
    CompositionLocalProvider(LocalTheme provides theme) {
        content()
    }
}
```

### API Client Migration

The React `geminiService.ts` has already been migrated to the unified `julesSDK` module as `JulesClient`. No additional work needed.

### Storage Migration

| React | KMP |
|-------|-----|
| `localStorage.setItem()` | `SettingsStorage.saveString()` |
| `localStorage.getItem()` | `SettingsStorage.getString()` |
| No database | SQLDelight (already implemented) |

## Migration Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Add wasmJs target to build configuration
- [ ] Create web entry point and HTML template
- [ ] Set up web-specific storage adapter (localStorage wrapper)
- [ ] Test basic "Hello World" Compose web app
- [ ] Configure Gradle tasks for web development

**Deliverable**: Working Compose web app with basic navigation

### Phase 2: Core UI Components (Week 3-4)
- [ ] Migrate `LoginScreen.tsx` → `LoginScreen.kt`
- [ ] Migrate `HomeView.tsx` → `HomeScreen.kt`
- [ ] Migrate `Header.tsx` → `Header.kt`
- [ ] Migrate `Drawer.tsx` → `Drawer.kt`
- [ ] Implement navigation (replace React Router)
- [ ] Test responsive layouts on web

**Deliverable**: Core navigation and authentication working

### Phase 3: Session Management (Week 5-6)
- [ ] Migrate `SessionView.tsx` → `SessionScreen.kt`
- [ ] Migrate `ChatHistory.tsx` → `ChatHistory.kt`
- [ ] Migrate `InputArea.tsx` → `InputArea.kt`
- [ ] Integrate with existing `JulesRepository`
- [ ] Test real-time activity updates

**Deliverable**: Full session management functionality

### Phase 4: Repository & Settings (Week 7-8)
- [ ] Migrate `RepositoryView.tsx` → `RepositoryScreen.kt`
- [ ] Migrate `SettingsView.tsx` → `SettingsScreen.kt` (already done in this PR)
- [ ] Migrate theme system (already done in this PR)
- [ ] Test all settings features on web

**Deliverable**: Complete feature parity with React app

### Phase 5: Polish & Testing (Week 9-10)
- [ ] Performance optimization
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile web testing
- [ ] Accessibility improvements
- [ ] Documentation updates
- [ ] Deploy to staging environment

**Deliverable**: Production-ready web app

### Phase 6: Cutover (Week 11)
- [ ] Deploy KMP web app to production
- [ ] Monitor for issues
- [ ] Add deprecation notice to React app
- [ ] Redirect users to new app
- [ ] Archive React codebase

**Deliverable**: React app deprecated, KMP web in production

## Dependency Mapping

| React/Web Dependency | KMP Alternative |
|---------------------|-----------------|
| `react` | Compose Multiplatform |
| `react-router-dom` | Compose Navigation (or custom) |
| `lucide-react` | Compose Material Icons Extended |
| `vite` | Kotlin/JS Webpack |
| Custom fetch | Ktor Client |
| `localStorage` | SettingsStorage (expect/actual) |

## Testing Strategy

### Unit Tests
- Migrate existing Vitest tests to Kotlin Test
- Use `kotlinx-coroutines-test` for async testing
- Test ViewModels and business logic

### Integration Tests
- Test API integration with mock server
- Test database operations
- Test cache behavior

### E2E Tests
- Use Playwright or Selenium for web E2E tests
- Test critical user flows
- Test across browsers

## Rollback Plan

If critical issues arise during migration:

1. **Immediate**: Revert DNS/routing to React app
2. **Short-term**: Fix issues in KMP web app on staging
3. **Long-term**: If unfixable, maintain React app while addressing KMP issues

## Performance Considerations

### Bundle Size
- Wasm bundle will be larger initially (~2-3MB)
- Use code splitting where possible
- Enable Brotli compression

### Load Time
- Implement loading screen during Wasm initialization
- Preload critical resources
- Use service workers for caching

### Runtime Performance
- Compose web is generally faster than React for complex UIs
- Monitor frame rates and memory usage
- Optimize recomposition

## Timeline Estimate

- **Total Duration**: 11 weeks
- **Team Size**: 2-3 developers
- **Effort**: ~400-500 developer hours

## Success Criteria

- [ ] 100% feature parity with React app
- [ ] No critical bugs in production
- [ ] Load time < 3 seconds on 3G
- [ ] Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Mobile web responsive and functional
- [ ] Accessibility score > 90 (Lighthouse)

## Resources

- [Compose Multiplatform Docs](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html)
- [Ktor Client](https://ktor.io/docs/client.html)
- [SQLDelight](https://cashapp.github.io/sqldelight/)

## Notes

- The unified SDK (`julesSDK`) is already extracted and ready for use
- Theme system and cache management are already implemented in KMP
- Focus migration efforts on UI components and navigation
- Leverage existing KMP infrastructure as much as possible
