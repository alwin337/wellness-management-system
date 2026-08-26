const express = require("express");

const router = express.Router();

const {
  getAssessments,
  getAssessment,
  submitAssessment,
  getMyResults,
  getMyResult,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require(
  "../controllers/assessmentController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const {
  studentOnly,
} = require(
  "../middleware/studentMiddleware"
);

const {
  adminOnly,
} = require(
  "../middleware/adminMiddleware"
);


// STUDENT ROUTES

// Get all assessments
router.get(
  "/",
  protect,
  studentOnly,
  getAssessments
);


// Get student's result history
router.get(
  "/my-results",
  protect,
  studentOnly,
  getMyResults
);


// Get one result
router.get(
  "/results/:id",
  protect,
  studentOnly,
  getMyResult
);


// Get assessment
router.get(
  "/:id",
  protect,
  studentOnly,
  getAssessment
);


// Submit assessment
router.post(
  "/:id/submit",
  protect,
  studentOnly,
  submitAssessment
);


// ADMIN ROUTES

// Create assessment
router.post(
  "/admin/create",
  protect,
  adminOnly,
  createAssessment
);


// Update assessment
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateAssessment
);


// Deactivate assessment
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteAssessment
);


module.exports = router;