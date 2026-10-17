"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import { sendChatMessage } from "@/lib/actions/chat";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I can help you find the right Cosmos Scents fragrance -- ask me about notes, prices, or which one suits an occasion.",
};

/**
 * Floating chat widget, mounted globally in app/layout.js. Conversation
 * state is plain useState -- lives only in this tab, resets on refresh
 * (see README: "Chatbot" section for why that's the deliberate choice,
 * not a shortcut).
 */
export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isPending, open]);

  // Same reasoning as Header.js -- the admin area has its own sidebar and
  // its own job; a customer-facing shopping assistant doesn't belong there.
  if (pathname?.startsWith("/admin")) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    setError("");
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const result = await sendChatMessage(
        nextMessages.map(({ role, content }) => ({ role, content })),
        text
      );
      if (result?.error) {
        setError(result.error);
      } else if (result?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      }
    });
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[calc(100vw-3rem)] sm:w-96 h-[28rem] bg-paper-raised border border-line rounded-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-heading text-lg">Ask Cosmos</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-muted hover:text-ink transition-colors text-xl leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "self-end bg-ink text-paper" : "self-start bg-gold-soft text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isPending ? (
              <div className="self-start bg-gold-soft text-ink rounded-md px-3 py-2 text-sm text-muted">
                Thinking...
              </div>
            ) : null}
            {error ? <p className="text-xs text-red-700 self-start px-1">{error}</p> : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a scent..."
              maxLength={500}
              className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
            />
            <Button type="submit" variant="primary" disabled={isPending || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      ) : null}

      <Button type="button" variant="primary" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Ask Cosmos"}
      </Button>
    </div>
  );
}
