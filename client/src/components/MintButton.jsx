import { useState } from "react";
import { connectWallet, mintKarma } from "../services/web3";
import { getMintAuthorization, confirmMint } from "../services/api";

export default function MintButton({ githubUsername }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | signing | minting | done | error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  async function handleMint() {
    setError(null);
    try {
      setStatus("connecting");
      const { signer, address } = await connectWallet();

      setStatus("signing");
      const auth = await getMintAuthorization(githubUsername, address);

      setStatus("minting");
      const hash = await mintKarma({
        signer,
        score: auth.score,
        githubUsername: auth.githubUsername,
        nonce: auth.nonce,
        signature: auth.signature,
      });

      await confirmMint(githubUsername, address, hash);
      setTxHash(hash);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  const labels = {
    idle: "Mint karma badge on-chain",
    connecting: "Connecting wallet…",
    signing: "Getting signed authorization…",
    minting: "Confirming transaction…",
    done: "Minted ✓",
    error: "Try again",
  };

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={status === "connecting" || status === "signing" || status === "minting"}
        className="w-full rounded-lg bg-signal px-6 py-3 font-display font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {labels[status]}
      </button>
      {txHash && (
        <div className="mt-2 truncate font-mono text-xs text-muted">Tx: {txHash}</div>
      )}
      {error && <div className="mt-2 font-body text-sm text-bronze">{error}</div>}
      <div className="mt-2 font-body text-xs text-muted">
        This badge is soulbound — it can never be transferred or sold, only re-minted to reflect an updated score.
      </div>
    </div>
  );
}
