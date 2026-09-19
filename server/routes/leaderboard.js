const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// GET /api/leaderboard — top scores overall (minted or not)
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find()
      .sort({ score: -1 })
      .limit(50)
      .select("githubUsername avatarUrl name score tier walletAddress mintTxHash lastScoredAt");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

module.exports = router;
