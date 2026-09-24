const express = require("express");
const router = express.Router();
const { askAssistant } = require("../services/assistantService");

// Minimal in-memory rate limit: 15 messages / 10 minutes per IP.
// Resets on server restart and isn't shared across multiple server instances —
// fine for a single Render instance; swap for a Mongo/Redis-backed limiter if you scale out.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) {
    return res
      .status(429)
      .json({
        error: "Too many questions — please wait a few minutes and try again.",
      });
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  next();
}

router.post("/chat", rateLimit, async (req, res) => {
  const { message, history } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: "message is too long" });
  }
  try {
    const reply = await askAssistant(
      message.trim(),
      Array.isArray(history) ? history : [],
    );
    res.json({ reply });
  } catch (err) {
    console.error("Assistant error:", err.message);
    res
      .status(err.status || 500)
      .json({ error: "The assistant is temporarily unavailable." });
  }
});

module.exports = router;
