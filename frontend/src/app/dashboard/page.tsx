/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, repos, type Repo, type GithubRepo } from "@/src/lib/api";
import PipelineLoader from "@/src/components/PipelineLoader";

const STATUS_STYLE: Record<
  string,
  { dot: string; label: string; text: string, ring: string }
> = {
  connected: { dot: "bg-muted-2", label: "Connected", text: "text-muted", ring: "" },
  parsing: {
    dot: "bg-amber animate-pulse-dot",
    label: "Parsing",
    text: "text-amber",
    ring: "ring-1 ring-amber/20"
  },
  completed: { dot: "bg-teal", label: "Docs live", text: "text-teal", ring: "ring-1 ring-teal/15" },
  failed: { dot: "bg-red-400", label: "Failed", text: "text-red-400", ring: "ring-1 ring-red-400/20" },
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RepoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="h-4 w-40 rounded bg-surface-2" />
        <div className="h-4 w-16 rounded-full bg-surface-2" />
      </div>
      <div className="mt-3 h-3 w-28 rounded bg-surface-2" />
      <div className="mt-5 flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-surface-2" />
        <div className="h-8 flex-1 rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    github_username: string | null;
  } | null>(null);
  const [runningRepoName, setRunningRepoName] = useState<string | null>(null);
  const [myRepos, setMyRepos] = useState<Repo[]>([]);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);

  async function loadRepos() {
    const data = await repos.list();
    setMyRepos(data);
  }

  useEffect(() => {
    auth
      .me()
      .then(setUser)
      .catch(() => router.push("/login"));

    loadRepos().finally(() => setLoading(false));
  }, [router]);

  async function openPicker() {
    setShowPicker(true);
    setPickerLoading(true);
    try {
      const data = await repos.githubList();
      setGithubRepos(data.repos || []);
    } finally {
      setPickerLoading(false);
    }
  }

  async function connectRepo(gh: GithubRepo) {
    setConnecting(gh.github_repo_id);
    try {
      const connected = await repos.connect({
        github_repo_id: gh.github_repo_id,
        full_name: gh.full_name,
        default_branch: gh.default_branch,
      });
      setShowPicker(false);
      setRunningRepoName(connected.full_name);
      const { thread_id } = await repos.run(connected.id);
      router.push(`/review?thread=${thread_id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to connect repo");
      setConnecting(null);
      setRunningRepoName(null);
    }
  }

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
            {user ? (
              <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal">
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="font-mono text-xs">{user.email}</span>
              </span>
            ) : (
              <span className="h-7 w-32 animate-pulse rounded-full bg-surface-2" />
            )}
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
          <button
            onClick={openPicker}
            className="group flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-bg shadow-sm transition hover:-translate-y-0.5 hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 active:translate-y-0 sm:self-auto"
          >
            <span className="text-base leading-none transition group-hover:rotate-90">+</span>
            Connect repository
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <RepoCardSkeleton />
            <RepoCardSkeleton />
          </div>
        ) : myRepos.length === 0 ? (
          <button
            onClick={openPicker}
            className="group flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 text-sm text-muted transition hover:border-teal/40 hover:bg-surface hover:shadow-lg hover:shadow-black/20"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-xl text-muted-2 transition group-hover:border-teal/40 group-hover:text-teal">
              +
            </span>
            <div className="text-center">
              <p className="font-medium text-ink">Connect your first repo</p>
              <p className="mt-1 text-xs text-muted-2">
                Docs generate automatically once connected
              </p>
            </div>
          </button>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myRepos.map((repo) => {
              const style = STATUS_STYLE[repo.status] ?? STATUS_STYLE.connected;
              const isReviewLoading = reviewLoadingId === repo.id;
              return (
                <div
                  key={repo.id}
                  className={`group rounded-xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-muted-2 hover:shadow-lg hover:shadow-black/20 ${style.ring}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-xs text-muted-2">
                        {"</>"}
                      </span>
                      <span className="truncate font-mono text-sm text-ink">
                        {repo.full_name}
                      </span>
                    </div>
                    <div
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      <span className={`text-xs ${style.text}`}>{style.label}</span>
                    </div>
                  </div>

                  <p className="mt-3 pl-[42px] text-xs text-muted-2">
                    {repo.last_parsed_at
                      ? `Last parsed ${new Date(repo.last_parsed_at).toLocaleString()}`
                      : "Waiting for first run"}
                  </p>

                  <div className="mt-5 flex gap-2">
                    {repo.last_parsed_at ? (
                      <button
                        onClick={async () => {
                          setReviewLoadingId(repo.id);
                          try {
                            const { thread_id } = await repos.latestThread(repo.id);
                            router.push(`/review?thread=${thread_id}`);
                          } catch {
                            alert("Could not find the latest run for this repo.");
                            setReviewLoadingId(null);
                          }
                        }}
                        disabled={isReviewLoading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-teal/40 hover:bg-teal/5 hover:shadow-sm disabled:opacity-60"
                      >
                        {isReviewLoading && <Spinner className="h-3 w-3" />}
                        Review docs
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setRunningRepoName(repo.full_name);
                          try {
                            const { thread_id } = await repos.run(repo.id);
                            router.push(`/review?thread=${thread_id}`);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Failed to run pipeline");
                            setRunningRepoName(null);
                          }
                        }}
                        className="flex-1 rounded-lg bg-teal py-2 text-center text-xs font-medium text-bg transition hover:shadow-md hover:shadow-teal/20"
                      >
                        Run pipeline
                      </button>
                    )}
                    <Link
                      href={`/chat?repo=${repo.id}`}
                      className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-violet/40 hover:bg-violet/5 hover:shadow-sm"
                    >
                      Ask a question
                    </Link>
                  </div>
                </div>
              );
            })}

            <button
              onClick={openPicker}
              className="group flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition hover:border-teal/40 hover:bg-surface hover:shadow-lg hover:shadow-black/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-muted-2 transition group-hover:border-teal/40 group-hover:text-teal group-hover:rotate-90">
                +
              </span>
              Connect another repo
            </button>
          </div>
        )}
      </div>

      {/* Picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 px-6 backdrop-blur-md"
          onClick={() => setShowPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[70vh] w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold">Pick a repository</h2>
              <button
                onClick={() => setShowPicker(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(70vh-64px)] overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <Spinner className="h-5 w-5 text-teal" />
                  <p className="text-sm text-muted">Loading your GitHub repos...</p>
                </div>
              ) : githubRepos.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  No repos found on your GitHub account.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {githubRepos.map((gh) => {
                    const isConnecting = connecting === gh.github_repo_id;
                    return (
                      <button
                        key={gh.github_repo_id}
                        onClick={() => connectRepo(gh)}
                        disabled={isConnecting}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left text-sm transition hover:border-teal/50 hover:bg-teal/5 hover:shadow-sm disabled:opacity-60"
                      >
                        <span className="font-mono text-xs text-ink">{gh.full_name}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-2">
                          {isConnecting && <Spinner className="h-3 w-3 text-teal" />}
                          {isConnecting
                            ? "Connecting..."
                            : gh.private
                              ? "Private"
                              : "Public"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {runningRepoName && <PipelineLoader repoName={runningRepoName} />}
    </main>
  );
}