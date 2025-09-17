// server.js (ESM)
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json()); // replaces body-parser for modern Express

// Serve static files from ./public
app.use(express.static(path.join(__dirname, "public")));

// Use the OpenAI key from environment variables (do NOT hardcode in repo)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple health check (optional)
app.get("/_health", (req, res) => res.json({ ok: true }));

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body && req.body.message) ? req.body.message : "";

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set in env");
      return res.status(500).json({ reply: "Server not configured with OpenAI key." });
    }

    // Call OpenAI
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Chaya, a helpful assistant for small businesses." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.3
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("OpenAI returned non-OK:", resp.status, txt);
      return res.status(500).json({ reply: "AI service error." });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer that.";
    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ reply: "Server error, please try again." });
  }
});

// Important: use a regex catch-all to serve index.html for SPA routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server (Render will set PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
