require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const scoreRoutes = require("./routes/score");
const mintRoutes = require("./routes/mint");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.json({ status: "KarmaLedger API running" }));
app.use("/api/score", scoreRoutes);
app.use("/api/mint", mintRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`KarmaLedger API listening on http://localhost:${PORT}`),
);
