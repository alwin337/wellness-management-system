const Appointment = require("../models/Appointment");
const Counsellor = require("../models/Counsellor");
const User = require("../models/User");

// ADMIN: VIEW COUNSELLING STATISTICS

const getCounsellingStatistics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    const totalCounsellors = await User.countDocuments({
      role: "counsellor",
    });

    const totalAppointments =
      await Appointment.countDocuments();

    const pendingAppointments =
      await Appointment.countDocuments({
        status: "pending",
      });

    const confirmedAppointments =
      await Appointment.countDocuments({
        status: "confirmed",
      });

    const completedAppointments =
      await Appointment.countDocuments({
        status: "completed",
      });

    const cancelledAppointments =
      await Appointment.countDocuments({
        status: "cancelled",
      });

    const rejectedAppointments =
      await Appointment.countDocuments({
        status: "rejected",
      });

    res.status(200).json({
      statistics: {
        totalStudents,
        totalCounsellors,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
      },
    });

  } catch (error) {
    console.error(
      "GET COUNSELLING STATISTICS ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch counselling statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getCounsellingStatistics,
};