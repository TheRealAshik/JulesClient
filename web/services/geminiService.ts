import { jules, JulesClient } from '@google/jules-sdk';
import {
  JulesActivity,
  JulesSession,
  JulesSource,
  AutomationMode,
  ListSourcesResponse,
  ListSessionsResponse,
  ListActivitiesResponse,
} from "../types";
import { PaginationSettings } from "../types/themeTypes";

export interface ListSourcesOptions {
  pageSize?: number;
  pageToken?: string;
}

export interface ListSessionsOptions {
  pageSize?: number;
  pageToken?: string;
}

export interface CreateSessionOptions {
  title?: string;
  requirePlanApproval?: boolean;
  startingBranch?: string;
  automationMode?: AutomationMode;
}

export interface ListActivitiesOptions {
  pageSize?: number;
  pageToken?: string;
  createTime?: string;
}

export class GeminiService {
  private apiKey: string;
  private paginationSettings: PaginationSettings;
  private readonly baseUrl = "https://jules.googleapis.com/v1alpha";
  public client: JulesClient;

  constructor(apiKey: string, paginationSettings?: PaginationSettings) {
    this.apiKey = apiKey;
    this.paginationSettings = paginationSettings || {
      autoPaginate: true,
      pageSize: 20
    };
    this.client = jules.with({ apiKey: this.apiKey });
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-goog-api-key": this.apiKey,
    };
  }

  // ==================== SOURCES ====================

  async listSources(options?: ListSourcesOptions): Promise<ListSourcesResponse> {
    try {
      // The SDK's iterator for sources does not natively expose a page token in the same way ListSessionsResponse does.
      // To strictly maintain the pagination contract for the UI without breaking `nextPageToken`,
      // we fall back to manual fetch for paginated `listSources` calls.
      const params = new URLSearchParams();
      params.append('pageSize', String(options?.pageSize ?? this.paginationSettings.pageSize));
      if (options?.pageToken) params.append('pageToken', options.pageToken);

      const queryString = params.toString();
      const url = `${this.baseUrl}/sources${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, { headers: this.getHeaders() });

      if (res.status === 401) throw new Error("Invalid API Key");
      if (!res.ok) throw new Error("Failed to fetch sources");

      const data = await res.json();
      const sources = (data.sources || []).map(mapSource);

      return {
        sources,
        nextPageToken: data.nextPageToken || data.next_page_token
      };
    } catch (error) {
      console.error("listSources error:", error);
      throw error;
    }
  }

  /**
   * Fetch all sources with automatic pagination
   */
  async listAllSources(): Promise<JulesSource[]> {
    const allSources: JulesSource[] = [];
    try {
      for await (const source of this.client.sources()) {
        allSources.push(mapSource(source));
      }
    } catch (error) {
       console.error("listAllSources error:", error);
    }
    return allSources;
  }

  async getSource(sourceName: string): Promise<JulesSource> {
    try {
      const cleanName = sourceName.replace('sources/github/', '').replace('sources/', '');
      const source = await this.client.sources.get({ github: cleanName });

      if (!source) throw new Error("Source not found");

      return mapSource(source);
    } catch (error) {
      console.error("getSource error:", error);
      throw error;
    }
  }

  // ==================== SESSIONS ====================

  async listSessions(options?: ListSessionsOptions): Promise<ListSessionsResponse> {
    try {
      const response = await this.client.sessions({
        pageSize: options?.pageSize ?? this.paginationSettings.pageSize,
        pageToken: options?.pageToken
      });

      return {
        sessions: response.sessions.map(s => mapSession(s)),
        nextPageToken: response.nextPageToken
      };
    } catch (error) {
      console.error("listSessions network error:", error);
      return { sessions: [], nextPageToken: undefined };
    }
  }

  /**
   * Fetch all sessions with automatic pagination
   */
  async listAllSessions(): Promise<JulesSession[]> {
    try {
        const sessions = await this.client.sessions().all();
        return sessions.map(s => mapSession(s));
    } catch (error) {
        console.error("listAllSessions error:", error);
        return [];
    }
  }

  async createSession(
    prompt: string,
    sourceName?: string,
    options?: CreateSessionOptions
  ): Promise<JulesSession> {
    const cleanSource = sourceName ? sourceName.replace('sources/github/', '').replace('sources/', '') : undefined;

    const config: any = { prompt };
    if (cleanSource) {
      config.source = {
          github: cleanSource,
          baseBranch: options?.startingBranch || "main"
      };
      config.requirePlanApproval = options?.requirePlanApproval ?? true;
    }

    if (options?.title) {
        config.title = options.title;
    }

    try {
      const sessionClient = await this.client.session(config);
      const sessionInfo = await sessionClient.info();
      return mapSession(sessionInfo, prompt);
    } catch (err: any) {
        throw new Error(`Failed to create session: ${err.message}`);
    }
  }

  async getSession(sessionId: string): Promise<JulesSession> {
    const cleanId = sessionId.replace('sessions/', '');
    try {
        const sessionClient = this.client.session(cleanId);
        const info = await sessionClient.info();
        return mapSession(info);
    } catch (error) {
        throw new Error("Failed to get session");
    }
  }

  // ==================== ACTIVITIES ====================

  async listActivities(
    sessionId: string,
    options?: ListActivitiesOptions
  ): Promise<ListActivitiesResponse> {
    const cleanId = sessionId.replace('sessions/', '');
    try {
        const response = await this.client.session(cleanId).activities.list({
            pageSize: options?.pageSize ?? this.paginationSettings.pageSize,
            pageToken: options?.pageToken
        });
        return {
            activities: response.activities.map(a => mapActivity(a)),
            nextPageToken: response.nextPageToken
        };
    } catch (error) {
      console.warn("listActivities network error:", error);
      return { activities: [], nextPageToken: undefined };
    }
  }

  /**
   * Fetch all activities for a session with automatic pagination
   */
  async listAllActivities(sessionId: string): Promise<JulesActivity[]> {
    const allActivities: JulesActivity[] = [];
    const cleanId = sessionId.replace('sessions/', '');
    try {
      const stream = this.client.session(cleanId).activities.history();
      for await (const a of stream) {
          allActivities.push(mapActivity(a));
      }
    } catch (error) {
        console.error("listAllActivities error", error);
    }
    return allActivities;
  }

  async getActivity(activityName: string): Promise<JulesActivity> {
    try {
      const parts = activityName.split('/');
      if (parts.length < 4 || parts[0] !== 'sessions' || parts[2] !== 'activities') {
        throw new Error(`Invalid activityName format: ${activityName}`);
      }

      const sessionId = parts[1];
      const activityId = parts[3];
      const activity = await this.client.session(sessionId).activities.get(activityId);
      return mapActivity(activity);
    } catch (error) {
      console.error("getActivity error:", error);
      throw error;
    }
  }

  async *streamActivities(sessionId: string): AsyncIterable<JulesActivity> {
      const cleanId = sessionId.replace('sessions/', '');
      const stream = this.client.session(cleanId).activities.stream();
      for await (const a of stream) {
          yield mapActivity(a);
      }
  }

  // ==================== SESSION ACTIONS ====================

  async sendMessage(sessionName: string, prompt: string): Promise<boolean> {
      const cleanId = sessionName.replace('sessions/', '');
      await this.client.session(cleanId).send(prompt);
      return true;
  }

  async approvePlan(sessionName: string, planId?: string): Promise<boolean> {
      const cleanId = sessionName.replace('sessions/', '');
      await this.client.session(cleanId).approve();
      return true;
  }

  async deleteSession(sessionName: string): Promise<boolean> {
    const url = sessionName.startsWith('sessions/')
      ? `${this.baseUrl}/${sessionName}`
      : `${this.baseUrl}/sessions/${sessionName}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to delete session: ${err}`);
    }

    return true;
  }

  async updateSession(sessionName: string, updates: Partial<JulesSession>, updateMask?: string[]): Promise<JulesSession> {
    const url = sessionName.startsWith('sessions/')
      ? `${this.baseUrl}/${sessionName}`
      : `${this.baseUrl}/sessions/${sessionName}`;

    const params = new URLSearchParams();
    if (updateMask) {
      params.append('updateMask', updateMask.join(','));
    }

    const res = await fetch(`${url}?${params.toString()}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to update session: ${err}`);
    }

    const data = await res.json();
    return mapSession(data);
  }
}

// Helpers

const mapSource = (s: any): JulesSource => {
    const repo = s.githubRepo || s.github_repo;
    return {
        ...s,
        id: s.id,
        name: s.name,
        githubRepo: repo ? {
            owner: repo.owner,
            repo: repo.repo,
            isPrivate: repo.isPrivate ?? repo.is_private ?? false,
            defaultBranch: repo.defaultBranch || repo.default_branch,
            branches: repo.branches || []
        } : undefined,
        displayName: repo ? `${repo.owner}/${repo.repo}` : s.name.split('/').slice(-2).join('/')
    };
};

const mapSession = (data: any, fallbackPrompt?: string): JulesSession => {
  return {
    ...data,
    state: data.state || 'QUEUED',
    prompt: data.prompt || fallbackPrompt || '',
    title: data.title,
    createTime: data.createTime || data.create_time || data.createdAt,
    updateTime: data.updateTime || data.update_time || data.updatedAt,
    sourceContext: data.sourceContext || data.source_context,
    automationMode: data.automationMode || data.automation_mode,
    requirePlanApproval: data.requirePlanApproval ?? data.require_plan_approval,
    outputs: (data.outputs || []).map((o: any) => ({
      ...o,
      pullRequest: o.pullRequest || o.pull_request ? {
        url: (o.pullRequest || o.pull_request)?.url,
        title: (o.pullRequest || o.pull_request)?.title,
        description: (o.pullRequest || o.pull_request)?.description,
        branch: (o.pullRequest || o.pull_request)?.branch
      } : undefined
    }))
  };
};

const mapActivity = (a: any): JulesActivity => {
  return {
    ...a,
    id: a.id,
    originator: a.originator,
    description: a.description,
    createTime: a.createTime || a.create_time || a.createdAt,
    userMessaged: a.type === 'userMessaged' ? { message: a.message } : (a.userMessaged || a.user_messaged),
    userMessage: a.userMessage || a.user_message,
    agentMessaged: a.type === 'agentMessaged' ? { message: a.message } : (a.agentMessaged || a.agent_messaged),
    agentMessage: a.agentMessage || a.agent_message,
    planGenerated: a.type === 'planGenerated' ? { plan: a.plan } : (a.planGenerated || a.plan_generated),
    planApproved: a.type === 'planApproved' ? { planId: a.planId } : (a.planApproved || a.plan_approved ? {
      planId: (a.planApproved || a.plan_approved)?.planId ||
        (a.planApproved || a.plan_approved)?.plan_id
    } : undefined),
    progressUpdated: a.type === 'progressUpdated' ? { title: a.title, description: a.description } : (a.progressUpdated || a.progress_updated),
    sessionCompleted: a.type === 'sessionCompleted' ? {} : (a.sessionCompleted || a.session_completed),
    sessionFailed: a.type === 'sessionFailed' ? { reason: a.reason } : (a.sessionFailed || a.session_failed ? {
      reason: (a.sessionFailed || a.session_failed)?.reason
    } : undefined),
    artifacts: a.artifacts
  };
};
