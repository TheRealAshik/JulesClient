package dev.therealashik.client.jules.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Colors extracted from Web:
// Background: #0c0c0c
// Card: #161619
// Primary (Indigo-600): #4f46e5
// Text: White

val JulesBackground = Color(0xFF0C0C0C)
val JulesSurface = Color(0xFF161619)
val JulesPrimary = Color(0xFF4F46E5)
val JulesOnBackground = Color.White
val JulesOnSurface = Color.White

// Additional Palette
val JulesGreen = Color(0xFF34D399) // Emerald-400
val JulesRed = Color(0xFFF87171)   // Red-400
val JulesZinc = Color(0xFF71717A)  // Zinc-500
val JulesIndigo = Color(0xFF818CF8) // Indigo-400

private val DarkColorScheme = darkColorScheme(
    primary = JulesPrimary,
    background = JulesBackground,
    surface = JulesSurface,
    onPrimary = Color.White,
    onBackground = JulesOnBackground,
    onSurface = JulesOnSurface
)

@Composable
fun JulesTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
