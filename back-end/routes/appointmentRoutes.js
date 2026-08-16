const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  getMyAppointmentById,
  cancelMyAppointment,
  getCounsellorAppointments,
  getCounsellorAppointmentById,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");

const router = express.Router();


// PATIENT ROUTES
// Book appointment
router.post(
  "/",
  protect,
  roleCheck("student"),
  createAppointment
);

// View own appointments
router.get(
  "/my",
  protect,
  roleCheck("student"),
  getMyAppointments
);

// View one appointment
router.get(
  "/my/:id",
  protect,
  roleCheck("student"),
  getMyAppointmentById
);

// Cancel own appointment
router.patch(
  "/my/:id/cancel",
  protect,
  roleCheck("student"),
  cancelMyAppointment
);


// COUNSELLOR ROUTES
// View counsellor's appointments
router.get(
  "/counsellor",
  protect,
  roleCheck("counsellor"),
  getCounsellorAppointments
);

// View one appointment
router.get(
  "/counsellor/:id",
  protect,
  roleCheck("counsellor"),
  getCounsellorAppointmentById
);

// Update appointment status
router.patch(
  "/counsellor/:id/status",
  protect,
  roleCheck("counsellor"),
  updateAppointmentStatus
);


module.exports = router;