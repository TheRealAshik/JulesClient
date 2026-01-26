package dev.therealashik.client.jules.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.mikepenz.markdown.compose.Markdown
import com.mikepenz.markdown.model.DefaultMarkdownColors
import com.mikepenz.markdown.model.DefaultMarkdownTypography
import dev.therealashik.client.jules.model.*
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesSurface
import kotlin.io.encoding.ExperimentalEncodingApi

@Composable
fun SessionView(
    session: JulesSession,
    activities: List<JulesActivity>,
    isProcessing: Boolean,
    defaultCardState: Boolean,
    onSendMessage: (String) -> Unit,
    onApprovePlan: (String?) -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // Auto-scroll to bottom
    LaunchedEffect(activities.size, session.outputs.size) {
        if (activities.isNotEmpty() || session.outputs.isNotEmpty()) {
            // Wait a frame for layout
            kotlinx.coroutines.delay(100)
            val count = activities.size + session.outputs.filter { it.pullRequest != null }.size
            if (count > 0) {
                 listState.animateScrollToItem(listState.layoutInfo.totalItemsCount - 1)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(JulesBackground)
    ) {
        // Chat History
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(bottom = 16.dp, top = 16.dp)
        ) {
            items(activities) { activity ->
                ActivityItem(activity, defaultCardState, onApprovePlan)
            }

            // Session Outputs (PR Cards)
            session.outputs.forEach { output ->
                if (output.pullRequest != null) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                        PullRequestCard(output.pullRequest)
                    }
                }
            }

            // Plan Approval Card (Pinned to bottom of list if waiting)
            if (session.state == SessionState.AWAITING_PLAN_APPROVAL) {
                item {
                    PlanApprovalCard(onApprove = { onApprovePlan(null) })
                }
            }

            // Completion / Failure Status (if no specific activity rendered it)
            if (session.state == SessionState.COMPLETED) {
                 item {
                     Spacer(modifier = Modifier.height(24.dp))
                     StatusBanner(true, "Session Completed Successfully")
                 }
            } else if (session.state == SessionState.FAILED) {
                 item {
                     Spacer(modifier = Modifier.height(24.dp))
                     StatusBanner(false, "Session Failed")
                 }
            }
        }

        // Input Area (Fixed at bottom)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(JulesSurface)
                .padding(16.dp)
        ) {
             Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Type a message...") },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Black.copy(alpha = 0.3f),
                        unfocusedContainerColor = Color.Black.copy(alpha = 0.3f),
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = false,
                    maxLines = 4
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            onSendMessage(inputText)
                            inputText = ""
                        }
                    },
                    enabled = inputText.isNotBlank() && !isProcessing,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                    )
                ) {
                    Text("➤", fontSize = 16.sp)
                }
            }
        }
    }
}

private fun getTextContent(content: MessageContent?): String? {
    if (content == null) return null
    if (!content.text.isNullOrBlank()) return content.text
    if (!content.parts.isNullOrEmpty()) {
        return content.parts.joinToString("") { it.text }
    }
    return null
}

@Composable
fun ActivityItem(activity: JulesActivity, defaultCardState: Boolean, onApprovePlan: (String?) -> Unit) {
    val isUser = activity.userMessaged != null || activity.userMessage != null
    val isPlan = activity.planGenerated != null
    val isProgress = activity.progressUpdated != null
    val isCompleted = activity.sessionCompleted != null
    val isFailed = activity.sessionFailed != null

    // Determine content text
    val text = when {
        isUser -> getTextContent(activity.userMessaged) ?: getTextContent(activity.userMessage)
        activity.agentMessaged != null -> getTextContent(activity.agentMessaged)
        activity.agentMessage != null -> getTextContent(activity.agentMessage)
        isPlan -> null // Rendered separately
        else -> activity.description // System message or fallback
    }

    // Skip rendering if essentially empty (unless it has artifacts/plan/progress)
    val hasArtifacts = activity.artifacts.isNotEmpty()
    if (text == null && !isPlan && !isProgress && !hasArtifacts && !isCompleted && !isFailed && activity.originator != "system") {
        return
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        // System Message
        if (activity.originator == "system" && !isPlan && !isProgress && !isCompleted && !isFailed) {
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                 Text(
                    text = text ?: "System Event",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray,
                    modifier = Modifier
                        .background(Color.White.copy(alpha = 0.05f), CircleShape)
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }
            return
        }

        // User/Agent Message Header & Bubble
        if (text != null) {
            Row(
                verticalAlignment = Alignment.Top,
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
            ) {
                if (!isUser) {
                     Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("J", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                }

                Column(modifier = Modifier.weight(1f, fill = false).widthIn(max = 600.dp)) {
                    // Bubble
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(
                                topStart = 16.dp,
                                topEnd = 16.dp,
                                bottomStart = if (isUser) 16.dp else 4.dp,
                                bottomEnd = if (isUser) 4.dp else 16.dp
                            ))
                            .background(if (isUser) Color(0xFF27272A) else Color.Transparent)
                            .border(
                                width = if (isUser) 1.dp else 0.dp,
                                color = if (isUser) Color.White.copy(alpha = 0.1f) else Color.Transparent,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .padding(if (isUser) 12.dp else 0.dp)
                    ) {
                        SelectionContainer {
                            Markdown(
                                content = text,
                                colors = DefaultMarkdownColors(
                                     text = Color.White.copy(alpha = 0.9f),
                                     codeText = Color(0xFFCE9178),
                                     codeBackground = Color(0xFF1E1E1E),
                                     inlineCodeText = Color(0xFFCE9178),
                                     inlineCodeBackground = Color(0xFF1E1E1E),
                                     dividerColor = Color.Gray,
                                     linkText = Color(0xFF818CF8) // Indigo-400
                                ),
                                typography = DefaultMarkdownTypography(
                                     h1 = MaterialTheme.typography.headlineLarge,
                                     h2 = MaterialTheme.typography.headlineMedium,
                                     h3 = MaterialTheme.typography.headlineSmall,
                                     h4 = MaterialTheme.typography.titleLarge,
                                     h5 = MaterialTheme.typography.titleMedium,
                                     h6 = MaterialTheme.typography.titleSmall,
                                     text = MaterialTheme.typography.bodyMedium.copy(lineHeight = 24.sp),
                                     code = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace),
                                     inlineCode = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace),
                                     quote = MaterialTheme.typography.bodyMedium,
                                     paragraph = MaterialTheme.typography.bodyMedium,
                                     ordered = MaterialTheme.typography.bodyMedium,
                                     bullet = MaterialTheme.typography.bodyMedium,
                                     list = MaterialTheme.typography.bodyMedium,
                                     link = MaterialTheme.typography.bodyMedium
                                )
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Indented Content (Plans, Artifacts, Progress)
        // If it was a user message, we don't usually have these attached, but if we do, show them.
        // For agent, we indent.
        Column(modifier = Modifier.padding(start = 40.dp)) {

            // Progress Updates
            if (isProgress && activity.progressUpdated != null) {
                ProgressItem(activity.progressUpdated)
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Plan
            if (isPlan && activity.planGenerated != null) {
                val plan = activity.planGenerated.plan
                // val isApproved = activity.planApproved != null // Simplification
                PlanCard(plan, defaultCardState, onApprove = { onApprovePlan(activity.name) })
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Artifacts
            activity.artifacts.forEach { artifact ->
                ArtifactView(artifact, defaultCardState)
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Completion / Failure
            if (isCompleted) {
                StatusBanner(true, "Session Completed Successfully")
            }
            if (isFailed) {
                StatusBanner(false, "Session Failed: ${activity.sessionFailed?.reason ?: "Unknown"}")
            }
        }
    }
}

@Composable
fun ProgressItem(progress: ProgressUpdate) {
    val title = progress.title ?: progress.status ?: "Processing"
    val description = progress.description

    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("↻", color = Color.Gray, fontSize = 16.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(title, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            if (!description.isNullOrBlank() && description != title) {
                Text(description, style = MaterialTheme.typography.bodySmall, color = Color.DarkGray)
            }
        }
    }
}

@Composable
fun StatusBanner(success: Boolean, message: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(
                if (success) Color(0xFF064E3B) else Color(0xFF7F1D1D),
                RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Text(if (success) "✓" else "⚠", color = Color.White, fontSize = 16.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Text(message, color = Color.White, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun PlanCard(plan: Plan, defaultExpanded: Boolean, onApprove: () -> Unit) {
    var isExpanded by remember { mutableStateOf(defaultExpanded) }

    Card(
        modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF121215))
    ) {
        Column {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isExpanded = !isExpanded }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("ℹ", color = MaterialTheme.colorScheme.primary, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Execution Plan", style = MaterialTheme.typography.titleMedium, color = Color.White)
                Spacer(modifier = Modifier.weight(1f))
                Text("${plan.steps.size} steps", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                Spacer(modifier = Modifier.width(8.dp))
                Text(if (isExpanded) "▲" else "▼", color = Color.Gray, fontSize = 12.sp)
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp)) {
                    plan.steps.forEach { step ->
                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                            Box(
                                modifier = Modifier.size(20.dp).background(Color(0xFF18181B), CircleShape).border(1.dp, Color.White.copy(alpha = 0.1f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("${(step.index ?: 0) + 1}", style = MaterialTheme.typography.labelSmall, fontSize = 10.sp, color = Color.Gray)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(step.title, style = MaterialTheme.typography.bodyMedium, color = Color.LightGray)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onApprove,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text("Start Coding")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("▶", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun PlanApprovalCard(onApprove: () -> Unit) {
    // Similar to PlanCard but as a standalone sticky prompt
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp)
            .border(1.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "Plan Proposed",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "The agent has proposed a plan. Please review the steps above and approve to proceed.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onApprove,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Approve Plan")
            }
        }
    }
}

@OptIn(ExperimentalEncodingApi::class)
@Composable
fun ArtifactView(artifact: ActivityArtifact, defaultExpanded: Boolean) {
    if (artifact.bashOutput != null) {
        CodeBlock(
            title = "Bash Output (Exit: ${artifact.bashOutput.exitCode})",
            content = artifact.bashOutput.output,
            language = "bash",
            isError = artifact.bashOutput.exitCode != 0,
            defaultExpanded = defaultExpanded
        )
    } else if (artifact.changeSet != null) {
        CodeBlock(
            title = artifact.changeSet.gitPatch?.suggestedCommitMessage ?: "Code Changes",
            content = artifact.changeSet.gitPatch?.unidiffPatch ?: "No diff content",
            language = "diff",
            defaultExpanded = defaultExpanded
        )
    } else if (artifact.media != null) {
        val base64Data = artifact.media.data
        val mime = artifact.media.mimeType
        val model = "data:$mime;base64,$base64Data"

        Card(
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
        ) {
            Column {
                Box(modifier = Modifier.fillMaxWidth().background(Color(0xFF1E1E1E)).padding(8.dp)) {
                    Text("Generated Artifact", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                }
                AsyncImage(
                    model = model,
                    contentDescription = "Generated Artifact",
                    modifier = Modifier.fillMaxWidth(),
                    contentScale = ContentScale.FillWidth
                )
            }
        }
    }
}

@Composable
fun CodeBlock(title: String, content: String, language: String, isError: Boolean = false, defaultExpanded: Boolean = false) {
    var isExpanded by remember { mutableStateOf(defaultExpanded) }
    val borderColor = if (isError) Color.Red.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.1f)
    val headerBg = if (isError) Color.Red.copy(alpha = 0.1f) else Color(0xFF1E1E1E)

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF09090B)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, borderColor, RoundedCornerShape(8.dp))
    ) {
        Column {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(headerBg)
                    .clickable { isExpanded = !isExpanded }
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(if (language == "bash") ">_" else "±", color = if(isError) Color.Red else Color.Gray, fontFamily = FontFamily.Monospace)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(title, color = if(isError) Color.Red else Color.Gray, style = MaterialTheme.typography.labelSmall, fontFamily = FontFamily.Monospace)
                }
                Text(if (isExpanded) "▲" else "▼", color = Color.Gray, fontSize = 10.sp)
            }

            // Content
            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Box(modifier = Modifier.padding(0.dp).fillMaxWidth().background(Color.Black.copy(alpha = 0.3f))) {
                    SelectionContainer {
                        Text(
                            text = content,
                            color = if(isError) Color(0xFFFCA5A5) else Color(0xFFD4D4D4),
                            fontFamily = FontFamily.Monospace,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun PullRequestCard(pr: PullRequestOutput) {
    val uriHandler = LocalUriHandler.current
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .background(Brush.verticalGradient(listOf(Color(0xFF18181B), Color(0xFF0F0F12))))
                .padding(16.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.background(Color(0xFF064E3B), RoundedCornerShape(4.dp)).padding(4.dp)) {
                        Text("PR", color = Color(0xFF34D399), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Pull Request Ready", style = MaterialTheme.typography.labelSmall, color = Color.LightGray)
                        Text("Click to review", style = MaterialTheme.typography.bodySmall, fontSize = 10.sp, color = Color.Gray)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(pr.title, style = MaterialTheme.typography.titleMedium, color = Color.White)
                Text(pr.description, style = MaterialTheme.typography.bodySmall, color = Color.Gray, maxLines = 2)

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { uriHandler.openUri(pr.url) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("View PR")
                }
                Text(pr.url, style = MaterialTheme.typography.bodySmall, fontSize = 10.sp, color = Color.DarkGray, modifier = Modifier.padding(top=8.dp))
            }
        }
    }
}
