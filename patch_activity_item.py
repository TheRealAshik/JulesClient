import re

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    content = f.read()

# Modify ActivityItem logic to respect showOnlyArtifacts
# First, wrap the System Event rendering and User/Agent message rendering with if (!showOnlyArtifacts)

# Wrapping System Message
system_event_pattern = r"(// System Message\n\s+if \(activity\.originator == \"system\".*?\n\s+return\n\s+\})"
system_event_replacement = r"""// System Message
        if (activity.originator == "system" && !isPlan && !isProgress && !isCompleted && !isFailed) {
            if (!showOnlyArtifacts) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = JulesSpacing.s),
                    contentAlignment = Alignment.Center
                ) {
                     Text(
                        text = text ?: "System Event",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF71717A), // Zinc-500
                        modifier = Modifier
                            .background(Color.White.copy(alpha = JulesOpacity.subtle), JulesShapes.circle)
                            .border(1.dp, Color.White.copy(alpha = JulesOpacity.subtle), JulesShapes.circle)
                            .padding(horizontal = JulesSpacing.m, vertical = JulesSpacing.xs)
                    )
                }
            }
            return
        }"""

content = re.sub(system_event_pattern, system_event_replacement, content, flags=re.DOTALL)

# Wrapping Message Bubble
message_bubble_pattern = r"(// User/Agent Message Header & Bubble\n\s+if \(text != null\) \{\n\s+var isTimestampVisible)(.*?)(Spacer\(modifier = Modifier.height\(JulesSpacing.s\)\)\n\s+\})"
message_bubble_replacement = r"""// User/Agent Message Header & Bubble
        if (text != null && !showOnlyArtifacts) {
            var isTimestampVisible\2\3"""

content = re.sub(message_bubble_pattern, message_bubble_replacement, content, flags=re.DOTALL)

# Wrapping Progress Item
progress_pattern = r"(// Progress Updates\n\s+val progressUpdate = activity\.progressUpdated\n\s+if \(isProgress && progressUpdate != null\) \{\n\s+ProgressItem\(progressUpdate\)\n\s+Spacer\(modifier = Modifier.height\(JulesSpacing.s\)\)\n\s+\})"
progress_replacement = r"""// Progress Updates
            val progressUpdate = activity.progressUpdated
            if (isProgress && progressUpdate != null && !showOnlyArtifacts) {
                ProgressItem(progressUpdate)
                Spacer(modifier = Modifier.height(JulesSpacing.s))
            }"""

content = re.sub(progress_pattern, progress_replacement, content)

# Wrapping Plan
plan_pattern = r"(// Plan\n\s+val planGenerated = activity\.planGenerated\n\s+if \(isPlan && planGenerated != null\) \{\n\s+val plan = planGenerated.plan\n\s+// val isApproved = activity.planApproved != null // Simplification\n\s+PlanCard\(plan, defaultCardState, onApprove = \{ onApprovePlan\(activity.name\) \}\)\n\s+Spacer\(modifier = Modifier.height\(JulesSpacing.s\)\)\n\s+\})"
plan_replacement = r"""// Plan
            val planGenerated = activity.planGenerated
            if (isPlan && planGenerated != null && !showOnlyArtifacts) {
                val plan = planGenerated.plan
                // val isApproved = activity.planApproved != null // Simplification
                PlanCard(plan, defaultCardState, onApprove = { onApprovePlan(activity.name) })
                Spacer(modifier = Modifier.height(JulesSpacing.s))
            }"""

content = re.sub(plan_pattern, plan_replacement, content)

# Wrapping Completion/Failure
status_pattern = r"(// Completion / Failure\n\s+if \(isCompleted\) \{\n\s+StatusBanner\(true, \"Session Completed Successfully\"\)\n\s+\}\n\s+if \(isFailed\) \{\n\s+StatusBanner\(false, \"Session Failed: \$\{activity\.sessionFailed\?\.reason \?: \"Unknown\"\}\"\)\n\s+\})"
status_replacement = r"""// Completion / Failure
            if (isCompleted && !showOnlyArtifacts) {
                StatusBanner(true, "Session Completed Successfully")
            }
            if (isFailed && !showOnlyArtifacts) {
                StatusBanner(false, "Session Failed: ${activity.sessionFailed?.reason ?: "Unknown"}")
            }"""

content = re.sub(status_pattern, status_replacement, content)

# Hide completely if showOnlyArtifacts is true and there are no artifacts
# Add this at the beginning of ActivityItem
early_return_pattern = r"(val hasArtifacts = activity\.artifacts\.isNotEmpty\(\)\n\s+val shouldRender = text != null \|\| isPlan \|\| isProgress \|\| hasArtifacts \|\| isCompleted \|\| isFailed \|\| activity\.originator == \"system\"\n\n\s+if \(!shouldRender\) \{\n\s+return\n\s+\})"
early_return_replacement = r"""\1

    if (showOnlyArtifacts && !hasArtifacts) {
        return
    }"""

content = re.sub(early_return_pattern, early_return_replacement, content)

with open(file_path, "w") as f:
    f.write(content)
