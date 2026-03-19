const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Auto-generate title from first user message
chatSchema.pre("save", function (next) {
  if (this.isNew && this.messages.length > 0) {
    const firstMsg = this.messages[0].content;
    this.title =
      firstMsg.length > 60 ? firstMsg.substring(0, 60) + "…" : firstMsg;
  }
  next();
});

module.exports = mongoose.model("Chat", chatSchema);
