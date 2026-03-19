const express = require("express");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/history — list all chats (no messages)
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select("title model createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/history/:id — get single chat with messages
router.get("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
