package dev.therealashik.client.jules.utils

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
actual fun rememberFilePickerLauncher(onFilePicked: (PlatformFile) -> Unit): FilePickerLauncher {
    return remember {
        FilePickerLauncher {
            println("File picking not implemented on iOS")
        }
    }
}
