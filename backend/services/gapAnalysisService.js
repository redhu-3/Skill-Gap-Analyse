const JobRole = require("../models/JobRole");
const Skill = require("../models/Skill");
const UserSkill = require("../models/UserSkill");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");

/**
 * Calculates real-time skill gaps, readiness score, and competency area progress
 * @param {string} userId - ID of the User
 * @param {string} [jobRoleId] - Optional job role ID (defaults to active enrollment)
 */
const calculateGapAnalysis = async (userId, jobRoleId = null) => {
  // 1. Find active enrollment if no jobRoleId is provided
  let enrollment;
  if (!jobRoleId) {
    enrollment = await UserRoleEnrollment.findOne({
      user: userId,
      status: "active"
    }).populate("jobRole");

    if (!enrollment) {
      return { hasRole: false };
    }
    jobRoleId = enrollment.jobRole._id;
  }

  // 2. Fetch JobRole details
  const jobRole = await JobRole.findById(jobRoleId);
  if (!jobRole) {
    throw new Error("Job role not found");
  }

  // 3. Fetch all active skills belonging to this job role
  const skills = await Skill.find({
    jobRole: jobRoleId,
    status: "active"
  }).lean();

  // 4. Fetch user's UserSkill records for these skills
  const userSkills = await UserSkill.find({
    user: userId,
    skill: { $in: skills.map(s => s._id) }
  }).lean();

  // Map user skill progress by skillId
  const userSkillMap = {};
  userSkills.forEach(us => {
    userSkillMap[us.skill.toString()] = us;
  });

  // 5. Categorize skills and calculate gaps
  const criticalGaps = [];
  const moderateGaps = [];
  const minorGaps = [];
  let completedSkillsCount = 0;

  // Track skills by priority groups for weighted readiness scoring
  const priorityGroups = {
    core: { total: 0, completed: 0 },
    secondary: { total: 0, completed: 0 },
    optional: { total: 0, completed: 0 }
  };

  // Group skills by competency area
  // We initialize the list of competency areas from the JobRole model
  const areaStats = {};
  const competencyAreasList = jobRole.competencyAreas || [];
  competencyAreasList.forEach(area => {
    areaStats[area.name] = {
      name: area.name,
      description: area.description || "",
      weightage: area.weightage,
      totalSkills: 0,
      completedSkills: 0
    };
  });

  // Fallback if skill belongs to a competency area not explicitly in JobRole list
  const getOrCreateArea = (areaName) => {
    const name = areaName || "Unassigned";
    if (!areaStats[name]) {
      areaStats[name] = {
        name,
        description: "Other required skills",
        weightage: 0,
        totalSkills: 0,
        completedSkills: 0
      };
    }
    return areaStats[name];
  };

  skills.forEach(skill => {
    const userSkill = userSkillMap[skill._id.toString()];
    const isCompleted = userSkill && userSkill.status === "completed";
    const priority = skill.priority || "core";

    // Increment totals for priority groups
    if (priorityGroups[priority]) {
      priorityGroups[priority].total++;
      if (isCompleted) {
        priorityGroups[priority].completed++;
      }
    }

    // Increment stats for competency areas
    const area = getOrCreateArea(skill.competencyArea);
    area.totalSkills++;
    if (isCompleted) {
      area.completedSkills++;
    }

    // Check if skill is a gap (status != "completed")
    if (!isCompleted) {
      const gapInfo = {
        _id: skill._id,
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        isMandatory: skill.isMandatory,
        weightage: skill.weightage,
        competencyArea: skill.competencyArea,
        prerequisites: skill.prerequisites || [],
        userStatus: userSkill ? userSkill.status : "locked"
      };

      if (priority === "core") {
        criticalGaps.push(gapInfo);
      } else if (priority === "secondary") {
        moderateGaps.push(gapInfo);
      } else {
        minorGaps.push(gapInfo);
      }
    } else {
      completedSkillsCount++;
    }
  });

  // Calculate readiness score
  let readinessScore = 0;
  const config = jobRole.readinessConfig || {};
  const formulaType = config.formulaType || "weighted";

  if (formulaType === "simple" || skills.length === 0) {
    readinessScore = skills.length > 0 ? (completedSkillsCount / skills.length) * 100 : 0;
  } else {
    // Weighted formula based on priority groups (Core / Secondary / Optional)
    const wCore = config.coreWeight !== undefined ? config.coreWeight : 0.6;
    const wSec = config.secondaryWeight !== undefined ? config.secondaryWeight : 0.3;
    const wOpt = config.optionalWeight !== undefined ? config.optionalWeight : 0.1;

    const coreRate = priorityGroups.core.total > 0 ? (priorityGroups.core.completed / priorityGroups.core.total) : 1;
    const secRate = priorityGroups.secondary.total > 0 ? (priorityGroups.secondary.completed / priorityGroups.secondary.total) : 1;
    const optRate = priorityGroups.optional.total > 0 ? (priorityGroups.optional.completed / priorityGroups.optional.total) : 1;

    // Normalizing weights in case any of the priority groups has zero skills assigned
    let sumActiveWeights = 0;
    if (priorityGroups.core.total > 0) sumActiveWeights += wCore;
    if (priorityGroups.secondary.total > 0) sumActiveWeights += wSec;
    if (priorityGroups.optional.total > 0) sumActiveWeights += wOpt;

    if (sumActiveWeights > 0) {
      const activeWCore = priorityGroups.core.total > 0 ? wCore / sumActiveWeights : 0;
      const activeWSec = priorityGroups.secondary.total > 0 ? wSec / sumActiveWeights : 0;
      const activeWOpt = priorityGroups.optional.total > 0 ? wOpt / sumActiveWeights : 0;

      readinessScore = (coreRate * activeWCore + secRate * activeWSec + optRate * activeWOpt) * 100;
    } else {
      readinessScore = 100;
    }
  }

  // Round score to nearest tenth
  readinessScore = Math.round(readinessScore * 10) / 10;

  // Format competency areas array
  const competencyAreasResult = Object.values(areaStats).map(area => {
    const rate = area.totalSkills > 0 ? (area.completedSkills / area.totalSkills) * 100 : 100;
    return {
      ...area,
      completionRate: Math.round(rate * 10) / 10
    };
  });

  return {
    hasRole: true,
    jobRole: {
      _id: jobRole._id,
      name: jobRole.name,
      industry: jobRole.industry,
      experienceLevel: jobRole.experienceLevel,
      estimatedLearningDuration: jobRole.estimatedLearningDuration,
      version: jobRole.version
    },
    readinessScore,
    formulaUsed: formulaType,
    summary: {
      totalSkills: skills.length,
      completedSkills: completedSkillsCount,
      totalGaps: skills.length - completedSkillsCount,
      criticalGapsCount: criticalGaps.length,
      moderateGapsCount: moderateGaps.length,
      minorGapsCount: minorGaps.length
    },
    competencyAreas: competencyAreasResult,
    gaps: {
      critical: criticalGaps,
      moderate: moderateGaps,
      minor: minorGaps
    }
  };
};

module.exports = {
  calculateGapAnalysis
};
