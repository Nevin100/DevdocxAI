"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal" />
          <span className="font-display text-lg font-semibold tracking-tight">
            DevDocAI
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#pipeline" className="text-sm text-muted transition hover:text-ink">
            Pipeline
          </Link>
          <Link href="/#how" className="text-sm text-muted transition hover:text-ink">
            How it works
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted transition hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-bg transition hover:bg-teal/90"
          >
            Get started
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/#pipeline" className="text-sm text-muted">
              Pipeline
            </Link>
            <Link href="/#how" className="text-sm text-muted">
              How it works
            </Link>
            <Link href="/login" className="text-sm text-muted">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-teal px-4 py-2 text-center text-sm font-medium text-bg"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}