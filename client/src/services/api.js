import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function analyzeProfile(username, cfHandle) {
  const { data } = await axios.get(
    `${API_BASE}/score/${encodeURIComponent(username)}`,
    {
      // Only send the param when a handle was actually provided.
      params: cfHandle ? { cfHandle } : undefined,
    },
  );
  return data;
}

export async function getMintAuthorization(githubUsername, walletAddress) {
  const { data } = await axios.post(`${API_BASE}/mint/authorize`, {
    githubUsername,
    walletAddress,
  });
  return data;
}

export async function confirmMint(githubUsername, walletAddress, txHash) {
  const { data } = await axios.post(`${API_BASE}/mint/confirm`, {
    githubUsername,
    walletAddress,
    txHash,
  });
  return data;
}

export async function getLeaderboard() {
  const { data } = await axios.get(`${API_BASE}/leaderboard`);
  return data;
}
