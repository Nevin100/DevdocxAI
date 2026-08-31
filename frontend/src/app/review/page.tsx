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
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);

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

  async function handleDecision(d: "approved" | "rejected") {
    if (!threadId) return;
    setDecision(d);
    setStatus("sending");
    try {
      await pipeline.review(threadId, d, notes);
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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-display text-base font-semibold">DevDocAI</span>
          </Link>
          {state && !loading && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse-dot" />
              <span className="text-xs text-amber">Awaiting your review</span>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" />
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal [animation-delay:0.4s]" />
            </div>
            <p className="mt-4 text-sm text-muted">Loading pipeline state...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto mt-16 max-w-md rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-amber">{error}</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-teal px-5 py-2 text-sm font-medium text-bg"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {/* Done */}
        {!loading && !error && status === "done" && (
          <div className="mx-auto mt-16 max-w-md rounded-xl border border-border bg-surface p-8 text-center">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                decision === "approved" ? "bg-teal/15 text-teal" : "bg-amber/15 text-amber"
              }`}
            >
              {decision === "approved" ? "✓" : "↺"}
            </div>
            <p className="font-display text-lg">
              {decision === "approved" ? "Docs approved" : "Sent back for a rewrite"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {decision === "approved"
                ? "Publishing to your docs store now."
                : "The generator will incorporate your notes and try again."}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-teal px-5 py-2 text-sm font-medium text-bg"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && status !== "done" && docs.length === 0 && (
          <div className="mx-auto mt-16 max-w-md rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              No docs generated yet — pipeline is at step{" "}
              <span className="font-mono text-ink">{state?.current_step}</span>
            </p>
          </div>
        )}

        {/* Main review UI */}
        {!loading && !error && status !== "done" && docs.length > 0 && (
          <>
            <div className="mb-6">
              <h1 className="font-display text-2xl font-semibold">Review generated docs</h1>
              <p className="mt-1 text-sm text-muted">
                {docs.length} file{docs.length !== 1 ? "s" : ""} documented. Approve to
                publish, or reject with notes to regenerate.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              {/* File list */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {docs.map((doc, i) => (
                  <button
                    key={doc.file_path}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 rounded-lg border px-3 py-2.5 text-left text-xs font-mono transition ${
                      i === activeIdx
                        ? "border-teal bg-teal/10 text-ink"
                        : "border-border text-muted hover:border-muted-2"
                    }`}
                  >
                    <span className="block truncate lg:whitespace-normal">{doc.file_path}</span>
                  </button>
                ))}
              </div>

              {/* Doc content */}
              <div className="flex flex-col rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <span className="font-mono text-xs text-muted">{active?.module_name}</span>
                  <span className="font-mono text-[11px] text-muted-2">
                    {activeIdx + 1} / {docs.length}
                  </span>
                </div>

                <div className="max-h-[420px] overflow-auto px-6 py-5">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
                    {active?.content}
                  </pre>
                </div>

                <div className="border-t border-border px-6 py-5">
                  <label htmlFor="notes" className="mb-1.5 block text-xs text-muted">
                    Notes <span className="text-muted-2">— used as feedback if rejected</span>
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. missing a usage example, wrong parameter description..."
                    className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                  />

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => handleDecision("approved")}
                      disabled={status === "sending"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal py-2.5 text-sm font-medium text-bg transition hover:bg-teal/90 disabled:opacity-60"
                    >
                      {status === "sending" && decision === "approved" ? (
                        "Publishing..."
                      ) : (
                        <>✓ Approve &amp; publish all {docs.length} files</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDecision("rejected")}
                      disabled={status === "sending"}
                      className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-ink transition hover:border-amber hover:text-amber disabled:opacity-60"
                    >
                      {status === "sending" && decision === "rejected"
                        ? "Sending back..."
                        : "Reject & regenerate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}