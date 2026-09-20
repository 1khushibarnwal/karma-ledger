const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    githubUsername: { type: String, required: true, unique: true, index: true },
    avatarUrl: String,
    name: String,
    score: { type: Number, required: true }, // combined total (ML + Codeforces bonus, clamped) — this is what gets minted
    mlScore: { type: Number, required: true }, // pure GitHub-derived ML score, unaffected by any bonus
    tier: { type: String, required: true }, // tier of the combined total score
    featureContributions: { type: Object },
    codeforcesHandle: { type: String, default: null },
    codeforcesBonus: { type: Number, default: 0 },
    walletAddress: { type: String, default: null },
    mintTxHash: { type: String, default: null },
    lastScoredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profile", ProfileSchema);
