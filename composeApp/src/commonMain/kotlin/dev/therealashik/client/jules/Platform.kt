package dev.therealashik.client.jules

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform