import { useState } from "react";

export default function SearchBar({
  onSearch,
  loading,
  initialValue = "",
  autoFocus = false,
  submitLabel = "Compute karma",
}) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim().replace(/^@/, "");
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-3 transition-colors focus-within:border-gold/60">
        <span className="select-none font-mono text-sm text-muted">github.com/</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="torvalds"
          autoFocus={autoFocus}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          aria-label="GitHub username"
          className="w-full flex-1 bg-transparent font-mono text-ivory outline-none placeholder:text-muted/60"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-lg bg-gold px-6 py-3 font-display font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Reading commits…" : submitLabel}
      </button>
    </form>
  );
}