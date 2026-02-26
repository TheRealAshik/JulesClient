package dev.therealashik.client.jules.model

import dev.therealashik.jules.sdk.model.AutomationMode

data class CreateSessionConfig(
    val title: String? = null,
    val requirePlanApproval: Boolean = true,
    val automationMode: AutomationMode = AutomationMode.AUTO_CREATE_PR,
    val startingBranch: String = "main"
)
