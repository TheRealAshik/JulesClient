import re

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    content = f.read()

# Fix the double call issue in items
content = content.replace("ActivityItem(activity, defaultCardState, onApprovePlan)(isCompactMode = selectedTabIndex == 0, showOnlyArtifacts = selectedTabIndex == 1)",
                          "ActivityItem(activity, defaultCardState, onApprovePlan, isCompactMode = selectedTabIndex == 0, showOnlyArtifacts = selectedTabIndex == 1)")


with open(file_path, "w") as f:
    f.write(content)
