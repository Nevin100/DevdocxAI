"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { chat } from "@/src/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll trigger
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  async function send(query: string) {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    if (!repoId) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "⚠️ No repository selected. Please open this chat from a repository dashboard.",
        },
      ]);
      return;
    }

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const { chat_response } = await chat.ask(repoId, trimmed);
      setMessages((m) => [...m, { role: "assistant", content: chat_response }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Couldn't reach the backend pipeline. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-bg text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
            </span>
            <span className="font-display text-base font-bold tracking-tight">DevDocAI</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-mono text-muted">
            <span>repo:</span>
            <span className="font-semibold text-teal">{repoId ?? "none"}</span>
          </div>
        </div>
      </header>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-teal text-bg font-medium rounded-tr-none"
                    : "border border-border bg-surface text-ink rounded-tl-none"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed
                    prose-p:my-2 
                    prose-headings:my-3 prose-headings:font-display prose-headings:text-ink
                    prose-code:rounded prose-code:bg-bg/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-teal
                    prose-pre:my-2 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-bg prose-pre:p-3
                    prose-table:w-full prose-table:my-3 prose-table:border-collapse
                    prose-th:border prose-th:border-border prose-th:bg-bg/60 prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-muted
                    prose-td:border prose-td:border-border prose-td:p-2
                    prose-strong:text-ink prose-a:text-teal prose-a:underline hover:prose-a:opacity-80"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Wrapper taaki markdown tables mobile screen par bahar na bhaagein
                        table: ({ children }) => (
                          <div className="my-3 w-full overflow-x-auto rounded-lg border border-border">
                            <table className="min-w-full text-xs">{children}</table>
                          </div>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-border bg-surface px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Footer & Input Controls */}
      <footer className="relative z-20 border-t border-border/80 bg-bg/95 px-4 pb-5 pt-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted transition hover:border-teal hover:bg-surface hover:text-ink active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 rounded-xl border border-border bg-surface p-1.5 transition-all focus-within:border-teal/60 focus-within:ring-1 focus-within:ring-teal/30"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the architecture, logic, or docs... (Enter to send)"
              className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-teal px-4 text-xs font-semibold text-bg transition hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </main>
  );
}