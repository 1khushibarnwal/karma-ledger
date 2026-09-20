import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { foundry, mainnet, polygon, polygonAmoy, sepolia } from "wagmi/chains";

// WalletConnect-based wallets (mobile, Rainbow, Trust) need a project id from
// https://cloud.reown.com. Injected wallets like MetaMask work without one, so
// the app stays usable locally if it's missing.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId && import.meta.env.DEV) {
  console.warn(
    "[KarmaChain] VITE_WALLETCONNECT_PROJECT_ID is not set — only browser-extension wallets will be offered.",
  );
}

// foundry (Anvil, chain 31337) is first so local development is the default
// target, matching the deploy script in the contracts package.
export const chains = [foundry, sepolia, mainnet, polygon, polygonAmoy];

export const wagmiConfig = getDefaultConfig({
  appName: "KarmaChain",
  appDescription:
    "On-chain developer reputation, minted from public GitHub activity.",
  projectId: projectId || "karmachain-local-dev",
  chains,
  ssr: false,
});
