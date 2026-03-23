import re

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    content = f.read()

# Modify ArtifactView signature
artifact_view_pattern = r"(@OptIn\(ExperimentalEncodingApi::class\)\n@Composable\nfun ArtifactView\(artifact: ActivityArtifact, defaultExpanded: Boolean\))"
artifact_view_replacement = r"@OptIn(ExperimentalEncodingApi::class)\n@Composable\nfun ArtifactView(artifact: ActivityArtifact, defaultExpanded: Boolean, isCompactMode: Boolean = false)"

content = re.sub(artifact_view_pattern, artifact_view_replacement, content)

# Modify bash output block
bash_pattern = r"(if \(bashOutput != null\) \{\n\s+)(CodeBlock\(\n\s+title = bashOutput.command,\n\s+content = bashOutput.output,\n\s+language = \"bash\",\n\s+exitCode = bashOutput.exitCode,\n\s+defaultExpanded = defaultExpanded\n\s+\))"
bash_replacement = r"""\1if (isCompactMode) {
        CompactArtifactView(
            title = bashOutput.command,
            isError = bashOutput.exitCode != null && bashOutput.exitCode != 0
        )
    } else {
        \2
    }"""

content = re.sub(bash_pattern, bash_replacement, content)

# Modify changeSet output block
changeset_pattern = r"(CodeBlock\(\n\s+title = changeSet.gitPatch\?.suggestedCommitMessage \?: \"Code Changes\",\n\s+subtitle = fileName,\n\s+content = patch,\n\s+language = \"diff\",\n\s+defaultExpanded = defaultExpanded\n\s+\))"
changeset_replacement = r"""if (isCompactMode) {
        CompactArtifactView(
            title = changeSet.gitPatch?.suggestedCommitMessage ?: "Code Changes",
            subtitle = fileName
        )
    } else {
        \1
    }"""

content = re.sub(changeset_pattern, changeset_replacement, content)

# Modify ArtifactView call in ActivityItem to pass isCompactMode
# It's inside a loop: activity.artifacts.forEach { artifact -> ArtifactView(artifact, defaultCardState)
activity_artifact_call_pattern = r"(activity\.artifacts\.forEach \{ artifact ->\n\s+)(ArtifactView\(artifact, defaultCardState\))"
activity_artifact_call_replacement = r"\1ArtifactView(artifact, defaultCardState, isCompactMode = isCompactMode)"

content = re.sub(activity_artifact_call_pattern, activity_artifact_call_replacement, content)


with open(file_path, "w") as f:
    f.write(content)
