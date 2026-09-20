const ROWS = [
  {
    analyzer: "A number rendered on a webpage",
    karma: "A number cryptographically signed and recorded on a public ledger",
  },
  {
    analyzer: "Lives and dies with that website staying online",
    karma: "Lives on-chain, independent of any one app",
  },
  {
    analyzer: "A screenshot of it proves nothing — anyone can fake one",
    karma: "The score is bound to a wallet by signature — it can't be claimed by someone else",
  },
  {
    analyzer: "Verifying it means trusting the website",
    karma: "Verifying it means one on-chain read — no trust in a UI required",
  },
  {
    analyzer: "The number can change silently on refresh",
    karma: "Once minted, it's an immutable, timestamped, on-chain fact",
  },
  {
    analyzer: "Only that one app can \"see\" the score",
    karma: "Any other app or contract can read it programmatically",
  },
];

export default function DifferentiationSection() {
  return (
    <section>
      <h2 className="mb-2 font-display text-xl font-semibold text-ivory">
        How this is different from a GitHub analyzer
      </h2>
      <p className="mb-6 max-w-2xl font-body text-sm text-muted">
        Both start from the same input — public GitHub activity. The difference is
        entirely in what happens after the number is computed.
      </p>

      <div className="overflow-hidden rounded-xl border border-hairline shadow-card">
        <div className="grid grid-cols-2 border-b border-hairline bg-surface2">
          <div className="px-4 py-3 font-mono text-xs text-muted sm:px-5">GitHub analyzer</div>
          <div className="px-4 py-3 font-mono text-xs text-signal sm:px-5">KarmaChain</div>
        </div>
        {ROWS.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-2 ${i !== ROWS.length - 1 ? "border-b border-hairline/60" : ""} bg-surface`}
          >
            <div className="px-4 py-4 font-body text-sm text-muted sm:px-5">{row.analyzer}</div>
            <div className="px-4 py-4 font-body text-sm text-ivory sm:px-5">{row.karma}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-2xl font-body text-sm italic text-signal">
        A GitHub stats card is something you show someone. A KarmaChain badge is
        something you can prove to a smart contract.
      </p>
    </section>
  );
}