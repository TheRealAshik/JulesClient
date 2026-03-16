package dev.therealashik.client.jules.storage

import dev.therealashik.client.jules.model.CacheConfig
import dev.therealashik.client.jules.model.Account
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



suspend fun SettingsStorage.getAccounts(): List<Account> {
    val json = getString("accounts", "")
    return if (json.isBlank()) {
        emptyList()
    } else {
        try {
            Json.decodeFromString(json)
        } catch (e: Exception) {
            emptyList()
        }
    }
}

suspend fun SettingsStorage.saveAccounts(accounts: List<Account>) {
    saveString("accounts", Json.encodeToString(accounts))
}

suspend fun SettingsStorage.getActiveAccountId(): String? {
    val id = getString("active_account_id", "")
    return if (id.isBlank()) null else id
}

suspend fun SettingsStorage.saveActiveAccountId(id: String?) {
    if (id == null) {
        saveString("active_account_id", "")
    } else {
        saveString("active_account_id", id)
    }
}
