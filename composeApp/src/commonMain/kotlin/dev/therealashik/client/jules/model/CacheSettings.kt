package dev.therealashik.client.jules.model

import kotlinx.serialization.Serializable

enum class CacheExpiration(val displayName: String, val milliseconds: Long) {
    FIVE_MIN("5 minutes", 5 * 60 * 1000),
    FIFTEEN_MIN("15 minutes", 15 * 60 * 1000),
    THIRTY_MIN("30 minutes", 30 * 60 * 1000),
    ONE_HOUR("1 hour", 60 * 60 * 1000),
    SIX_HOURS("6 hours", 6 * 60 * 60 * 1000),
    TWELVE_HOURS("12 hours", 12 * 60 * 60 * 1000),
    ONE_DAY("24 hours", 24 * 60 * 60 * 1000),
    SEVEN_DAYS("7 days", 7 * 24 * 60 * 60 * 1000),
    THIRTY_DAYS("30 days", 30 * 24 * 60 * 60 * 1000),
    NEVER("Never", Long.MAX_VALUE)
}

enum class CacheSizeLimit(val displayName: String, val bytes: Long) {
    TEN_MB("10 MB", 10 * 1024 * 1024),
    TWENTY_FIVE_MB("25 MB", 25 * 1024 * 1024),
    FIFTY_MB("50 MB", 50 * 1024 * 1024),
    HUNDRED_MB("100 MB", 100 * 1024 * 1024),
    TWO_FIFTY_MB("250 MB", 250 * 1024 * 1024),
    FIVE_HUNDRED_MB("500 MB", 500 * 1024 * 1024),
    UNLIMITED("Unlimited", Long.MAX_VALUE)
}

@Serializable
data class CacheConfig(
    val enabled: Boolean = true,
    val expiration: String = CacheExpiration.ONE_HOUR.name,
    val sizeLimit: String = CacheSizeLimit.FIFTY_MB.name,
    val preloadOnStart: Boolean = false,
    val wifiOnly: Boolean = true
) {
    fun getExpirationMs(): Long = try {
        CacheExpiration.valueOf(expiration).milliseconds
    } catch (e: Exception) {
        CacheExpiration.ONE_HOUR.milliseconds
    }

    fun getSizeLimitBytes(): Long = try {
        CacheSizeLimit.valueOf(sizeLimit).bytes
    } catch (e: Exception) {
        CacheSizeLimit.FIFTY_MB.bytes
    }
}

@Serializable
data class CacheStats(
    val totalSize: Long = 0,
    val entryCount: Int = 0,
    val hitCount: Long = 0,
    val missCount: Long = 0,
    val lastPruned: Long = 0,
    val lastCleared: Long = 0
) {
    val hitRate: Float
        get() = if (hitCount + missCount == 0L) 0f else hitCount.toFloat() / (hitCount + missCount)
}
