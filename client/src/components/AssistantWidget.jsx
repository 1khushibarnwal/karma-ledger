import { useEffect, useRef, useState } from "react";
import { askAssistant } from "../services/api";

const GREETING =
  "Hi! I'm the KarmaLedger assistant — ask me anything about how this project works, why it's " +
  "built the way it is, or how to use or deploy it.";

const SUGGESTIONS = [
  "Why is the badge soulbound?",
  "How is my Karma Score calculated?",
  "What does the Codeforces bonus do?",
  "Is minting safe for my wallet?",
  "Why is it deployed on Sepolia testnet?",
  "How can I deploy my own instance of KarmaLedger?",
  "What is the purpose of this project?",
  "How does the assistant work?",
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  async function send(text) {
    const trimmed = text.trim();

    if (!trimmed || loading) return;

    setError("");

    const nextMessages = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Send prior turns as history so follow-up questions keep context.
      const history = nextMessages.slice(0, -1).slice(-8);

      const reply = await askAssistant(trimmed, history);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Something went wrong reaching the assistant. Try again?"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className={`
            flex flex-col overflow-hidden rounded-xl border border-hairline
            bg-surface shadow-2xl transition-all duration-200

            ${
              isExpanded
                ? `
                  fixed inset-5
                  h-auto w-auto
                  max-w-none
                  rounded-2xl
                `
                : `
                  h-[32rem]
                  w-[22rem]
                  max-w-[calc(100vw-2.5rem)]
                `
            }
          `}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-surface2 px-4 py-3">
            <div>
              <p
                className={`font-display font-semibold text-ivory ${
                  isExpanded ? "text-base" : "text-sm"
                }`}
              >
                KarmaLedger Assistant
              </p>

              <p
                className={`font-mono text-muted ${
                  isExpanded ? "text-xs" : "text-[11px]"
                }`}
              >
                Knows this project only
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / collapse */}
              <button
                onClick={() => setIsExpanded((v) => !v)}
                aria-label={
                  isExpanded
                    ? "Collapse assistant"
                    : "Expand assistant"
                }
                title={isExpanded ? "Collapse" : "Expand"}
                className="
                  grid h-8 w-8 place-items-center rounded-lg
                  text-muted transition-colors
                  hover:bg-surface hover:text-ivory
                "
              >
                {isExpanded ? (
                  /* Minimize icon */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15 4 20m0 0h4m-4 0v-4M15 9l5-5m0 0h-4m4 0v4"
                    />
                  </svg>
                ) : (
                  /* Maximize icon */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"
                    />
                  </svg>
                )}
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                title="Close"
                className="
                  grid h-8 w-8 place-items-center rounded-lg
                  text-muted transition-colors
                  hover:bg-surface hover:text-ivory
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6 6 18"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className={`
              min-h-0 flex-1 overflow-y-auto
              space-y-3 px-4 py-4
              ${isExpanded ? "px-6 py-6" : ""}
            `}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`
                  max-w-[85%] rounded-lg px-3 py-2
                  font-body whitespace-pre-wrap
                  ${
                    isExpanded
                      ? "text-base leading-7"
                      : "text-sm leading-relaxed"
                  }
                  ${
                    m.role === "user"
                      ? "ml-auto bg-gold text-surface"
                      : "bg-surface2 text-ivory"
                  }
                `}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div
                className={`
                  max-w-[85%] rounded-lg bg-surface2
                  px-3 py-2 font-body text-muted
                  ${isExpanded ? "text-base leading-7" : "text-sm"}
                `}
              >
                Thinking…
              </div>
            )}

            {error && (
              <div
                className={`
                  max-w-[85%] rounded-lg
                  border border-bronze/60 bg-surface2
                  px-3 py-2 font-body text-bronze
                  ${isExpanded ? "text-base leading-7" : "text-sm"}
                `}
              >
                {error}
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className={`
                      rounded-full border border-hairline
                      bg-surface text-left text-muted
                      transition-colors
                      hover:border-signal/60 hover:text-ivory
                      ${
                        isExpanded
                          ? "px-3 py-2 font-body text-sm"
                          : "px-3 py-1.5 font-mono text-[11px]"
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className={`
              flex shrink-0 gap-2
              border-t border-hairline p-3
              ${isExpanded ? "p-4" : ""}
            `}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about KarmaLedger…"
              disabled={loading}
              className={`
                min-w-0 flex-1 rounded-lg
                border border-hairline bg-ink
                text-ivory outline-none
                placeholder:text-muted/60
                focus:border-gold/60
                ${
                  isExpanded
                    ? "px-4 py-3 font-body text-base"
                    : "px-3 py-2 font-body text-sm"
                }
              `}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`
                shrink-0 rounded-lg
                bg-gold font-display font-semibold
                text-surface transition-opacity
                hover:opacity-90 disabled:opacity-50
                ${
                  isExpanded
                    ? "px-5 py-3 text-base"
                    : "px-4 py-2 text-sm"
                }
              `}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating assistant button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open ? "Close assistant" : "Open KarmaLedger assistant"
        }
        className="
          grid h-14 w-14 place-items-center
          rounded-full bg-gold text-surface
          shadow-xl transition-transform
          hover:scale-105
        "
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12c0 4.418-4.03 8-9 8-1.06 0-2.077-.16-3.02-.457L3 20l1.5-4.02C3.55 14.66 3 13.38 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}