import { JulesActivity, JulesSession, JulesSource } from "../types";

let API_KEY = "";
const BASE_URL = "https://jules.googleapis.com/v1alpha";

export const setApiKey = (key: string) => {
  API_KEY = key;
};

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
  };
};

// --- Sources ---

export const listSources = async (): Promise<JulesSource[]> => {
  try {
    const res = await fetch(`${BASE_URL}/sources`, { headers: getHeaders() });

    if (res.status === 401) throw new Error("Invalid API Key");
    if (!res.ok) throw new Error("Failed to fetch sources");

    const data = await res.json();

    // Map API source format to UI convenience, handling potential snake_case
    return (data.sources || []).map((s: any) => {
      const repo = s.githubRepo || s.github_repo;
      return {
        ...s,
        githubRepo: repo,
        displayName: repo ? `${repo.owner}/${repo.repo}` : s.name.split('/').slice(-2).join('/')
      };
    });
  } catch (error) {
    console.error("listSources error:", error);
    throw error;
  }
};

// --- Sessions ---

export const listSessions = async (): Promise<JulesSession[]> => {
  try {
    const res = await fetch(`${BASE_URL}/sessions?pageSize=20`, { headers: getHeaders() });

    if (!res.ok) {
      // Allow failure gracefully for list
      console.warn("listSessions failed with status:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.sessions || []).map((s: any) => ({
      ...s,
      createTime: s.createTime || s.create_time,
      updateTime: s.updateTime || s.update_time,
      outputs: (s.outputs || []).map((o: any) => ({
        ...o,
        pullRequest: o.pullRequest || o.pull_request
      }))
    }));
  } catch (error) {
    console.error("listSessions network error:", error);
    return [];
  }
};

export interface CreateSessionOptions {
  requirePlanApproval?: boolean;
  startingBranch?: string;
}

export const createSession = async (
  prompt: string,
  sourceName: string,
  options?: CreateSessionOptions
): Promise<JulesSession> => {
  const payload = {
    prompt,
    requirePlanApproval: options?.requirePlanApproval ?? true,
    automationMode: "AUTO_CREATE_PR",
    sourceContext: {
      source: sourceName,
      githubRepoContext: {
        startingBranch: options?.startingBranch || "main"
      }
    }
  };

  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create session: ${err}`);
  }
  const data = await res.json();
  return {
    ...data,
    prompt: data.prompt || prompt,
    createTime: data.createTime || data.create_time,
    updateTime: data.updateTime || data.update_time,
    outputs: (data.outputs || []).map((o: any) => ({
      ...o,
      pullRequest: o.pullRequest || o.pull_request
    }))
  };
};

export const getSession = async (sessionId: string): Promise<JulesSession> => {
  const url = sessionId.startsWith('sessions/') ? `${BASE_URL}/${sessionId}` : `${BASE_URL}/sessions/${sessionId}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to get session");
  const data = await res.json();
  return {
    ...data,
    createTime: data.createTime || data.create_time,
    updateTime: data.updateTime || data.update_time,
    outputs: (data.outputs || []).map((o: any) => ({
      ...o,
      pullRequest: o.pullRequest || o.pull_request
    }))
  };
};

// --- Activities & Interaction ---

export const listActivities = async (sessionName: string): Promise<JulesActivity[]> => {
  try {
    const res = await fetch(`${BASE_URL}/${sessionName}/activities?pageSize=50`, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.activities || []).map((a: any) => ({
      ...a,
      id: a.id,
      originator: a.originator,
      description: a.description,
      createTime: a.createTime || a.create_time,
      userMessaged: a.userMessaged || a.user_messaged,
      userMessage: a.userMessage || a.user_message,
      agentMessaged: a.agentMessaged || a.agent_messaged,
      agentMessage: a.agentMessage || a.agent_message,
      planGenerated: a.planGenerated || a.plan_generated,
      planApproved: a.planApproved || a.plan_approved,
      progressUpdated: a.progressUpdated || a.progress_updated,
      sessionCompleted: a.sessionCompleted || a.session_completed,
      sessionFailed: a.sessionFailed || a.session_failed
    }));
  } catch (error) {
    console.warn("listActivities network error:", error);
    return [];
  }
};

export const sendMessage = async (sessionName: string, prompt: string) => {
  const res = await fetch(`${BASE_URL}/${sessionName}:sendMessage`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  // The API returns an empty 200 OK for sendMessage
  return true;
};

export const approvePlan = async (sessionName: string) => {
  const res = await fetch(`${BASE_URL}/${sessionName}:approvePlan`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({}), // Empty body
  });
  if (!res.ok) throw new Error("Failed to approve plan");
  // The API returns an empty 200 OK for approvePlan
  return true;
};