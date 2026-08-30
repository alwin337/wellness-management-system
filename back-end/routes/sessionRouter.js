const express = require("express");

const router = express.Router();

const {
  createSession,
  getPastAppointments,
  getMySessions,
  getStudentSessionHistory,
  getSession,
  sendFeedback,
  getMySessionHistory,
  getMySessionFeedback,
} = require("../controllers/sessionController");

const protect = require("../middleware/authMiddleware");

// Complete appointment + create session
router.post(
  "/",
  protect,
  createSession
);

// Counsellor's past appointments
router.get(
  "/past-appointments",
  protect,
  getPastAppointments
);

// Counsellor's sessions
router.get(
  "/my",
  protect,
  getMySessions
);

// Student's session history
router.get(
  "/student/:studentId",
  protect,
  getStudentSessionHistory
);

// Send feedback
router.put(
  "/:id/feedback",
  protect,
  sendFeedback
);

// Get single session
router.get(
  "/:id",
  protect,
  getSession
);

router.get(
  "/my/history",
  protect,
  getMySessionHistory
);

router.get(
  "/my/:id/feedback",
  protect,
  getMySessionFeedback
);

module.exports = router;