import re

with open("composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt", "r") as f:
    content = f.read()

# 1. Add var selectedTabIndex by remember { mutableStateOf(0) }
# 2. Add TabRow below header divider
# 3. Add isCompactMode to ActivityItem and ArtifactView
# 4. Filter lists based on selectedTabIndex
