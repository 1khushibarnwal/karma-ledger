const weights = require("./weights.json");

// Normalize raw GitHub signals into the same 0-1 feature space the model was trained on.
// The caps below are deliberately generous (say, 30 commits/week = max score for that
// feature) so realistic active developers land in a healthy mid-to-high range.
function normalizeFeatures(raw) {
  return {
    commit_frequency: clamp01(raw.commits_last_90d_sampled / (30 * 12)), // ~30/week over ~12 weeks of sampled events
    repo_diversity: clamp01(raw.distinct_languages / 6),
    project_depth: clamp01(raw.avg_commits_per_repo / 15),
    community_signal: clamp01(Math.log2(1 + raw.followers + raw.total_stars) / 10),
    consistency: clamp01(raw.longest_streak_days / 30),
  };
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Runs the trained logistic-regression model on a user's normalized GitHub features.
 * Returns both the final 0-1000 Karma Score and a per-feature contribution breakdown
 * so the frontend can show *why* someone scored the way they did (judges love this).
 */
function computeKarmaScore(rawFeatures) {
  const norm = normalizeFeatures(rawFeatures);
  const { feature_order, weights: w, bias } = weights;

  let z = bias;
  const contributions = {};
  feature_order.forEach((name, i) => {
    const contribution = norm[name] * w[i];
    contributions[name] = Number(contribution.toFixed(3));
    z += contribution;
  });

  const probability = sigmoid(z); // 0-1 "reliability" probability from the model
  const score = Math.round(probability * 1000); // scale to 0-1000 Karma Score

  let tier = "Bronze";
  if (score >= 800) tier = "Platinum";
  else if (score >= 600) tier = "Gold";
  else if (score >= 400) tier = "Silver";

  return {
    score,
    tier,
    probability: Number(probability.toFixed(4)),
    normalizedFeatures: norm,
    featureContributions: contributions,
    modelInfo: {
      type: "Logistic Regression",
      testAccuracy: weights.test_accuracy,
    },
  };
}

module.exports = { computeKarmaScore, normalizeFeatures };
