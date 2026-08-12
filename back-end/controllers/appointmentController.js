const Appointment = require("../models/Appointment");
const Schedule = require("../models/Schedule");
const Counsellor = require("../models/Counsellor");


// PATIENT: BOOK APPOINTMENT

const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      counsellorId,
      scheduleId,
      reason,
      notes,
    } = req.body;

    // Check schedule
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      counsellorId,
      isAvailable: true,
    });

    if (!schedule) {
      return res.status(400).json({
        message: "Schedule is not available",
      });
    }

    // Check counsellor
    const counsellor = await Counsellor.findById(counsellorId);

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor not found",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      counsellorId,
      scheduleId,
      appointmentDate: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      reason,
      notes,
    });

    // Make schedule unavailable
    schedule.isAvailable = false;
    await schedule.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};


// PATIENT: VIEW OWN APPOINTMENTS

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await Appointment.find({
      userId,
    })
      .populate(
        "counsellorId",
        "name email specialization contactNumber"
      )
      .populate(
        "scheduleId",
        "date startTime endTime isAvailable"
      )
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      appointments,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};


// PATIENT: VIEW ONE OF THEIR APPOINTMENTS

const getMyAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
    })
      .populate(
        "counsellorId",
        "name email specialization contactNumber"
      )
      .populate("scheduleId");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};


// PATIENT: CANCEL APPOINTMENT

const cancelMyAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        message: `Appointment cannot be cancelled because it is already ${appointment.status}`,
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Make schedule available again
    await Schedule.findByIdAndUpdate(
      appointment.scheduleId,
      {
        isAvailable: true,
      }
    );

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};


// COUNSELLOR: VIEW THEIR APPOINTMENTS

const getCounsellorAppointments = async (req, res) => {
  try {
    const counsellorId = req.user.counsellorId;

    const appointments = await Appointment.find({
      counsellorId,
    })
      .populate(
        "userId",
        "name email contactNumber"
      )
      .populate(
        "scheduleId",
        "date startTime endTime"
      )
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      appointments,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch counsellor appointments",
      error: error.message,
    });
  }
};


// COUNSELLOR: VIEW ONE APPOINTMENT

const getCounsellorAppointmentById = async (req, res) => {
  try {
    const counsellorId = req.user.counsellorId;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      counsellorId,
    })
      .populate(
        "userId",
        "name email contactNumber"
      )
      .populate("scheduleId");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};


// COUNSELLOR: UPDATE APPOINTMENT STATUS

const updateAppointmentStatus = async (req, res) => {
  try {
    const counsellorId = req.user.counsellorId;
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      counsellorId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    await appointment.save();

    // If cancelled/rejected, make schedule available again
    if (
      status === "cancelled" ||
      status === "rejected"
    ) {
      await Schedule.findByIdAndUpdate(
        appointment.scheduleId,
        {
          isAvailable: true,
        }
      );
    }

    res.status(200).json({
      message: `Appointment ${status} successfully`,
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};


module.exports = {
  createAppointment,
  getMyAppointments,
  getMyAppointmentById,
  cancelMyAppointment,
  getCounsellorAppointments,
  getCounsellorAppointmentById,
  updateAppointmentStatus,
};