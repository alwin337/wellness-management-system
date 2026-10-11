const User = require("../models/User");
const Counsellor = require("../models/Counsellor");
const bcrypt = require("bcryptjs");

// Add counsellor
// POST /api/counsellors
// ADMIN ONLY
const addCounsellor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      contactNumber,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !contactNumber
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, specialization and contact number are required",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Account already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Create counsellor login account
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "counsellor",
    });

    // Create counsellor profile
    const counsellor = await Counsellor.create({
      user: user._id,
      specialization,
      contactNumber,
      isActive: true,
    });

    res.status(201).json({
      message: "Counsellor created successfully",

      counsellor: {
        id: counsellor._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: counsellor.specialization,
        contactNumber: counsellor.contactNumber,
        isActive: counsellor.isActive,
      },
    });
  } catch (error) {
    console.error(
      "CREATE COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Error creating counsellor profile",
      error: error.message,
    });
  }
};

// Get all counsellors
// GET /api/counsellors
// ADMIN ONLY
const getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find()
      .populate(
        "user",
        "name email role department"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      total: counsellors.length,
      counsellors,
    });
  } catch (error) {
    console.error(
      "GET ALL COUNSELLORS ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Server error fetching counsellors",
      error: error.message,
    });
  }
};

// Get active counsellors
// GET /api/counsellors/active
// LOGGED-IN USERS
const getActiveCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find({
      isActive: true,
    })
      .populate(
        "user",
        "name email role department"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      total: counsellors.length,
      counsellors,
    });
  } catch (error) {
    console.error(
      "GET ACTIVE COUNSELLORS ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Server error fetching active counsellors",
      error: error.message,
    });
  }
};

// Get single counsellor
// GET /api/counsellors/:id
// LOGGED-IN USERS
const getCounsellor = async (req, res) => {
  try {
    const counsellor =
      await Counsellor.findById(
        req.params.id
      ).populate(
        "user",
        "name email role department"
      );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor record not found",
      });
    }

    res.status(200).json({
      counsellor,
    });
  } catch (error) {
    console.error(
      "GET COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error retrieving counsellor",
      error: error.message,
    });
  }
};

// Update counsellor
// PUT /api/counsellors/:id
// ADMIN ONLY
const updateCounsellor = async (req, res) => {
  try {
    const counsellor =
      await Counsellor.findById(
        req.params.id
      );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor record not found",
      });
    }

    // Find linked User account
    const user = await User.findById(
      counsellor.user
    );

    if (!user) {
      return res.status(404).json({
        message:
          "Counsellor user account not found",
      });
    }

    const {
      name,
      email,
      specialization,
      contactNumber,
    } = req.body;

    // Update user information
    if (name) {
      user.name = name;
    }

    if (email && email !== user.email) {
      // Check whether another user has this email
      const emailExists =
        await User.findOne({
          email,
          _id: { $ne: user._id },
        });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      user.email = email;
    }

    // Update counsellor information
    if (specialization) {
      counsellor.specialization =
        specialization;
    }

    if (contactNumber) {
      counsellor.contactNumber =
        contactNumber;
    }

    // Save both documents
    await user.save();
    await counsellor.save();

    res.status(200).json({
      message:
        "Counsellor updated successfully",

      counsellor: {
        id: counsellor._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization:
          counsellor.specialization,
        contactNumber:
          counsellor.contactNumber,
        isActive: counsellor.isActive,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Error updating counsellor",
      error: error.message,
    });
  }
};

// Deactivate counsellor
// PATCH /api/counsellors/:id/deactivate
// ADMIN ONLY
const deactivateCounsellor = async (req, res) => {
  try {
    const counsellor =
      await Counsellor.findById(
        req.params.id
      );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor record not found",
      });
    }

    // Check if already inactive
    if (!counsellor.isActive) {
      return res.status(400).json({
        message: "Counsellor is already inactive",
      });
    }

    counsellor.isActive = false;

    await counsellor.save();

    res.status(200).json({
      message:
        "Counsellor deactivated successfully",

      counsellor: {
        id: counsellor._id,
        isActive: counsellor.isActive,
      },
    });
  } catch (error) {
    console.error(
      "DEACTIVATE COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error deactivating counsellor",
      error: error.message,
    });
  }
};

// Activate counsellor
// PATCH /api/counsellors/:id/activate
// ADMIN ONLY
const activateCounsellor = async (req, res) => {
  try {
    const counsellor =
      await Counsellor.findById(
        req.params.id
      );

    if (!counsellor) {
      return res.status(404).json({
        message: "Counsellor record not found",
      });
    }

    // Check if already active
    if (counsellor.isActive) {
      return res.status(400).json({
        message: "Counsellor is already active",
      });
    }

    counsellor.isActive = true;

    await counsellor.save();

    res.status(200).json({
      message:
        "Counsellor activated successfully",

      counsellor: {
        id: counsellor._id,
        isActive: counsellor.isActive,
      },
    });
  } catch (error) {
    console.error(
      "ACTIVATE COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error activating counsellor",
      error: error.message,
    });
  }
};

module.exports = {
  addCounsellor,
  getAllCounsellors,
  getActiveCounsellors,
  getCounsellor,
  updateCounsellor,
  deactivateCounsellor,
  activateCounsellor,
};