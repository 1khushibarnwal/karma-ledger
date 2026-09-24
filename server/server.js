require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const scoreRoutes = require("./routes/score");
const mintRoutes = require("./routes/mint");
const leaderboardRoutes = require("./routes/leaderboard");
const assistantRoutes = require("./routes/assistant");

const app = express();
// In production set CLIENT_URL to your Vercel URL(s), comma-separated.
// If unset (local dev) all origins are allowed.
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.json({ status: "KarmaLedger API running" }));
app.use("/api/score", scoreRoutes);
app.use("/api/mint", mintRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/assistant", assistantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`KarmaLedger API listening on http://localhost:${PORT}`),
);
