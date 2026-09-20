import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import Leaderboard from "../components/Leaderboard";
import { useLeaderboard } from "../hooks/useLeaderboard";

export default function Ledger() {
  const { address } = useAccount();
  const { data, isLoading, isError, refetch } = useLeaderboard();

  const entries = data || [];
  const minted = entries.filter((e) => e.mintTxHash).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
        The ledger
      </h1>
      <p className="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-muted">
        Every profile scored so far, ranked. A checkmark means the score was struck
        on-chain and can be read back by any contract — the rest are scores that exist
        only in this app's database.
      </p>

      {entries.length > 0 && (
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-3">
          <div className="bg-surface p-5">
            <div className="font-display text-2xl font-semibold tabular-nums text-ivory">
              {entries.length}
            </div>
            <div className="mt-1 font-body text-sm text-muted">profiles scored</div>
          </div>
          <div className="bg-surface p-5">
            <div className="font-display text-2xl font-semibold tabular-nums text-signal">
              {minted}
            </div>
            <div className="mt-1 font-body text-sm text-muted">badges minted</div>
          </div>
          <div className="bg-surface p-5">
            <div className="font-display text-2xl font-semibold tabular-nums text-gold">
              {Math.max(...entries.map((e) => e.score))}
            </div>
            <div className="mt-1 font-body text-sm text-muted">highest score</div>
          </div>
        </div>
      )}

      <div className="mt-10">
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface2" />
            ))}
          </div>
        )}

        {isError && (
          <div className="plate p-8">
            <h2 className="font-display text-lg font-semibold text-ivory">
              The ledger didn't load
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted">
              The scoring backend isn't reachable. Start it and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg border border-hairline px-4 py-2 font-body text-sm text-ivory transition-colors hover:border-signal/50 hover:text-signal"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Leaderboard entries={entries} currentWallet={address} />
            {entries.length === 0 && (
              <Link
                to="/score"
                className="mt-4 inline-block font-body text-sm text-signal underline decoration-dotted underline-offset-4"
              >
                Score the first profile
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}