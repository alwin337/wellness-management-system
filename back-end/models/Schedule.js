const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);