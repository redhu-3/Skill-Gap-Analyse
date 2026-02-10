const JobRole = require("../models/JobRole");

// Admin: Create new job role
exports.createJobRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    // basic validation
    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required"
      });
    }

    const newRole = new JobRole({
      name,
      description,
      createdBy: req.user.id // coming from adminAuth middleware
    });

    await newRole.save();

    res.status(201).json({
      message: "Job role created successfully",
      role: newRole
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating job role",
      error: error.message
    });
  }
};




// Admin: Get all job roles created by this admin
exports.getAllJobRoles = async (req, res) => {
  try {
    const roles = await JobRole.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Job roles fetched successfully",
      roles
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job roles",
      error: error.message
    });
  }
};



// Admin: Update job role (ONLY if draft)
exports.updateJobRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await JobRole.findOne({
      _id: id,
      createdBy: req.user.id,
    });

    if (!role) {
      return res.status(404).json({
        message: "Job role not found or access denied",
      });
    }

    // 🚫 Prevent editing published roles
    if (role.status === "published") {
      return res.status(400).json({
        message:
          "Published roles cannot be edited. Create a new draft version.",
      });
    }

    if (name) role.name = name;
    if (description) role.description = description;

    role.updatedBy = req.user.id;

    await role.save();

    res.status(200).json({
      message: "Draft job role updated successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating job role",
      error: error.message,
    });
  }
};




// Public: Get all published job roles
exports.getPublishedJobRoles = async (req, res) => {
  try {
    const roles = await JobRole.find({
      status: "published",
     
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Published job roles fetched successfully",
      roles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching published job roles",
      error: error.message,
    });
  }
};


// Admin: Publish a job role
exports.publishJobRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await JobRole.findOne({
      _id: id,
      createdBy: req.user.id,
    });

    if (!role) {
      return res.status(404).json({ message: "Job role not found" });
    }

    // Mark older versions as NOT latest
    await JobRole.updateMany(
      {
        name: role.name,
        createdBy: req.user.id,
        _id: { $ne: role._id },
      },
       {
        $set: { status: "draft" } // 🔥 THIS WAS MISSING
      }
    );

    // Publish this role
    role.status = "published";
   
    await role.save();

    res.status(200).json({
      message: "Job role published successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error publishing job role",
      error: error.message,
    });
  }
};
