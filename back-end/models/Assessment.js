const mongoose = require("mongoose");

// Answer option
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
    },
  },
  {
    _id: false,
  }
);

// Assessment question
const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
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

// Result interpretation
const interpretationSchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      required: true,
    },

    max: {
      type: Number,
      required: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    recommendation: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// Assessment
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

    instrument: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      version: {
        type: String,
        trim: true,
      },
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

      validate: {
        validator: function (questions) {
          return questions.length > 0;
        },

        message:
          "Assessment must contain at least one question",
      },
    },

    scoring: {
      method: {
        type: String,

        enum: [
          "sum",
          "reverse_sum",
          "who5",
        ],

        required: true,
      },

      multiplier: {
        type: Number,
        default: 1,
      },

      maxScore: {
        type: Number,
        required: true,
      },

      reverseScoredQuestions: {
        type: [String],
        default: [],
      },

      responseMin: {
        type: Number,
        required: true,
      },

      responseMax: {
        type: Number,
        required: true,
      },

      interpretations: {
        type: [interpretationSchema],
        default: [],
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