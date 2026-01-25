package dev.therealashik.client.jules.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import dev.therealashik.client.jules.model.*
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesSurface

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
                ActivityItem(activity, onApprovePlan, session.state == SessionState.AWAITING_PLAN_APPROVAL)
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
fun ActivityItem(
    activity: JulesActivity,
    onApprovePlan: (String?) -> Unit,
    isAwaitingApproval: Boolean
) {
    // Determine content type
    val isUser = activity.userMessaged != null || activity.userMessage != null
    val isAgent = activity.agentMessaged != null || activity.agentMessage != null
    val isPlan = activity.planGenerated != null

    val text = when {
        isUser -> activity.userMessaged?.text ?: activity.userMessage?.text
        isAgent -> activity.agentMessaged?.text ?: activity.agentMessage?.text
        // If isPlan is true, activity.planGenerated is not null
        isPlan -> "Plan Generated: ${activity.planGenerated?.plan?.steps?.size ?: 0} steps"
        else -> activity.description ?: activity.originator ?: "Unknown"
    }
    
    val displayText = text ?: "..."

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
                Text(
                    text = displayText,
                    color = Color.White.copy(alpha = 0.9f),
                    fontFamily = FontFamily.Monospace,
                    style = MaterialTheme.typography.bodyMedium
                )

                // Show Plan Steps
                if (isPlan && activity.planGenerated != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    activity.planGenerated.plan.steps.forEach { step ->
                        Text(
                            text = "${step.index}. ${step.title}",
                            color = Color.Gray,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    if (isAwaitingApproval) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { onApprovePlan(activity.planGenerated.plan.id) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("Approve Plan")
                        }
                    }
                }
            }
        }
    }
}
