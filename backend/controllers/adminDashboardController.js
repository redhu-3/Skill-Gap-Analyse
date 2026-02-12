const JobRole = require("../models/JobRole");
const Skill = require("../models/Skill");
const Question = require("../models/Question"); // Make sure this exists

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRoles = await JobRole.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const publishedRoles = await JobRole.countDocuments({
      status: "published",
    });

    res.status(200).json({
      success: true,
      data: {
        totalRoles,
        totalSkills,
        totalQuestions,
        publishedRoles,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};
