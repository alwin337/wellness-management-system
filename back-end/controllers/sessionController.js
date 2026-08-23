const Session = require("../models/Session");
const Appointment = require("../models/Appointment");
const Counsellor = require("../models/Counsellor");
const User = require("../models/User");

const getLoggedInCounsellor = async (userId) => {
  return await Counsellor.findOne({
    user: userId,
  });
};

//complete appointment + session

const createSession = async (req, res) => {
  try {
    const { appointmentId, notes } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID is required",
      });
    }

    //find counsellor profile
    const counsellor = await getLoggedInCounsellor(req.user._id);

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    //find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    //check appointments
    if (appointment.counsellorId.toString() !== counsellor._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to complete this appointment",
      });
    }

    //confirmedAppointments
    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed appointments can be completed",
      });
    }

    //check if session alr exists
    const existingSession = await Session.findOne({
      appointmentId: appointment._id,
    });

    if (existingSession) {
      return res.status(400).json({
        message: "Session already exists",
      });
    }

    //creates session
    const session = await Session.create({
      appointmentId: appointment._id,
      userId: appointment.userId,
      counsellorId: appointment.counsellorId,
      reason: appointment.reason,
      notes: notes || "",
      sessionDate: new Date(),
    });

    // Change appointment status
    appointment.status = "completed";

    await appointment.save();

    res.status(201).json({
      message: "Session completed successfully",
      session,
    });
  } catch (error) {
    console.error("CREATE SESSION ERROR:", error.message);

    res.status(500).json({
      message: "Error completing session",
      error: error.message,
    });
  }
};

//get past appointments
const getPastAppointments = async (req, res) => {
  try {
    const counsellor = await getLoggedInCounsellor(req.user._id);

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    const appointments = await Appointment.find({
      counsellorId: counsellor._id,
      status: {
        $in: ["completed", "cancelled"],
      },
    })
      .populate("userId", "name email department")
      .populate("counsellorId", "specialization contactNumber")
      .sort({
        appointmentDate: -1,
      });

    res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error("PAST APPOINTMENTS ERROR:", error.message);

    res.status(500).json({
      message: "Error fetching past appointments",
      error: error.message,
    });
  }
};


//get all sessions
const getMySessions = async (req, res) => {
  try {
    const counsellor = await getLoggedInCounsellor(
      req.user._id
    );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    const sessions = await Session.find({
      counsellorId: counsellor._id,
    })
      .populate(
        "userId",
        "name email department"
      )
      .populate(
        "appointmentId",
        "appointmentDate startTime endTime reason status"
      )
      .sort({
        sessionDate: -1,
      });

    res.status(200).json({
      totalSessions: sessions.length,
      sessions,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message,
    });
  }
};

//get student session history
const getStudentSessionHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const counsellor = await getLoggedInCounsellor(
      req.user._id
    );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    // Check student
    const student = await User.findById(
      studentId
    ).select("name email department");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Only sessions between this counsellor
    // and this student
    const sessions = await Session.find({
      counsellorId: counsellor._id,
      userId: studentId,
    })
      .populate(
        "appointmentId",
        "appointmentDate startTime endTime reason status"
      )
      .sort({
        sessionDate: -1,
      });

    res.status(200).json({
      student,
      totalSessions: sessions.length,
      sessions,
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Error fetching student session history",
      error: error.message,
    });
  }
};

//send feedback

const sendFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        message: "Feedback is required",
      });
    }

    const counsellor = await getLoggedInCounsellor(
      req.user._id
    );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    const session = await Session.findById(
      req.params.id
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Make sure counsellor owns session
    if (
      session.counsellorId.toString() !==
      counsellor._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to send feedback",
      });
    }

    // Make sure appointment is completed
    const appointment = await Appointment.findById(
      session.appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        message:
          "Feedback can only be sent after session completion",
      });
    }

    // Save feedback
    session.feedback = feedback.trim();
    session.feedbackSent = true;

    await session.save();

    res.status(200).json({
      message: "Feedback sent successfully",

      feedback: {
        sessionId: session._id,
        feedback: session.feedback,
        feedbackSent: session.feedbackSent,
      },
    });

  } catch (error) {
    console.error(
      "FEEDBACK ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Error sending feedback",
      error: error.message,
    });
  }
};


//get single session
const getSession = async (req, res) => {
  try {
    const counsellor = await getLoggedInCounsellor(
      req.user._id
    );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor profile not found",
      });
    }

    const session = await Session.findById(
      req.params.id
    )
      .populate(
        "userId",
        "name email department"
      )
      .populate(
        "appointmentId",
        "appointmentDate startTime endTime reason status"
      );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Ownership check
    if (
      session.counsellorId.toString() !==
      counsellor._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this session",
      });
    }

    res.status(200).json({
      session,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching session",
      error: error.message,
    });
  }
};


module.exports = {
  createSession,
  getPastAppointments,
  getMySessions,
  getStudentSessionHistory,
  getSession,
  sendFeedback,
};

