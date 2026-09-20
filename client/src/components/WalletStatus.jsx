import { useEffect, useState } from "react";
import { connectWallet, getNetworkName } from "../services/web3";

export default function WalletStatus({ wallet, onChange }) {
  const [connecting, setConnecting] = useState(false);

  // React to the wallet's own account/network switches so a stale signer
  // is never used silently — force a clean reconnect instead.
  useEffect(() => {
    if (!window.ethereum) return;

    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) onChange(null);
      else onChange(null); // address changed — require an explicit reconnect for a fresh signer
    }
    function handleChainChanged() {
      onChange(null);
    }

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [onChange]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const walletInfo = await connectWallet();
      onChange(walletInfo);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  }

  if (!wallet) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="rounded-lg border border-hairline px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/50 hover:text-signal disabled:opacity-50"
      >
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const short = `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-1.5">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
      <span className="font-mono text-xs text-ivory">{short}</span>
      <span className="font-mono text-xs text-muted">· {getNetworkName(wallet.chainId)}</span>
    </div>
  );
}