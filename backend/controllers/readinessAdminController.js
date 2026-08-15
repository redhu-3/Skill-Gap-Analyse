const ReadinessConfig = require("../models/ReadinessConfig");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");
const JobRole = require("../models/JobRole");
const UserSkill = require("../models/UserSkill");
const UserAssessment = require("../models/UserAssessment");
const readinessEngine = require("../services/readinessEngine");

/**
 * Fetch the single configuration record.
 */
exports.getConfig = async (req, res) => {
  try {
    const config = await readinessEngine.getActiveConfig();
    res.status(200).json({ config });
  } catch (error) {
    console.error("getConfig error:", error);
    res.status(500).json({ message: "Error loading readiness config", error: error.message });
  }
};

/**
 * Create or update the global readiness configuration.
 */
exports.updateConfig = async (req, res) => {
  try {
    const { formulas, gapRules, industryLevels, benchmarks, recommendationRules } = req.body;
    let config = await ReadinessConfig.findOne();

    if (!config) {
      config = new ReadinessConfig();
    }

    if (formulas) config.formulas = formulas;
    if (gapRules) config.gapRules = gapRules;
    if (industryLevels) config.industryLevels = industryLevels;
    if (benchmarks) config.benchmarks = benchmarks;
    if (recommendationRules) config.recommendationRules = recommendationRules;

    await config.save();
    res.status(200).json({ message: "Readiness configuration updated successfully", config });
  } catch (error) {
    console.error("updateConfig error:", error);
    res.status(500).json({ message: "Error updating readiness config", error: error.message });
  }
};

/**
 * Gathers aggregate metrics for the dashboard view.
 */
exports.getReadinessAnalytics = async (req, res) => {
  try {
    const enrollments = await UserRoleEnrollment.find().populate("jobRole");
    const config = await readinessEngine.getActiveConfig();

    const roleStats = {};
    const failedMandatorySkills = {};
    const skillGapsCount = {};
    const industryLevelDistribution = {};

    // Initialize levels count
    config.industryLevels.forEach(level => {
      industryLevelDistribution[level.label] = 0;
    });

    for (const enroll of enrollments) {
      if (!enroll.jobRole || !enroll.user) continue;

      try {
        const metrics = await readinessEngine.calculateUserReadiness(enroll.user, enroll.jobRole._id);
        
        // Average readiness by role
        const roleIdStr = enroll.jobRole._id.toString();
        if (!roleStats[roleIdStr]) {
          roleStats[roleIdStr] = {
            roleName: enroll.jobRole.name,
            totalReadiness: 0,
            userCount: 0
          };
        }
        roleStats[roleIdStr].totalReadiness += metrics.overallReadiness;
        roleStats[roleIdStr].userCount += 1;

        // Level distribution
        if (industryLevelDistribution[metrics.readinessLabel] !== undefined) {
          industryLevelDistribution[metrics.readinessLabel] += 1;
        } else {
          industryLevelDistribution[metrics.readinessLabel] = 1;
        }

        // Check failed mandatory skills & general gaps
        metrics.skillDetails.forEach(sd => {
          if (sd.isMandatory && sd.gapPercent > 0) {
            failedMandatorySkills[sd.skillId] = (failedMandatorySkills[sd.skillId] || 0) + 1;
          }
          if (sd.gapPercent > 0) {
            skillGapsCount[sd.skillId] = (skillGapsCount[sd.skillId] || 0) + 1;
          }
        });

      } catch (err) {
        // Skip users with missing data
        console.warn(`Skipping user calculation during analytics:`, err.message);
      }
    }

    // Format average readiness data
    const averageReadinessByRole = Object.values(roleStats).map(stat => ({
      roleName: stat.roleName,
      averageScore: Math.round(stat.totalReadiness / stat.userCount),
      userCount: stat.userCount
    }));

    res.status(200).json({
      averageReadinessByRole,
      industryLevelDistribution,
      failedMandatorySkills,
      skillGapsCount
    });

  } catch (error) {
    console.error("getReadinessAnalytics error:", error);
    res.status(500).json({ message: "Error compiling analytics", error: error.message });
  }
};
