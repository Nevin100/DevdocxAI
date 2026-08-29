/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, setToken } from "@/src/lib/api";

export default function GithubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code received from GitHub");
      throw Error("No authorization code received from GitHub.");
      return;
    }

    auth
      .githubCallback(code)
      .then(({ access_token }) => {
        setToken(access_token);
        router.push("/dashboard");
      })
      .catch((err:any) => {
        setError(err instanceof Error ? err.message : "GitHub login failed");
      });
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal" />
          <span className="font-display text-lg font-semibold">DevDocAI</span>
        </div>

        {error ? (
          <div className="mt-8 rounded-xl border border-border bg-surface p-6">
            <p className="text-sm text-amber">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-ink transition hover:border-muted-2"
            >
              Back to login
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" />
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal [animation-delay:0.4s]" />
            </div>
            <p className="text-sm text-muted">Signing you in with GitHub...</p>
          </div>
        )}
      </div>
    </main>
  );
}