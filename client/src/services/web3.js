import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ABI = [
  "function mintOrUpdateKarma(uint256 score, string githubUsername, uint256 nonce, bytes signature) external",
  "function tokenOfOwner(address) view returns (uint256)",
  "function karmaOf(uint256) view returns (uint256 score, string githubUsername, uint256 timestamp, uint8 tier)",
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "No wallet found. Install MetaMask to mint your Karma badge.",
    );
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
}

const KNOWN_NETWORKS = {
  1: "Ethereum",
  11155111: "Sepolia",
  31337: "Anvil (local)",
  137: "Polygon",
  80002: "Polygon Amoy",
};

export function getNetworkName(chainId) {
  return KNOWN_NETWORKS[chainId] || `Chain ${chainId}`;
}

export async function mintKarma({
  signer,
  score,
  githubUsername,
  nonce,
  signature,
}) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS is not set in client/.env");
  }
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const tx = await contract.mintOrUpdateKarma(
    score,
    githubUsername,
    nonce,
    signature,
  );
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function readOnChainKarma(provider, address) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const tokenId = await contract.tokenOfOwner(address);
  if (tokenId === 0n) return null;
  const data = await contract.karmaOf(tokenId);
  return {
    tokenId: tokenId.toString(),
    score: Number(data[0]),
    githubUsername: data[1],
    timestamp: Number(data[2]),
    tier: Number(data[3]),
  };
}
