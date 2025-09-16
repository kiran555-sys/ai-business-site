import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed because ES modules don’t have __dirname by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (your frontend: index.html, styles, images, etc.)
app.use(express.static(path.join(__dirname, ".")));

const OPENAI_API_KEY = "sk-XXXX..."; // 🔑 keep this secret in Render’s env vars!

// Chatbot endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant for small businesses." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t understand.";
    res.json({ reply });

  } catch (error) {
    console.error("❌ Error in /chat:", error);
    res.status(500).json({ reply: "Server error, please try again." });
  }
});

// Catch-all route: serve index.html for root ("/") and unknown paths
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
