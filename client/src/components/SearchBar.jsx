import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-3 focus-within:border-gold/60 transition-colors">
        <span className="text-muted font-mono text-sm">github.com/</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="torvalds"
          className="flex-1 bg-transparent font-mono text-ivory placeholder:text-muted/60 outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gold px-6 py-3 font-display font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Reading commits…" : "Compute karma"}
      </button>
    </form>
  );
}
