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
// import androidx.compose.material.icons.Icons
// import androidx.compose.material.icons.filled.KeyboardArrowDown
// import androidx.compose.material.icons.filled.KeyboardArrowUp
import com.mikepenz.markdown.model.MarkdownTypography
import com.mikepenz.markdown.model.DefaultMarkdownTypography
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.mikepenz.markdown.compose.Markdown
import com.mikepenz.markdown.model.DefaultMarkdownColors
import dev.therealashik.client.jules.model.*
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesSurface
import kotlinx.serialization.json.Json
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi

@Composable
fun SessionView(
    session: JulesSession,
    activities: List<JulesActivity>,
    isProcessing: Boolean,
    onSendMessage: (String) -> Unit,
    onApprovePlan: (String?) -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(activities.size) {
        if (activities.isNotEmpty()) {
            listState.animateScrollToItem(activities.size - 1)
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
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            items(activities) { activity ->
                ActivityItem(activity)
            }

            // Plan Approval Card (Pinned to bottom of list if waiting)
            if (session.state == SessionState.AWAITING_PLAN_APPROVAL) {
                item {
                    PlanApprovalCard(onApprove = { onApprovePlan(null) }) // Pass null or active plan ID if available
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
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            onSendMessage(inputText)
                            inputText = ""
                        }
                    },
                    enabled = inputText.isNotBlank() && !isProcessing
                ) {
                    Text("Send")
                }
            }
        }
    }
}

@Composable
fun ActivityItem(activity: JulesActivity) {
    val isUser = activity.userMessaged != null || activity.userMessage != null
    val isPlan = activity.planGenerated != null

    // Determine content text
    val text = when {
        isUser -> activity.userMessaged?.text ?: activity.userMessage?.text
        activity.agentMessaged != null -> activity.agentMessaged?.text
        activity.agentMessage != null -> activity.agentMessage?.text
        isPlan -> "Generated a plan with ${activity.planGenerated?.plan?.steps?.size} steps."
        else -> activity.description ?: activity.originator ?: "Unknown Activity"
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        // Header
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(
                        if (isUser) Color.Gray else MaterialTheme.colorScheme.primary, 
                        RoundedCornerShape(4.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isUser) "U" else "J",
                    color = Color.White,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = activity.originator?.uppercase() ?: "SYSTEM",
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray
            )
        }
        
        Spacer(modifier = Modifier.height(4.dp))
        
        // Content
        Box(
            modifier = Modifier
                .padding(start = 32.dp)
                .background(Color.White.copy(alpha = 0.05f), RoundedCornerShape(8.dp))
                .padding(12.dp)
        ) {
            Column {
                if (text != null) {
                    // Check for Thought Bubble
                    // Simple heuristic: starts with "Thinking Process:" or generic thought type check if we had it.
                    // Assuming for now regular text.
                    // If the text looks like a thought (e.g. Wrapped in <thought> or just huge block), we could collapse it.
                    // For now, render Markdown.

                    Markdown(
                        content = text,
                        colors = DefaultMarkdownColors(
                             text = Color.White.copy(alpha = 0.9f),
                             codeText = Color(0xFFCE9178),
                             codeBackground = Color(0xFF1E1E1E),
                             inlineCodeText = Color(0xFFCE9178),
                             inlineCodeBackground = Color(0xFF1E1E1E),
                             dividerColor = Color.Gray,
                             linkText = Color.Blue
                        ),
                        typography = DefaultMarkdownTypography(
                             h1 = MaterialTheme.typography.headlineLarge,
                             h2 = MaterialTheme.typography.headlineMedium,
                             h3 = MaterialTheme.typography.headlineSmall,
                             h4 = MaterialTheme.typography.titleLarge,
                             h5 = MaterialTheme.typography.titleMedium,
                             h6 = MaterialTheme.typography.titleSmall,
                             text = MaterialTheme.typography.bodyMedium,
                             code = MaterialTheme.typography.bodyMedium,
                             inlineCode = MaterialTheme.typography.bodyMedium,
                             quote = MaterialTheme.typography.bodyMedium,
                             paragraph = MaterialTheme.typography.bodyMedium,
                             ordered = MaterialTheme.typography.bodyMedium,
                             bullet = MaterialTheme.typography.bodyMedium,
                             list = MaterialTheme.typography.bodyMedium,
                             link = MaterialTheme.typography.bodyMedium
                        )
                    )
                }

                // Render Artifacts
                activity.artifacts.forEach { artifact ->
                    ArtifactView(artifact)
                }

                // Render Plan Specifics
                if (isPlan && activity.planGenerated != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    PlanView(activity.planGenerated.plan)
                }
            }
        }
    }
}

@Composable
fun PlanApprovalCard(onApprove: () -> Unit) {
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

@Composable
fun PlanView(plan: Plan) {
    Column {
        Text("Plan Steps:", style = MaterialTheme.typography.labelMedium, color = Color.Gray)
        Spacer(modifier = Modifier.height(4.dp))
        plan.steps.forEach { step ->
            Row(modifier = Modifier.padding(vertical = 2.dp)) {
                Text(
                    "${step.index}. ",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    step.title,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@OptIn(ExperimentalEncodingApi::class)
@Composable
fun ArtifactView(artifact: ActivityArtifact) {
    Spacer(modifier = Modifier.height(8.dp))

    if (artifact.bashOutput != null) {
        CodeBlock(
            title = "Bash Output (${artifact.bashOutput.exitCode})",
            content = artifact.bashOutput.output,
            language = "bash"
        )
    } else if (artifact.changeSet != null) {
        CodeBlock(
            title = "File Changes: ${artifact.changeSet.source ?: "Unknown"}",
            content = artifact.changeSet.gitPatch?.unidiffPatch ?: "No diff content",
            language = "diff"
        )
    } else if (artifact.media != null) {
        // Render Image
        // Assuming base64 data
        val base64Data = artifact.media.data
        // Coil3 supports many sources, but Base64 might need custom fetcher or just data URI scheme.
        // Try data URI first.
        val mime = artifact.media.mimeType
        val model = "data:$mime;base64,$base64Data"

        AsyncImage(
            model = model,
            contentDescription = "Generated Artifact",
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp)),
            contentScale = ContentScale.FillWidth
        )
    }
}

@Composable
fun CodeBlock(title: String, content: String, language: String) {
    var isExpanded by remember { mutableStateOf(false) }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isExpanded = !isExpanded }
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(title, color = Color.Gray, style = MaterialTheme.typography.labelSmall, fontFamily = FontFamily.Monospace)
                /*
                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = if (isExpanded) "Collapse" else "Expand",
                    tint = Color.Gray
                )
                */
                Text(if (isExpanded) "▲" else "▼", color = Color.Gray)
            }

            // Content
            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Box(modifier = Modifier.padding(8.dp).fillMaxWidth().background(Color.Black.copy(alpha = 0.3f))) {
                    Text(
                        text = content,
                        color = Color(0xFFD4D4D4),
                        fontFamily = FontFamily.Monospace,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        }
    }
}
