const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(" No Bearer token");
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN RECEIVED:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    console.log("USER FOUND:", user);

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    console.log("✅ PROTECT PASSED");
    console.log("ROLE:", req.user.role);

    next();

  } catch (error) {
    console.log("❌ JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message
    });
  }
};

module.exports = protect;