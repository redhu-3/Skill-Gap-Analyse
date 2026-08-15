const JobRole = require("../models/JobRole");
const UserSkill = require("../models/UserSkill");
const UserAssessment = require("../models/UserAssessment");
const ReadinessConfig = require("../models/ReadinessConfig");
const Skill = require("../models/Skill");

/**
 * Initializes default global config if none exists in the DB.
 */
async function getActiveConfig() {
  let config = await ReadinessConfig.findOne();
  if (!config) {
    config = await ReadinessConfig.create({
      formulas: {
        assessmentWeight: 0.7,
        skillCompletionWeight: 0.3,
        mandatorySkillPenalty: 0.25
      },
      gapRules: [
        { label: "Critical Gap", minThreshold: 0, maxThreshold: 40, color: "#f87171", priority: "high" },
        { label: "Moderate Gap", minThreshold: 41, maxThreshold: 70, color: "#fbbf24", priority: "medium" },
        { label: "Strong Skill", minThreshold: 71, maxThreshold: 100, color: "#34d399", priority: "low" }
      ],
      industryLevels: [
        { label: "Beginner", minThreshold: 0, maxThreshold: 40, color: "#f87171" },
        { label: "Intermediate", minThreshold: 41, maxThreshold: 70, color: "#fbbf24" },
        { label: "Industry Ready", minThreshold: 71, maxThreshold: 90, color: "#60a5fa" },
        { label: "Expert", minThreshold: 91, maxThreshold: 100, color: "#34d399" }
      ],
      benchmarks: {
        defaultBenchmarkScore: 80,
        allowRoleOverrides: true
      },
      recommendationRules: [
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 60, recommendationType: "learning_path" },
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 70, recommendationType: "projects" },
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 80, recommendationType: "interview_prep" }
      ]
    });
  }
  return config;
}

/**
 * Calculates a user's readiness metrics for a given job role.
 */
async function calculateUserReadiness(userId, roleId) {
  const config = await getActiveConfig();
  const role = await JobRole.findById(roleId).populate("competencyAreas.associatedSkills");
  if (!role) throw new Error("Job role not found");

  // Get all associated skill IDs
  const skillIds = [];
  role.competencyAreas.forEach(ca => {
    ca.associatedSkills.forEach(s => {
      if (!skillIds.includes(s._id.toString())) {
        skillIds.push(s._id.toString());
      }
    });
  });

  // Fetch all user skills for progress
  const userSkills = await UserSkill.find({ user: userId, skill: { $in: skillIds } });
  const userSkillsMap = {};
  userSkills.forEach(us => {
    userSkillsMap[us.skill.toString()] = us;
  });

  // Fetch all user passed assessments
  const userAssessments = await UserAssessment.find({ user: userId, skill: { $in: skillIds } });
  const bestScoresMap = {};
  userAssessments.forEach(ua => {
    const sId = ua.skill.toString();
    if (!bestScoresMap[sId] || bestScoresMap[sId] < ua.score) {
      bestScoresMap[sId] = ua.score;
    }
  });

  // Map role-specific benchmarks/mandatory settings
  const benchmarkMap = {};
  if (role.skillsBenchmark && role.skillsBenchmark.length > 0) {
    role.skillsBenchmark.forEach(sb => {
      if (sb.skill) {
        benchmarkMap[sb.skill.toString()] = {
          targetScore: sb.targetScore,
          isMandatory: sb.isMandatory
        };
      }
    });
  }

  // Calculate scores for each skill
  const skillCalculations = [];
  let mandatoryFailed = false;

  skillIds.forEach(sId => {
    const userSkill = userSkillsMap[sId];
    const isCompleted = userSkill ? userSkill.status === "completed" : false;
    const rawScore = bestScoresMap[sId] || 0;

    const bm = benchmarkMap[sId] || {
      targetScore: config.benchmarks.defaultBenchmarkScore,
      isMandatory: false
    };

    // Composite skill score formula: (assessment score * weight) + (completion score * weight)
    const completionScore = isCompleted ? 100 : 0;
    const compositeScore = Math.round(
      (rawScore * config.formulas.assessmentWeight) +
      (completionScore * config.formulas.skillCompletionWeight)
    );

    // Check mandatory failure
    if (bm.isMandatory && compositeScore < bm.targetScore) {
      mandatoryFailed = true;
    }

    // Determine Gap Severity using gapRules
    let gapLabel = "Unknown";
    let gapColor = "#9ca3af";
    let gapPriority = "low";
    for (const rule of config.gapRules) {
      if (compositeScore >= rule.minThreshold && compositeScore <= rule.maxThreshold) {
        gapLabel = rule.label;
        gapColor = rule.color;
        gapPriority = rule.priority;
        break;
      }
    }

    const gapPercent = Math.max(0, bm.targetScore - compositeScore);

    // Get Recommendations based on rules
    const recommendations = [];
    config.recommendationRules.forEach(rule => {
      let isTriggered = false;
      const valToCheck = rule.triggerMetric === "score" ? compositeScore : gapPercent;
      
      if (rule.thresholdOperator === "lt" && valToCheck < rule.thresholdValue) isTriggered = true;
      if (rule.thresholdOperator === "lte" && valToCheck <= rule.thresholdValue) isTriggered = true;
      if (rule.thresholdOperator === "gt" && valToCheck > rule.thresholdValue) isTriggered = true;
      if (rule.thresholdOperator === "gte" && valToCheck >= rule.thresholdValue) isTriggered = true;

      if (isTriggered) {
        recommendations.push(rule.recommendationType);
      }
    });

    skillCalculations.push({
      skillId: sId,
      score: compositeScore,
      rawScore,
      completed: isCompleted,
      targetScore: bm.targetScore,
      isMandatory: bm.isMandatory,
      gapPercent,
      gapLabel,
      gapColor,
      gapPriority,
      recommendations
    });
  });

  // Calculate competency area scores
  const competencyReadiness = [];
  let totalRoleWeight = 0;
  let weightedCompetencySum = 0;

  role.competencyAreas.forEach(ca => {
    const areaSkillCalculations = skillCalculations.filter(sc => 
      ca.associatedSkills.some(as => as._id.toString() === sc.skillId)
    );

    const avgScore = areaSkillCalculations.length > 0
      ? Math.round(areaSkillCalculations.reduce((sum, sc) => sum + sc.score, 0) / areaSkillCalculations.length)
      : 0;

    competencyReadiness.push({
      name: ca.name,
      weightage: ca.weightage,
      score: avgScore,
      skills: areaSkillCalculations
    });

    totalRoleWeight += ca.weightage;
    weightedCompetencySum += (avgScore * ca.weightage);
  });

  // Overall readiness calculation
  let overallReadiness = totalRoleWeight > 0 
    ? Math.round(weightedCompetencySum / totalRoleWeight)
    : 0;

  // Apply penalty if any mandatory skill is failed
  let penaltyApplied = false;
  if (mandatoryFailed) {
    overallReadiness = Math.round(overallReadiness * (1 - config.formulas.mandatorySkillPenalty));
    penaltyApplied = true;
  }

  // Determine Industry Readiness Level
  let readinessLabel = "Unknown";
  let readinessColor = "#9ca3af";
  for (const level of config.industryLevels) {
    if (overallReadiness >= level.minThreshold && overallReadiness <= level.maxThreshold) {
      readinessLabel = level.label;
      readinessColor = level.color;
      break;
    }
  }

  const isIndustryReady = !mandatoryFailed && overallReadiness >= 70;

  return {
    jobRole: {
      id: role._id,
      name: role.name,
      description: role.description
    },
    overallReadiness,
    isIndustryReady,
    mandatoryFailed,
    penaltyApplied,
    readinessLabel,
    readinessColor,
    competencyReadiness,
    skillDetails: skillCalculations,
    configUsed: config
  };
}

module.exports = {
  getActiveConfig,
  calculateUserReadiness
};
