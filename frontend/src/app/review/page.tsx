"use client";

import Link from "next/link";
import { useState } from "react";
import { review } from "@/src/lib/api";

const SAMPLE_DOCS = [
  {
    file_path: "src/utils/parser.py",
    module_name: "utils.parser",
    content:
      "# Parser\n\nParses source files into an AST and extracts classes, functions,\nand imports for downstream doc generation.\n\n## Functions\n\n- parse_python_file(file_path, source_code) — walks the AST and returns\n  a structured dict of classes, functions and imports.",
  },
  {
    file_path: "src/services/auth_service.py",
    module_name: "services.auth_service",
    content:
      "# Auth Service\n\nHandles registration, login and GitHub OAuth token exchange.\nDelegates all queries to UserRepository — no raw SQL here.",
  },
];

export default function ReviewPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");
  const [threadId] = useState("sample-thread-id");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const active = SAMPLE_DOCS[activeIdx];

  async function handleDecision(decision: "approved" | "rejected") {
    setStatus("sending");
    try {
      await review.submit(threadId, decision, notes);
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-display text-lg font-semibold">DevDocAI</span>
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse-dot" />
            <span className="text-xs text-amber">Paused for review</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">Review generated docs</h1>
        <p className="mt-1 text-sm text-muted">
          Nothing publishes until you approve. Reject with notes to send it back for a rewrite.
        </p>

        {status === "done" ? (
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
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
            {/* File list */}
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SAMPLE_DOCS.map((doc, i) => (
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

            {/* Doc content + decision */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{active.module_name}</span>
              </div>

              <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
                {active.content}
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
                  placeholder="e.g. missing usage example for parse_python_file"
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