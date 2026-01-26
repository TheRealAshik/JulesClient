package dev.therealashik.client.jules

expect object Settings {
    fun saveBoolean(key: String, value: Boolean)
    fun getBoolean(key: String, default: Boolean): Boolean
}
