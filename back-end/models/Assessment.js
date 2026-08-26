const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [optionSchema],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const levelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    min: {
      type: Number,
      required: true,
    },

    max: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    recommendation: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "stress",
        "anxiety",
        "mood",
        "academic_stress",
        "sleep",
        "general_wellbeing",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
    },

    questions: {
      type: [questionSchema],
      required: true,
    },

    scoring: {
      type: {
        type: String,
        enum: [
          "sum",
          "percentage",
          "validated",
        ],
        default: "sum",
      },

      multiplier: {
        type: Number,
        default: 1,
      },

      maxScore: {
        type: Number,
        required: true,
      },

      levels: {
        type: [levelSchema],
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Assessment",
  assessmentSchema
);