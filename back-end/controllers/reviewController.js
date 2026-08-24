const Review = require("../models/Review")
const Appointment = require("../models/Appointment")
const Counsellor = require("../models/Counsellor")

//student submits Anonymous Review
// /api/reviews 

const createReview = async (req, res) => {
  try {
    const {
      appointmentId,
      rating,
      comment,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

     // Find appointment
    const appointment =
      await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

     // Make sure appointment belongs to logged-in student
    if (
      appointment.userId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to review this appointment",
      });
    }

    // Only completed sessions can be reviewed
    if (appointment.status !== "completed") {
      return res.status(400).json({
        message:
          "You can review only completed sessions",
      });
    }

    const existingReview =
      await Review.findOne({
        appointmentId,
      });

    if (existingReview) {
      return res.status(400).json({
        message:
          "You have already reviewed this session",
      });
    }

    const review = await Review.create({
      studentId: req.user._id,
      counsellorId: appointment.counsellorId,
      appointmentId: appointment._id,
      rating,
      comment: comment || "",
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Anonymous review submitted successfully",

      review: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        isAnonymous: true,
      },
    });

    } catch (error) {
    console.error(
      "CREATE REVIEW ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Error submitting review",
      error: error.message,
    });
  }
};

//counsellor views anonymous review

const getCounsellorReviews = async (req, res) => {
  try {
    const counsellor =
      await Counsellor.findOne({
        user: req.user._id,
      });

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

     // Do NOT populate studentId
    const reviews =
      await Review.find({
        counsellorId: counsellor._id,
      })
        .select(
          "rating comment isAnonymous createdAt"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      reviews,
    });

     } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};


module.exports = {
  createReview,
  getCounsellorReviews,
}; 