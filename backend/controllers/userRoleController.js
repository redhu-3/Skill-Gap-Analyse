const JobRole = require("../models/JobRole");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");

// User enrolls in a job role
exports.enrollInJobRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleId } = req.params;

    // Fetch published role
    const role = await JobRole.findOne({
      _id: roleId,
      status: "published",
    });

    if (!role) {
      return res.status(404).json({
        message: "Job role not found or not published",
      });
    }

    // Check existing enrollment
    const existing = await UserRoleEnrollment.findOne({
      user: userId,
      jobRole: roleId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already enrolled in this role",
      });
    }

    // Create enrollment with locked version
    const enrollment = await UserRoleEnrollment.create({
      user: userId,
      jobRole: role._id,
      roleVersion: role.version,
    });

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error enrolling in job role",
      error: error.message,
    });
  }
};
