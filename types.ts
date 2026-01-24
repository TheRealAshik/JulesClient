import React from 'react';

export interface JulesSource {
    name: string; // "sources/github/owner/repo"
    displayName?: string; // helper for UI
    id?: string;
    githubRepo?: {
        owner: string;
        repo: string;
        isPrivate: boolean;
        defaultBranch: { displayName: string };
        branches?: Array<{ displayName: string }>;
    };
}

export interface JulesSession {
    name: string; // "sessions/{id}"
    id?: string;
    title: string;
    prompt: string;
    state: 'QUEUED' | 'PLANNING' | 'AWAITING_PLAN_APPROVAL' | 'AWAITING_USER_FEEDBACK' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED';
    createTime: string;
    updateTime: string;
    outputs?: Array<{
        pullRequest?: {
            url: string;
            title: string;
            description: string;
        }
    }>;
}

export interface Step {
    id?: string;
    index?: number;
    title: string;
    description: string;
}

export interface Plan {
    id?: string;
    steps: Step[];
    createTime?: string;
}

export interface JulesActivity {
    name: string; // "sessions/{id}/activities/{id}"
    id?: string;
    originator?: 'system' | 'agent' | 'user';
    description?: string;
    createTime: string;

    // Oneof fields
    userMessaged?: {
        prompt?: string;
        text?: string;
        message?: string;
        userMessage?: string;
        user_message?: string;
        content?: string;
        parts?: { text: string }[];
    } | string;
    userMessage?: {
        prompt?: string;
        text?: string;
        message?: string;
        userMessage?: string;
        user_message?: string;
        content?: string;
        parts?: { text: string }[];
    } | string;
    agentMessaged?: {
        text?: string;
        content?: string;
        agentMessage?: string;
        agent_message?: string;
        parts?: { text: string }[];
    } | string;
    agentMessage?: {
        text?: string;
        content?: string;
        agentMessage?: string;
        agent_message?: string;
        parts?: { text: string }[];
    } | string;
    planGenerated?: {
        plan: Plan;
    };
    planApproved?: {};
    sessionCompleted?: {};
    sessionFailed?: {
        reason?: string;
    };
    progressUpdated?: {
        status?: string;
        status_update?: string;
        title?: string;
        progress_title?: string;
        description?: string;
        progress_description?: string;
        text?: string;
        message?: string;
    };

    // Artifacts
    artifacts?: {
        media?: {
            mimeType: string;
            data: string;
        };
        bashOutput?: {
            command: string;
            output: string;
            exitCode: number;
        };
        changeSet?: {
            source?: string;
            gitPatch?: {
                baseCommitId?: string;
                unidiffPatch?: string;
                suggestedCommitMessage?: string;
            };
        };
    }[];
}

// UI specific types
export interface SuggestionCategory {
    id: string;
    label: string;
    icon: React.ReactNode;
}