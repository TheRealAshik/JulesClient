import re

file_path = "composeApp/src/commonMain/kotlin/dev/therealashik/client/jules/ui/screens/SessionView.kt"

with open(file_path, "r") as f:
    content = f.read()

# Filter session outputs (PRs) based on selectedTabIndex
pr_pattern = r"(// Session Outputs \(PR Cards\)\n\s+session\.outputs\.forEach \{ output ->\n\s+val pr = output\.pullRequest\n\s+if \(pr != null\) \{\n\s+item \{\n\s+Spacer\(modifier = Modifier\.height\(JulesSpacing\.l\)\)\n\s+PullRequestCard\(pr\)\n\s+\}\n\s+\}\n\s+\})"
pr_replacement = r"""// Session Outputs (PR Cards)
                if (selectedTabIndex == 0) {
                    session.outputs.forEach { output ->
                        val pr = output.pullRequest
                        if (pr != null) {
                            item {
                                Spacer(modifier = Modifier.height(JulesSpacing.l))
                                PullRequestCard(pr)
                            }
                        }
                    }
                }"""

content = re.sub(pr_pattern, pr_replacement, content)

# Filter plan approval based on selectedTabIndex
plan_approval_pattern = r"(// Plan Approval Card \(Pinned to bottom of list if waiting\)\n\s+if \(session\.state == SessionState\.AWAITING_PLAN_APPROVAL\) \{\n\s+item \{\n\s+PlanApprovalCard\(onApprove = \{ onApprovePlan\(null\) \}\)\n\s+\}\n\s+\})"
plan_approval_replacement = r"""// Plan Approval Card (Pinned to bottom of list if waiting)
                if (session.state == SessionState.AWAITING_PLAN_APPROVAL && selectedTabIndex == 0) {
                    item {
                        PlanApprovalCard(onApprove = { onApprovePlan(null) })
                    }
                }"""

content = re.sub(plan_approval_pattern, plan_approval_replacement, content)


# Filter error based on selectedTabIndex
error_pattern = r"(// Error Display\n\s+if \(!error\.isNullOrBlank\(\)\) \{)"
error_replacement = r"""// Error Display
                if (!error.isNullOrBlank() && selectedTabIndex == 0) {"""

content = re.sub(error_pattern, error_replacement, content)

# Filter completion / failure based on selectedTabIndex
completion_pattern = r"(// Completion / Failure Status \(if no specific activity rendered it\)\n\s+if \(session\.state == SessionState\.COMPLETED\) \{)"
completion_replacement = r"""// Completion / Failure Status (if no specific activity rendered it)
                if (session.state == SessionState.COMPLETED && selectedTabIndex == 0) {"""

content = re.sub(completion_pattern, completion_replacement, content)

failure_pattern = r"(\} else if \(session\.state == SessionState\.FAILED\) \{)"
failure_replacement = r"""} else if (session.state == SessionState.FAILED && selectedTabIndex == 0) {"""

content = re.sub(failure_pattern, failure_replacement, content)

with open(file_path, "w") as f:
    f.write(content)
