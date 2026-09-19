import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import ScoreCard from "./components/ScoreCard";
import MintButton from "./components/MintButton";
import Leaderboard from "./components/Leaderboard";
import { analyzeProfile, getLeaderboard } from "./services/api";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    refreshLeaderboard();
  }, []);

  async function refreshLeaderboard() {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch {
      // leaderboard is a nice-to-have; fail silently if backend/db isn't up yet
    }
  }

  async function handleSearch(username) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeProfile(username);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not analyze that profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <div className="mb-3 font-mono text-sm text-signal">KarmaChain</div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ivory sm:text-5xl">
            Your commits already prove who you are.
          </h1>
          <p className="mt-4 max-w-xl font-body text-muted">
            KarmaChain reads a developer's public GitHub activity, scores it with a
            trained model, and lets them mint that score as a badge that can't be
            transferred, bought, or faked — a reputation that travels with the wallet,
            not the platform.
          </p>
        </header>

        <div className="mb-10 flex flex-col gap-4">
          <SearchBar onSearch={handleSearch} loading={loading} />
          {error && <div className="font-body text-sm text-bronze">{error}</div>}
        </div>

        {result && (
          <div className="mb-16">
            <ScoreCard result={result}>
              <MintButton githubUsername={result.profile.username} />
            </ScoreCard>
          </div>
        )}

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ivory">Ledger</h2>
          <Leaderboard entries={leaderboard} />
        </section>

        <footer className="mt-16 border-t border-hairline pt-6 font-mono text-xs text-muted">
          Built for Hack Devengers 2.0 · MERN + logistic regression + soulbound ERC-721
        </footer>
      </div>
    </div>
  );
}
