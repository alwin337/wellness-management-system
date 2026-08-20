const Schedule = require("../models/Schedule");
const Counsellor = require("../models/Counsellor");

// ADD SCHEDULE
// POST /api/schedules
// can added by both admin & counsellor


const addSchedule = async (req, res) => {
  try {
    let {
      counsellor,
      date,
      startTime,
      endTime,
    } = req.body;

    // If counsellor ID is not in body, resolve it if user is a counsellor
    if (!counsellor && req.user && req.user.role === 'counsellor') {
      const counsellorDoc = await Counsellor.findOne({ user: req.user._id });
      if (counsellorDoc) {
        counsellor = counsellorDoc._id;
      }
    }

    // Check required fields
    if (
      !counsellor ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message:
          "Counsellor, date, start time and end time are required",
      });
    }

    // Check counsellor exists
    const counsellorExists =
      await Counsellor.findById(counsellor);

    if (!counsellorExists) {
      return res.status(404).json({
        message: "Counsellor not found",
      });
    }

    // Check if start time is before end time
    if (startTime >= endTime) {
      return res.status(400).json({
        message: "Start time must be before end time",
      });
    }

    // Check duplicate schedule
    const existingSchedule =
      await Schedule.findOne({
        counsellor,
        date,
        startTime,
        endTime,
      });

    if (existingSchedule) {
      return res.status(400).json({
        message: "This schedule already exists",
      });
    }

    const schedule = await Schedule.create({
      counsellor,
      date,
      startTime,
      endTime,
      isAvailable: true,
    });

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });

  } catch (error) {
    console.error(
      "ADD SCHEDULE ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Error creating schedule",
      error: error.message,
    });
  }
};


// GET ALL SCHEDULES
// GET /api/schedules
// LOGGED-IN USERS


const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate({
        path: "counsellor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      schedules,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error fetching schedules",
      error: error.message,
    });
  }
};



// GET SCHEDULES FOR ONE COUNSELLOR
// GET /api/schedules/counsellor/:counsellorId
// LOGGED-IN USERS


const getCounsellorSchedules = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    const counsellor =
      await Counsellor.findById(counsellorId);

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor not found",
      });
    }

    const schedules = await Schedule.find({
      counsellor: counsellorId,
    }).sort({
      date: 1,
      startTime: 1,
    });

    res.status(200).json({
      counsellor: counsellorId,
      schedules,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching counsellor schedules",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE SCHEDULE
// PUT /api/schedules/:id
// ADMIN / COUNSELLOR
// =====================================================

const updateSchedule = async (req, res) => {
  try {
    const schedule =
      await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    const {
      date,
      startTime,
      endTime,
      isAvailable,
    } = req.body;

    if (date) {
      schedule.date = date;
    }

    if (startTime) {
      schedule.startTime = startTime;
    }

    if (endTime) {
      schedule.endTime = endTime;
    }

    if (isAvailable !== undefined) {
      schedule.isAvailable = isAvailable;
    }

    // Validate time
    if (
      schedule.startTime >=
      schedule.endTime
    ) {
      return res.status(400).json({
        message:
          "Start time must be before end time",
      });
    }

    const updatedSchedule =
      await schedule.save();

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating schedule",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE SCHEDULE
// DELETE /api/schedules/:id
// ADMIN / COUNSELLOR
// =====================================================

const deleteSchedule = async (req, res) => {
  try {
    const schedule =
      await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    await Schedule.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Schedule deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting schedule",
      error: error.message,
    });
  }
};


module.exports = {
  addSchedule,
  getAllSchedules,
  getCounsellorSchedules,
  updateSchedule,
  deleteSchedule,
};