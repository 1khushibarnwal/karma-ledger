export default function Leaderboard({ entries }) {
  if (!entries?.length) {
    return (
      <div className="font-body text-sm text-muted">
        No profiles scored yet — be the first entry in the ledger.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-hairline">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hairline bg-surface2 font-mono text-xs uppercase tracking-normal text-muted">
            <th className="px-4 py-3 font-normal">Rank</th>
            <th className="px-4 py-3 font-normal">Developer</th>
            <th className="px-4 py-3 font-normal">Tier</th>
            <th className="px-4 py-3 font-normal text-right">Score</th>
            <th className="px-4 py-3 font-normal text-right">On-chain</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry._id} className="border-b border-hairline/60 bg-surface last:border-0">
              <td className="px-4 py-3 font-mono text-sm text-muted">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <img src={entry.avatarUrl} alt="" className="h-6 w-6 rounded" />
                  <span className="font-body text-sm text-ivory">{entry.githubUsername}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{entry.tier}</td>
              <td className="px-4 py-3 text-right font-mono text-sm text-gold">{entry.score}</td>
              <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                {entry.mintTxHash ? "✓ minted" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
