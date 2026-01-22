const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `
You are an AI assistant inside a Virtual Internship Portal.

This portal has:
- Students, Companies, and Admin roles
- Students can browse and apply for internships
- Companies can post internships and review applicants
- Admin manages the entire system
- Students see AI recommendations on their dashboard

Answer only about this website.
Be short, clear, and helpful.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("OpenAI raw response:", response);
      return res.status(500).json({ error: "AI returned no text" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI service failed" });
  }
});

module.exports = router;