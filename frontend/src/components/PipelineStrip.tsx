"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { name: "codebase_parser", color: "bg-teal", desc: "AST parse" },
  { name: "doc_generator", color: "bg-violet", desc: "LLM writes" },
  { name: "brave_researcher", color: "bg-violet", desc: "enrich" },
  { name: "human_review", color: "bg-amber", desc: "you approve" },
  { name: "doc_publisher", color: "bg-teal", desc: "published" },
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
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[640px] items-center justify-between gap-1 sm:min-w-0">
        {STAGES.map((stage, i) => (
          <div key={stage.name} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  i <= active ? stage.color : "bg-surface-2"
                } ${i === active ? "animate-pulse-dot" : ""}`}
              />
              <div className="font-mono text-[11px] leading-tight text-muted">
                {stage.name}
              </div>
              <div className="text-[10px] leading-tight text-muted-2">
                {stage.desc}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className="mx-1 mt-[-24px] h-px flex-1 bg-border sm:mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}