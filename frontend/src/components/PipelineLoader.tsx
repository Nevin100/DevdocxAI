"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { name: "codebase_parser", label: "Reading your code", color: "bg-teal" },
  { name: "doc_generator", label: "Writing documentation", color: "bg-violet" },
  { name: "brave_researcher", label: "Adding external context", color: "bg-violet" },
  { name: "human_review", label: "Ready for your review", color: "bg-amber" },
];

export default function PipelineLoader({ repoName }: { repoName: string }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Advance through stages on a rough timer — this is a best-effort visual,
  // not a real-time signal (the backend runs the pipeline synchronously
  // today, so we don't get live step updates until it's done).
  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 2));
    }, 4000);
    const clock = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      clearInterval(stageTimer);
      clearInterval(clock);
    };
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-xs text-muted">{repoName}</span>
          <span className="font-mono text-xs text-muted-2">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {STAGES.map((stage, i) => {
            const done = i < stageIdx;
            const active = i === stageIdx;
            return (
              <div key={stage.name} className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                    done ? "bg-teal" : active ? `${stage.color} animate-pulse-dot` : "bg-surface-2"
                  }`}
                />
                <div>
                  <p className={`text-sm ${active || done ? "text-ink" : "text-muted-2"}`}>
                    {stage.label}
                  </p>
                  {active && (
                    <p className="font-mono text-[11px] text-muted-2">{stage.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-2">
          Larger repos take longer — this can run a few minutes while every
          file gets parsed and documented. Don&apos;t close this tab.
        </p>
      </div>
    </div>
  );
}