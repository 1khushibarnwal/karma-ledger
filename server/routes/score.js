const express = require("express");
const router = express.Router();
const { fetchGithubProfile } = require("../services/githubService");
const { fetchCodeforcesProfile } = require("../services/codeforcesService");
const {
  computeKarmaScore,
  computeCodeforcesBonus,
  tierFor,
} = require("../services/mlScorer");
const Profile = require("../models/Profile");

// GET /api/score/:username?cfHandle=optional_codeforces_handle
// Always computes the GitHub-derived ML score. If a Codeforces handle is
// supplied and resolves successfully, its rating contributes an additional,
// separately-reported bonus on top — never silently blended into the ML
// model's own weights/accuracy figures.
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const { cfHandle } = req.query;

  try {
    const profile = await fetchGithubProfile(username);
    const mlResult = computeKarmaScore(profile.raw);

    let codeforces = null;
    let codeforcesBonus = 0;
    let codeforcesError = null;

    if (cfHandle) {
      try {
        codeforces = await fetchCodeforcesProfile(cfHandle);
        codeforcesBonus = computeCodeforcesBonus(codeforces);
      } catch (cfErr) {
        // A bad/unknown Codeforces handle should never fail the whole request —
        // the GitHub-derived score still stands on its own.
        codeforcesError = cfErr.message || "Could not verify Codeforces handle";
      }
    }

    const totalScore = Math.min(1000, mlResult.score + codeforcesBonus);
    const tier = tierFor(totalScore);

    const saved = await Profile.findOneAndUpdate(
      { githubUsername: profile.username },
      {
        githubUsername: profile.username,
        avatarUrl: profile.avatar_url,
        name: profile.name,
        score: totalScore,
        mlScore: mlResult.score,
        tier,
        featureContributions: mlResult.featureContributions,
        codeforcesHandle: codeforces?.handle || null,
        codeforcesBonus,
        lastScoredAt: new Date(),
      },
      { upsert: true, new: true },
    );

    res.json({
      profile,
      score: totalScore,
      mlScore: mlResult.score,
      tier,
      probability: mlResult.probability,
      normalizedFeatures: mlResult.normalizedFeatures,
      featureContributions: mlResult.featureContributions,
      modelInfo: mlResult.modelInfo,
      codeforces,
      codeforcesBonus,
      codeforcesError,
      dbId: saved._id,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res
        .status(404)
        .json({ error: `GitHub user "${username}" not found` });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({
        error:
          "GitHub API rate limit hit. Add a GITHUB_TOKEN to server/.env to raise the limit.",
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to analyze profile" });
  }
});

module.exports = router;
