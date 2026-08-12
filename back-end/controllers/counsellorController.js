const User = require("../models/User");
const Counsellor = require("../models/Counsellor");
const bcrypt = require("bcryptjs");


// =====================================================
// ADD COUNSELLOR
// POST /api/counsellors
// ADMIN ONLY
// =====================================================

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


// =====================================================
// GET ALL COUNSELLORS
// GET /api/counsellors
// LOGGED-IN USERS
// =====================================================

const getAllCounsellors = async (req, res) => {
  try {

    const counsellors = await Counsellor.find()
      .populate(
        "user",
        "name email role"
      );

    res.status(200).json({
      counsellors,
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error fetching counsellors",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE COUNSELLOR
// GET /api/counsellors/:id
// LOGGED-IN USERS
// =====================================================

const getCounsellor = async (req, res) => {
  try {

    const counsellor =
      await Counsellor.findById(
        req.params.id
      ).populate(
        "user",
        "name email role"
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

    res.status(500).json({
      message:
        "Server error retrieving counsellor",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE COUNSELLOR
// PUT /api/counsellors/:id
// ADMIN ONLY
// =====================================================

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


    // ==========================================
    // UPDATE USER INFORMATION
    // ==========================================

    if (name) {
      user.name = name;
    }


    if (email && email !== user.email) {

      // Check whether another user already
      // has this email
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


    // ==========================================
    // UPDATE COUNSELLOR INFORMATION
    // ==========================================

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


// =====================================================
// DELETE COUNSELLOR
// DELETE /api/counsellors/:id
// ADMIN ONLY
// =====================================================

const deleteCounsellor = async (req, res) => {
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


    // Delete linked User account
    await User.findByIdAndDelete(
      counsellor.user
    );


    // Delete counsellor profile
    await Counsellor.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({
      message:
        "Counsellor deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE COUNSELLOR ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error while removing counsellor",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  addCounsellor,
  getAllCounsellors,
  getCounsellor,
  updateCounsellor,
  deleteCounsellor,
};