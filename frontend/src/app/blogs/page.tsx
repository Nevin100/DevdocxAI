"use client";

import Link from "next/link";
import { useState } from "react";

interface BlogPost {
  part: string;
  title: string;
  tagline: string;
  url: string;
  platform: "devto" | "hashnode";
  status: "Published" | "In Progress";
  tags: string[];
}

const BLOG_SERIES: BlogPost[] = [
  {
    part: "Part 1",
    title: "Foundation: Backend, Auth, DB, GitHub OAuth, MCP",
    tagline: "Structuring FastAPI, async PostgreSQL, JWT crypto, and registering MCP tool servers for agents.",
    url: "https://dev.to/nevin100/building-devdocai-an-ai-that-writes-your-docs-part-1-foundation-5cjh",
    platform: "devto",
    status: "Published",
    tags: ["FastAPI", "PostgreSQL", "OAuth", "MCP"],
  },
  {
    part: "Part 2",
    title: "LangGraph Core + Agents + RAG",
    tagline: "AST codebase parser, Brave search enrichment, Qdrant vector index, and cyclic LangGraph state machines.",
    url: "https://dev.to/nevin100/-building-devdocai-an-ai-that-writes-your-docs-automatically-part-2-langgraph-core-agents--3j27",
    platform: "devto",
    status: "Published",
    tags: ["LangGraph", "Groq", "Qdrant", "RAG"],
  },
  {
    part: "Part 3",
    title: "Webhooks + Redis Cache",
    tagline: "Real-time GitHub PR merge listeners, event deduplication with Upstash Redis, and background runners.",
    url: "https://dev.to/nevin100/building-devdocai-a-production-multi-agent-langgraph-system-part-3-github-webhooks-redis-1mgk",
    platform: "devto",
    status: "Published",
    tags: ["Webhooks", "Redis", "Upstash", "AsyncIO"],
  },
  {
    part: "Part 4",
    title: "Closing Out Backend & Laying Down the Frontend",
    tagline: "Finalizing agent states, wiring Next.js dashboard, and establishing human-in-the-loop review screens.",
    url: "https://dev.to/nevin100/building-devdocai-a-production-multi-agent-langgraph-system-part-4-coming-back-closing-out-5aa9",
    platform: "devto",
    status: "Published",
    tags: ["Next.js", "Tailwind", "HITL", "Fullstack"],
  },
  {
    part: "Part 5",
    title: "Backend Closed Out, GitHub OAuth Working End-to-End",
    tagline: "End-to-end testing with real GitHub repos, auth persistence, token encryption, and edge case fixes.",
    url: "https://dev.to/nevin100/building-devdocai-a-production-multi-agent-langgraph-system-part-5-backend-closed-out-github-216o",
    platform: "devto",
    status: "Published",
    tags: ["OAuth2", "Security", "Production", "Docker"],
  },
];

const ROADMAP_PHASES = [
  { phase: "Phase 1", title: "Backend Foundation", desc: "FastAPI, PostgreSQL, AsyncPG, JWT & Fernet Crypto", status: "Done" },
  { phase: "Phase 2", title: "GitHub OAuth + MCP", desc: "OAuth Flow, token exchange, and LangGraph GitHub tools", status: "Done" },
  { phase: "Phase 3", title: "LangGraph Multi-Agent Core", desc: "State channels, pipeline edges, and HITL review checkpoints", status: "Done" },
  { phase: "Phase 4", title: "Agent Specialization", desc: "codebase_parser, doc_generator, brave_researcher, chatbot", status: "Done" },
  { phase: "Phase 5", title: "Webhooks & Redis Cache", desc: "pr_watcher webhook listeners & Upstash state caching", status: "Done" },
  { phase: "Phase 6", title: "Next.js UI & HITL Deck", desc: "Developer cockpit, live markdown viewer, chat onboarding", status: "Active" },
  { phase: "Phase 7", title: "AWS Deployment & CI/CD", desc: "ECR, ECS Fargate containers & GitHub Actions workflows", status: "Upcoming" },
];

export default function BuildInPublicPage() {
  const [copiedClone, setCopiedClone] = useState(false);

  const copyCloneCmd = () => {
    navigator.clipboard.writeText("git clone https://github.com/Nevin100/DevDocxAI.git");
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <main className="relative min-h-dvh bg-bg text-ink selection:bg-teal/20 selection:text-teal">
      {/* Structural Engineering Matrix Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-85">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            <span className="font-display text-base font-bold tracking-tight">DevDocAI</span>
            <span className="font-mono text-[11px] text-muted hidden sm:inline">/ build-in-public</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Nevin100/DevDocxAI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-teal/50 hover:text-teal"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              <span>GitHub Repo</span>
            </a>
            <Link
              href="/dashboard"
              className="rounded-xl bg-teal px-3.5 py-1.5 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Hero Section */}
        <section className="border-b border-border/80 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-mono text-teal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
            LIVE ENGINEERING LOGS
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:leading-[1.15]">
            Architected in the open. Documented word by word.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            Every architectural decision, LangGraph multi-agent loop, FastAPI endpoint, and HITL gate
            behind <strong>DevDocAI</strong> is written, benchmarked, and published publicly on Dev.to and Hashnode.
          </p>

          {/* Quick Creator / Profiles Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal/15 font-mono text-xs font-bold text-teal">
                NB
              </span>
              <div className="text-xs">
                <span className="font-semibold text-ink">Nevin Bali</span>
                <span className="text-muted-2"> (Lead Engineer)</span>
              </div>
            </div>

            <a
              href="https://github.com/Nevin100"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-teal/40 hover:text-ink"
            >
              <span>GitHub:</span>
              <span className="font-mono text-teal font-semibold">@Nevin100</span>
            </a>

            <a
              href="https://dev.to/nevin100"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-[#0a0a0a] hover:text-ink"
            >
              <span className="rounded bg-[#0a0a0a] px-1 text-[10px] font-bold text-white">DEV</span>
              <span className="font-mono text-ink">dev.to/nevin100</span>
            </a>

            <a
              href="https://hashnode.com/@Nevin100"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-blue-500/40 hover:text-ink"
            >
              <span className="rounded bg-blue-600 px-1 text-[10px] font-bold text-white">HN</span>
              <span className="font-mono text-ink">hashnode.com/@nevin100</span>
            </a>
          </div>

          {/* Clone Snippet */}
          <div className="mt-8 flex max-w-xl items-center justify-between rounded-xl border border-border bg-surface-2/40 p-2 pl-3 font-mono text-xs">
            <span className="text-muted truncate mr-2">git clone https://github.com/Nevin100/DevDocxAI.git</span>
            <button
              onClick={copyCloneCmd}
              className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-ink border border-border hover:border-teal/40 transition shrink-0"
            >
              {copiedClone ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </section>

        {/* Blog Chronology Section */}
        <section className="py-14 border-b border-border/80">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-teal">Dev.to & Hashnode Sync</span>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                The Engineering Build Series
              </h2>
            </div>
            <p className="font-mono text-xs text-muted-2">5 In-depth deep dives published</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_SERIES.map((blog) => (
              <a
                key={blog.part}
                href={blog.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-teal/50 hover:shadow-lg hover:shadow-teal/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-teal">
                      {blog.part}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-2 group-hover:text-teal transition">
                      <span>dev.to</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold leading-snug text-ink group-hover:text-teal transition">
                    {blog.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-3">
                    {blog.tagline}
                  </p>
                </div>

                <div className="mt-5 border-t border-border/60 pt-3 flex flex-wrap gap-1.5">
                  {blog.tags.map((t) => (
                    <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Architecture & Roadmap Section */}
        <section className="py-14">
          <div className="max-w-xl mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-teal">Delivery Plan</span>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              From Prototype to Cloud Container
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
              Tracking completed components across multi-agent orchestration, webhooks, and AWS deployments.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP_PHASES.map((item) => {
              const isDone = item.status === "Done";
              const isActive = item.status === "Active";

              return (
                <div
                  key={item.phase}
                  className={`rounded-xl border p-4 transition ${
                    isActive
                      ? "border-teal/40 bg-teal/5 shadow-sm"
                      : isDone
                      ? "border-border bg-surface/50"
                      : "border-border/40 bg-surface/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-ink">{item.phase}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold ${
                        isDone
                          ? "bg-teal/15 text-teal"
                          : isActive
                          ? "bg-amber/15 text-amber animate-pulse"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="rounded-2xl border border-border bg-surface/90 p-8 text-center sm:p-10 shadow-xl">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Want to follow along or contribute?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
            Check the issues tab, star the repo on GitHub, or leave your feedback on the dev.to and Hashnode articles.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/Nevin100/DevDocxAI"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-teal px-5 py-2.5 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Star on GitHub ★
            </a>
            <a
              href="https://dev.to/nevin100"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-ink transition hover:border-teal/40 active:scale-95"
            >
              Read on Dev.to
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}