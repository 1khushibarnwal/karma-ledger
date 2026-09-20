import { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { mintKarma } from "../services/web3";
import { getMintAuthorization, confirmMint } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useEthersSigner } from "../hooks/useEthersSigner";
import CopyButton from "./CopyButton";

export default function MintButton({ githubUsername, onMinted }) {
  const [status, setStatus] = useState("idle"); // idle | signing | minting | done | error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const { openConnectModal } = useConnectModal();
  const showToast = useToast();

  const busy = status === "signing" || status === "minting";

  async function handleMint() {
    setError(null);

    // No wallet yet — hand off to RainbowKit rather than prompting MetaMask
    // directly, so WalletConnect and mobile wallets are offered too.
    if (!isConnected || !signer) {
      openConnectModal?.();
      return;
    }

    try {
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
      // Rejecting in the wallet isn't a failure worth shouting about.
      const rejected = err?.code === "ACTION_REJECTED" || err?.code === 4001;
      const message = rejected
        ? "Transaction rejected in your wallet."
        : err.shortMessage || err.reason || err.message || "Something went wrong";
      setError(message);
      setStatus("error");
      showToast(message, "error");
    }
  }

  const labels = {
    idle: isConnected ? "Mint karma badge on-chain" : "Connect a wallet to mint",
    signing: "Getting signed authorization…",
    minting: "Confirming transaction…",
    done: "Minted",
    error: "Try again",
  };

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={busy || status === "done"}
        className="w-full rounded-lg bg-signal px-6 py-3 font-display font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {busy && (
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          )}
          {labels[status]}
          {status === "done" && <span aria-hidden="true">✓</span>}
        </span>
      </button>

      {isConnected && address && status === "idle" && (
        <div className="mt-2 font-mono text-xs text-muted">
          Minting to {address.slice(0, 6)}…{address.slice(-4)}
        </div>
      )}

      {txHash && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-surface2 px-3 py-2">
          <span className="truncate font-mono text-xs text-muted">Tx {txHash}</span>
          <CopyButton text={txHash} />
        </div>
      )}

      {error && <div className="mt-2 font-body text-sm text-bronze">{error}</div>}

      <p className="mt-3 font-body text-xs leading-relaxed text-muted">
        This badge is soulbound — it can never be transferred or sold, only re-minted to
        reflect an updated score.
      </p>
    </div>
  );
}