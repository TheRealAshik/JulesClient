package dev.therealashik.client.jules

import android.content.Context
import android.content.SharedPreferences

object AndroidContext {
    lateinit var context: Context
}

actual object Settings {
    private const val PREF_NAME = "jules_preferences"

    private val prefs: SharedPreferences by lazy {
        AndroidContext.context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    actual fun saveBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    actual fun getBoolean(key: String, default: Boolean): Boolean {
        return prefs.getBoolean(key, default)
    }
}
