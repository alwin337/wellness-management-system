const mongoose = require("mongoose");

// Student answer
const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// Assessment result
const assessmentResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },

    instrumentName: {
      type: String,
      required: true,
    },

    instrumentVersion: {
      type: String,
    },

    answers: {
      type: [answerSchema],
      required: true,
    },

    rawScore: {
      type: Number,
      required: true,
    },

    totalScore: {
      type: Number,
      required: true,
    },

    maxScore: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    resultDescription: {
      type: String,
    },

    recommendation: {
      type: String,
    },

    components: {
        type: Map,
        of: Number,
        default: undefined,
      },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);