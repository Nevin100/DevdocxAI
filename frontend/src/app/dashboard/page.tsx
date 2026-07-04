"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/lib/api";

type Repo = {
  id: string;
  full_name: string;
  status: "connected" | "parsing" | "completed" | "failed";
  last_parsed_at: string | null;
};

// TODO: replace with GET /repos once that endpoint exists on the backend.
const SAMPLE_REPOS: Repo[] = [
  { id: "1", full_name: "nevin100/devdocxai", status: "completed", last_parsed_at: "2 hours ago" },
  { id: "2", full_name: "nevin100/invoicer", status: "parsing", last_parsed_at: null },
];

const STATUS_STYLE: Record<Repo["status"], { dot: string; label: string; text: string }> = {
  connected: { dot: "bg-muted-2", label: "Connected", text: "text-muted" },
  parsing: { dot: "bg-amber animate-pulse-dot", label: "Parsing", text: "text-amber" },
  completed: { dot: "bg-teal", label: "Docs live", text: "text-teal" },
  failed: { dot: "bg-red-400", label: "Failed", text: "text-red-400" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; github_username: string | null } | null>(null);
  const [repos] = useState<Repo[]>(SAMPLE_REPOS);

  useEffect(() => {
    auth
      .me()
      .then(setUser)
      .catch(() => router.push("/login"));
  }, [router]);

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-display text-lg font-semibold">DevDocAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/chat" className="transition hover:text-ink">
              Chat
            </Link>
            <span className="font-mono text-xs">{user?.email ?? "..."}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-semibold">Repositories</h1>
            <p className="mt-1 text-sm text-muted">
              Connect a repo and DevDocAI keeps the docs current on every merge.
            </p>
          </div>
          <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-bg transition hover:bg-teal/90 sm:self-auto">
            Connect repository
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {repos.map((repo) => {
            const style = STATUS_STYLE[repo.status];
            return (
              <div
                key={repo.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm text-ink">{repo.full_name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    <span className={`text-xs ${style.text}`}>{style.label}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-2">
                  {repo.last_parsed_at
                    ? `Last parsed ${repo.last_parsed_at}`
                    : "Waiting for first run"}
                </p>

                <div className="mt-5 flex gap-2">
                  <Link
                    href="/review"
                    className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-muted-2"
                  >
                    Review docs
                  </Link>
                  <Link
                    href="/chat"
                    className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-muted-2"
                  >
                    Ask a question
                  </Link>
                </div>
              </div>
            );
          })}

          <button className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition hover:border-muted-2 hover:text-ink">
            <span className="text-2xl">+</span>
            Connect another repo
          </button>
        </div>
      </div>
    </main>
  );
}