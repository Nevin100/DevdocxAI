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

// Chat
export const chat = {
  ask: (repoId: string, query: string) =>
    request<{ chat_response: string }>("/chat/ask", {
      method: "POST",
      body: JSON.stringify({ repo_id: repoId, chat_query: query }),
    }),
};

// HITL Review :
export const review = {
  submit: (threadId: string, reviewStatus: "approved" | "rejected", devNotes: string) =>
    request<{ status: string }>("/pipeline/review", {
      method: "POST",
      body: JSON.stringify({
        thread_id: threadId,
        review_status: reviewStatus,
        dev_notes: devNotes,
      }),
    }),
};
