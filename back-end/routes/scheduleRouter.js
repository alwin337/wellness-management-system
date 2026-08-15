const express = require("express");

const router = express.Router();

const {
  addSchedule,
  getAllSchedules,
  getCounsellorSchedules,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");


// ==========================================
// VIEW SCHEDULES
// ==========================================

// Logged-in users and counsellors can view schedules
router.get(
  "/",
  protect,
  roleCheck("student", "counsellor"),
  getAllSchedules
);


// View schedules of a specific counsellor
router.get(
  "/counsellor/:counsellorId",
  protect,
  roleCheck("student", "counsellor"),
  getCounsellorSchedules
);


// ==========================================
// COUNSELLOR MANAGEMENT
// ==========================================

// Counsellor creates schedule
router.post(
  "/",
  protect,
  roleCheck("counsellor"),
  addSchedule
);


// Counsellor updates schedule
router.put(
  "/:id",
  protect,
  roleCheck("counsellor"),
  updateSchedule
);


// Counsellor deletes schedule
router.delete(
  "/:id",
  protect,
  roleCheck("counsellor"),
  deleteSchedule
);


module.exports = router;