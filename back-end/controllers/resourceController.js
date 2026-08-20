const Resource = require("../models/Resource");

// CREATE RESOURCE
const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      content,
      mediaUrl,
      thumbnailUrl,
      duration,
      difficulty,
    } = req.body;

    if (!title || !description || !type || !category) {
      return res.status(400).json({
        message: "Title, description, type and category are required",
      });
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category,
      content,
      mediaUrl,
      thumbnailUrl,
      duration,
      difficulty,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create resource",
      error: error.message,
    });
  }
};


// GET RESOURCES
const getResources = async (req, res) => {
  try {
    const { type, category } = req.query;

    const filter = {
      isPublished: true,
    };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    const resources = await Resource.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: resources.length,
      resources,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};


module.exports = {
  createResource,
  getResources,
};