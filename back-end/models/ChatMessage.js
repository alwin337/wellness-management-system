const mongoose = require("mongoose");

const chatMessageSchema =
  new mongoose.Schema(
    {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatConversation",
        required: true,
      },

      sender: {
        type: String,
        enum: [
          "student",
          "assistant",
          "system",
        ],
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      // Used for safety classification
      safetyLevel: {
        type: String,
        enum: [
          "normal",
          "concern",
          "urgent",
        ],
        default: "normal",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);