package dev.therealashik.client.jules.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import dev.therealashik.client.jules.model.JulesSession
import dev.therealashik.client.jules.ui.JulesSurface

@Composable
fun Drawer(
    isOpen: Boolean,
    onClose: () -> Unit,
    sessions: List<JulesSession>,
    currentSessionId: String?,
    onSelectSession: (JulesSession) -> Unit,
    onDeleteSession: (String) -> Unit
) {
    // Determine screen width based on platform logic in the parent or use Box constraints
    // For simplicity, we'll assume a fixed width overlay or standard ModalDrawerSheet behavior if using Material3 ModalNavigationDrawer
    
    // Simplistic Overlay implementation
    if (isOpen) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .zIndex(100f)
                .background(Color.Black.copy(alpha = 0.5f))
                .clickable { onClose() }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(300.dp)
                    .background(JulesSurface)
                    .clickable(enabled = false) {} // Prevent click through
                    .padding(16.dp)
            ) {
                Text(
                    "Sessions",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                LazyColumn(
                    modifier = Modifier.weight(1f)
                ) {
                    items(sessions) { session ->
                        val isSelected = session.name == currentSessionId
                        SessionItem(
                            session = session,
                            isSelected = isSelected,
                            onSelect = { onSelectSession(session) },
                            onDelete = { onDeleteSession(session.name) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SessionItem(
    session: JulesSession,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onDelete: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .background(
                if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) 
                else Color.Transparent, 
                shape = MaterialTheme.shapes.small
            )
            .clickable { onSelect() }
            .padding(8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = session.name.replace("sessions/", ""), // Simplified name display
                style = MaterialTheme.typography.bodyMedium,
                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.White,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = session.state,
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
        }
        
        IconButton(
            onClick = onDelete,
            modifier = Modifier.size(24.dp)
        ) {
            Text("x", color = Color.Gray)
        }
    }
}
