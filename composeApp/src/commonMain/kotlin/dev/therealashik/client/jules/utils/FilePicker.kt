package dev.therealashik.client.jules.utils

import androidx.compose.runtime.Composable

// TODO: Add support for multiple file selection
// TODO: Add file type filtering (e.g., images, documents)
interface PlatformFile {
    val name: String
    suspend fun readText(): String
}

fun interface FilePickerLauncher {
    fun launch()
}

@Composable
expect fun rememberFilePickerLauncher(onFilePicked: (PlatformFile) -> Unit): FilePickerLauncher
