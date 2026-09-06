"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-md transition-all">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition hover:opacity-90 active:scale-95"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-ink">
            DevDocAI
          </span>
          <span className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-2 sm:inline-block">
            beta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-5">
            <Link
              href="/#pipeline"
              className="text-xs font-medium text-muted transition hover:text-ink"
            >
              Pipeline
            </Link>
            <Link
              href="/#how"
              className="text-xs font-medium text-muted transition hover:text-ink"
            >
              How it works
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center rounded-xl bg-teal px-3.5 py-1.5 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Blogs
            </Link>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink hover:bg-surface"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-teal px-3.5 py-1.5 text-xs font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile Animated Hamburger Button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-ink transition hover:border-muted-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <div className="relative h-3.5 w-4">
            <span
              className={`absolute left-0 block h-0.5 w-4 bg-ink transition-all duration-200 ${
                open ? "top-1.5 rotate-45" : "top-0.5"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-4 bg-ink transition-all duration-200 ${
                open ? "top-1.5 -rotate-45" : "top-2.5"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {open && (
        <div className="border-t border-border/80 bg-bg/95 px-5 py-4 backdrop-blur-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-3">
            <Link
              href="/#pipeline"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-ink"
            >
              Pipeline
            </Link>
            <Link
              href="/#how"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-ink"
            >
              How it works
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-ink"
            >
              Log in
            </Link>

            <div className="pt-2">
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-teal py-2 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
              >
                Get started
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-teal py-2 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}