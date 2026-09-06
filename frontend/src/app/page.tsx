import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import PipelineStrip from "@/src/components/PipelineStrip";

const METRICS = [
  { value: "AST-Level", label: "Semantic parsing, no regex guessing" },
  { value: "0ms", label: "Human gate latency before release" },
  { value: "100%", label: "PR sync coverage via GitHub webhooks" },
];

const STEPS = [
  {
    step: "01",
    tag: "AUTH & WEBHOOKS",
    title: "Connect via GitHub App",
    body: "Grant targeted repository access. We register an event listener for main branch pushes and merged PRs.",
  },
  {
    step: "02",
    tag: "MULTI-AGENT ORCHESTRATION",
    title: "Deep tree traversal & context sync",
    body: "codebase_parser compiles call graphs and AST schemas. brave_researcher fetches external package changelogs and framework standards.",
  },
  {
    step: "03",
    tag: "HITL GATEWAY",
    title: "Inspect before merge",
    body: "The LangGraph thread yields at human_review. Inline diffs show you precisely what updated before updating your knowledge base.",
  },
  {
    step: "04",
    tag: "CONTINUOUS DELIVERY",
    title: "Evergreen documentation",
    body: "Markdown and OpenAPI manifests commit directly back into your /docs directory or sync to vector storage.",
  },
];

const STACK = [
  { name: "LangGraph", desc: "Cyclic multi-agent runtime" },
  { name: "FastAPI", desc: "Async Python gateway" },
  { name: "Groq", desc: "Sub-second LPU inference" },
  { name: "Qdrant", desc: "Dense/sparse vector index" },
  { name: "PostgreSQL", desc: "WAL checkpoints & audits" },
  { name: "MCP Protocol", desc: "IDE & external tool context" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg text-ink selection:bg-teal/25 selection:text-teal antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80">
        {/* Subtle engineering grid backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-teal">
              Engine v0.9
            </span>
            <span className="text-border">|</span>
            <span>Deterministic docs with HITL review</span>
          </div>

          {/* Heading */}
          <h1 className="mt-7 max-w-4xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.12]">
            Self-updating documentation, anchored directly in your code’s AST.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Stop asking engineers to update stale wikis. DevDocAI listens to PR merges,
            extracts syntactic symbols, and writes accurate technical architecture drafts.
            Nothing ships without manual approval.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              <span>Connect GitHub repo</span>
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              href="#pipeline"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-5 py-3 text-sm font-medium text-ink backdrop-blur-sm transition hover:border-muted-2 hover:bg-surface active:scale-95"
            >
              <span>Explore live pipeline trace</span>
              <span className="font-mono text-[11px] text-muted">↓</span>
            </Link>
          </div>

          {/* Spec Badges */}
          <div className="mt-14 grid grid-cols-1 gap-4 border-t border-border/70 pt-8 sm:grid-cols-3">
            {METRICS.map((item) => (
              <div key={item.value} className="flex flex-col">
                <span className="font-mono text-lg font-bold text-ink sm:text-xl">
                  {item.value}
                </span>
                <span className="mt-1 text-xs text-muted leading-relaxed">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Pipeline Showcase */}
          <div
            id="pipeline"
            className="mt-14 overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-border bg-bg/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted">
                  daemon: langgraph_worker_1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-2">EXECUTION POOL</span>
                <span className="flex items-center gap-1.5 rounded-md border border-teal/30 bg-teal/10 px-2 py-0.5 font-mono text-[11px] text-teal">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
                  listening
                </span>
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <PipelineStrip />
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Architecture / How it Works */}
      <section className="border-b border-border/80" id="how">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-teal">
              System Architecture
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Engineered for codebases that change every hour.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              A four-stage deterministic cycle that guarantees LLMs never invent
              endpoints, parameters, or behaviors that don’t exist in source.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface/50 p-6 transition duration-200 hover:border-muted-2 hover:bg-surface/80"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-teal">
                      {step.step}
                    </span>
                    <span className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] text-muted">
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
                <div className="mt-6 h-px w-full bg-border/40 transition group-hover:bg-teal/30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Primitives / Tech Stack */}
      <section className="border-b border-border/80 bg-surface/20">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-8 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                Zero Blackbox Magic
              </span>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">
                Built on inspectable infrastructure
              </h3>
            </div>
            <p className="font-mono text-xs text-muted-2">
              All agent events stream directly to your logs
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="flex flex-col rounded-xl border border-border bg-surface p-3.5"
              >
                <span className="font-mono text-xs font-semibold text-ink">
                  {item.name}
                </span>
                <span className="mt-1 text-[11px] leading-tight text-muted">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-teal">
            Immediate Setup
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Never explain the same auth middleware twice.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Point DevDocAI to your repository and receive comprehensive,
            syntax-checked docs in under 3 minutes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              <span>Get started with GitHub</span>
            </Link>
            <span className="font-mono text-xs text-muted-2">
              Free during public beta
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-mono font-semibold text-ink">DevDocAI</span>
            <span>— Open deterministic code doc platform</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>STATUS: ALL RUNNERS HEALTHY</span>
          </div>
        </div>
      </footer>
    </main>
  );
}