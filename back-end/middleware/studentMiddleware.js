const studentOnly = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      message:
        "Self-assessment is available only to students",
    });
  }

  next();
};

module.exports = {
  studentOnly,
};