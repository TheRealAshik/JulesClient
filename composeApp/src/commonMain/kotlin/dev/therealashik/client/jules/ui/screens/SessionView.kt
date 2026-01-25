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
import androidx.compose.ui.unit.dp
import dev.therealashik.client.jules.model.JulesActivity
import dev.therealashik.client.jules.model.JulesSession
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesSurface

@Composable
fun SessionView(
    session: JulesSession,
    activities: List<JulesActivity>,
    isProcessing: Boolean,
    onSendMessage: (String) -> Unit
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
        }

        // Input Area (Fixed at bottom)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(JulesSurface) // Visual separator
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
    val isUser = activity.type == "user_message" // Assuming "user_message" or similar based on real API
    // Need to verify actual activity types. For now, basic rendering.
    
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
                text = activity.type.uppercase(),
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
            Text(
                text = activity.text ?: activity.toolCall ?: "...",
                color = Color.White.copy(alpha = 0.9f),
                fontFamily = FontFamily.Monospace,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
