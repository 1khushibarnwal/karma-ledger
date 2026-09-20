import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API can fail on non-HTTPS/local contexts — fail silently, non-critical
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded border border-hairline px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-signal/50 hover:text-signal"
      type="button"
    >
      {copied ? "Copied" : label}
    </button>
  );
}