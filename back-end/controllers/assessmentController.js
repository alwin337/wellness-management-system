const mongoose = require("mongoose");

const Assessment = require(
  "../models/Assessment"
);

const AssessmentResult = require(
  "../models/AssessmentResult"
);

const {
  calculateAssessmentScore,
} = require(
  "../services/assessmentScoringService"
);

// Get all active assessments
const getAssessments = async (
  req,
  res
) => {
  try {
    const assessments =
      await Assessment.find({
        isActive: true,
      }).select(
        "title category instrument description instructions questions scoring.method scoring.maxScore scoring.responseMin scoring.responseMax"
      );

    res.status(200).json({
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENTS ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessments",
      error: error.message,
    });
  }
};

// Get one assessment
const getAssessment = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid assessment ID",
      });
    }

    const assessment =
      await Assessment.findById(
        req.params.id
      );

    if (!assessment) {
      return res.status(404).json({
        message:
          "Assessment not found",
      });
    }

    if (!assessment.isActive) {
      return res.status(404).json({
        message:
          "Assessment is currently unavailable",
      });
    }

    res.status(200).json({
      assessment,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENT ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment",
      error: error.message,
    });
  }
};

// Submit assessment
const submitAssessment = async (
  req,
  res
) => {
  try {
    const { answers } = req.body;

    if (
      !answers ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message:
          "Answers must be provided as an array",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid assessment ID",
      });
    }

    const assessment =
      await Assessment.findById(
        req.params.id
      );

    if (!assessment) {
      return res.status(404).json({
        message:
          "Assessment not found",
      });
    }

    if (!assessment.isActive) {
      return res.status(400).json({
        message:
          "This assessment is currently unavailable",
      });
    }

    // Calculate result
    const result =
      calculateAssessmentScore(
        assessment,
        answers
      );

    // Save result
    const savedResult =
      await AssessmentResult.create({
        userId: req.user._id,

        assessmentId:
          assessment._id,

        instrumentName:
          assessment.instrument.name,

        instrumentVersion:
          assessment.instrument.version,

        answers:
          result.answers,

        rawScore:
          result.rawScore,

        totalScore:
          result.totalScore,

        maxScore:
          result.maxScore,

        percentage:
          result.percentage,

        level:
          result.level,

        resultDescription:
          result.description,

        recommendation:
          result.recommendation,
      });

    res.status(201).json({
      message:
        "Assessment completed successfully",

      result: {
        id:
          savedResult._id,

        assessment:
          assessment.title,

        category:
          assessment.category,

        instrument:
          assessment.instrument.name,

        version:
          assessment.instrument.version,

        score:
          result.totalScore,

        maxScore:
          result.maxScore,

        percentage:
          result.percentage,

        level:
          result.level,

        description:
          result.description,

        recommendation:
          result.recommendation,

        completedAt:
          savedResult.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "SUBMIT ASSESSMENT ERROR:",
      error.message
    );

    res.status(400).json({
      message:
        error.message ||
        "Error submitting assessment",
    });
  }
};

// Get student's assessment history
const getMyResults = async (
  req,
  res
) => {
  try {
    const results =
      await AssessmentResult.find({
        userId: req.user._id,
      })
        .populate(
          "assessmentId",
          "title category instrument"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "GET RESULTS ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment history",
      error: error.message,
    });
  }
};

// Get one student's result
const getMyResult = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid result ID",
      });
    }

    const result =
      await AssessmentResult.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).populate(
        "assessmentId",
        "title category instrument description"
      );

    if (!result) {
      return res.status(404).json({
        message:
          "Assessment result not found",
      });
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.error(
      "GET RESULT ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment result",
      error: error.message,
    });
  }
};

// Admin creates assessment
const createAssessment = async (
  req,
  res
) => {
  try {
    const {
      title,
      category,
      instrument,
      description,
      instructions,
      questions,
      scoring,
    } = req.body;

    if (
      !title ||
      !category ||
      !instrument ||
      !instrument.name ||
      !questions ||
      !scoring
    ) {
      return res.status(400).json({
        message:
          "Title, category, instrument, questions and scoring are required",
      });
    }

    const assessment =
      await Assessment.create({
        title,
        category,
        instrument,
        description,
        instructions,
        questions,
        scoring,
      });

    res.status(201).json({
      message:
        "Assessment created successfully",

      assessment,
    });
  } catch (error) {
    console.error(
      "CREATE ASSESSMENT ERROR:",
      error.message
    );

    res.status(400).json({
      message:
        "Error creating assessment",
      error: error.message,
    });
  }
};

// Admin updates assessment
const updateAssessment = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid assessment ID",
      });
    }

    const assessment =
      await Assessment.findById(
        req.params.id
      );

    if (!assessment) {
      return res.status(404).json({
        message:
          "Assessment not found",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "instrument",
      "description",
      "instructions",
      "questions",
      "scoring",
      "isActive",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          assessment[field] =
            req.body[field];
        }
      }
    );

    await assessment.save();

    res.status(200).json({
      message:
        "Assessment updated successfully",

      assessment,
    });
  } catch (error) {
    console.error(
      "UPDATE ASSESSMENT ERROR:",
      error.message
    );

    res.status(400).json({
      message:
        "Error updating assessment",
      error: error.message,
    });
  }
};

// Admin deactivates assessment
const deleteAssessment = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid assessment ID",
      });
    }

    const assessment =
      await Assessment.findById(
        req.params.id
      );

    if (!assessment) {
      return res.status(404).json({
        message:
          "Assessment not found",
      });
    }

    assessment.isActive = false;

    await assessment.save();

    res.status(200).json({
      message:
        "Assessment deactivated successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ASSESSMENT ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error deactivating assessment",
      error: error.message,
    });
  }
};

module.exports = {
  getAssessments,
  getAssessment,
  submitAssessment,
  getMyResults,
  getMyResult,
  createAssessment,
  updateAssessment,
  deleteAssessment,
};