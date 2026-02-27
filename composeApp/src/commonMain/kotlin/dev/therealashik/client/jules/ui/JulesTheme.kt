package dev.therealashik.client.jules.ui

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.ColorScheme
import androidx.compose.ui.unit.dp
import dev.therealashik.client.jules.model.Theme
import dev.therealashik.client.jules.theme.ThemeManager

// Helper to parse hex color
private fun String.toColor(): Color {
    val hex = removePrefix("#")
    return Color(hex.toLong(16) or 0xFF000000)
}

object JulesSpacing {
    val xs = 4.dp
    val s = 8.dp
    val m = 12.dp
    val l = 16.dp
    val xl = 20.dp
    val xxl = 24.dp
    val xxxl = 32.dp
}

object JulesShapes {
    val small = RoundedCornerShape(8.dp)
    val medium = RoundedCornerShape(12.dp)
    val large = RoundedCornerShape(16.dp)
    val pill = RoundedCornerShape(24.dp)
    val circle = CircleShape
}

object JulesOpacity {
    val subtle = 0.05f
    val normal = 0.1f
    val focused = 0.2f
}

object JulesSizes {
    val touchTarget = 48.dp
    val iconSmall = 16.dp
    val iconMedium = 20.dp
    val iconLarge = 24.dp
    val avatar = 32.dp
    val drawerWidth = 320.dp
    val drawerHeaderHeight = 48.dp
}

// Colors
val JulesGreen = Color(0xFF10B981)
val JulesRed = Color(0xFFEF4444)
val JulesIndigo = Color(0xFF6366F1)
val JulesSurface = Color(0xFF161619)
val JulesBackground = Color(0xFF0C0C0C)
val JulesPrimary = Color(0xFF6366F1)
val JulesTextMain = Color(0xFFE4E4E7)
val JulesTextMuted = Color(0xFFA1A1AA)
val JulesZinc = Color(0xFFA1A1AA)

// Drawer Colors
val JulesDrawerBackdrop = Color.Black.copy(alpha = 0.5f)
val JulesDrawerBackground = Color(0xFF18181B)
val JulesDrawerBorder = Color(0xFF27272A)
val JulesDrawerSearchBg = Color(0xFF27272A)
val JulesDrawerSearchBgFocused = Color(0xFF3F3F46)
val JulesDrawerSearchBorder = Color.Transparent
val JulesDrawerSearchBorderFocused = Color(0xFF6366F1)
val JulesDrawerProgressBg = Color(0xFF27272A)
val JulesDrawerProgressFill = Color(0xFF6366F1)
val JulesDrawerButtonBg = Color(0xFF27272A)
val JulesDrawerItemSelected = Color(0xFF27272A)


// Convert Theme data model to ColorScheme
fun Theme.toColorScheme(): ColorScheme {
    return darkColorScheme(
        primary = primary.toColor(),
        background = background.toColor(),
        surface = surface.toColor(),
        surfaceVariant = surfaceHighlight.toColor(),
        outline = border.toColor(),
        onPrimary = Color.White,
        onBackground = textMain.toColor(),
        onSurface = textMain.toColor(),
        onSurfaceVariant = textMuted.toColor()
    )
}

@Composable
fun JulesTheme(
    theme: Theme? = null,
    themeManager: ThemeManager? = null,
    content: @Composable () -> Unit
) {
    val activeTheme = when {
        theme != null -> theme
        themeManager != null -> {
            val state by themeManager.activeTheme.collectAsState()
            state
        }
        else -> dev.therealashik.client.jules.model.ThemePreset.MIDNIGHT.theme
    }
    
    MaterialTheme(
        colorScheme = activeTheme.toColorScheme(),
        content = content
    )
}
