//define routes

const express = require('express')

const {
    registerUser,
    loginUser,
    getProfile,
  } = require("../controllers/authController");
const protect = require('../middleware/authMiddleware')

console.log("registerUser:", typeof registerUser);
console.log("loginUser:", typeof loginUser);
console.log("getProfile:", typeof getProfile);
console.log("protect:", typeof protect);

const router = express.Router()

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

module.exports = router;