package dev.therealashik.client.jules.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import dev.therealashik.client.jules.model.JulesSource
import dev.therealashik.client.jules.ui.JulesSurface

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Header(
    onOpenDrawer: () -> Unit,
    currentSource: JulesSource?,
    sources: List<JulesSource>,
    onSourceChange: (JulesSource) -> Unit,
    isLoading: Boolean
) {
    var expanded by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .background(JulesSurface)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onOpenDrawer) {
                // Temporary replacement for Menu Icon
                Text("☰", color = Color.White) 
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            // Source Selector
            Box {
                Row(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.05f))
                        .clickable { expanded = true }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = currentSource?.displayName ?: currentSource?.name ?: "Select Repository...",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(JulesSurface)
                ) {
                    sources.forEach { source ->
                        DropdownMenuItem(
                            text = { Text(source.displayName ?: source.name, color = Color.White) },
                            onClick = {
                                onSourceChange(source)
                                expanded = false
                            }
                        )
                    }
                }
            }
        }
        
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = MaterialTheme.colorScheme.primary,
                strokeWidth = 2.dp
            )
        }
    }
}
