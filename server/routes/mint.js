const express = require("express");
const router = express.Router();
const { signKarmaPayload } = require("../services/signer");
const Profile = require("../models/Profile");

// POST /api/mint/authorize
// body: { githubUsername, walletAddress }
// Looks up the most recently computed score for this GitHub user, then signs a
// mint authorization the frontend can submit directly to the smart contract.
router.post("/authorize", async (req, res) => {
  const { githubUsername, walletAddress } = req.body;
  if (!githubUsername || !walletAddress) {
    return res.status(400).json({ error: "githubUsername and walletAddress are required" });
  }
  if (!process.env.CONTRACT_ADDRESS) {
    return res.status(500).json({ error: "CONTRACT_ADDRESS not configured on server" });
  }

  try {
    const profile = await Profile.findOne({ githubUsername });
    if (!profile) {
      return res.status(404).json({
        error: "No score on file for this GitHub user yet — call /api/score/:username first",
      });
    }

    // nonce = current timestamp; contract marks this exact payload hash as "used"
    // once minted, so it can't be replayed twice.
    const nonce = Date.now();

    const signature = await signKarmaPayload({
      recipient: walletAddress,
      score: profile.score,
      githubUsername: profile.githubUsername,
      nonce,
      contractAddress: process.env.CONTRACT_ADDRESS,
    });

    res.json({
      score: profile.score,
      githubUsername: profile.githubUsername,
      nonce,
      signature,
      contractAddress: process.env.CONTRACT_ADDRESS,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign mint authorization" });
  }
});

// POST /api/mint/confirm — frontend calls this after the on-chain tx confirms,
// so we can store the tx hash / wallet against the profile for the leaderboard.
router.post("/confirm", async (req, res) => {
  const { githubUsername, walletAddress, txHash } = req.body;
  try {
    const updated = await Profile.findOneAndUpdate(
      { githubUsername },
      { walletAddress, mintTxHash: txHash },
      { new: true }
    );
    res.json({ ok: true, profile: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to record mint" });
  }
});

module.exports = router;
