const express = require("express");

const {
  getCounsellingStatistics,
} = require("../controllers/statisticsController");

const {
  protect,
  roleCheck,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN: VIEW COUNSELLING STATISTICS

router.get(
  "/",
  protect,
  roleCheck("admin"),
  getCounsellingStatistics
);

module.exports = router;