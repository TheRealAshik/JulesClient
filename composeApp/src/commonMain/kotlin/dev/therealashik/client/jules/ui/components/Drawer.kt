package dev.therealashik.client.jules.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import dev.therealashik.client.jules.model.JulesSession
import dev.therealashik.client.jules.model.JulesSource
import dev.therealashik.client.jules.model.SessionState
import dev.therealashik.client.jules.ui.JulesSurface

@Composable
fun Drawer(
    isOpen: Boolean,
    onClose: () -> Unit,
    sessions: List<JulesSession>,
    currentSessionId: String?,
    onSelectSession: (JulesSession) -> Unit,
    onDeleteSession: (String) -> Unit,
    sessionsUsed: Int,
    dailyLimit: Int,
    sources: List<JulesSource>,
    currentSource: JulesSource?,
    onSelectSource: (JulesSource) -> Unit
) {
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
                    .background(Color(0xFF121212))
                    .clickable(enabled = false) {}
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🐙", style = MaterialTheme.typography.headlineMedium)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "jules",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    IconButton(onClick = onClose) {
                        Text("✕", color = Color.White, style = MaterialTheme.typography.titleMedium)
                    }
                }

                // Search
                var searchQuery by remember { mutableStateOf("") }
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                    placeholder = { Text("Search...", style = MaterialTheme.typography.bodyMedium, color = Color.Gray) },
                    leadingIcon = { Text("🔍", color = Color.Gray) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.DarkGray,
                        unfocusedBorderColor = Color.DarkGray.copy(alpha = 0.5f),
                        cursorColor = Color.White,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    shape = MaterialTheme.shapes.medium,
                    singleLine = true
                )

                var isSessionsExpanded by remember { mutableStateOf(true) }
                var isCodebasesExpanded by remember { mutableStateOf(true) }

                val filteredSessions = remember(sessions, searchQuery) {
                    if (searchQuery.isBlank()) sessions
                    else sessions.filter {
                        (it.title ?: "").contains(searchQuery, ignoreCase = true) ||
                                it.name.contains(searchQuery, ignoreCase = true)
                    }
                }

                val filteredSources = remember(sources, searchQuery) {
                    if (searchQuery.isBlank()) sources
                    else sources.filter {
                        (it.displayName ?: "").contains(searchQuery, ignoreCase = true) ||
                                it.name.contains(searchQuery, ignoreCase = true)
                    }
                }

                LazyColumn(
                    modifier = Modifier.weight(1f)
                ) {
                    // Recent Sessions Section
                    item {
                        DrawerSectionHeader(
                            title = "Recent sessions",
                            isExpanded = isSessionsExpanded,
                            onToggle = { isSessionsExpanded = !isSessionsExpanded }
                        )
                    }
                    if (isSessionsExpanded) {
                        items(filteredSessions) { session ->
                            val isSelected = session.name == currentSessionId
                            SessionItem(
                                session = session,
                                isSelected = isSelected,
                                onSelect = { onSelectSession(session) },
                                onDelete = { onDeleteSession(session.name) }
                            )
                        }
                    }

                    item { Spacer(modifier = Modifier.height(16.dp)) }

                    // Codebases Section
                    item {
                        DrawerSectionHeader(
                            title = "Codebases",
                            isExpanded = isCodebasesExpanded,
                            onToggle = { isCodebasesExpanded = !isCodebasesExpanded }
                        )
                    }
                    if (isCodebasesExpanded) {
                        items(filteredSources) { source ->
                            val isSelected = source.name == currentSource?.name
                            SourceItem(
                                source = source,
                                isSelected = isSelected,
                                onSelect = { onSelectSource(source) }
                            )
                        }
                    }
                }

                // Footer
                Column(modifier = Modifier.padding(top = 16.dp)) {
                    // Progress
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Daily session limit", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        Text("($sessionsUsed/$dailyLimit)", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { sessionsUsed.toFloat() / dailyLimit.coerceAtLeast(1) },
                        modifier = Modifier.fillMaxWidth().height(4.dp),
                        color = Color(0xFF4F46E5), // Indigo-600
                        trackColor = Color.DarkGray
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Links
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { /* Open Docs */ },
                            modifier = Modifier.weight(1f),
                            shape = MaterialTheme.shapes.small,
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, Color.DarkGray)
                        ) {
                            Text("📄 Docs")
                        }

                        IconButton(
                            onClick = { /* Open Discord */ },
                            modifier = Modifier.background(Color.DarkGray.copy(alpha = 0.3f), shape = MaterialTheme.shapes.small)
                        ) {
                            Text("💬") // Discord
                        }

                        IconButton(
                            onClick = { /* Open X */ },
                            modifier = Modifier.background(Color.DarkGray.copy(alpha = 0.3f), shape = MaterialTheme.shapes.small)
                        ) {
                            Text("🐦") // X
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DrawerSectionHeader(
    title: String,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium, color = Color.Gray)
        Text(
            text = if (isExpanded) "▲" else "▼",
            color = Color.Gray,
            fontSize = 12.sp
        )
    }
}

@Composable
fun SourceItem(
    source: JulesSource,
    isSelected: Boolean,
    onSelect: () -> Unit
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
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("📦", fontSize = 16.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(
                text = source.displayName ?: source.name,
                style = MaterialTheme.typography.bodyMedium,
                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.White,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = "1 session",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
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
                text = session.title ?: session.name.replace("sessions/", ""),
                style = MaterialTheme.typography.bodyMedium,
                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.White,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = session.state.name,
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
