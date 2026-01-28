package dev.therealashik.client.jules.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ShimmerMessage() {
    val transition = rememberInfiniteTransition()
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    val shimmerColors = listOf(
        Color.White.copy(alpha = 0.05f),
        Color.White.copy(alpha = 0.15f),
        Color.White.copy(alpha = 0.05f),
    )

    val brush = Brush.linearGradient(
        colors = shimmerColors,
        start = Offset.Zero,
        end = Offset(x = translateAnim, y = translateAnim)
    )

    Row(modifier = Modifier.padding(vertical = 8.dp).fillMaxWidth()) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(Color(0xFF18181B), CircleShape)
                .border(1.dp, Color.White.copy(alpha = 0.1f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.SmartToy, null, tint = Color(0xFF818CF8), modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(modifier = Modifier.height(16.dp).width(200.dp).clip(RoundedCornerShape(4.dp)).background(brush))
            Box(modifier = Modifier.height(16.dp).width(160.dp).clip(RoundedCornerShape(4.dp)).background(brush))
            Box(modifier = Modifier.height(16.dp).width(120.dp).clip(RoundedCornerShape(4.dp)).background(brush))
        }
    }
}
