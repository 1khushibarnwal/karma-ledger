import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import ScoreCard from "../components/ScoreCard";
import SkeletonScoreCard from "../components/SkeletonScoreCard";
import MintButton from "../components/MintButton";
import { analyzeProfile } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useRefreshLeaderboard } from "../hooks/useLeaderboard";

export default function Score() {
  const [searchParams, setSearchParams] = useSearchParams();
  const username = searchParams.get("u") || "";
  const cfHandle = searchParams.get("cf") || "";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useToast();
  const refreshLeaderboard = useRefreshLeaderboard();

  // Guards against a stale response from a previous username overwriting a
  // newer one if the user searches twice quickly.
  const requestRef = useRef(0);

  const runAnalysis = useCallback(
    async (name, cf) => {
      const requestId = ++requestRef.current;
      setLoading(true);
      setResult(null);
      setError(null);
      try {
        const data = await analyzeProfile(name, cf);
        if (requestRef.current !== requestId) return;
        setResult(data);
      } catch (err) {
        if (requestRef.current !== requestId) return;
        const message = err.response?.data?.error || "Could not analyze that profile";
        setError(message);
        showToast(message, "error");
      } finally {
        if (requestRef.current === requestId) setLoading(false);
      }
    },
    [showToast]
  );

  // The username lives in the URL, so a result is shareable and survives reload.
  useEffect(() => {
    if (username) runAnalysis(username, cfHandle);
    else {
      setResult(null);
      setError(null);
    }
  }, [username, cfHandle, runAnalysis]);

  function handleSearch(name, cf) {
    // Both values live in the URL so results stay shareable and survive reload.
    setSearchParams(cf ? { u: name, cf } : { u: name });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
        Score a profile
      </h1>
      <p className="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-muted">
        Enter any public GitHub username, and optionally a Codeforces handle for a rating
        bonus. Scoring is free and needs no wallet — you only connect one when you want to
        mint the result as a badge.
      </p>

      <div className="mt-8">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          initialValue={username}
          initialCfHandle={cfHandle}
          showCodeforces
          autoFocus={!username}
        />
      </div>

      <div className="mt-12">
        {loading && <SkeletonScoreCard />}

        {!loading && error && (
          <div className="plate p-8">
            <h2 className="font-display text-lg font-semibold text-ivory">
              That profile didn't score
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted">
              {error} Check the spelling, or try a different username — the account has to
              be public and exist on GitHub.
            </p>
          </div>
        )}

        {!loading && !error && result && (
          <ScoreCard result={result}>
            <MintButton
              githubUsername={result.profile.username}
              onMinted={refreshLeaderboard}
            />
          </ScoreCard>
        )}

        {!loading && !error && !result && (
          <div className="rounded-xl border border-dashed border-hairline p-12 text-center">
            <p className="font-body text-sm text-muted">
              Results appear here. Nothing is stored until a badge is minted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}