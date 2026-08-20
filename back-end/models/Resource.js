const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "article",
        "breathing_exercise",
        "meditation",
        "video",
        "audio",
        "guide",
        "tip",
      ],
    },

    category: {
      type: String,
      required: true,
      enum: [
        "stress",
        "anxiety",
        "depression",
        "sleep",
        "mindfulness",
        "self_care",
        "general",
      ],
      default: "general",
    },

    content: {
      type: String,
      default: "",
    },

    mediaUrl: {
      type: String,
      default: null,
    },

    thumbnailUrl: {
      type: String,
      default: null,
    },

    duration: {
      type: Number,
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);