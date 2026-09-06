/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { name: "codebase_parser", color: "bg-teal text-teal border-teal/40", desc: "AST parse", icon: "{ }" },
  { name: "doc_generator", color: "bg-violet text-violet border-violet/40", desc: "LLM writes", icon: "AI" },
  { name: "brave_researcher", color: "bg-violet text-violet border-violet/40", desc: "enrich", icon: "🌐" },
  { name: "human_review", color: "bg-amber text-amber border-amber/40", desc: "you approve", icon: "HITL" },
  { name: "doc_publisher", color: "bg-teal text-teal border-teal/40", desc: "published", icon: "✓" },
];

export default function PipelineStrip() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % (STAGES.length + 1));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full overflow-x-auto py-3 scrollbar-none">
      <div className="flex min-w-[620px] items-center justify-between gap-2 sm:min-w-0">
        {STAGES.map((stage, i) => {
          const isDone = i < active;
          const isActive = i === active;
          const isPending = i > active;

          return (
            <div key={stage.name} className="flex flex-1 items-center">
              {/* Step Card Unit */}
              <div
                className={`relative flex flex-1 flex-col items-center rounded-xl border p-2.5 text-center transition-all duration-300 ${
                  isActive
                    ? "border-teal/50 bg-teal/5 shadow-md shadow-teal/10 scale-105 z-10"
                    : isDone
                    ? "border-border/80 bg-surface/70"
                    : "border-border/40 bg-surface/20 opacity-50"
                }`}
              >
                {/* Node Pill / Icon */}
                <div className="relative mb-2 flex items-center justify-center">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-mono font-bold transition-all duration-300 ${
                      isDone
                        ? "border-teal bg-teal text-bg shadow-sm"
                        : isActive
                        ? "border-teal bg-surface text-teal ring-4 ring-teal/20"
                        : "border-border bg-bg text-muted-2"
                    }`}
                  >
                    {isDone ? (
                      <svg className="h-3 w-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>

                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                    </span>
                  )}
                </div>

                {/* Module Identifiers */}
                <div
                  className={`font-mono text-[11px] font-semibold tracking-tight transition-colors duration-200 ${
                    isActive ? "text-ink" : isDone ? "text-ink/80" : "text-muted"
                  }`}
                >
                  {stage.name}
                </div>

                <div className="mt-0.5 font-mono text-[10px] text-muted-2">
                  {stage.desc}
                </div>
              </div>

              {/* Connecting Data Rail */}
              {i < STAGES.length - 1 && (
                <div className="relative mx-1.5 h-0.5 w-6 shrink-0 bg-border/60 sm:w-8">
                  {/* Dynamic Progress Indicator */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      i < active ? "bg-teal w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}