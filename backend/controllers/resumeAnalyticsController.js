const SkillAlias = require("../models/SkillAlias");
const ResumeKeywordMapping = require("../models/ResumeKeywordMapping");
const CertificationMapping = require("../models/CertificationMapping");
const ProjectMapping = require("../models/ProjectMapping");
const ExperienceMapping = require("../models/ExperienceMapping");
const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");

/**
 * GET /api/admin/resume-intelligence/analytics
 * Compiles real mapping totals combined with mock aggregate statistics for resume scans.
 */
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Gather configuration metrics
    const aliasCount = await SkillAlias.countDocuments();
    const keywordCount = await ResumeKeywordMapping.countDocuments();
    const certCount = await CertificationMapping.countDocuments();
    const projectCount = await ProjectMapping.countDocuments();
    const experienceCount = await ExperienceMapping.countDocuments();

    // 2. Mock Analytics Distributions (simulating parser metrics)
    const confidenceDistribution = [
      { label: "High Confidence (90-100%)", value: 45 },
      { label: "Medium Confidence (70-89%)", value: 38 },
      { label: "Low Confidence (Below 70%)", value: 17 }
    ];

    const matchTypeDistribution = [
      { type: "Exact Match", percentage: 55 },
      { type: "Alias Match", percentage: 22 },
      { type: "Keyword Match", percentage: 15 },
      { type: "Fuzzy Match", percentage: 8 }
    ];

    // Fetch top skills for mock representations
    const skills = await Skill.find().limit(5);
    const topDetectedSkills = skills.map((sk, idx) => ({
      skillName: sk.name,
      count: 120 - idx * 22
    }));

    if (topDetectedSkills.length === 0) {
      topDetectedSkills.push(
        { skillName: "React", count: 85 },
        { skillName: "Node.js", count: 72 },
        { skillName: "AWS", count: 50 },
        { skillName: "Python", count: 45 },
        { skillName: "SQL", count: 40 }
      );
    }

    const topMissingSkills = [
      { skillName: "TypeScript", count: 45 },
      { skillName: "Docker", count: 38 },
      { skillName: "GraphQL", count: 32 },
      { skillName: "Kubernetes", count: 28 },
      { skillName: "CI/CD Platforms", count: 25 }
    ];

    const roles = await JobRole.find().limit(3);
    const topMatchedRoles = roles.map((r, idx) => ({
      roleName: r.name,
      count: 95 - idx * 25
    }));

    if (topMatchedRoles.length === 0) {
      topMatchedRoles.push(
        { roleName: "Full Stack Engineer", count: 68 },
        { roleName: "Frontend Developer", count: 52 },
        { roleName: "Cloud Architect", count: 30 }
      );
    }

    res.status(200).json({
      configSummary: {
        aliasCount,
        keywordCount,
        certCount,
        projectCount,
        experienceCount
      },
      confidenceDistribution,
      matchTypeDistribution,
      topDetectedSkills,
      topMissingSkills,
      topMatchedRoles
    });

  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ message: "Error compiling resume analytics", error: error.message });
  }
};
