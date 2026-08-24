const mongoose = require("mongoose");

const facilityRequestSchema = new mongoose.Schema(
  {
    // Stored internally but NEVER exposed
    // to admin UI.
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "air_conditioner",
        "fan",
        "lighting",
        "furniture",
        "room",
        "electrical",
        "cleanliness",
        "other",
      ],
      default: "other",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "pending",
    },

    adminResponse: {
      type: String,
      trim: true,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FacilityRequest",
  facilityRequestSchema
);