const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50kb" }));

const SYSTEM = `Ты — Yomi, AI-помощник для психологической поддержки студентов АГУ.

Сначала обязательно определи эмоцию в формате:
<<<EMOTION:{"emotion":"грусть","confidence":82,"emoji":"😔"}>>>

Эмоции: радость, грусть, страх, злость, удивление, отвращение, тревога, усталость, нейтральная.

После JSON-блока напиши короткий поддерживающий ответ на русском языке.

Правила:
- 1–2 предложения.
- Не более 40 слов.
- Используй активное слушание.
- Не давай медицинских советов.
- Если уместно, предложи только одну простую технику самопомощи.
- Не используй длинные объяснения и списки.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: "Invalid history format"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Yomi"
        },
        body: JSON.stringify({
          model: "nex-agi/nex-n2-pro:free",
          messages: [
            {
              role: "system",
              content: SYSTEM
            },
            ...history
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    console.log("STATUS:", response.status);

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        error: data
      });
    }

    const content = data.choices?.[0]?.message?.content || "";

    res.json({
      content
    });

  } catch (err) {
    console.error("Server error:", err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Yomi OpenRouter server started");
});