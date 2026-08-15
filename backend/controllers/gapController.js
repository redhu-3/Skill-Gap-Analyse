const gapService = require("../services/gapAnalysisService");
const UserSkill = require("../models/UserSkill");

/**
 * GET /api/user/gap-analysis
 * Fetch authenticated user's active job role gap analysis
 */
exports.getSelfGapAnalysis = async (req, res) => {
  try {
    const analysis = await gapService.calculateGapAnalysis(req.user.id);
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error("Self Gap Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating gap analysis"
    });
  }
};

/**
 * GET /api/admin/users/:userId/gap-analysis
 * Fetch gap analysis of a specific user for administrative review
 */
exports.getUserGapAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const analysis = await gapService.calculateGapAnalysis(userId);
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error("User Gap Analysis Error (Admin):", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating gap analysis"
    });
  }
};

/**
 * GET /api/admin/gap-stats
 * Aggregates user skill progress to show top skill gaps across the platform
 */
exports.getAdminGapStats = async (req, res) => {
  try {
    const gapStats = await UserSkill.aggregate([
      {
        $match: {
          status: { $ne: "completed" }
        }
      },
      {
        $group: {
          _id: "$skill",
          gapCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "_id",
          as: "skillDetails"
        }
      },
      {
        $unwind: "$skillDetails"
      },
      {
        $project: {
          _id: 1,
          gapCount: 1,
          skillName: "$skillDetails.name",
          category: "$skillDetails.category",
          priority: "$skillDetails.priority"
        }
      },
      {
        $sort: { gapCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      topGaps: gapStats
    });
  } catch (error) {
    console.error("Admin Gap Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gap statistics",
      error: error.message
    });
  }
};
