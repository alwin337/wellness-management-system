const FacilityRequest = require(
  "../models/FacilityRequest"
);


// STUDENT CREATE REQUEST
const createFacilityRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
    } = req.body;

    if (
      !title ||
      !description ||
      !location
    ) {
      return res.status(400).json({
        message:
          "Title, description and location are required",
      });
    }

    const request =
      await FacilityRequest.create({
        studentId: req.user._id,

        title,
        description,
        category: category || "other",
        location,

        isAnonymous: true,
      });

    res.status(201).json({
      message:
        "Facility request submitted successfully",

      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        category: request.category,
        location: request.location,
        status: request.status,
        isAnonymous: true,
        createdAt: request.createdAt,
      },
    });

  } catch (error) {
    console.error(
      "CREATE FACILITY REQUEST ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error submitting facility request",
      error: error.message,
    });
  }
};


// ADMIN VIEW REQUESTS

const getAllFacilityRequests = async (
  req,
  res
) => {
  try {
    // IMPORTANT:
    // studentId is deliberately NOT populated.
    const requests =
      await FacilityRequest.find()
        .select(
          "-studentId"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      requests,
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Error fetching facility requests",
      error: error.message,
    });
  }
};


// ADMIN UPDATE REQUEST

const updateFacilityRequest = async (
  req,
  res
) => {
  try {
    const request =
      await FacilityRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: "Facility request not found",
      });
    }

    const {
      status,
      adminResponse,
    } = req.body;

    if (status) {
      request.status = status;
    }

    if (adminResponse !== undefined) {
      request.adminResponse =
        adminResponse;
    }

    await request.save();

    res.status(200).json({
      message:
        "Facility request updated successfully",

      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        category: request.category,
        location: request.location,
        status: request.status,
        adminResponse: request.adminResponse,
        isAnonymous: true,
      },
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Error updating facility request",
      error: error.message,
    });
  }
};


module.exports = {
  createFacilityRequest,
  getAllFacilityRequests,
  updateFacilityRequest,
};