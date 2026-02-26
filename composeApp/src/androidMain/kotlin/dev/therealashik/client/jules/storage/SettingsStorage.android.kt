package dev.therealashik.client.jules.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

actual class SettingsStorage(private val context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "jules_settings",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val flows = mutableMapOf<String, MutableStateFlow<String>>()

    actual suspend fun saveString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
        flows[key]?.value = value
    }

    actual suspend fun getString(key: String, default: String): String {
        return prefs.getString(key, default) ?: default
    }

    actual suspend fun saveBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    actual suspend fun getBoolean(key: String, default: Boolean): Boolean {
        return prefs.getBoolean(key, default)
    }

    actual suspend fun saveLong(key: String, value: Long) {
        prefs.edit().putLong(key, value).apply()
    }

    actual suspend fun getLong(key: String, default: Long): Long {
        return prefs.getLong(key, default)
    }

    actual suspend fun delete(key: String) {
        prefs.edit().remove(key).apply()
        flows.remove(key)
    }

    actual suspend fun clear() {
        prefs.edit().clear().apply()
        flows.clear()
    }

    actual fun observeString(key: String, default: String): Flow<String> {
        return flows.getOrPut(key) {
            MutableStateFlow(prefs.getString(key, default) ?: default)
        }
    }
}
