import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Mark from "../components/Mark";
import { useLeaderboard } from "../hooks/useLeaderboard";

const TIERS = [
  { name: "Bronze", range: "0 – 399", className: "text-bronze border-bronze/40" },
  { name: "Silver", range: "400 – 599", className: "text-silver border-silver/40" },
  { name: "Gold", range: "600 – 799", className: "text-gold border-gold/40" },
  { name: "Platinum", range: "800 +", className: "text-platinum border-platinum/40" },
];

const STEPS = [
  {
    title: "Read the public record",
    body: "We pull a developer's public GitHub activity — commit cadence, languages, depth per repo, community signal, streaks. No account access, no private data.",
  },
  {
    title: "Score it with a trained model",
    body: "A logistic regression weighs those five features into a single number out of 1000, and shows you exactly how much each one contributed.",
  },
  {
    title: "Strike it onto the chain",
    body: "The backend signs the score for one specific wallet. That wallet mints a badge that can't be transferred, bought, or re-pointed at someone else.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: leaderboard } = useLeaderboard();
  const top = (leaderboard || []).slice(0, 3);

  function handleSearch(username) {
    navigate(`/score?u=${encodeURIComponent(username)}`);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="ledger-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-rise">
              <h1 className="max-w-[18ch] font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ivory sm:text-5xl lg:text-6xl">
                Your commits already prove who you are.
              </h1>
              <p className="mt-6 max-w-[62ch] font-body text-base leading-relaxed text-muted">
                KarmaChain reads a developer's public GitHub activity, scores it with a
                trained model, and lets them mint that score as a badge that can't be
                transferred, bought, or faked — a reputation that travels with the wallet,
                not the platform.
              </p>

              <div className="mt-8 max-w-xl">
                <SearchBar onSearch={handleSearch} submitLabel="Compute karma" />
                <p className="mt-3 font-body text-sm text-muted">
                  Try{" "}
                  <button
                    onClick={() => handleSearch("torvalds")}
                    className="text-signal underline decoration-dotted underline-offset-4"
                  >
                    torvalds
                  </button>
                  ,{" "}
                  <button
                    onClick={() => handleSearch("sindresorhus")}
                    className="text-signal underline decoration-dotted underline-offset-4"
                  >
                    sindresorhus
                  </button>{" "}
                  or your own username. Scoring a profile is free and needs no wallet.
                </p>
              </div>
            </div>

            {/* The specimen badge — the thing the whole product produces, shown
                up front rather than described. */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="plate animate-strike relative overflow-hidden p-8">
                <div className="flex items-start justify-between">
                  <Mark className="h-8 w-8 text-gold" />
                  <span className="rounded border border-gold/40 px-2 py-0.5 font-mono text-[11px] text-gold">
                    Gold
                  </span>
                </div>
                <div className="mt-8 font-display text-6xl font-bold leading-none tabular-nums text-gold">
                  742
                </div>
                <div className="mt-2 font-mono text-sm text-muted">@specimen</div>
                <div className="mt-6 space-y-2 border-t border-hairline pt-6">
                  {[
                    ["Commit frequency", 82],
                    ["Project depth", 64],
                    ["Consistency streak", 91],
                  ].map(([label, pct]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 font-body text-xs text-muted">{label}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-surface2">
                        <span
                          className="block h-1.5 rounded-full bg-signal"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 font-mono text-[11px] leading-relaxed text-muted">
                  Soulbound — transfers revert on-chain.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ivory">
          Three steps, one permanent mark
        </h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-surface p-7">
              <div className="font-mono text-sm text-signal">{i + 1}</div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ivory">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <Link
          to="/how-it-works"
          className="mt-6 inline-block font-body text-sm text-signal underline decoration-dotted underline-offset-4"
        >
          See why this isn't just a GitHub stats card
        </Link>
      </section>

      {/* Tiers */}
      <section className="border-y border-hairline bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ivory">
            Four tiers, struck like hallmarks
          </h2>
          <p className="mt-3 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            A tier is just a band of the same 1000-point score. It exists so a contract
            reading your badge can make a cheap decision without interpreting the raw number.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div key={tier.name} className="plate p-6">
                <div
                  className={`inline-block rounded border px-2 py-0.5 font-mono text-xs ${tier.className}`}
                >
                  {tier.name}
                </div>
                <div className="mt-4 font-display text-xl font-semibold tabular-nums text-ivory">
                  {tier.range}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ledger preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ivory">
            Currently on the ledger
          </h2>
          <Link
            to="/ledger"
            className="font-body text-sm text-signal underline decoration-dotted underline-offset-4"
          >
            See the full ledger
          </Link>
        </div>

        {top.length === 0 ? (
          <p className="mt-6 font-body text-sm text-muted">
            No profiles scored yet. Score one and take the first entry.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {top.map((entry, i) => (
              <div key={entry._id} className="plate flex items-center gap-4 p-5">
                <span className="font-display text-2xl font-semibold tabular-nums text-muted">
                  {i + 1}
                </span>
                <img
                  src={entry.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg border border-hairline"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-sm text-ivory">
                    {entry.githubUsername}
                  </div>
                  <div className="font-mono text-xs text-muted">{entry.tier}</div>
                </div>
                <span className="font-display text-xl font-semibold tabular-nums text-gold">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}