const JobRole = require("../models/JobRole");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");
const readinessEngine = require("../services/readinessEngine");

/**
 * Returns a user's readiness, gap analysis, and competency list for a role.
 */
exports.getUserReadinessDetails = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    // Authorization: User can request their own details, admins can request any details
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = await readinessEngine.calculateUserReadiness(userId, roleId);
    res.status(200).json({ readiness: data });
  } catch (error) {
    console.error("getUserReadinessDetails error:", error);
    res.status(500).json({ message: "Error calculating readiness details", error: error.message });
  }
};

/**
 * Compares the user against all published roles and returns match percentages.
 */
exports.getUserRoleMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const roles = await JobRole.find({ status: "published" });

    const matches = [];
    for (const role of roles) {
      try {
        const metrics = await readinessEngine.calculateUserReadiness(userId, role._id);
        matches.push({
          roleId: role._id,
          name: role.name,
          description: role.description,
          category: role.category,
          overallReadiness: metrics.overallReadiness,
          readinessLabel: metrics.readinessLabel,
          readinessColor: metrics.readinessColor,
          isIndustryReady: metrics.isIndustryReady
        });
      } catch (err) {
        // Skip errors
      }
    }

    // Sort by compatibility descending
    matches.sort((a, b) => b.overallReadiness - a.overallReadiness);

    res.status(200).json({ matches });
  } catch (error) {
    console.error("getUserRoleMatches error:", error);
    res.status(500).json({ message: "Error loading role matches", error: error.message });
  }
};
