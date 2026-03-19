const express = require("express");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/auth");

const router = express.Router();

const AVAILABLE_MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    description: "Most capable",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    description: "Fast & efficient",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    description: "Great for coding",
  },
];

router.get("/models", protect, (req, res) => {
  res.json(AVAILABLE_MODELS);
});

router.post("/send", protect, async (req, res) => {
  try {
    const { chatId, message, model = "llama-3.3-70b-versatile" } = req.body;

    if (!message)
      return res.status(400).json({ message: "Message is required" });

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
    } else {
      chat = await Chat.create({ user: req.user._id, model, messages: [] });
    }

    chat.messages.push({ role: "user", content: message });

    const groqMessages = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(
      `data: ${JSON.stringify({ type: "chatId", chatId: chat._id })}\n\n`,
    );

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          stream: true,
          max_tokens: 1024,
        }),
      },
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "AI service error" })}\n\n`,
      );
      res.end();
      return;
    }

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || "";
          if (delta) {
            fullResponse += delta;
            res.write(
              `data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`,
            );
          }
        } catch {}
      }
    }

    chat.messages.push({ role: "assistant", content: fullResponse });
    if (chat.messages.length === 2) {
      const firstMsg = chat.messages[0].content;
      chat.title =
        firstMsg.length > 60 ? firstMsg.substring(0, 60) + "…" : firstMsg;
    }
    await chat.save();

    res.write(
      `data: ${JSON.stringify({ type: "done", chatId: chat._id })}\n\n`,
    );
    res.end();
  } catch (err) {
    console.error("Chat error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    } else {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`,
      );
      res.end();
    }
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
