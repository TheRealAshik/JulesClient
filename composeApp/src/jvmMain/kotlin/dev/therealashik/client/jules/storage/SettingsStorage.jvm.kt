package dev.therealashik.client.jules.storage

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import java.util.prefs.Preferences

actual class SettingsStorage {
    private val prefs: Preferences = Preferences.userNodeForPackage(SettingsStorage::class.java)
    private val flows = mutableMapOf<String, MutableStateFlow<String>>()

    actual suspend fun saveString(key: String, value: String) {
        prefs.put(key, value)
        prefs.flush()
        flows[key]?.value = value
    }

    actual suspend fun getString(key: String, default: String): String {
        return prefs.get(key, default)
    }

    actual suspend fun saveBoolean(key: String, value: Boolean) {
        prefs.putBoolean(key, value)
        prefs.flush()
    }

    actual suspend fun getBoolean(key: String, default: Boolean): Boolean {
        return prefs.getBoolean(key, default)
    }

    actual suspend fun saveLong(key: String, value: Long) {
        prefs.putLong(key, value)
        prefs.flush()
    }

    actual suspend fun getLong(key: String, default: Long): Long {
        return prefs.getLong(key, default)
    }

    actual suspend fun delete(key: String) {
        prefs.remove(key)
        prefs.flush()
        flows.remove(key)
    }

    actual suspend fun clear() {
        prefs.clear()
        prefs.flush()
        flows.clear()
    }

    actual fun observeString(key: String, default: String): Flow<String> {
        return flows.getOrPut(key) {
            MutableStateFlow(prefs.get(key, default))
        }
    }
}
