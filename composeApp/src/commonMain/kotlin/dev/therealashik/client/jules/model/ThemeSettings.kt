package dev.therealashik.client.jules.model

import kotlinx.serialization.Serializable

@Serializable
data class Theme(
    val background: String,
    val surface: String,
    val surfaceHighlight: String,
    val border: String,
    val primary: String,
    val textMain: String,
    val textMuted: String
) {
    fun isValid(): Boolean = listOf(
        background, surface, surfaceHighlight, border, primary, textMain, textMuted
    ).all { it.matches(Regex("^#[0-9A-Fa-f]{6}$")) }
}

@Serializable
data class CustomTheme(
    val id: String,
    val name: String,
    val theme: Theme,
    val createdAt: Long,
    val updatedAt: Long,
    val isActive: Boolean = false
)

enum class ThemePreset(val displayName: String, val theme: Theme) {
    MIDNIGHT("Midnight", Theme(
        background = "#0c0c0c",
        surface = "#161619",
        surfaceHighlight = "#27272a",
        border = "#27272a",
        primary = "#4f46e5",
        textMain = "#e4e4e7",
        textMuted = "#a1a1aa"
    )),
    DEEP_SPACE("Deep Space", Theme(
        background = "#0b0e14",
        surface = "#151921",
        surfaceHighlight = "#1f2937",
        border = "#374151",
        primary = "#8b5cf6",
        textMain = "#e2e8f0",
        textMuted = "#94a3b8"
    )),
    SUNSET("Sunset", Theme(
        background = "#191209",
        surface = "#261c10",
        surfaceHighlight = "#3f2e1a",
        border = "#57401f",
        primary = "#f59e0b",
        textMain = "#fef3c7",
        textMuted = "#fcd34d"
    )),
    FOREST("Forest", Theme(
        background = "#061811",
        surface = "#0c291f",
        surfaceHighlight = "#14402d",
        border = "#166534",
        primary = "#10b981",
        textMain = "#ecfdf5",
        textMuted = "#6ee7b7"
    )),
    OCEAN("Ocean", Theme(
        background = "#08151c",
        surface = "#0f2633",
        surfaceHighlight = "#1e3a4f",
        border = "#0284c7",
        primary = "#0ea5e9",
        textMain = "#e0f2fe",
        textMuted = "#7dd3fc"
    ))
}
