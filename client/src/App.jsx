import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import ScoreCard from "./components/ScoreCard";
import SkeletonScoreCard from "./components/SkeletonScoreCard";
import MintButton from "./components/MintButton";
import Leaderboard from "./components/Leaderboard";
import DifferentiationSection from "./components/DifferentiationSection";
import FAQSection from "./components/FAQSection";
import WalletStatus from "./components/WalletStatus";
import { analyzeProfile, getLeaderboard } from "./services/api";
import { useToast } from "./context/ToastContext";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [wallet, setWallet] = useState(null);
  const showToast = useToast();

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
    setResult(null);
    try {
      const data = await analyzeProfile(username);
      setResult(data);
    } catch (err) {
      showToast(err.response?.data?.error || "Could not analyze that profile", "error");
    } finally {
      setLoading(false);
    }
  }

  // MintButton refreshes the leaderboard's "minted" checkmark once a mint confirms
  async function handleMinted() {
    await refreshLeaderboard();
  }

  return (
    <div className="min-h-screen bg-ink font-body">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
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
          </div>
          <div className="shrink-0 pt-1">
            <WalletStatus wallet={wallet} onChange={setWallet} />
          </div>
        </header>

        <div className="mb-10 flex flex-col gap-4">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {loading && (
          <div className="mb-16">
            <SkeletonScoreCard />
          </div>
        )}

        {!loading && result && (
          <div className="mb-16">
            <ScoreCard result={result}>
              <MintButton
                githubUsername={result.profile.username}
                wallet={wallet}
                onWalletConnected={setWallet}
                onMinted={handleMinted}
              />
            </ScoreCard>
          </div>
        )}

        <section className="mb-16">
          <h2 className="mb-4 font-display text-xl font-semibold text-ivory">Ledger</h2>
          <Leaderboard entries={leaderboard} currentWallet={wallet?.address} />
        </section>

        <DifferentiationSection />

        <FAQSection />

        <footer className="mt-16 border-t border-hairline pt-6 font-mono text-xs text-muted">
          Built for Hack Devengers 2.0 · MERN + logistic regression + soulbound ERC-721
        </footer>
      </div>
    </div>
  );
}