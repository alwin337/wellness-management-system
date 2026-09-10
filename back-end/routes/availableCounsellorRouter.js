const express = require("express");

const router = express.Router();

const {
  getActiveCounsellors,
} = require("../controllers/counsellorController");

const protect = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  getActiveCounsellors
);

module.exports = router;