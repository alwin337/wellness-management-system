const express = require("express");

const {
  createResource,
  getResources,
} = require("../controllers/resourceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get published resources
router.get("/", getResources);

// Create resource
router.post("/", authMiddleware, createResource);

module.exports = router;