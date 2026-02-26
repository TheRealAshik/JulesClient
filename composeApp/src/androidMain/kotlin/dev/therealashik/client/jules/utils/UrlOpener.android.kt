package dev.therealashik.client.jules.utils

import android.content.Intent
import android.net.Uri
import androidx.core.content.ContextCompat

actual fun openUrl(url: String) {
    val context = dev.therealashik.client.jules.AppContext.get()
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    ContextCompat.startActivity(context, intent, null)
}
