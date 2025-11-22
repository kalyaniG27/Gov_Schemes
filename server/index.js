// server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { analyzeQuery } = require("./ruleEngine");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ⭐ MAIN VOICE QUERY ENDPOINT
app.post("/api/voice-query", (req, res) => {
  const { text, language } = req.body;

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  console.log("🎤 Voice received:", text, " | Language:", language);

  const result = analyzeQuery(text, language || "en");

  return res.json({
    answer: result.answer,
    language: result.language,
    matchedCategory: result.matchedCategory || null,
  });
});

// BACKUP ROUTE (Optional)
app.post("/voice", (req, res) => {
  const { text } = req.body;
  console.log("🎤 /voice legacy route:", text);

  let answer = "Sorry, I did not understand.";

  if (text.toLowerCase().includes("farmer")) {
    answer = "Available schemes include PM-Kisan, Crop Insurance & Soil Health Card.";
  }

  res.json({ answer });
});

app.listen(PORT, () => {
  console.log(`🚀 Voice rule-engine server running on http://localhost:${PORT}`);
});
