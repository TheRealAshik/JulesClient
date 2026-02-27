package dev.therealashik.client.jules.storage

import dev.therealashik.client.jules.model.CacheConfig
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

suspend fun SettingsStorage.getCacheConfig(): CacheConfig {
    val json = getString("cache_config", "")
    return if (json.isBlank()) {
        CacheConfig()
    } else {
        try {
            Json.decodeFromString(json)
        } catch (e: Exception) {
            CacheConfig()
        }
    }
}

suspend fun SettingsStorage.saveCacheConfig(config: CacheConfig) {
    saveString("cache_config", Json.encodeToString(config))
}
