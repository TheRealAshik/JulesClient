package dev.therealashik.client.jules.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun DiffView(content: String) {
    val textMeasurer = rememberTextMeasurer()
    val textStyle = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontSize = 12.sp,
        lineHeight = 16.sp
    )
    val density = LocalDensity.current

    BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
        val constraints = this.constraints
        val maxWidth = constraints.maxWidth

        val (layoutResults, totalHeight) = remember(content, maxWidth, textStyle, density) {
            val lines = content.split('\n')

            // Calculate padding in pixels
            val horizontalPaddingPx = with(density) { 12.dp.roundToPx() }
            val verticalPaddingPx = with(density) { 2.dp.toPx() }

            // Available width for text (subtracting horizontal padding on both sides if needed,
            // but original code had fillMaxWidth() + padding(horizontal=12.dp), which usually means padding on left AND right)
            // Text(modifier = ... .padding(horizontal = 12.dp) ...) applies 12.dp on start and end.
            val availableWidth = maxWidth - (horizontalPaddingPx * 2)

            val results = lines.map { line ->
                textMeasurer.measure(
                    text = AnnotatedString(line),
                    style = textStyle,
                    constraints = Constraints(maxWidth = availableWidth.coerceAtLeast(0))
                )
            }

            val totalH = results.sumOf { (it.size.height + (verticalPaddingPx * 2)).toDouble() }
            results to totalH
        }

        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(with(density) { totalHeight.toFloat().toDp() })
        ) {
            var currentY = 0f
            val paddingHorizontal = 12.dp.toPx()
            val paddingVertical = 2.dp.toPx()

            layoutResults.forEachIndexed { index, layoutResult ->
                val lineContent = layoutResult.layoutInput.text.text
                val (textColor, bgColor) = getDiffColors(lineContent)
                val lineHeight = layoutResult.size.height + (paddingVertical * 2)

                // Draw background (full width)
                drawRect(
                    color = bgColor,
                    topLeft = Offset(0f, currentY),
                    size = Size(size.width, lineHeight)
                )

                // Draw text
                drawText(
                    textLayoutResult = layoutResult,
                    color = textColor,
                    topLeft = Offset(paddingHorizontal, currentY + paddingVertical)
                )

                currentY += lineHeight
            }
        }
    }
}

private fun getDiffColors(line: String): Pair<Color, Color> {
    return when {
        line.startsWith('+') && !line.startsWith("+++") ->
            Color(0xFF4ADE80) to Color(0xFF22C55E).copy(alpha = 0.05f)
        line.startsWith('-') && !line.startsWith("---") ->
            Color(0xFFF87171) to Color(0xFFEF4444).copy(alpha = 0.05f)
        line.startsWith("@@") ->
            Color(0xFF818CF8) to Color.Transparent
        else ->
            Color(0xFFA1A1AA) to Color.Transparent
    }
}
