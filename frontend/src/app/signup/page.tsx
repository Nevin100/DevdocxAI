"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, setToken } from "@/src/lib/api";

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  // Real-time password strength indicators
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLen: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumberOrSymbol: /[\d\W]/.test(password),
    };
  }, [password]);

  const strengthCount = Object.values(passwordCriteria).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password needs at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await auth.register(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGithub() {
    setGithubLoading(true);
    try {
      const { url } = await auth.githubUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redirect to GitHub");
      setGithubLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4 py-12 text-ink selection:bg-teal/20 selection:text-teal sm:px-6">
      {/* Structural Metadata for Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Sign Up - DevDocAI",
            description: "Register for DevDocAI to start automating your codebase documentation pipeline.",
          }),
        }}
      />

      {/* Engineering Grid & Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-25" />
      <div className="pointer-events-none absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal/10 blur-[100px]" />

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 backdrop-blur-md transition hover:border-teal/50 hover:bg-surface active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            <span className="font-display text-sm font-bold tracking-tight">DevDocAI</span>
            <span className="font-mono text-[10px] uppercase text-muted">engine setup</span>
          </Link>

          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Start documenting code
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Sync your repositories and generate living architecture specs in minutes.
          </p>
        </div>

        {/* Card Shell */}
        <div className="rounded-2xl border border-border/90 bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={handleGithub}
            disabled={githubLoading || loading}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-muted-2 hover:bg-surface-2 active:scale-[0.99] disabled:opacity-60"
          >
            {githubLoading ? (
              <Spinner className="h-4 w-4 text-teal" />
            ) : (
              <GitHubIcon className="h-4 w-4 transition group-hover:scale-110" />
            )}
            <span>{githubLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}</span>
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-2">
            <div className="h-px flex-1 bg-border/80" />
            <span>or sign up with email</span>
            <div className="h-px flex-1 bg-border/80" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-xl border border-border bg-bg/90 px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-muted/50 focus:border-teal focus:ring-1 focus:ring-teal/30"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-muted">
                  Create Password
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="font-mono text-[11px] text-muted hover:text-teal transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-border bg-bg/90 px-3.5 py-2.5 text-xs text-ink outline-none transition placeholder:text-muted/50 focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
              </div>

              {/* Password Dynamic Indicator Bars */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    <div
                      className={`h-1 flex-1 rounded-full transition-all ${
                        strengthCount >= 1 ? "bg-amber" : "bg-surface-2"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-all ${
                        strengthCount >= 2 ? "bg-amber" : "bg-surface-2"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-all ${
                        strengthCount === 3 ? "bg-teal" : "bg-surface-2"
                      }`}
                    />
                  </div>
                  <span className="block font-mono text-[10px] text-muted-2">
                    {passwordCriteria.hasMinLen
                      ? strengthCount === 3
                        ? "Secure password"
                        : "Good, consider adding numbers or symbols"
                      : "Needs at least 8 characters"}
                  </span>
                </div>
              )}
            </div>

            {/* Error Feedback */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 animate-in fade-in zoom-in-95 duration-200"
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="leading-snug">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || githubLoading}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner className="h-3.5 w-3.5 text-bg" />
                  <span>Configuring workspace...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-2 leading-relaxed">
            By signing up, you agree to automated pipeline webhook listeners on connected repos.
          </p>
        </div>

        {/* Navigation Link */}
        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal hover:underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}