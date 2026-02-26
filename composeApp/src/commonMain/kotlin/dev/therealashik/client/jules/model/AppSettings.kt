package dev.therealashik.client.jules.model

import kotlinx.serialization.Serializable

@Serializable
data class AppSettings(
    val activeThemeId: String? = null,
    val activePreset: String = ThemePreset.MIDNIGHT.name,
    val cacheConfig: CacheConfig = CacheConfig(),
    val defaultCardCollapsed: Boolean = false
) {
    fun getActiveTheme(): Theme = try {
        ThemePreset.valueOf(activePreset).theme
    } catch (e: Exception) {
        ThemePreset.MIDNIGHT.theme
    }
}
