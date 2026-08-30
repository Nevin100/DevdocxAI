/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pipeline, type PipelineState } from "@/src/lib/api";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  const [state, setState] = useState<PipelineState | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => {
    if (!threadId) {
      setError("No pipeline thread specified.");
      setLoading(false);
      return;
    }

    pipeline
      .getState(threadId)
      .then(setState)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load pipeline"))
      .finally(() => setLoading(false));
  }, [threadId]);

  async function handleDecision(decision: "approved" | "rejected") {
    if (!threadId) return;
    setStatus("sending");
    try {
      await pipeline.review(threadId, decision, notes);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setStatus("idle");
    }
  }

  const docs = state?.generated_docs ?? [];
  const active = docs[activeIdx];

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-display text-lg font-semibold">DevDocAI</span>
          </Link>
          {state && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse-dot" />
              <span className="text-xs text-amber">{state.current_step}</span>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">Review generated docs</h1>
        <p className="mt-1 text-sm text-muted">
          Nothing publishes until you approve. Reject with notes to send it back for a rewrite.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-muted">Loading pipeline state...</p>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-amber">{error}</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-teal px-5 py-2 text-sm font-medium text-bg"
            >
              Back to dashboard
            </Link>
          </div>
        ) : status === "done" ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
            <p className="font-display text-lg">Decision recorded</p>
            <p className="mt-1 text-sm text-muted">
              The pipeline has resumed. Head back to the dashboard to track progress.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-teal px-5 py-2 text-sm font-medium text-bg"
            >
              Back to dashboard
            </Link>
          </div>
        ) : docs.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              No docs generated yet for this run — still at step:{" "}
              <span className="font-mono text-ink">{state?.current_step}</span>
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {docs.map((doc, i) => (
                <button
                  key={doc.file_path}
                  onClick={() => setActiveIdx(i)}
                  className={`shrink-0 rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition ${
                    i === activeIdx
                      ? "border-teal bg-surface text-ink"
                      : "border-border text-muted hover:border-muted-2"
                  }`}
                >
                  {doc.file_path}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{active?.module_name}</span>
              </div>

              <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
                {active?.content}
              </pre>

              <div className="mt-6">
                <label htmlFor="notes" className="mb-1.5 block text-xs text-muted">
                  Notes (used as feedback if rejected)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. missing usage example"
                  className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleDecision("approved")}
                  disabled={status === "sending"}
                  className="flex-1 rounded-lg bg-teal py-2.5 text-sm font-medium text-bg transition hover:bg-teal/90 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : "Approve & publish"}
                </button>
                <button
                  onClick={() => handleDecision("rejected")}
                  disabled={status === "sending"}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-ink transition hover:border-amber hover:text-amber disabled:opacity-60"
                >
                  Reject & regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}