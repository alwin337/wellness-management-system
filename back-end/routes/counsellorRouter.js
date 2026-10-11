const express = require("express");

const router = express.Router();

const {
  addCounsellor,
  getAllCounsellors,
  getActiveCounsellors,
  getCounsellor,
  updateCounsellor,
  deactivateCounsellor,
  activateCounsellor,
} = require("../controllers/counsellorController");

const protect = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All counsellor routes require login and admin access
router.use(protect, adminOnly);

// Get all counsellors
router.get("/", getAllCounsellors);

// Get active counsellors
router.get("/active", getActiveCounsellors);

// Get single counsellor
router.get("/:id", getCounsellor);

// Add counsellor
router.post("/", addCounsellor);

// Update counsellor
router.put("/:id", updateCounsellor);

// Deactivate counsellor
router.patch(
  "/:id/deactivate",
  deactivateCounsellor
);

// Activate counsellor
router.patch(
  "/:id/activate",
  activateCounsellor
);

module.exports = router;