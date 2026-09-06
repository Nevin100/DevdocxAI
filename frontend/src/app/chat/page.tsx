"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { chat } from "@/src/lib/api";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does codebase_parser do?",
  "Where is the auth logic?",
  "How does the HITL checkpoint work?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask me anything about this codebase — I answer from the generated docs, not the open internet.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(query: string) {
    if (!query.trim() || loading) return;

    if (!repoId) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "No repo selected — open this page from a repo's 'Ask a question' button.",
        },
      ]);
      return;
    }

    setMessages((m) => [...m, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const { chat_response } = await chat.ask(repoId, query);
      setMessages((m) => [...m, { role: "assistant", content: chat_response }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Couldn't reach the pipeline. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="font-display text-lg font-semibold">DevDocAI</span>
          </Link>
          <span className="font-mono text-xs text-muted">
            onboarding_chatbot
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="flex-1 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal text-bg"
                    : "border border-border bg-surface text-ink"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-headings:font-display prose-code:rounded prose-code:bg-bg prose-code:px-1 prose-code:py-0.5 prose-code:text-teal prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-table:text-xs prose-th:text-muted prose-strong:text-ink prose-a:text-teal">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted" />
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-teal hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="sticky bottom-6 mt-6 flex gap-2 rounded-xl border border-border bg-surface p-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the codebase..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-2"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-bg transition hover:bg-teal/90 disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
