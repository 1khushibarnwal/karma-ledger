const TIER_COLORS = {
  Bronze: "text-bronze border-bronze/40",
  Silver: "text-silver border-silver/40",
  Gold: "text-gold border-gold/40",
  Platinum: "text-platinum border-platinum/40",
};

const FEATURE_LABELS = {
  commit_frequency: "Commit frequency",
  repo_diversity: "Language diversity",
  project_depth: "Project depth",
  community_signal: "Community signal",
  consistency: "Consistency streak",
};

export default function ScoreCard({ result, children }) {
  const { profile, score, tier, featureContributions, modelInfo } = result;
  const maxContribution = Math.max(...Object.values(featureContributions).map(Math.abs), 0.01);

  return (
    <div className="w-full max-w-2xl rounded-xl border border-hairline bg-surface overflow-hidden">
      <div className="flex items-center gap-4 border-b border-hairline p-6">
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="h-16 w-16 rounded-lg border border-hairline"
        />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ivory">
            {profile.name || profile.username}
          </div>
          <div className="font-mono text-sm text-muted">@{profile.username}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold text-gold leading-none">{score}</div>
          <div
            className={`mt-1 inline-block rounded border px-2 py-0.5 font-mono text-xs ${TIER_COLORS[tier]}`}
          >
            {tier}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-6">
        <div className="font-body text-sm text-muted">
          Score breakdown — how the model reached this number
        </div>
        {Object.entries(featureContributions).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-40 shrink-0 font-body text-sm text-ivory/80">
              {FEATURE_LABELS[key] || key}
            </div>
            <div className="h-2 flex-1 rounded-full bg-surface2">
              <div
                className="h-2 rounded-full bg-signal"
                style={{ width: `${Math.max(4, (Math.abs(value) / maxContribution) * 100)}%` }}
              />
            </div>
            <div className="w-14 text-right font-mono text-xs text-muted">
              {value >= 0 ? "+" : ""}
              {value}
            </div>
          </div>
        ))}
        <div className="pt-2 font-mono text-xs text-muted">
          Model: {modelInfo.type} · {(modelInfo.testAccuracy * 100).toFixed(1)}% held-out accuracy
        </div>
      </div>

      {children && <div className="border-t border-hairline p-6">{children}</div>}
    </div>
  );
}
