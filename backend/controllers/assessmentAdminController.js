const Assessment = require("../models/Assessment");
const AssessmentStats = require("../models/AssessmentStats");
const Question = require("../models/Question");
const Skill = require("../models/Skill");
const { canModifyJobRole } = require("../utils/authUtils");
const aiService = require("../services/aiService");
const mongoose = require("mongoose");

/**
 * Gets assessments by skillId.
 */
exports.getAssessmentsBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const assessments = await Assessment.find({ skill: skillId }).sort({ level: 1 });
    res.status(200).json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments by skill:", error);
    res.status(500).json({ message: "Failed to fetch assessments" });
  }
};

/**
 * Creates a new blueprint draft (Draft status) or updates an existing assessment configuration.
 */
exports.createOrUpdateBlueprint = async (req, res) => {
  try {
    const { 
      assessmentId, // if updating existing assessment
      skillId, 
      name, 
      level, 
      timer, 
      minPassingPercentage, 
      maxAttempts,
      selectionMode,
      blueprint,
      adaptiveRules,
      skillThresholds,
      skillWeightages,
      totalQuestions,
      randomPick
    } = req.body;

    const createdBy = req.user.id;

    let assessment;

    // --- Authorization Check ---
    let authSkillId = skillId;
    if (assessmentId && mongoose.Types.ObjectId.isValid(assessmentId)) {
      assessment = await Assessment.findById(assessmentId);
      if (!assessment) return res.status(404).json({ message: "Assessment not found" });
      authSkillId = skillId || assessment.skill;
    }
    
    if (authSkillId) {
      const authSkill = await Skill.findById(authSkillId);
      if (!authSkill) {
        return res.status(404).json({ message: "Target Skill not found" });
      }
      if (!(await canModifyJobRole(createdBy, authSkill.jobRole))) {
         return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
      }
    }
    // ---------------------------

    if (assessment) {

      // If active version is already published, we force creating a new draft version
      if (assessment.status === "published") {
        // Create new version draft
        const nextVersion = (assessment.version || 1) + 1;
        assessment = await Assessment.create({
          skill: skillId || assessment.skill,
          name: name || assessment.name,
          level: level || assessment.level,
          timer: timer || assessment.timer,
          minPassingPercentage: minPassingPercentage || assessment.minPassingPercentage,
          maxAttempts: maxAttempts || assessment.maxAttempts,
          selectionMode: selectionMode || assessment.selectionMode,
          blueprint: blueprint || assessment.blueprint,
          adaptiveRules: adaptiveRules || assessment.adaptiveRules,
          skillWeightages: skillWeightages || assessment.skillWeightages,
          totalQuestions: totalQuestions !== undefined ? totalQuestions : assessment.totalQuestions,
          randomPick: randomPick !== undefined ? randomPick : assessment.randomPick,
          version: nextVersion,
          status: "draft",
          isActiveVersion: false, // only becomes active once published
          createdBy
        });
      } else {
        // Update the current draft version
        if (skillId) assessment.skill = skillId;
        if (name) assessment.name = name;
        if (level) assessment.level = level;
        if (timer) assessment.timer = timer;
        if (minPassingPercentage) assessment.minPassingPercentage = minPassingPercentage;
        if (maxAttempts) assessment.maxAttempts = maxAttempts;
        if (selectionMode) assessment.selectionMode = selectionMode;
        if (blueprint) assessment.blueprint = blueprint;
        if (adaptiveRules) assessment.adaptiveRules = adaptiveRules;
        if (skillThresholds) assessment.skillThresholds = skillThresholds;
        if (skillWeightages) assessment.skillWeightages = skillWeightages;
        if (totalQuestions !== undefined) assessment.totalQuestions = totalQuestions;
        if (randomPick !== undefined) assessment.randomPick = randomPick;
        assessment.status = "draft"; // revert to draft on updates
        await assessment.save();
      }
    } else {
      // Create new assessment first draft
      if (!skillId || !name || !level) {
        return res.status(400).json({ message: "Skill ID, name, and level are required" });
      }

      // Check if there is already an active/published assessment for this skill + level
      const existing = await Assessment.findOne({ skill: skillId, level, status: "published" });
      const version = existing ? existing.version + 1 : 1;

      assessment = await Assessment.create({
        skill: skillId,
        name,
        level,
        timer: timer || 1800,
        minPassingPercentage: minPassingPercentage || 70,
        maxAttempts: maxAttempts || 3,
        totalQuestions: totalQuestions !== undefined ? totalQuestions : (blueprint ? blueprint.totalQuestions : 10),
        randomPick: randomPick !== undefined ? randomPick : (blueprint ? blueprint.totalQuestions : 10),
        selectionMode: selectionMode || "static",
        blueprint: blueprint || {
          totalQuestions: 10,
          difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
          skillsCovered: [{ skill: skillId, questionCount: 10 }]
        },
        adaptiveRules: adaptiveRules || {
          baseDifficulty: "easy",
          thresholdToUpgrade: 2,
          thresholdToDowngrade: 1
        },
        skillThresholds: skillThresholds || [{ skill: skillId, minPassingPercentage: minPassingPercentage || 70 }],
        skillWeightages: skillWeightages || [{ skill: skillId, weight: 1.0 }],
        version,
        status: "draft",
        isActiveVersion: !existing, // if first level, set to true. Else wait for publish
        createdBy
      });
    }

    res.status(200).json({ message: "Assessment configuration draft saved successfully", assessment });
  } catch (error) {
    console.error("createOrUpdateBlueprint error:", error);
    res.status(500).json({ message: "Error saving blueprint draft", error: error.message });
  }
};

/**
 * Gets all version records of a specific level assessment for a skill.
 */
exports.getBlueprintVersions = async (req, res) => {
  try {
    const { skillId, level } = req.query;
    if (!skillId || !level) {
      return res.status(400).json({ message: "skillId and level are required" });
    }

    const versions = await Assessment.find({ skill: skillId, level: Number(level) })
      .sort({ version: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({ versions });
  } catch (error) {
    console.error("getBlueprintVersions error:", error);
    res.status(500).json({ message: "Error fetching versions", error: error.message });
  }
};

/**
 * Compares two assessment version configs side-by-side.
 */
exports.compareVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      return res.status(400).json({ message: "v1 and v2 version numbers are required" });
    }

    const current = await Assessment.findById(id);
    if (!current) return res.status(404).json({ message: "Assessment not found" });

    const [cfg1, cfg2] = await Promise.all([
      Assessment.findOne({ skill: current.skill, level: current.level, version: Number(v1) }),
      Assessment.findOne({ skill: current.skill, level: current.level, version: Number(v2) })
    ]);

    if (!cfg1 || !cfg2) {
      return res.status(404).json({ message: "One of the target versions was not found" });
    }

    res.status(200).json({ version1: cfg1, version2: cfg2 });
  } catch (error) {
    console.error("compareVersions error:", error);
    res.status(500).json({ message: "Error comparing versions", error: error.message });
  }
};

/**
 * Promotes a draft to Published, archiving older versions.
 */
exports.publishAssessmentVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await Assessment.findById(id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    const authSkill = await Skill.findById(draft.skill);
    if (authSkill) {
      if (!(await canModifyJobRole(req.user.id, authSkill.jobRole))) {
         return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
      }
    }

    // Set all other versions of this skill/level to inactive and archived
    await Assessment.updateMany(
      { skill: draft.skill, level: draft.level, _id: { $ne: id } },
      { $set: { isActiveVersion: false, status: "archived" } }
    );

    // Publish this one
    draft.status = "published";
    draft.isActiveVersion = true;
    await draft.save();

    res.status(200).json({ message: "Assessment version published successfully", assessment: draft });
  } catch (error) {
    console.error("publishAssessmentVersion error:", error);
    res.status(500).json({ message: "Error publishing version", error: error.message });
  }
};

/**
 * Transition version status (e.g. Draft -> Review -> Approved -> Archived)
 */
exports.transitionVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "review", "approved", "published", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid target status" });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    const authSkill = await Skill.findById(assessment.skill);
    if (authSkill) {
      if (!(await canModifyJobRole(req.user.id, authSkill.jobRole))) {
         return res.status(403).json({ message: "Forbidden: You do not have active access to modify this Job Role." });
      }
    }

    assessment.status = status;
    // If transitioning away from published, deactivate
    if (status !== "published") {
      assessment.isActiveVersion = false;
    }
    await assessment.save();

    res.status(200).json({ message: `Version status transitioned to ${status}`, assessment });
  } catch (error) {
    console.error("transitionVersion error:", error);
    res.status(500).json({ message: "Error transitioning version", error: error.message });
  }
};

/**
 * Retrieves assessment and question attempts analytics.
 */
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const { id } = req.params; // Assessment ID

    const stats = await AssessmentStats.findOne({ assessment: id })
      .populate({
        path: "questionMetrics.question",
        select: "questionText difficulty type estimatedTime"
      });

    if (!stats) {
      // Return empty blueprint stats object
      return res.status(200).json({
        attemptCount: 0,
        passRate: 0,
        averageScore: 0,
        questionMetrics: [],
        message: "No analytic logs found for this assessment yet"
      });
    }

    res.status(200).json({ stats });
  } catch (error) {
    console.error("getAssessmentAnalytics error:", error);
    res.status(500).json({ message: "Error loading analytics", error: error.message });
  }
};

/**
 * Prompts Gemini to suggest blueprint configs based on skill scope.
 */
exports.aiRecommendBlueprint = async (req, res) => {
  try {
    const { skillId } = req.body;
    if (!skillId) return res.status(400).json({ message: "skillId is required" });

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    const prompt = `You are a curriculum architect AI. Recommend an assessment blueprint design for the skill "${skill.name}" (category: "${skill.category || 'general'}", competencyArea: "${skill.competencyArea || 'general'}").
    Provide a recommended:
    - totalQuestions (number, default: 15)
    - difficultyDistribution (percentages of easy, medium, hard totaling 100)
    - passingPercentage (number, default: 75)
    - suggestedTimeLimit (minutes, default: 30)
    - skillWeight (number, e.g. 1.5)
    Return ONLY valid JSON matching this schema:
    {
      "totalQuestions": 15,
      "difficultyDistribution": {
        "easy": 30,
        "medium": 50,
        "hard": 20
      },
      "passingPercentage": 75,
      "suggestedTimeLimit": 30,
      "skillWeight": 1.5,
      "reasoning": "Brief explanation of recommendations..."
    }`;

    const recommendation = await aiService.callGemini(prompt);
    res.status(200).json({ recommendation });
  } catch (error) {
    console.error("aiRecommendBlueprint error:", error);
    res.status(502).json({ message: "AI recommendation parsing failed", error: error.message });
  }
};
