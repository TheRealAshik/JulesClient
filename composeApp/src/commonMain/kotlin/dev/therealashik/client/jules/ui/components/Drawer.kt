package dev.therealashik.client.jules.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import dev.therealashik.jules.sdk.model.JulesSession
import dev.therealashik.jules.sdk.model.JulesSource
import dev.therealashik.client.jules.utils.getSessionDisplayInfo
import dev.therealashik.client.jules.utils.openUrl
import dev.therealashik.client.jules.ui.*

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
    onSelectSource: (JulesSource) -> Unit,
    onNavigateToSettings: (() -> Unit)? = null
) {
    AnimatedVisibility(
        visible = isOpen,
        enter = slideInHorizontally(
            initialOffsetX = { -it },
            animationSpec = tween(300, easing = FastOutSlowInEasing)
        ) + fadeIn(tween(300)),
        exit = slideOutHorizontally(
            targetOffsetX = { -it },
            animationSpec = tween(300)
        ) + fadeOut(tween(300))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .zIndex(100f)
        ) {
            // Backdrop
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(JulesDrawerBackdrop)
                    .clickable { onClose() }
            )

            // Drawer Content
            Column(
                modifier = Modifier
                    .width(JulesSizes.drawerWidth)
                    .fillMaxHeight()
                    .background(JulesDrawerBackground)
                    .border(1.dp, JulesDrawerBorder, RectangleShape)
                    .clickable(enabled = false) {}
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .windowInsetsPadding(WindowInsets.statusBars)
                        .height(JulesSizes.drawerHeaderHeight)
                        .padding(horizontal = JulesSpacing.l),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(JulesSpacing.s)
                    ) {
                        Icon(
                            Icons.Default.SmartToy,
                            contentDescription = "Jules",
                            tint = Color.White.copy(alpha = 0.8f),
                            modifier = Modifier.size(JulesSpacing.xxl)
                        )
                        Text(
                            "jules",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White,
                            letterSpacing = (-0.5).sp
                        )
                    }

                    FilledTonalIconButton(
                        onClick = onClose,
                        modifier = Modifier.size(JulesSpacing.xxxl),
                        colors = IconButtonDefaults.filledTonalIconButtonColors(
                            containerColor = Color(0xFF27272A),
                            contentColor = Color(0xFF9CA3AF)
                        )
                    ) {
                        Icon(Icons.Default.Close, null, modifier = Modifier.size(JulesSizes.iconMedium))
                    }
                }
                Divider(color = JulesDrawerBorder)

                // Search Input
                var searchQuery by remember { mutableStateOf("") }
                var isFocused by remember { mutableStateOf(false) }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(JulesSpacing.l)
                        .background(
                            if (isFocused) JulesDrawerSearchBgFocused else JulesDrawerSearchBg,
                            JulesShapes.medium
                        )
                        .border(
                            1.dp,
                            if (isFocused) JulesDrawerSearchBorderFocused else JulesDrawerSearchBorder,
                            JulesShapes.medium
                        )
                        .padding(horizontal = JulesSpacing.m, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = null,
                        tint = if (isFocused) JulesPrimary else JulesZinc,
                        modifier = Modifier.size(JulesSizes.iconSmall)
                    )

                    BasicTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = JulesSpacing.m)
                            .onFocusChanged { isFocused = it.isFocused },
                        textStyle = TextStyle(color = Color.White, fontSize = 14.sp),
                        singleLine = true,
                        decorationBox = { innerTextField ->
                            if (searchQuery.isEmpty()) {
                                Text("Search repositories & sessions...", color = Color(0xFF52525B), fontSize = 14.sp)
                            }
                            innerTextField()
                        }
                    )
                }

                // Filtering logic
                var isSessionsExpanded by remember { mutableStateOf(true) }
                var isCodebasesExpanded by remember { mutableStateOf(true) }

                val filteredSessions = remember(sessions, searchQuery) {
                    if (searchQuery.isBlank()) sessions
                    else sessions.filter {
                        (it.title ?: "").contains(searchQuery, ignoreCase = true) ||
                                it.prompt.contains(searchQuery, ignoreCase = true)
                    }
                }

                val filteredSources = remember(sources, searchQuery) {
                    if (searchQuery.isBlank()) sources
                    else sources.filter {
                        (it.displayName ?: "").contains(searchQuery, ignoreCase = true) ||
                                it.name.contains(searchQuery, ignoreCase = true)
                    }
                }

                LazyColumn(modifier = Modifier.weight(1f).padding(horizontal = JulesSpacing.s)) {
                    // Recent Sessions
                    item {
                         DrawerSectionHeader(
                            title = "Recent sessions",
                            count = if (searchQuery.isNotEmpty()) filteredSessions.size else null,
                            isExpanded = isSessionsExpanded,
                            onToggle = { isSessionsExpanded = !isSessionsExpanded }
                        )
                    }
                    if (isSessionsExpanded) {
                        items(filteredSessions) { session ->
                            SessionItem(
                                session = session,
                                isSelected = session.name == currentSessionId,
                                onSelect = { onSelectSession(session); onClose() }, // Close drawer on selection
                                onDelete = { onDeleteSession(session.name) }
                            )
                        }
                    }

                    item { Spacer(modifier = Modifier.height(JulesSpacing.l)) }

                    // Codebases
                    item {
                        DrawerSectionHeader(
                            title = "Codebases",
                            count = if (searchQuery.isNotEmpty()) filteredSources.size else null,
                            isExpanded = isCodebasesExpanded,
                            onToggle = { isCodebasesExpanded = !isCodebasesExpanded }
                        )
                    }
                    if (isCodebasesExpanded) {
                        items(filteredSources) { source ->
                            SourceItem(
                                source = source,
                                isSelected = currentSource?.name == source.name,
                                onSelect = { onSelectSource(source); onClose() }
                            )
                        }
                    }
                }

                // Footer
                Column(
                    modifier = Modifier
                        .background(JulesDrawerBackground)
                        .border(1.dp, JulesDrawerBorder)
                        .padding(JulesSpacing.l)
                ) {
                    // Progress
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = JulesSpacing.m),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Text(
                            "Daily Usage ($sessionsUsed/$dailyLimit)",
                            fontSize = 12.sp,
                            color = JulesZinc
                        )
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .background(JulesDrawerProgressBg, RoundedCornerShape(2.dp))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(sessionsUsed.toFloat() / dailyLimit.coerceAtLeast(1))
                                .height(4.dp)
                                .background(JulesDrawerProgressFill, RoundedCornerShape(2.dp))
                        )
                    }

                    Spacer(modifier = Modifier.height(JulesSpacing.m))

                    // Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(JulesSpacing.s)
                    ) {
                        // Settings Button
                        FilledTonalButton(
                            onClick = { onNavigateToSettings?.invoke() },
                            modifier = Modifier.weight(1f).height(40.dp),
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = JulesDrawerButtonBg,
                                contentColor = Color(0xFFD4D4D8)
                            ),
                            shape = JulesShapes.small
                        ) {
                            Icon(Icons.Default.Settings, null, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(JulesSpacing.s))
                            Text("Settings", fontSize = 14.sp)
                        }

                        // Docs
                        FilledTonalIconButton(
                            onClick = { openUrl("https://docs.jules.ai") },
                            modifier = Modifier.size(40.dp),
                            colors = IconButtonDefaults.filledTonalIconButtonColors(
                                containerColor = JulesDrawerButtonBg,
                                contentColor = Color(0xFF9CA3AF)
                            )
                        ) {
                            Icon(Icons.Default.MenuBook, null, modifier = Modifier.size(18.dp))
                        }

                         // Discord
                        FilledTonalIconButton(
                            onClick = { openUrl("https://discord.gg/jules") },
                            modifier = Modifier.size(40.dp),
                            colors = IconButtonDefaults.filledTonalIconButtonColors(
                                containerColor = JulesDrawerButtonBg,
                                contentColor = Color(0xFF9CA3AF)
                            )
                        ) {
                            Icon(Icons.Default.Forum, null, modifier = Modifier.size(18.dp))
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
    count: Int?,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
            .padding(vertical = JulesSpacing.s, horizontal = JulesSpacing.xs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(JulesSpacing.s)) {
            Text(title, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFFA1A1AA))
            if (count != null && count > 0) {
                 Text(
                    count.toString(),
                    fontSize = 10.sp,
                    color = Color(0xFFD4D4D8),
                    modifier = Modifier
                        .background(Color.White.copy(alpha = JulesOpacity.normal), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                 )
            }
        }

        Icon(
            if (isExpanded) Icons.Default.ExpandMore else Icons.Default.KeyboardArrowRight,
            contentDescription = null,
            tint = JulesZinc,
            modifier = Modifier.size(JulesSizes.iconSmall)
        )
    }
}

@Composable
fun SessionItem(
    session: JulesSession,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onDelete: () -> Unit
) {
    val displayInfo = remember(session.state) { getSessionDisplayInfo(session.state) }
    var menuExpanded by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
            .clip(JulesShapes.small)
            .background(if (isSelected) JulesDrawerItemSelected else Color.Transparent)
            .clickable { onSelect() }
            .padding(JulesSpacing.m),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(JulesSpacing.m)
    ) {
        // Emoji
        Text(
            text = displayInfo.emoji,
            fontSize = 16.sp,
            modifier = Modifier.padding(top = 2.dp)
        )

        Column(modifier = Modifier.weight(1f)) {
            // Title
            Text(
                text = session.title ?: session.prompt,
                fontSize = 14.sp,
                fontWeight = FontWeight.Light,
                color = if (isSelected) Color.White else Color(0xFFD4D4D8),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            // Status and Helper
            Column {
                Text(
                    text = displayInfo.label,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) Color(0xFFA5B4FC) else Color(0xFFA1A1AA),
                    modifier = Modifier.padding(top = 2.dp)
                )

                Text(
                    text = displayInfo.helperText,
                    fontSize = 10.sp,
                    color = Color(0xFF52525B),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                if (displayInfo.cta != "none") {
                    Text(
                        text = "${displayInfo.cta} →",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = JulesIndigo,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }

        // Context Menu
        Box {
             FilledTonalIconButton(
                onClick = { menuExpanded = true },
                modifier = Modifier.size(40.dp),
                colors = IconButtonDefaults.filledTonalIconButtonColors(
                    containerColor = Color.Transparent,
                    contentColor = JulesZinc
                )
            ) {
                Icon(
                    Icons.Default.MoreVert,
                    contentDescription = "Options",
                    modifier = Modifier.size(JulesSizes.iconSmall)
                )
            }

            DropdownMenu(
                expanded = menuExpanded,
                onDismissRequest = { menuExpanded = false },
                modifier = Modifier.background(Color(0xFF18181B))
            ) {
                DropdownMenuItem(
                    text = { Text("Delete", fontSize = 12.sp, color = JulesRed) },
                    onClick = {
                        onDelete()
                        menuExpanded = false
                    }
                )
            }
        }
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
            .padding(vertical = 2.dp)
            .clip(JulesShapes.small)
            .background(if (isSelected) JulesDrawerItemSelected else Color.Transparent)
            .clickable { onSelect() }
            .padding(JulesSpacing.m),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(JulesSizes.iconSmall).background(Color(0xFF27272A), RoundedCornerShape(4.dp)),
            contentAlignment = Alignment.Center
        ) {
             Text("G", fontSize = 10.sp, color = Color.Gray)
        }
        Spacer(modifier = Modifier.width(JulesSpacing.m))
        Column {
            Text(
                text = source.displayName ?: source.name.split("/").takeLast(2).joinToString("/"),
                fontSize = 14.sp,
                color = if (isSelected) Color.White else Color(0xFFA1A1AA),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
