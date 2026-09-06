/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { pipeline, type PipelineState } from "@/src/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  const [state, setState] = useState<PipelineState | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!threadId) {
      setError("No pipeline execution thread specified. Return to dashboard to select a run.");
      setLoading(false);
      return;
    }

    pipeline
      .getState(threadId)
      .then(setState)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load pipeline context."))
      .finally(() => setLoading(false));
  }, [threadId]);

  async function handleDecision(d: "approved" | "rejected") {
    if (!threadId || status === "sending") return;
    setDecision(d);
    setStatus("sending");
    try {
      await pipeline.review(threadId, d, notes);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit checkpoint review.");
      setStatus("idle");
    }
  }

  const docs = state?.generated_docs ?? [];
  const active = docs[activeIdx];

  const docStats = useMemo(() => {
    if (!active?.content) return { lines: 0, words: 0 };
    return {
      lines: active.content.split("\n").length,
      words: active.content.trim().split(/\s+/).length,
    };
  }, [active]);

  const handleCopy = async () => {
    if (!active?.content) return;
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-bg text-ink selection:bg-teal/20 selection:text-teal">
      {/* Top Engineering App Bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-85">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
              </span>
              <span className="font-display text-sm font-bold tracking-tight">DevDocAI</span>
            </Link>

            <span className="hidden text-xs text-muted sm:inline">/</span>
            <div className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted sm:flex">
              <span>thread:</span>
              <span className="font-semibold text-teal truncate max-w-[140px]">{threadId ?? "none"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {state && !loading && status !== "done" && (
              <div className="flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
                </span>
                <span className="font-mono text-xs font-semibold text-amber">HITL Checkpoint: Paused for Human Review</span>
              </div>
            )}

            <Link
              href="/dashboard"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-teal/40 hover:text-ink"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
        {/* Loading Screen */}
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
              <Spinner className="h-6 w-6 text-teal" />
            </div>
            <p className="mt-4 font-display text-base font-semibold text-ink">Reconstructing pipeline AST state...</p>
            <p className="mt-1 font-mono text-xs text-muted">Polling thread checkpoint from LangGraph backend</p>
          </div>
        )}

        {/* Error Screen */}
        {!loading && error && (
          <div className="mx-auto my-auto max-w-md rounded-2xl border border-rose-500/30 bg-surface p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              ✕
            </div>
            <h2 className="font-display text-lg font-bold text-ink">Unable to Load Review State</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">{error}</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-teal px-5 py-2.5 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
            >
              Return to Repositories
            </Link>
          </div>
        )}

        {/* Action Completed Status */}
        {!loading && !error && status === "done" && (
          <div className="mx-auto my-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl ${
                decision === "approved"
                  ? "border-teal/30 bg-teal/10 text-teal"
                  : "border-amber/30 bg-amber/10 text-amber"
              }`}
            >
              {decision === "approved" ? "✓" : "↺"}
            </div>
            <h2 className="font-display text-xl font-bold text-ink">
              {decision === "approved" ? "Documentation Approved & Queued" : "Rewrite Dispatched to Generator"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
              {decision === "approved"
                ? "AST symbols, markdown manifests, and OpenAPI schemas have been authorized for git sync."
                : "Your targeted critique notes have been piped back into the multi-agent graph for an iterative rewrite."}
            </p>
          </div>
        )}

        {/* Empty Docs State */}
        {!loading && !error && status !== "done" && docs.length === 0 && (
          <div className="mx-auto my-auto max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted">
              ℹ
            </div>
            <h2 className="font-display text-base font-semibold text-ink">Zero Documentation Files Available</h2>
            <p className="mt-1 text-xs text-muted">
              The pipeline is currently parked at step:{" "}
              <span className="font-mono text-teal">{state?.current_step ?? "unknown"}</span>
            </p>
          </div>
        )}

        {/* Interactive Workspace Area */}
        {!loading && !error && status !== "done" && docs.length > 0 && (
          <div className="flex flex-1 flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  Documentation Review Gate
                </h1>
                <p className="mt-1 text-xs text-muted">
                  Inspect generated module specifications. Approve to commit, or reject with architectural notes to regenerate.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-teal font-semibold">
                  {docs.length} File{docs.length > 1 ? "s" : ""}
                </span>
                <span>ready for deployment</span>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
              {/* Left Explorer Panel */}
              <aside className="flex flex-col rounded-2xl border border-border bg-surface/70 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-bg/50 px-4 py-3">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Indexed Modules
                  </span>
                  <span className="font-mono text-[10px] text-muted-2">
                    {activeIdx + 1} of {docs.length}
                  </span>
                </div>

                <div className="flex max-h-[500px] flex-row gap-1.5 overflow-x-auto p-2 lg:max-h-[calc(100vh-260px)] lg:flex-col lg:overflow-y-auto">
                  {docs.map((doc, i) => {
                    const isSelected = i === activeIdx;
                    return (
                      <button
                        key={doc.file_path}
                        onClick={() => setActiveIdx(i)}
                        className={`group flex shrink-0 items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                          isSelected
                            ? "border-teal bg-teal/10 shadow-sm"
                            : "border-transparent text-muted hover:border-border hover:bg-surface-2 hover:text-ink"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p
                            className={`truncate font-mono text-xs ${
                              isSelected ? "font-semibold text-teal" : "text-ink group-hover:text-teal"
                            }`}
                          >
                            {doc.file_path}
                          </p>
                          <span className="font-mono text-[10px] text-muted-2">
                            {doc.module_name || "module"}
                          </span>
                        </div>
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isSelected ? "bg-teal" : "bg-border group-hover:bg-muted-2"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Right Content & Decision Column */}
              <section className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
                {/* File Header Tab */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/50 px-5 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-surface font-mono text-[11px] text-teal font-semibold">
                      MD
                    </span>
                    <span className="truncate font-mono text-xs font-semibold text-ink">
                      {active?.file_path}
                    </span>
                    <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
                      {docStats.lines} lines · {docStats.words} words
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border bg-surface p-0.5 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setViewMode("rendered")}
                        className={`rounded-md px-2.5 py-1 transition ${
                          viewMode === "rendered" ? "bg-teal text-bg font-semibold" : "text-muted hover:text-ink"
                        }`}
                      >
                        Rendered
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("raw")}
                        className={`rounded-md px-2.5 py-1 transition ${
                          viewMode === "raw" ? "bg-teal text-bg font-semibold" : "text-muted hover:text-ink"
                        }`}
                      >
                        Source
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted transition hover:border-teal hover:text-ink active:scale-95"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Document Previewer */}
                <div className="relative min-h-[380px] max-h-[520px] flex-1 overflow-y-auto p-6 scroll-smooth bg-surface/50">
                  {viewMode === "rendered" ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none break-words leading-relaxed
                      prose-headings:font-display prose-headings:text-ink
                      prose-code:rounded prose-code:bg-bg/90 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-teal
                      prose-pre:border prose-pre:border-border prose-pre:bg-bg prose-pre:p-4
                      prose-strong:text-ink prose-a:text-teal prose-a:underline hover:prose-a:opacity-80"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="my-3 w-full overflow-x-auto rounded-lg border border-border bg-bg/50">
                              <table className="min-w-full divide-y divide-border text-xs text-left">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="bg-bg px-3 py-2 font-semibold text-muted">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="px-3 py-2 border-t border-border/50">{children}</td>
                          ),
                        }}
                      >
                        {active?.content || "*No documentation content generated.*"}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted bg-bg/70 p-4 rounded-xl border border-border">
                      {active?.content}
                    </pre>
                  )}
                </div>

                {/* Human-In-The-Loop Decision Deck */}
                <div className="border-t border-border bg-bg/60 p-5 sm:p-6">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="feedback-notes" className="text-xs font-semibold text-ink">
                        Reviewer Feedback Notes
                      </label>
                      <span className="font-mono text-[11px] text-muted-2">
                        Required only if rejecting for regeneration
                      </span>
                    </div>
                    <textarea
                      id="feedback-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Include request body schema for /api/v1/auth, clarify PostgreSQL connection pool limits..."
                      className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-muted/50 focus:border-teal focus:ring-1 focus:ring-teal/30"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleDecision("rejected")}
                      disabled={status === "sending"}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-amber transition hover:border-amber/60 hover:bg-amber/5 active:scale-[0.99] disabled:opacity-50"
                    >
                      {status === "sending" && decision === "rejected" ? (
                        <>
                          <Spinner className="mr-2 h-3.5 w-3.5 text-amber" />
                          <span>Dispatching Rewrite...</span>
                        </>
                      ) : (
                        "↺ Reject & Regenerate"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision("approved")}
                      disabled={status === "sending"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal px-6 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                    >
                      {status === "sending" && decision === "approved" ? (
                        <>
                          <Spinner className="h-3.5 w-3.5 text-bg" />
                          <span>Finalizing & Publishing...</span>
                        </>
                      ) : (
                        <>
                          <span>✓ Approve & Publish All ({docs.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}