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


// GET ALL ASSESSMENTS
// GET /api/assessments
// STUDENT

const getAssessments = async (
  req,
  res
) => {

  try {

    const assessments =
      await Assessment.find({
        isActive: true,
      }).select(
        "title category description instructions questions scoring.type scoring.maxScore"
      );

    res.status(200).json({
      count: assessments.length,
      assessments,
    });

  } catch (error) {

    console.error(
      "GET ASSESSMENTS:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessments",
      error: error.message,
    });
  }
};


// GET SINGLE ASSESSMENT
// GET /api/assessments/:id


const getAssessment = async (
  req,
  res
) => {

  try {

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
      "GET ASSESSMENT:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment",
      error: error.message,
    });
  }
};


// SUBMIT ASSESSMENT
// POST /api/assessments/:id/submit

const submitAssessment = async (
  req,
  res
) => {

  try {

    const {
      answers,
    } = req.body;

    // Validate request
    

    if (
      !answers ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message:
          "Answers must be provided as an array",
      });
    }

    
    // Find assessment
   
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

    // Calculate score
    const result =
      calculateAssessmentScore(
        assessment,
        answers
      );

    // Save result

    const savedResult =
      await AssessmentResult.create({

        userId:
          req.user._id,

        assessmentId:
          assessment._id,

        answers:
          result.answers,

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

    // Response

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
      "SUBMIT ASSESSMENT:",
      error.message
    );

    res.status(400).json({
      message:
        error.message ||
        "Error submitting assessment",
    });
  }
};


// GET MY RESULTS
// GET /api/assessments/my-results

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
          "title category"
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
      "GET MY RESULTS:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment history",
      error: error.message,
    });
  }
};


// GET ONE RESULT
// GET /api/assessments/results/:id

const getMyResult = async (
  req,
  res
) => {

  try {

    const result =
      await AssessmentResult.findOne({
        _id: req.params.id,
        userId: req.user._id,
      })
        .populate(
          "assessmentId",
          "title category description"
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
      "GET RESULT:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching assessment result",
      error: error.message,
    });
  }
};


// ADMIN CREATE ASSESSMENT
// ADMIN

const createAssessment = async (
  req,
  res
) => {

  try {

    const {
      title,
      category,
      description,
      instructions,
      questions,
      scoring,
    } = req.body;

    if (
      !title ||
      !category ||
      !questions ||
      !scoring
    ) {
      return res.status(400).json({
        message:
          "Title, category, questions and scoring are required",
      });
    }

    const assessment =
      await Assessment.create({
        title,
        category,
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
      "CREATE ASSESSMENT:",
      error.message
    );

    res.status(400).json({
      message:
        "Error creating assessment",
      error: error.message,
    });
  }
};


// ADMIN UPDATE ASSESSMENT


const updateAssessment = async (
  req,
  res
) => {

  try {

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

    res.status(400).json({
      message:
        "Error updating assessment",
      error: error.message,
    });
  }
};


// ADMIN DELETE/DEACTIVATE ASSESSMENT

const deleteAssessment = async (
  req,
  res
) => {

  try {

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

    // Soft delete
    assessment.isActive = false;

    await assessment.save();

    res.status(200).json({
      message:
        "Assessment deactivated successfully",
    });

  } catch (error) {

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