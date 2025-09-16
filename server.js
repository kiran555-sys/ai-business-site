import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY = "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";

app.post("/chat", async (req, res) => {
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
        { role: "user", content: userMessage }
      ],
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t understand.";
  res.json({ reply });
});

app.listen(3000, () => console.log("✅ Chatbot backend running at http://localhost:3000"));
