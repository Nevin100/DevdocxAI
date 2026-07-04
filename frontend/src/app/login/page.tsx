"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, setToken } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await auth.login(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGithub() {
    const { url } = await auth.githubUrl();
    window.location.href = url;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal" />
          <span className="font-display text-lg font-semibold">DevDocAI</span>
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="font-display text-xl font-semibold">Log in</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back. Your repos are waiting.
          </p>

          <button
            onClick={handleGithub}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-2.5 text-sm font-medium text-ink transition hover:border-muted-2"
          >
            Continue with GitHub
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-2">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-amber" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-teal py-2.5 text-sm font-medium text-bg transition hover:bg-teal/90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/signup" className="text-teal hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}