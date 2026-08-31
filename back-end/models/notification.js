const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification category
    type: {
      type: String,
      enum: [
        "appointment_confirmed",
        "appointment_cancelled",
        "appointment_completed",
        "appointment_reminder",
        "session_feedback",
        "assessment_result",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ID of the related appointment/session/assessment result
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Used by frontend to navigate to the related page
    referenceType: {
      type: String,
      enum: [
        "Appointment",
        "Session",
        "AssessmentResult",
        null,
      ],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);