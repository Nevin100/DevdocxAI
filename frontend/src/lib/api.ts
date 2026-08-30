const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("devdocai_token");
}

export function setToken(token: string) {
  localStorage.setItem("devdocai_token", token);
}

export function clearToken() {
  localStorage.removeItem("devdocai_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Types 
export type Repo = {
  id: string;
  full_name: string;
  default_branch: string;
  status: string;
  last_parsed_at: string | null;
};

export type GithubRepo = {
  github_repo_id: string;
  full_name: string;
  default_branch: string;
  private: boolean;
  description: string | null;
  language: string | null;
};

export type PipelineState = {
  thread_id: string;
  current_step: string;
  review_status: string;
  generated_docs: { file_path: string; module_name: string; content: string }[];
  completed: boolean;
};

// Auth 
export const auth = {
  register: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ id: string; email: string; github_username: string | null }>(
      "/auth/me"
    ),

  githubUrl: () => request<{ url: string }>("/auth/github"),

  githubCallback: (code: string) =>
    request<{ access_token: string }>("/auth/github/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
};

// Repos 
export const repos = {
  list: () => request<Repo[]>("/repos"),

  githubList: () => request<{ repos: GithubRepo[]; error?: string }>("/github/repos"),

  connect: (body: { github_repo_id: string; full_name: string; default_branch: string }) =>
    request<Repo>("/repos/connect", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  run: (repoId: string) =>
    request<{ status: string; thread_id: string }>(`/repos/${repoId}/run`, {
      method: "POST",
    }),

  latestThread: (repoId: string) =>
    request<{ thread_id: string }>(`/repos/${repoId}/latest-thread`),
};

// Pipeline (HITL review) 
export const pipeline = {
  getState: (threadId: string) =>
    request<PipelineState>(`/pipeline/${threadId}/state`),

  review: (threadId: string, reviewStatus: "approved" | "rejected", devNotes: string) =>
    request<{ status: string; thread_id: string }>("/pipeline/review", {
      method: "POST",
      body: JSON.stringify({
        thread_id: threadId,
        review_status: reviewStatus,
        dev_notes: devNotes,
      }),
    }),
};

// Chat (onboarding chatbot) 
export const chat = {
  ask: (repoId: string, query: string) =>
    request<{ chat_response: string }>("/chat/ask", {
      method: "POST",
      body: JSON.stringify({ repo_id: repoId, chat_query: query }),
    }),
};