package dev.therealashik.client.jules.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.therealashik.client.jules.model.CustomTheme
import dev.therealashik.client.jules.model.Theme
import dev.therealashik.client.jules.theme.ThemeManager
import dev.therealashik.client.jules.ui.JulesSpacing
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeEditorScreen(
    themeManager: ThemeManager,
    existingTheme: CustomTheme? = null,
    onNavigateBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var themeName by remember { mutableStateOf(existingTheme?.name ?: "My Theme") }
    var theme by remember { mutableStateOf(existingTheme?.theme ?: Theme()) }
    var showColorPicker by remember { mutableStateOf<String?>(null) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (existingTheme != null) "Edit Theme" else "Create Theme") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        scope.launch {
                            if (existingTheme != null) {
                                themeManager.updateTheme(existingTheme.id, themeName, theme)
                            } else {
                                themeManager.createTheme(themeName, theme)
                            }
                            onNavigateBack()
                        }
                    }) {
                        Icon(Icons.Default.Check, "Save")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(JulesSpacing.l)
        ) {
            // Theme Name
            OutlinedTextField(
                value = themeName,
                onValueChange = { themeName = it },
                label = { Text("Theme Name") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(Modifier.height(JulesSpacing.xl))
            
            // Color Pickers
            Text("Colors", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(JulesSpacing.m))
            
            ColorPickerRow("Background", theme.background) {
                showColorPicker = "background"
            }
            ColorPickerRow("Surface", theme.surface) {
                showColorPicker = "surface"
            }
            ColorPickerRow("Surface Highlight", theme.surfaceHighlight) {
                showColorPicker = "surfaceHighlight"
            }
            ColorPickerRow("Border", theme.border) {
                showColorPicker = "border"
            }
            ColorPickerRow("Primary", theme.primary) {
                showColorPicker = "primary"
            }
            ColorPickerRow("Text Main", theme.textMain) {
                showColorPicker = "textMain"
            }
            ColorPickerRow("Text Muted", theme.textMuted) {
                showColorPicker = "textMuted"
            }
            
            Spacer(Modifier.height(JulesSpacing.xl))
            
            // Preview
            Text("Preview", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(JulesSpacing.m))
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = theme.background.toColor()
                )
            ) {
                Column(modifier = Modifier.padding(JulesSpacing.l)) {
                    Text(
                        "Sample Text",
                        color = theme.textMain.toColor(),
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        "Muted text",
                        color = theme.textMuted.toColor(),
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(JulesSpacing.m))
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(
                            containerColor = theme.primary.toColor()
                        )
                    ) {
                        Text("Primary Button")
                    }
                }
            }
        }
    }
    
    // Simple color picker dialog
    showColorPicker?.let { field ->
        val currentColor = when (field) {
            "background" -> theme.background
            "surface" -> theme.surface
            "surfaceHighlight" -> theme.surfaceHighlight
            "border" -> theme.border
            "primary" -> theme.primary
            "textMain" -> theme.textMain
            "textMuted" -> theme.textMuted
            else -> "#000000"
        }
        
        var colorInput by remember { mutableStateOf(currentColor) }
        
        AlertDialog(
            onDismissRequest = { showColorPicker = null },
            title = { Text("Pick Color") },
            text = {
                Column {
                    OutlinedTextField(
                        value = colorInput,
                        onValueChange = { colorInput = it },
                        label = { Text("Hex Color") },
                        placeholder = { Text("#RRGGBB") }
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    theme = when (field) {
                        "background" -> theme.copy(background = colorInput)
                        "surface" -> theme.copy(surface = colorInput)
                        "surfaceHighlight" -> theme.copy(surfaceHighlight = colorInput)
                        "border" -> theme.copy(border = colorInput)
                        "primary" -> theme.copy(primary = colorInput)
                        "textMain" -> theme.copy(textMain = colorInput)
                        "textMuted" -> theme.copy(textMuted = colorInput)
                        else -> theme
                    }
                    showColorPicker = null
                }) {
                    Text("Apply")
                }
            },
            dismissButton = {
                TextButton(onClick = { showColorPicker = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun ColorPickerRow(
    label: String,
    color: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = JulesSpacing.m),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(color, style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.width(JulesSpacing.m))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(color.toColor())
                    .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
            )
        }
    }
}

private fun String.toColor(): Color {
    val hex = removePrefix("#")
    return try {
        Color(hex.toLong(16) or 0xFF000000)
    } catch (e: Exception) {
        Color.Gray
    }
}
