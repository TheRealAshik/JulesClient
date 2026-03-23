import re

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    content = f.read()

# Add import for TabRow and Tab if missing (already importing all from material3)
# import androidx.compose.material3.* is there.

# Modify SessionView variables
var_pattern = r"(val listState = rememberLazyListState\(\))"
var_replacement = r"\1\n    var selectedTabIndex by remember { mutableStateOf(0) }"

content = re.sub(var_pattern, var_replacement, content)

# Modify Header to add TabRow
header_pattern = r"(HorizontalDivider\(color = MaterialTheme.colorScheme.outlineVariant\))"
header_replacement = r"""\1

            TabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                divider = { HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant) }
            ) {
                Tab(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    text = { Text("Chat") }
                )
                Tab(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    text = { Text("Code") }
                )
            }"""

content = re.sub(header_pattern, header_replacement, content)

# Modify LazyColumn rendering
items_pattern = r"(items\(activities\) \{ activity ->\n\s+)(ActivityItem\(activity, defaultCardState, onApprovePlan\))"
items_replacement = r"\1\2(isCompactMode = selectedTabIndex == 0, showOnlyArtifacts = selectedTabIndex == 1)"

content = re.sub(items_pattern, items_replacement, content)

# We will need to update ActivityItem signature to accept `isCompactMode` and `showOnlyArtifacts`
activity_item_pattern = r"(@Composable\nfun ActivityItem\(activity: JulesActivity, defaultCardState: Boolean, onApprovePlan: \(String\?\) -> Unit\))"
activity_item_replacement = r"@Composable\nfun ActivityItem(activity: JulesActivity, defaultCardState: Boolean, onApprovePlan: (String?) -> Unit, isCompactMode: Boolean = false, showOnlyArtifacts: Boolean = false)"

content = re.sub(activity_item_pattern, activity_item_replacement, content)

# We need to wrap the contents of ActivityItem in `if (!showOnlyArtifacts)` where appropriate
# Let's do this by fully replacing ActivityItem and ArtifactView functions instead, it's safer.

with open(file_path, "w") as f:
    f.write(content)
