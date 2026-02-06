import { jules, JulesClientImpl, MemoryStorage, MemorySessionStorage } from '@google/jules-sdk';
import type {
    Platform
} from '@google/jules-sdk';
import {
  JulesActivity,
  JulesSession,
  JulesSource,
  AutomationMode,
  ListSourcesResponse,
  ListSessionsResponse,
  ListActivitiesResponse,
  PaginationSettings
} from "../types";

// ==================== BROWSER PLATFORM ====================

class BrowserPlatform {
    async fetch(input: RequestInfo | URL, init?: RequestInit) {
        // Use global fetch which works in both browser and Node (18+)
        const fetchFn = (typeof window !== 'undefined' && window.fetch)
            ? window.fetch.bind(window)
            : fetch;

        const res = await fetchFn(input, init);
        return {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            json: () => res.json(),
            text: () => res.text()
        };
    }

    getEnv(key: string) {
        // Support Vite env vars
        // @ts-ignore
        return import.meta.env?.[key] || import.meta.env?.[`VITE_${key}`] || (process.env as any)?.[key];
    }

    async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createDataUrl(data: string, mimeType: string) {
        return `data:${mimeType};base64,${data}`;
    }

    crypto = {
        randomUUID: () => crypto.randomUUID(),
        async sign(text: string, secret: string) {
             const enc = new TextEncoder();
             const key = await crypto.subtle.importKey(
                "raw", enc.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false, ["sign"]
             );
             const signature = await crypto.subtle.sign("HMAC", key, enc.encode(text));
             return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        },
        async verify(text: string, signature: string, secret: string) {
            const expected = await this.sign(text, secret);
            return expected === signature;
        }
    }

    encoding = {
        base64Encode: (text: string) => btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
        base64Decode: (text: string) => atob(text.replace(/-/g, '+').replace(/_/g, '/'))
    }

    async readFile(path: string) { throw new Error("File access not supported in browser"); }
    async writeFile(path: string, content: string) { console.warn("Write file ignored in browser", path); }
    async deleteFile(path: string) { console.warn("Delete file ignored in browser", path); }
    async saveFile(path: string, data: any) { console.warn("Save file ignored in browser", path); }
}

const storageFactory = {
    activity: (sessionId: string) => new MemoryStorage(),
    session: () => new MemorySessionStorage()
};

const platform = new BrowserPlatform();

// Initialize client with MemoryStorage
// We create a new client instead of using the default 'jules' export
let client = new JulesClientImpl({}, storageFactory, platform as any);

let storedKey = "";
const BASE_URL = "https://jules.googleapis.com/v1alpha";

let paginationSettings: PaginationSettings = {
  autoPaginate: true,
  pageSize: 20
};

export const setPaginationSettings = (settings: PaginationSettings) => {
  paginationSettings = settings;
};

export const setApiKey = (key: string) => {
  storedKey = key;
  // with() creates a new instance sharing the storage factory and platform
  client = client.with({ apiKey: key });
};

export const getApiKey = () => storedKey;

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": storedKey,
  };
};

// ==================== SOURCES ====================

export interface ListSourcesOptions {
  pageSize?: number;
  pageToken?: string;
}

const mapSource = (s: any): JulesSource => {
    const repo = s.githubRepo || s.github_repo;
    return {
        name: s.name,
        id: s.id,
        displayName: repo ? `${repo.owner}/${repo.repo}` : s.name?.split('/').slice(-2).join('/'),
        githubRepo: repo ? {
            owner: repo.owner,
            repo: repo.repo,
            isPrivate: repo.isPrivate ?? repo.is_private,
            defaultBranch: (repo.defaultBranch || repo.default_branch) ? { displayName: (repo.defaultBranch || repo.default_branch) } : undefined,
            branches: (repo.branches || []).map((b: any) => ({ displayName: b }))
        } : undefined
    };
};

export const listSources = async (options?: ListSourcesOptions): Promise<ListSourcesResponse> => {
    // App.tsx expects all sources mostly (no pagination UI).
    // We fetch all available sources via the iterator.
    const sources = await listAllSources();
    return {
        sources,
        nextPageToken: undefined
    };
};

export const listAllSources = async (): Promise<JulesSource[]> => {
    const sources: JulesSource[] = [];
    for await (const s of client.sources()) {
        sources.push(mapSource(s));
    }
    return sources;
};

export const getSource = async (sourceName: string): Promise<JulesSource> => {
    if (sourceName.includes('github')) {
        const parts = sourceName.split('github/');
        const repoSlug = parts[1];
        const source = await client.sources.get({ github: repoSlug });
        if (!source) throw new Error("Source not found");
        return mapSource(source);
    }

    // Fallback to fetch
    const url = sourceName.startsWith('sources/')
      ? `${BASE_URL}/${sourceName}`
      : `${BASE_URL}/sources/${sourceName}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch source");
    const data = await res.json();
    return mapSource(data);
};

// ==================== SESSIONS ====================

export interface ListSessionsOptions {
  pageSize?: number;
  pageToken?: string;
}

const mapSession = (data: any, fallbackPrompt?: string): JulesSession => {
    return {
        name: data.name,
        id: data.id,
        title: data.title,
        prompt: data.prompt || fallbackPrompt || '',
        state: data.state,
        createTime: data.createTime || data.createdAt,
        updateTime: data.updateTime || data.updatedAt,
        sourceContext: data.sourceContext || data.source_context,
        automationMode: data.automationMode || data.automation_mode,
        requirePlanApproval: data.requirePlanApproval ?? data.require_plan_approval,
        outputs: (data.outputs || []).map((o: any) => ({
             ...o,
             pullRequest: (o.pullRequest || o.pull_request) ? {
                 url: (o.pullRequest || o.pull_request).url,
                 title: (o.pullRequest || o.pull_request).title,
                 description: (o.pullRequest || o.pull_request).description,
                 branch: (o.pullRequest || o.pull_request).branch
             } : undefined
        }))
    };
};

export const listSessions = async (options?: ListSessionsOptions): Promise<ListSessionsResponse> => {
    const opts: any = {};
    if (options?.pageSize) opts.pageSize = options.pageSize;
    else opts.pageSize = paginationSettings.pageSize;

    if (options?.pageToken) opts.pageToken = options.pageToken;

    // Use SDK cursor to fetch page
    // @ts-ignore - Awaiting the cursor should return the page
    const page = await client.sessions(opts);

    return {
        sessions: (page.sessions || []).map((s: any) => mapSession(s)),
        nextPageToken: page.nextPageToken
    };
};

export const listAllSessions = async (): Promise<JulesSession[]> => {
    const all: JulesSession[] = [];
    for await (const s of client.sessions()) {
        all.push(mapSession(s));
    }
    return all;
};

export interface CreateSessionOptions {
  title?: string;
  requirePlanApproval?: boolean;
  startingBranch?: string;
  automationMode?: AutomationMode;
}

export const createSession = async (
  prompt: string,
  sourceName?: string,
  options?: CreateSessionOptions
): Promise<JulesSession> => {
    const config: any = { prompt };
    if (sourceName) {
        if (sourceName.includes('github')) {
             const parts = sourceName.split('github/');
             const [owner, repo] = parts[1].split('/');
             config.source = { github: `${owner}/${repo}` };
             if (options?.startingBranch) {
                 config.source.baseBranch = options.startingBranch;
             }
        } else {
             config.sourceContext = { source: sourceName };
        }

        if (options?.automationMode) config.automationMode = options.automationMode;
        if (options?.requirePlanApproval !== undefined) config.requirePlanApproval = options.requirePlanApproval;
    }
    if (options?.title) config.title = options.title;

    const sessionClient = await client.session(config);
    const info = await sessionClient.info();
    return mapSession(info, prompt);
};

export const getSession = async (sessionId: string): Promise<JulesSession> => {
    const id = sessionId.replace(/^sessions\//, '');
    const sessionClient = client.session(id);
    const info = await sessionClient.info();
    return mapSession(info);
};

// ==================== ACTIVITIES ====================

export interface ListActivitiesOptions {
  pageSize?: number;
  pageToken?: string;
  createTime?: string;
}

export const mapActivity = (a: any): JulesActivity => {
    return {
        name: a.name,
        id: a.id,
        originator: a.originator,
        description: a.description,
        createTime: a.createTime || a.createdAt,
        userMessaged: a.userMessaged || a.user_messaged,
        userMessage: a.userMessage || a.user_message,
        agentMessaged: a.agentMessaged || a.agent_messaged,
        agentMessage: a.agentMessage || a.agent_message,
        planGenerated: a.planGenerated || a.plan_generated,
        planApproved: a.planApproved || a.plan_approved,
        progressUpdated: a.progressUpdated || a.progress_updated,
        sessionCompleted: a.sessionCompleted || a.session_completed,
        sessionFailed: a.sessionFailed || a.session_failed,
        artifacts: a.artifacts
    };
};

export const listActivities = async (
  sessionId: string,
  options?: ListActivitiesOptions
): Promise<ListActivitiesResponse> => {
    const id = sessionId.replace(/^sessions\//, '');
    const sessionClient = client.session(id);
    const activities: JulesActivity[] = [];

    // Use history() which now uses MemoryStorage, so it should be fast and non-crashing.
    // However, for first call, it hydrates from network.
    for await (const a of sessionClient.history()) {
        const mapped = mapActivity(a);
        if (options?.createTime && mapped.createTime <= options.createTime) continue;
        activities.push(mapped);
    }
    return { activities, nextPageToken: undefined };
};

export const listAllActivities = async (sessionId: string): Promise<JulesActivity[]> => {
    const resp = await listActivities(sessionId);
    return resp.activities;
};

export const getActivity = async (activityName: string): Promise<JulesActivity> => {
    const url = activityName.startsWith('sessions/')
      ? `${BASE_URL}/${activityName}`
      : activityName;

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to get activity");

    const data = await res.json();
    return mapActivity(data);
};

// ==================== SESSION ACTIONS ====================

export const sendMessage = async (sessionName: string, prompt: string): Promise<boolean> => {
    const id = sessionName.replace(/^sessions\//, '');
    const sessionClient = client.session(id);
    await sessionClient.send(prompt);
    return true;
};

export const approvePlan = async (sessionName: string, planId?: string): Promise<boolean> => {
    const id = sessionName.replace(/^sessions\//, '');
    const sessionClient = client.session(id);
    await sessionClient.approve();
    return true;
};

export const deleteSession = async (sessionName: string): Promise<boolean> => {
  const url = sessionName.startsWith('sessions/')
    ? `${BASE_URL}/${sessionName}`
    : `${BASE_URL}/sessions/${sessionName}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete session: ${err}`);
  }

  return true;
};

export const updateSession = async (sessionName: string, updates: Partial<JulesSession>, updateMask?: string[]): Promise<JulesSession> => {
  const url = sessionName.startsWith('sessions/')
    ? `${BASE_URL}/${sessionName}`
    : `${BASE_URL}/sessions/${sessionName}`;

  const params = new URLSearchParams();
  if (updateMask) {
    params.append('updateMask', updateMask.join(','));
  }

  const res = await fetch(`${url}?${params.toString()}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update session: ${err}`);
  }

  const data = await res.json();
  return mapSession(data);
};

// ==================== STREAMING ====================

export const streamActivities = (sessionId: string) => {
    const id = sessionId.replace(/^sessions\//, '');
    const sessionClient = client.session(id);
    return sessionClient.stream();
};
