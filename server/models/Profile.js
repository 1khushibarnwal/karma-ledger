const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    githubUsername: { type: String, required: true, unique: true, index: true },
    avatarUrl: String,
    name: String,
    score: { type: Number, required: true },
    tier: { type: String, required: true },
    featureContributions: { type: Object },
    walletAddress: { type: String, default: null },
    mintTxHash: { type: String, default: null },
    lastScoredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
