package dev.therealashik.client.jules.storage

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import platform.Foundation.NSUserDefaults

actual class SettingsStorage {
    private val userDefaults = NSUserDefaults.standardUserDefaults
    private val flows = mutableMapOf<String, MutableStateFlow<String>>()

    actual suspend fun saveString(key: String, value: String) {
        userDefaults.setObject(value, key)
        userDefaults.synchronize()
        flows[key]?.value = value
    }

    actual suspend fun getString(key: String, default: String): String {
        return userDefaults.stringForKey(key) ?: default
    }

    actual suspend fun saveBoolean(key: String, value: Boolean) {
        userDefaults.setBool(value, key)
        userDefaults.synchronize()
    }

    actual suspend fun getBoolean(key: String, default: Boolean): Boolean {
        return if (userDefaults.objectForKey(key) != null) {
            userDefaults.boolForKey(key)
        } else {
            default
        }
    }

    actual suspend fun saveLong(key: String, value: Long) {
        userDefaults.setInteger(value, key)
        userDefaults.synchronize()
    }

    actual suspend fun getLong(key: String, default: Long): Long {
        return if (userDefaults.objectForKey(key) != null) {
            userDefaults.integerForKey(key)
        } else {
            default
        }
    }

    actual suspend fun delete(key: String) {
        userDefaults.removeObjectForKey(key)
        userDefaults.synchronize()
        flows.remove(key)
    }

    actual suspend fun clear() {
        val domain = userDefaults.dictionaryRepresentation().keys
        domain.forEach { key ->
            userDefaults.removeObjectForKey(key as String)
        }
        userDefaults.synchronize()
        flows.clear()
    }

    actual fun observeString(key: String, default: String): Flow<String> {
        return flows.getOrPut(key) {
            MutableStateFlow(userDefaults.stringForKey(key) ?: default)
        }
    }
}
