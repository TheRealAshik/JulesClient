package dev.therealashik.client.jules.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun Header(
    onOpenDrawer: () -> Unit,
    isLoading: Boolean,
    onOpenSettings: () -> Unit = {}
) {

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color(0xFF0C0C0C).copy(alpha = 0.9f),
        tonalElevation = 0.dp
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.statusBars)
                    .height(48.dp)
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left Section
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Sidebar Trigger
                    FilledTonalIconButton(
                        onClick = onOpenDrawer,
                        modifier = Modifier.size(32.dp),
                        colors = IconButtonDefaults.filledTonalIconButtonColors(
                            containerColor = Color(0xFF27272A),
                            contentColor = Color(0xFF71717A)
                        )
                    ) {
                        Icon(
                            Icons.Default.Menu,
                            contentDescription = "Toggle sidebar",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                // Right Section: Settings
                FilledTonalIconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier.size(32.dp),
                    colors = IconButtonDefaults.filledTonalIconButtonColors(
                        containerColor = Color(0xFF27272A),
                        contentColor = Color(0xFF71717A)
                    )
                ) {
                    Icon(
                        Icons.Default.Settings,
                        contentDescription = "Configure",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Bottom border
            Divider(
                modifier = Modifier.align(Alignment.BottomCenter),
                color = Color.White.copy(alpha = 0.05f),
                thickness = 1.dp
            )

            // Loading Indicator
            if (isLoading) {
                 LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(2.dp)
                        .align(Alignment.BottomCenter),
                    color = Color(0xFF818CF8),
                    trackColor = Color.Transparent
                )
            }
        }
    }
}
