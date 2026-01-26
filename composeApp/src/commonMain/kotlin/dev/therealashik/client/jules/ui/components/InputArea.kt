package dev.therealashik.client.jules.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalTextStyle
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.therealashik.client.jules.model.AutomationMode
import dev.therealashik.client.jules.model.JulesSource
import dev.therealashik.client.jules.viewmodel.CreateSessionConfig
import kotlinx.coroutines.delay

private val DEFAULT_PLACEHOLDERS = listOf(
    "Refactor this function...",
    "Fix CSS alignment issues...",
    "Add a new API endpoint...",
    "Optimize performance...",
    "Write unit tests...",
    "Explain this code..."
)

private const val PLACEHOLDER_CYCLE_INTERVAL = 3500L

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InputArea(
    onSendMessage: (String, CreateSessionConfig) -> Unit,
    isLoading: Boolean,
    currentSource: JulesSource?,
    modifier: Modifier = Modifier
) {
    var input by remember { mutableStateOf("") }
    var isFocused by remember { mutableStateOf(false) }

    // Dynamic Placeholder Logic
    var placeholderIndex by remember { mutableStateOf(0) }
    LaunchedEffect(isFocused, input) {
        if (!isFocused && input.isEmpty()) {
            while (true) {
                delay(PLACEHOLDER_CYCLE_INTERVAL)
                placeholderIndex = (placeholderIndex + 1) % DEFAULT_PLACEHOLDERS.size
            }
        }
    }
    val placeholderText = DEFAULT_PLACEHOLDERS[placeholderIndex]

    // Expansion Logic
    val isExpanded = isFocused || input.isNotEmpty()

    // Branch Selection
    var selectedBranch by remember(currentSource) {
        mutableStateOf(currentSource?.githubRepo?.defaultBranch?.displayName ?: "main")
    }
    var isBranchMenuOpen by remember { mutableStateOf(false) }

    // Settings / Mode Selection
    var isSettingsMenuOpen by remember { mutableStateOf(false) }
    var sessionTitle by remember { mutableStateOf("") }
    var automationMode by remember { mutableStateOf(AutomationMode.AUTO_CREATE_PR) }

    val focusRequester = remember { FocusRequester() }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141417)),
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = if (isExpanded) Color(0xFF6366F1).copy(alpha = 0.4f) else Color.White.copy(alpha = 0.1f),
                shape = RoundedCornerShape(16.dp)
            )
            .animateContentSize()
            .clickable(enabled = !isFocused) {
                focusRequester.requestFocus()
            }
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            TextField(
                value = input,
                onValueChange = { input = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .focusRequester(focusRequester)
                    .onFocusChanged { isFocused = it.isFocused },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = Color(0xFFE4E4E7),
                    unfocusedTextColor = Color(0xFFE4E4E7),
                    cursorColor = Color(0xFF6366F1)
                ),
                placeholder = {
                    Text(
                        placeholderText,
                        color = Color.Gray,
                        modifier = Modifier.animateContentSize()
                    )
                },
                minLines = if (isExpanded) 3 else 1,
                maxLines = if (isExpanded) 10 else 1
            )

            // Footer Controls
            AnimatedVisibility(visible = isExpanded) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left Actions
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Plus Button
                        IconButton(
                            onClick = { /* TODO: Attachments */ },
                            modifier = Modifier
                                .size(32.dp)
                                .background(Color(0xFF1F1F23), RoundedCornerShape(8.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add", tint = Color.LightGray, modifier = Modifier.size(16.dp))
                        }

                        // Branch Selector
                        Box {
                            Row(
                                modifier = Modifier
                                    .height(32.dp)
                                    .background(Color(0xFF1F1F23), RoundedCornerShape(8.dp))
                                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                                    .clickable { isBranchMenuOpen = true }
                                    .padding(horizontal = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(Icons.Default.AccountTree, contentDescription = null, tint = Color(0xFF818CF8), modifier = Modifier.size(14.dp))
                                Text(selectedBranch, color = Color.LightGray, fontSize = 12.sp)
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(14.dp))
                            }

                            DropdownMenu(
                                expanded = isBranchMenuOpen,
                                onDismissRequest = { isBranchMenuOpen = false },
                                modifier = Modifier.background(Color(0xFF121215))
                            ) {
                                currentSource?.githubRepo?.branches?.forEach { branch ->
                                    DropdownMenuItem(
                                        text = {
                                            Text(
                                                branch.displayName,
                                                color = if(branch.displayName == selectedBranch) Color(0xFF818CF8) else Color.LightGray
                                            )
                                        },
                                        onClick = {
                                            selectedBranch = branch.displayName
                                            isBranchMenuOpen = false
                                        },
                                        leadingIcon = {
                                            if (branch.displayName == selectedBranch) {
                                                Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF818CF8))
                                            }
                                        }
                                    )
                                }
                            }
                        }

                        // Settings Button
                        Box {
                            IconButton(
                                onClick = { isSettingsMenuOpen = true },
                                modifier = Modifier
                                    .size(32.dp)
                                    .background(Color(0xFF1F1F23), RoundedCornerShape(8.dp))
                                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                            ) {
                                Icon(
                                    Icons.Default.Settings,
                                    contentDescription = "Settings",
                                    tint = if(sessionTitle.isNotEmpty()) Color(0xFF818CF8) else Color.LightGray,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            DropdownMenu(
                                expanded = isSettingsMenuOpen,
                                onDismissRequest = { isSettingsMenuOpen = false },
                                modifier = Modifier.background(Color(0xFF121215))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("SESSION TITLE", fontSize = 10.sp, color = Color.Gray, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    OutlinedTextField(
                                        value = sessionTitle,
                                        onValueChange = { sessionTitle = it },
                                        placeholder = { Text("Optional title...", fontSize = 12.sp) },
                                        textStyle = LocalTextStyle.current.copy(fontSize = 12.sp, color = Color.White),
                                        modifier = Modifier.fillMaxWidth().height(50.dp),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = Color(0xFF818CF8),
                                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Send Button
                    IconButton(
                        onClick = {
                            if (input.isNotBlank() && !isLoading) {
                                onSendMessage(
                                    input,
                                    CreateSessionConfig(
                                        title = sessionTitle.takeIf { it.isNotBlank() },
                                        startingBranch = selectedBranch,
                                        automationMode = automationMode
                                    )
                                )
                                input = ""
                                sessionTitle = ""
                                // Optionally clear focus if you want to collapse, but usually web keeps it expanded if you want to type more?
                                // Web implementation blurs on submit if variant is default.
                                // We can't easily force blur here without FocusManager, but leaving it expanded is fine for now.
                            }
                        },
                        enabled = input.isNotBlank() && !isLoading,
                        modifier = Modifier
                            .size(32.dp)
                            .background(
                                if (input.isNotBlank()) Color(0xFF4F46E5) else Color(0xFF27272A),
                                RoundedCornerShape(8.dp)
                            )
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(14.dp), color = Color.White, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.ArrowForward, contentDescription = "Send", tint = if (input.isNotBlank()) Color.White else Color.Gray, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}
