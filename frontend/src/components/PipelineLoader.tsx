/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";

interface Stage {
  name: string;
  label: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    name: "codebase_parser",
    label: "AST Extraction & Graph Indexing",
    detail: "Walking source files and extracting symbol signatures...",
  },
  {
    name: "doc_generator",
    label: "LLM Technical Synthesis",
    detail: "Drafting markdown docs with syntax and schema definitions...",
  },
  {
    name: "brave_researcher",
    label: "Context Verification",
    detail: "Cross-referencing package registries and external APIs...",
  },
  {
    name: "human_review",
    label: "HITL Checkpoint Finalization",
    detail: "Preparing interactive review diffs and live state...",
  },
];

export default function PipelineLoader({ repoName }: { repoName: string }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Progressive fake log feed tied to elapsed time
  const [activeLog, setActiveLog] = useState("Initializing worker thread...");

  useEffect(() => {
    // Stage increment intervals (gradual step sequence)
    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 2));
    }, 4500);

    const clock = setInterval(() => setElapsed((s) => s + 1), 1000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(clock);
    };
  }, []);

  // Update dynamic telemetry logs
  useEffect(() => {
    const logs = [
      `[worker] cloning shallow head of ${repoName}...`,
      `[parser] AST generated 14 modules. traversing call hierarchy...`,
      `[vector] embedding module interfaces into local context...`,
      `[llm:groq] generating comprehensive system architecture spec...`,
      `[checkpoint] pausing execution for human authorization...`,
    ];
    const logIdx = Math.min(Math.floor(elapsed / 3.5), logs.length - 1);
    setActiveLog(logs[logIdx]);
  }, [elapsed, repoName]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const progressPercent = useMemo(() => {
    return Math.min(10 + Math.round(((stageIdx + 1) / STAGES.length) * 80), 92);
  }, [stageIdx]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-4 backdrop-blur-md transition-all duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xl shadow-black/50 sm:p-7 p-5">
        {/* Subtle Ambient Radial Highlight */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal/10 blur-3xl" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="flex h-2 w-2 rounded-full bg-teal shadow-[0_0_8px_var(--tw-shadow-color)] shadow-teal" />
            <span className="truncate font-mono text-xs font-semibold text-ink">
              {repoName}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted shrink-0">
            <svg
              className="h-3.5 w-3.5 text-muted-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="relative my-6 space-y-5">
          {/* Continuous Vertical Trace Line */}
          <div className="absolute left-[13px] top-3 bottom-3 w-px bg-border/60" />

          {STAGES.map((stage, i) => {
            const isDone = i < stageIdx;
            const isActive = i === stageIdx;
            const isPending = i > stageIdx;

            return (
              <div key={stage.name} className="relative flex items-start gap-4">
                {/* Step Node Marker */}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-mono transition-all duration-300 ${
                    isDone
                      ? "border-teal bg-teal text-bg"
                      : isActive
                      ? "border-teal bg-surface text-teal ring-4 ring-teal/15"
                      : "border-border bg-bg text-muted"
                  }`}
                >
                  {isDone ? (
                    <svg
                      className="h-3.5 w-3.5 stroke-[2.5]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : isActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-2">{i + 1}</span>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold tracking-tight transition-colors ${
                        isActive
                          ? "text-ink"
                          : isDone
                          ? "text-ink/80"
                          : "text-muted-2"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <span className="font-mono text-[10px] text-muted-2">
                      {stage.name}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    {isActive
                      ? stage.detail
                      : isDone
                      ? "Completed successfully"
                      : "Queued"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Stream Terminal Box */}
        <div className="rounded-xl border border-border/80 bg-bg/90 p-3 shadow-inner">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-2 border-b border-border/40 pb-1.5 mb-2">
            <span>PIPELINE_TELEMETRY</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-teal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
            <span className="truncate">{activeLog}</span>
          </div>
        </div>

        {/* Bottom Safety Warning */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-amber"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="truncate">
            Parsing AST signatures. Keep this browser window open.
          </p>
        </div>
      </div>
    </div>
  );
}