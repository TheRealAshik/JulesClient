package dev.therealashik.client.jules.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.therealashik.client.jules.model.AutomationMode
import dev.therealashik.client.jules.model.JulesSource
import dev.therealashik.client.jules.viewmodel.CreateSessionConfig
import dev.therealashik.client.jules.ui.JulesBackground
import dev.therealashik.client.jules.ui.JulesSurface

@Composable
fun HomeView(
    currentSource: JulesSource?,
    onSendMessage: (String, CreateSessionConfig) -> Unit,
    isProcessing: Boolean
) {
    var inputText by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(JulesBackground)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.widthIn(max = 600.dp)
        ) {
            // Logo (Placeholder)
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("J", fontSize = 40.sp, color = Color.White)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                "How can I help you today?",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White,
                fontWeight = FontWeight.Medium
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Input Area
            Card(
                colors = CardDefaults.cardColors(containerColor = JulesSurface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        modifier = Modifier.fillMaxWidth(),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        placeholder = { Text("Describe your task...", color = Color.Gray) },
                        minLines = 3
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = {
                                if (inputText.isNotBlank() && currentSource != null) {
                                    val config = CreateSessionConfig(
                                        title = null,
                                        requirePlanApproval = false,
                                        startingBranch = "main",
                                        automationMode = AutomationMode.AUTO_CREATE_PR
                                    )
                                    onSendMessage(inputText, config)
                                }
                            },
                            enabled = inputText.isNotBlank() && currentSource != null && !isProcessing
                        ) {
                            if (isProcessing) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White)
                            } else {
                                Text("Start Session")
                            }
                        }
                    }
                }
            }
            
            if (currentSource == null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "Please select a repository from the top header to begin.",
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
