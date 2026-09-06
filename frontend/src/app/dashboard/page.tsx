/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, repos, type Repo, type GithubRepo } from "@/src/lib/api";
import PipelineLoader from "@/src/components/PipelineLoader";

const STATUS_STYLE: Record<
  string,
  { dot: string; label: string; text: string; badgeBg: string; ring: string }
> = {
  connected: {
    dot: "bg-muted-2",
    label: "Connected",
    text: "text-muted",
    badgeBg: "bg-surface-2/60 border-border",
    ring: "border-border",
  },
  parsing: {
    dot: "bg-amber-400 animate-pulse",
    label: "Parsing docs",
    text: "text-amber-400",
    badgeBg: "bg-amber-400/10 border-amber-400/20",
    ring: "border-amber-400/30 ring-1 ring-amber-400/20",
  },
  completed: {
    dot: "bg-teal",
    label: "Docs live",
    text: "text-teal",
    badgeBg: "bg-teal/10 border-teal/20",
    ring: "border-teal/30 ring-1 ring-teal/15",
  },
  failed: {
    dot: "bg-rose-400",
    label: "Sync failed",
    text: "text-rose-400",
    badgeBg: "bg-rose-400/10 border-rose-400/20",
    ring: "border-rose-400/30 ring-1 ring-rose-400/20",
  },
};

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
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
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/60 p-5 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-surface-2" />
            <div className="h-4 w-36 rounded-md bg-surface-2" />
          </div>
          <div className="h-5 w-20 rounded-full bg-surface-2" />
        </div>
        <div className="h-3 w-48 rounded bg-surface-2" />
      </div>
      <div className="mt-6 flex gap-2">
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-surface-2" />
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

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [ghSearchQuery, setGhSearchQuery] = useState("");

  // Modal & Action states
  const [showPicker, setShowPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadRepos() {
    try {
      const data = await repos.list();
      setMyRepos(data || []);
    } catch (err) {
      console.error("Failed to load user repositories:", err);
    }
  }

  useEffect(() => {
    let mounted = true;

    auth
      .me()
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => router.push("/login"));

    loadRepos().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  async function refreshDashboard() {
    setRefreshing(true);
    await loadRepos();
    setRefreshing(false);
  }

  async function openPicker() {
    setShowPicker(true);
    setPickerLoading(true);
    setGhSearchQuery("");
    try {
      const data = await repos.githubList();
      setGithubRepos(data.repos || []);
    } catch (err) {
      console.error("Failed to fetch GitHub repos:", err);
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

  // Filtered lists
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return myRepos;
    return myRepos.filter((r) =>
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myRepos, searchQuery]);

  const filteredGhRepos = useMemo(() => {
    if (!ghSearchQuery.trim()) return githubRepos;
    return githubRepos.filter((r) =>
      r.full_name.toLowerCase().includes(ghSearchQuery.toLowerCase())
    );
  }, [githubRepos, ghSearchQuery]);

  return (
    <main className="min-h-screen bg-bg text-ink selection:bg-teal/20 selection:text-teal">
      {/* Structural Metadata for Web Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "DevDocAI Codebase Documentation Hub",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Cloud",
            description:
              "Automated living documentation, architectural diagrams, and intelligent onboarding assistant for GitHub repositories.",
          }),
        }}
      />

      {/* Primary Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition hover:opacity-85"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
              </span>
              <span className="font-display text-base font-bold tracking-tight">
                DevDocAI
              </span>
            </Link>

            <nav
              aria-label="Dashboard Breadcrumbs"
              className="hidden items-center gap-2 text-xs font-medium text-muted sm:flex"
            >
              <span>/</span>
              <span className="text-ink">Repositories Overview</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="hidden rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-teal/40 hover:text-ink sm:inline-flex"
            >
              Ask Chatbot
            </Link>

            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface/90 py-1 pl-1.5 pr-3 shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal">
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate font-mono text-xs text-muted sm:max-w-none">
                  {user.github_username ?? user.email}
                </span>
              </div>
            ) : (
              <div className="h-7 w-28 animate-pulse rounded-full bg-surface-2" />
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Header Title & Actions Deck */}
        <section className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Connected Repositories
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              Continuous documentation engine synchronized with your Git branches.
              DevDocAI tracks pull requests and recalculates architecture graphs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:self-auto">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={refreshing}
              aria-label="Refresh repository states"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-teal/40 hover:text-ink disabled:opacity-50"
              title="Refresh repository states"
            >
              <Spinner className={refreshing ? "h-3.5 w-3.5 text-teal" : "hidden"} />
              {!refreshing && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={openPicker}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-teal px-4 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              <span className="text-sm leading-none">+</span>
              <span>Connect Repo</span>
            </button>
          </div>
        </section>

        {/* Search Bar filter */}
        {myRepos.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connected repos..."
                className="w-full rounded-xl border border-border bg-surface/80 px-3.5 py-2 pl-9 text-xs text-ink outline-none transition focus:border-teal/60 focus:ring-1 focus:ring-teal/30 placeholder:text-muted/60"
              />
              <svg
                className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <span className="text-xs font-mono text-muted">
              {filteredRepos.length} of {myRepos.length} indexed
            </span>
          </div>
        )}

        {/* Repository Grid Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RepoCardSkeleton />
            <RepoCardSkeleton />
            <RepoCardSkeleton />
          </div>
        ) : myRepos.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center transition hover:border-teal/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-teal">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-base font-semibold text-ink">
              No repositories connected yet
            </h2>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
              Integrate your GitHub codebase to automatically extract component
              trees, AST dependencies, and interactive docs.
            </p>
            <button
              onClick={openPicker}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
            >
              Select GitHub Repository
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo) => {
              const style = STATUS_STYLE[repo.status] ?? STATUS_STYLE.connected;
              const isReviewLoading = reviewLoadingId === repo.id;

              return (
                <article
                  key={repo.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-surface/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.ring}`}
                >
                  {/* Top Details */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-bg font-mono text-xs font-semibold text-muted">
                          {"</>"}
                        </span>
                        <div className="min-w-0">
                          <h2
                            title={repo.full_name}
                            className="truncate font-mono text-xs font-semibold text-ink transition group-hover:text-teal"
                          >
                            {repo.full_name}
                          </h2>
                          <span className="font-mono text-[10px] text-muted">
                            branch: {repo.default_branch || "main"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 ${style.badgeBg}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        <span className={`text-[10px] font-semibold ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border/50 pt-3">
                      <p className="text-[11px] text-muted">
                        {repo.last_parsed_at
                          ? `Updated ${new Date(repo.last_parsed_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "Awaiting initial sync"}
                      </p>
                    </div>
                  </div>

                  {/* Primary Call to Action buttons */}
                  <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                    {repo.last_parsed_at ? (
                      <button
                        onClick={async () => {
                          setReviewLoadingId(repo.id);
                          try {
                            const { thread_id } = await repos.latestThread(repo.id);
                            router.push(`/review?thread=${thread_id}`);
                          } catch {
                            alert("Could not load latest run session.");
                            setReviewLoadingId(null);
                          }
                        }}
                        disabled={isReviewLoading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 text-xs font-semibold text-ink transition hover:border-teal/40 hover:bg-teal/5 active:scale-95 disabled:opacity-60"
                      >
                        {isReviewLoading && <Spinner className="h-3 w-3 text-teal" />}
                        <span>Review Docs</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setRunningRepoName(repo.full_name);
                          try {
                            const { thread_id } = await repos.run(repo.id);
                            router.push(`/review?thread=${thread_id}`);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Run failed");
                            setRunningRepoName(null);
                          }
                        }}
                        className="flex-1 rounded-xl bg-teal py-2 text-center text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
                      >
                        Trigger Pipeline
                      </button>
                    )}

                    <Link
                      href={`/chat?repo=${repo.id}`}
                      className="flex-1 rounded-xl border border-border bg-surface py-2 text-center text-xs font-semibold text-ink transition hover:border-teal/40 hover:bg-surface-2 active:scale-95"
                    >
                      Ask Chatbot
                    </Link>
                  </div>
                </article>
              );
            })}

            {/* Ghost Add Card */}
            <button
              onClick={openPicker}
              className="group flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-surface/30 p-5 text-xs text-muted transition hover:border-teal/50 hover:bg-surface active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-base text-muted transition group-hover:border-teal/40 group-hover:text-teal">
                +
              </span>
              <span className="font-medium text-ink">Connect another repo</span>
              <span className="text-[10px] text-muted">Public or private GitHub</span>
            </button>
          </div>
        )}
      </div>

      {/* GitHub Repo Selection Modal */}
      {showPicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-4 backdrop-blur-sm"
          onClick={() => setShowPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 id="modal-title" className="font-display text-base font-bold text-ink">
                  Connect GitHub Repository
                </h2>
                <p className="text-[11px] text-muted">
                  Choose an authorized repository to generate automated documentation.
                </p>
              </div>

              <button
                onClick={() => setShowPicker(false)}
                aria-label="Close modal"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Quick Repo Search Filter inside Modal */}
            <div className="border-b border-border/60 bg-bg/40 px-5 py-3">
              <input
                type="text"
                value={ghSearchQuery}
                onChange={(e) => setGhSearchQuery(e.target.value)}
                placeholder="Filter repositories..."
                className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none transition focus:border-teal/60 focus:ring-1 focus:ring-teal/30 placeholder:text-muted/60"
              />
            </div>

            {/* Modal Body List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Spinner className="h-6 w-6 text-teal" />
                  <p className="font-mono text-xs text-muted">
                    Fetching repositories from GitHub...
                  </p>
                </div>
              ) : filteredGhRepos.length === 0 ? (
                <p className="py-10 text-center font-mono text-xs text-muted">
                  No matching repositories found.
                </p>
              ) : (
                filteredGhRepos.map((gh) => {
                  const isConnecting = connecting === gh.github_repo_id;
                  return (
                    <button
                      key={gh.github_repo_id}
                      onClick={() => connectRepo(gh)}
                      disabled={isConnecting}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-surface/50 p-3 text-left transition hover:border-teal/50 hover:bg-teal/5 active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate font-mono text-xs font-semibold text-ink group-hover:text-teal">
                          {gh.full_name}
                        </p>
                        <span className="font-mono text-[10px] text-muted">
                          default: {gh.default_branch || "main"}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md border border-border/80 bg-bg px-2 py-0.5 text-[10px] font-mono text-muted">
                          {gh.private ? "Private" : "Public"}
                        </span>
                        {isConnecting ? (
                          <Spinner className="h-3.5 w-3.5 text-teal" />
                        ) : (
                          <span className="rounded-lg bg-teal/10 px-2 py-1 text-[11px] font-semibold text-teal opacity-0 group-hover:opacity-100 transition">
                            Connect
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Pipeline Execution Modal */}
      {runningRepoName && <PipelineLoader repoName={runningRepoName} />}
    </main>
  );
}