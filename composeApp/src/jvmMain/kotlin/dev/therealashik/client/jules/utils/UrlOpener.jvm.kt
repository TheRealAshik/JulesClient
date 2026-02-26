package dev.therealashik.client.jules.utils

import java.awt.Desktop
import java.net.URI

actual fun openUrl(url: String) {
    if (Desktop.isDesktopSupported()) {
        Desktop.getDesktop().browse(URI(url))
    }
}
