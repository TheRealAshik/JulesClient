package dev.therealashik.client.jules.utils

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.awt.FileDialog
import java.io.File
import javax.swing.SwingUtilities

class JvmPlatformFile(private val file: File) : PlatformFile {
    override val name: String = file.name
    override suspend fun readText(): String = withContext(Dispatchers.IO) {
        file.readText()
    }
}

@Composable
actual fun rememberFilePickerLauncher(onFilePicked: (PlatformFile) -> Unit): FilePickerLauncher {
    return remember {
        FilePickerLauncher {
            SwingUtilities.invokeLater {
                val dialog = FileDialog(null as java.awt.Frame?, "Select File", FileDialog.LOAD)
                dialog.isVisible = true

                if (dialog.directory != null && dialog.file != null) {
                    val file = File(dialog.directory, dialog.file)
                    onFilePicked(JvmPlatformFile(file))
                }
            }
        }
    }
}
