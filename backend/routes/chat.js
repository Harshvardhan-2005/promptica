const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/auth");

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AVAILABLE_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Quick responses" },
];

// GET /api/chat/models
router.get("/models", protect, (req, res) => {
  res.json(AVAILABLE_MODELS);
});

// POST /api/chat/send — stream response
router.post("/send", protect, async (req, res) => {
  try {
    const { chatId, message, model = "gpt-4o-mini" } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
    } else {
      chat = await Chat.create({
        user: req.user._id,
        model,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({ role: "user", content: message });

    // Build OpenAI messages
    const openaiMessages = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Set up SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send chat ID first
    res.write(`data: ${JSON.stringify({ type: "chatId", chatId: chat._id })}\n\n`);

    // Stream from OpenAI
    const stream = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`);
      }
    }

    // Save assistant response
    chat.messages.push({ role: "assistant", content: fullResponse });
    if (chat.messages.length === 2) {
      const firstMsg = chat.messages[0].content;
      chat.title = firstMsg.length > 60 ? firstMsg.substring(0, 60) + "…" : firstMsg;
    }
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: "done", chatId: chat._id })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
      res.end();
    }
  }
});

// DELETE /api/chat/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
