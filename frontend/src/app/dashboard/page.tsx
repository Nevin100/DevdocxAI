/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, repos, type Repo, type GithubRepo } from "@/src/lib/api";
import PipelineLoader from "@/src/components/PipelineLoader";

const STATUS_STYLE: Record<
  string,
  { dot: string; label: string; text: string }
> = {
  connected: { dot: "bg-muted-2", label: "Connected", text: "text-muted" },
  parsing: {
    dot: "bg-amber animate-pulse-dot",
    label: "Parsing",
    text: "text-amber",
  },
  completed: { dot: "bg-teal", label: "Docs live", text: "text-teal" },
  failed: { dot: "bg-red-400", label: "Failed", text: "text-red-400" },
};

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
  const [connecting, setConnecting] = useState<string | null>(null);

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
    const data = await repos.githubList();
    setGithubRepos(data.repos || []);
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
            <span className="font-mono text-xs">{user?.email ?? "..."}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Repositories
            </h1>
            <p className="mt-1 text-sm text-muted">
              Connect a repo and DevDocAI keeps the docs current on every merge.
            </p>
          </div>
          <button
            onClick={openPicker}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-bg transition hover:bg-teal/90 sm:self-auto"
          >
            Connect repository
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : myRepos.length === 0 ? (
          <button
            onClick={openPicker}
            className="flex min-h-[148px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition hover:border-muted-2 hover:text-ink"
          >
            <span className="text-2xl">+</span>
            Connect your first repo
          </button>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myRepos.map((repo) => {
              const style = STATUS_STYLE[repo.status] ?? STATUS_STYLE.connected;
              return (
                <div
                  key={repo.id}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-sm text-ink">
                      {repo.full_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />
                      <span className={`text-xs ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-2">
                    {repo.last_parsed_at
                      ? `Last parsed ${new Date(repo.last_parsed_at).toLocaleString()}`
                      : "Waiting for first run"}
                  </p>

                  <div className="mt-5 flex gap-2">
                    {repo.last_parsed_at ? (
                      <button
                        onClick={async () => {
                          setRunningRepoName(repo.full_name);
                          try {
                            const { thread_id } = await repos.latestThread(
                              repo.id,
                            );
                            router.push(`/review?thread=${thread_id}`);
                          } catch {
                            alert(
                              "Could not find the latest run for this repo.",
                            );
                            setRunningRepoName(null);
                          }
                        }}
                        className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-muted-2"
                      >
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
                            alert(
                              err instanceof Error
                                ? err.message
                                : "Failed to run pipeline",
                            );
                              setRunningRepoName(null);
                          }
                        }}
                        className="flex-1 rounded-lg bg-teal py-2 text-center text-xs font-medium text-bg transition hover:bg-teal/90"
                      >
                        Run pipeline
                      </button>
                    )}
                    <Link
                      href={`/chat?repo=${repo.id}`}
                      className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-ink transition hover:border-muted-2"
                    >
                      Ask a question
                    </Link>
                  </div>
                </div>
              );
            })}

            <button
              onClick={openPicker}
              className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition hover:border-muted-2 hover:text-ink"
            >
              <span className="text-2xl">+</span>
              Connect another repo
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Pick a repository
              </h2>
              <button
                onClick={() => setShowPicker(false)}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {githubRepos.length === 0 ? (
              <p className="text-sm text-muted">Loading your GitHub repos...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {githubRepos.map((gh) => (
                  <button
                    key={gh.github_repo_id}
                    onClick={() => connectRepo(gh)}
                    disabled={connecting === gh.github_repo_id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left text-sm transition hover:border-teal disabled:opacity-50"
                  >
                    <span className="font-mono text-xs text-ink">
                      {gh.full_name}
                    </span>
                    <span className="text-xs text-muted-2">
                      {connecting === gh.github_repo_id
                        ? "Connecting..."
                        : gh.private
                          ? "Private"
                          : "Public"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {runningRepoName && <PipelineLoader repoName={runningRepoName} />}
    </main>
  );
}
