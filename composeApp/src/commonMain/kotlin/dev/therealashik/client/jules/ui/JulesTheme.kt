package dev.therealashik.client.jules.ui

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.ColorScheme
import androidx.compose.ui.unit.dp

// Colors extracted from Web:
// Background: #0c0c0c
// Card: #161619
// Primary (Indigo-600): #4f46e5
// Text: White

val JulesBackground = Color(0xFF0C0C0C)
val JulesSurface = Color(0xFF161619)
val JulesPrimary = Color(0xFF4F46E5)

// Additional Palette
val JulesGreen = Color(0xFF34D399) // Emerald-400
val JulesRed = Color(0xFFF87171)   // Red-400
val JulesZinc = Color(0xFF71717A)  // Zinc-500
val JulesIndigo = Color(0xFF818CF8) // Indigo-400

// Drawer Colors
val JulesDrawerBackground = Color(0xFF161619)
val JulesDrawerBorder = Color.White.copy(alpha = 0.05f)
val JulesDrawerBackdrop = Color.Black.copy(alpha = 0.6f)
val JulesDrawerSearchBg = Color(0xFF161619)
val JulesDrawerSearchBgFocused = Color(0xFF1E1E22)
val JulesDrawerSearchBorder = Color.White.copy(alpha = 0.1f)
val JulesDrawerSearchBorderFocused = Color(0xFF6366F1).copy(alpha = 0.5f)
val JulesDrawerItemSelected = Color.White.copy(alpha = 0.05f)
val JulesDrawerButtonBg = Color(0xFF1E1E22)
val JulesDrawerProgressBg = Color(0xFF3F3F46)
val JulesDrawerProgressFill = Color(0xFF6366F1)

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

enum class ThemePreset {
    MIDNIGHT,
    DEEP_SPACE,
    SUNSET,
    FOREST,
    OCEAN
}

fun getThemeConfig(preset: ThemePreset): ColorScheme {
    return when (preset) {
        ThemePreset.MIDNIGHT -> darkColorScheme(
            primary = Color(0xFF4F46E5), // Indigo-600
            background = Color(0xFF0C0C0C),
            surface = Color(0xFF161619),
            onPrimary = Color.White,
            onBackground = Color.White,
            onSurface = Color.White
        )
        ThemePreset.DEEP_SPACE -> darkColorScheme(
            primary = Color(0xFF8B5CF6), // Violet-500
            background = Color(0xFF0B0E14), // Very dark blue/black
            surface = Color(0xFF151921),
            onPrimary = Color.White,
            onBackground = Color(0xFFE2E8F0),
            onSurface = Color(0xFFE2E8F0)
        )
        ThemePreset.SUNSET -> darkColorScheme(
            primary = Color(0xFFF59E0B), // Amber-500
            background = Color(0xFF191209), // Dark brown/black
            surface = Color(0xFF261C10),
            onPrimary = Color.White,
            onBackground = Color(0xFFFEF3C7),
            onSurface = Color(0xFFFEF3C7)
        )
        ThemePreset.FOREST -> darkColorScheme(
            primary = Color(0xFF10B981), // Emerald-500
            background = Color(0xFF061811),
            surface = Color(0xFF0C291F),
            onPrimary = Color.White,
            onBackground = Color(0xFFECFDF5),
            onSurface = Color(0xFFECFDF5)
        )
        ThemePreset.OCEAN -> darkColorScheme(
            primary = Color(0xFF0EA5E9), // Sky-500
            background = Color(0xFF08151C),
            surface = Color(0xFF0F2633),
            onPrimary = Color.White,
            onBackground = Color(0xFFE0F2FE),
            onSurface = Color(0xFFE0F2FE)
        )
    }
}

@Composable
fun JulesTheme(
    preset: ThemePreset = ThemePreset.MIDNIGHT,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = getThemeConfig(preset),
        content = content
    )
}
