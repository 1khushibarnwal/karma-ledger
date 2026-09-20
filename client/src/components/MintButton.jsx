import { useState } from "react";
import { connectWallet, mintKarma } from "../services/web3";
import { getMintAuthorization, confirmMint } from "../services/api";
import { useToast } from "../context/ToastContext";
import CopyButton from "./CopyButton";

export default function MintButton({ githubUsername, wallet, onWalletConnected, onMinted }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | signing | minting | done | error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const showToast = useToast();

  async function handleMint() {
    setError(null);
    try {
      let signer, address;

      if (wallet?.signer) {
        // already connected via the header's wallet status — skip the extra MetaMask prompt
        ({ signer, address } = wallet);
      } else {
        setStatus("connecting");
        const connected = await connectWallet();
        signer = connected.signer;
        address = connected.address;
        onWalletConnected?.(connected); // sync back up so the header reflects it too
      }

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
      showToast(`Karma badge minted for @${githubUsername}`, "success");
      onMinted?.();
    } catch (err) {
      console.error(err);
      const message = err.message || "Something went wrong";
      setError(message);
      setStatus("error");
      showToast(message, "error");
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
        <div className="mt-2 flex items-center gap-2">
          <span className="truncate font-mono text-xs text-muted">Tx: {txHash}</span>
          <CopyButton text={txHash} />
        </div>
      )}

      {error && <div className="mt-2 font-body text-sm text-bronze">{error}</div>}

      <div className="mt-2 font-body text-xs text-muted">
        This badge is soulbound — it can never be transferred or sold, only re-minted to reflect an updated score.
      </div>
    </div>
  );
}