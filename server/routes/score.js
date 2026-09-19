const express = require("express");
const router = express.Router();
const { fetchGithubProfile } = require("../services/githubService");
const { computeKarmaScore } = require("../services/mlScorer");
const Profile = require("../models/Profile");

// GET /api/score/:username -> full analysis + ML score for a GitHub user
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await fetchGithubProfile(username);
    const result = computeKarmaScore(profile.raw);

    const saved = await Profile.findOneAndUpdate(
      { githubUsername: profile.username },
      {
        githubUsername: profile.username,
        avatarUrl: profile.avatar_url,
        name: profile.name,
        score: result.score,
        tier: result.tier,
        featureContributions: result.featureContributions,
        lastScoredAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      profile,
      ...result,
      dbId: saved._id,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `GitHub user "${username}" not found` });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({
        error: "GitHub API rate limit hit. Add a GITHUB_TOKEN to server/.env to raise the limit.",
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to analyze profile" });
  }
});

module.exports = router;
