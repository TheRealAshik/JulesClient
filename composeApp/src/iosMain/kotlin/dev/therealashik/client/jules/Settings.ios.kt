package dev.therealashik.client.jules

import platform.Foundation.NSUserDefaults

actual object Settings {
    private val defaults = NSUserDefaults.standardUserDefaults

    actual fun saveBoolean(key: String, value: Boolean) {
        defaults.setBool(value, forKey = key)
    }

    actual fun getBoolean(key: String, default: Boolean): Boolean {
        // NSUserDefaults returns false if key doesn't exist.
        // To respect the default value, we should check if the key exists.
        // However, for simplicity here we can just check if object exists,
        // but setBool is primitive.
        // A common workaround is registering defaults or checking objectForKey != null.
        if (defaults.objectForKey(key) == null) {
            return default
        }
        return defaults.boolForKey(key)
    }

    actual fun saveString(key: String, value: String) {
        defaults.setObject(value, forKey = key)
    }

    actual fun getString(key: String, default: String): String {
        return defaults.stringForKey(key) ?: default
    }

    actual fun saveInt(key: String, value: Int) {
        defaults.setInteger(value.toLong(), forKey = key)
    }

    actual fun getInt(key: String, default: Int): Int {
        if (defaults.objectForKey(key) == null) {
            return default
        }
        return defaults.integerForKey(key).toInt()
    }
}
