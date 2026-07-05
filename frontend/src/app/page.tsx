import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import PipelineStrip from "@/src/components/PipelineStrip";

const STEPS = [
  {
    title: "Connect a repo",
    body: "Sign in with GitHub. Pick the repository you want documented.",
  },
  {
    title: "Agents read your code",
    body: "codebase_parser walks the AST. doc_generator writes the docs. brave_researcher adds outside context.",
  },
  {
    title: "You review, you approve",
    body: "The pipeline pauses at human_review. Nothing publishes without you.",
  },
  {
    title: "Docs stay current",
    body: "Every merged PR re-triggers the pipeline. Your docs update themselves.",
  },
];

const STACK = [
  "LangGraph", "FastAPI", "Groq", "Qdrant", "Cohere", "PostgreSQL", "MCP", "Redis",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="grid-fade absolute inset-0 h-[520px]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            5 agents, 1 pipeline, 0 stale docs
          </div>

          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Your codebase writes its own documentation now.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            DevDocAI reads your GitHub repo at the AST level, drafts
            developer-friendly docs with an LLM, and keeps them updated on
            every merge — with a human checkpoint before anything goes live.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-teal px-6 py-3 text-center text-sm font-medium text-bg transition hover:bg-teal/90"
            >
              Connect a repository
            </Link>
            <Link
              href="#pipeline"
              className="rounded-lg border border-border px-6 py-3 text-center text-sm font-medium text-ink transition hover:border-muted-2"
            >
              See the pipeline
            </Link>
          </div>

          <div className="mt-16 rounded-xl border border-border bg-surface p-6 sm:p-8" id="pipeline">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                pipeline.run(repo)
              </span>
              <span className="font-mono text-xs text-teal">● live</span>
            </div>
            <PipelineStrip />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border" id="how">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Four steps from a raw repo to documentation your team actually
            trusts.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <span className="font-mono text-xs text-teal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="mb-6 text-xs uppercase tracking-wide text-muted-2">
            Built on
          </p>
          <div className="flex flex-wrap gap-3">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-xs text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Stop writing docs by hand.
          </h2>
          <p className="mt-3 text-muted">
            Connect a repo, review the first draft, done.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 text-sm font-medium text-bg transition hover:bg-teal/90"
          >
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-2">
        DevDocAI - built in public.
      </footer>
    </main>
  );
}