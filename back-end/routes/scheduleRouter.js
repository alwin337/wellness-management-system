const express = require("express");

const router = express.Router();

const {
  addSchedule,
  getAllSchedules,
  getCounsellorSchedules,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");


// VIEW SCHEDULES
// Logged-in users


router.get(
  "/",
  protect,
  getAllSchedules
);

router.get(
  "/counsellor/:counsellorId",
  protect,
  getCounsellorSchedules
);


// ADMIN MANAGEMENT


router.post(
  "/",
  protect,
  adminOnly,
  addSchedule
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateSchedule
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteSchedule
);


module.exports = router;