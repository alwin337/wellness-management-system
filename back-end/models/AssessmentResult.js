const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
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

const assessmentResultSchema =
  new mongoose.Schema(
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

      answers: {
        type: [answerSchema],
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
    },

    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);