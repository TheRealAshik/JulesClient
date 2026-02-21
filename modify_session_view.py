import os

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    lines = f.readlines()

new_lines = []
imported = False

# Add import
for line in lines:
    if line.startswith("import") and not imported:
        new_lines.append("import dev.therealashik.client.jules.ui.components.DiffView\n")
        imported = True
    new_lines.append(line)

lines = new_lines
new_lines = []

# Replace block
skip = False
for i, line in enumerate(lines):
    if 'if (language == "diff") {' in line:
        new_lines.append(line)
        new_lines.append("                        DiffView(content)\n")
        skip = True
        continue

    if skip:
        if '} else {' in line:
             skip = False
             new_lines.append(line)
        # If we are inside the diff block, we skip lines until we hit the else block.
        # But wait, the diff block ends with a closing brace BEFORE the else.
        # Original:
        # if (language == "diff") {
        #    Column { ... }
        # } else {

        # We want:
        # if (language == "diff") {
        #    DiffView(content)
        # } else {

        # So we need to detect the closing brace of the if block.
        pass
    else:
        new_lines.append(line)

# Let's retry the replacement logic more carefully.
# We know the exact structure from grep.
# 860:                    if (language == "diff") {
# 861-                        Column {
# ...
# 886-                        }
# 887-                    } else {

lines = new_lines # Updates with import
final_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if 'if (language == "diff") {' in line:
        final_lines.append(line)
        final_lines.append("                        DiffView(content)\n")
        # Now we need to skip the Column block up to the closing brace of the if block
        # The next line should be "                        Column {"
        # We skip until we see "} else {"? No, the closing brace of "if" is followed by " else {"

        # Let's look ahead.
        # We need to skip lines 861 to 886 (inclusive of 886 which is closing brace of Column).
        # And we need to emit the closing brace of the if block?
        # No, line 887 is "} else {".
        # So we skip lines until we see "} else {".
        # But wait, the "if" block has curly braces.
        # if (...) {
        #    Column { ... }
        # } else {

        # So we replace the content inside "if".
        # We emit "DiffView(content)\n"
        # Then we skip lines until "} else {".
        # Then we emit "} else {".

        i += 1
        while i < len(lines):
            if '} else {' in lines[i]:
                final_lines.append(lines[i])
                i += 1
                break
            i += 1
        continue

    final_lines.append(line)
    i += 1

with open(file_path, "w") as f:
    f.writelines(final_lines)
