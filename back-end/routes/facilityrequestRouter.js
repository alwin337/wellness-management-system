const express = require("express");

const router = express.Router();

const {
  createFacilityRequest,
  getAllFacilityRequests,
  updateFacilityRequest,
} = require(
  "../controllers/facilityRequestController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const {
  adminOnly,
} = require(
  "../middleware/adminMiddleware"
);


// STUDENT

router.post(
  "/",
  protect,
  createFacilityRequest
);


// ADMIN

router.get(
  "/",
  protect,
  adminOnly,
  getAllFacilityRequests
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateFacilityRequest
);


module.exports = router;