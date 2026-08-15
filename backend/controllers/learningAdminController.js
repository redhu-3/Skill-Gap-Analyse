const LearningPathTemplate = require("../models/LearningPathTemplate");
const LearningResource = require("../models/LearningResource");
const UserLearningPath = require("../models/UserLearningPath");
const JobRole = require("../models/JobRole");
const Skill = require("../models/Skill");
const aiService = require("../services/aiService");

// ─── TEMPLATES ───
exports.listTemplates = async (req, res) => {
  try {
    const templates = await LearningPathTemplate.find().populate("jobRole").populate("steps.skill");
    res.status(200).json({ templates });
  } catch (error) {
    console.error("listTemplates error:", error);
    res.status(500).json({ message: "Error loading roadmap templates", error: error.message });
  }
};

exports.createOrUpdateTemplate = async (req, res) => {
  try {
    const { templateId, name, jobRole, difficulty, description, steps, isActive } = req.body;
    let template;

    if (templateId) {
      template = await LearningPathTemplate.findById(templateId);
      if (!template) return res.status(404).json({ message: "Template not found" });

      if (name) template.name = name;
      if (jobRole) template.jobRole = jobRole;
      if (difficulty) template.difficulty = difficulty;
      if (description) template.description = description;
      if (steps) template.steps = steps;
      if (isActive !== undefined) template.isActive = isActive;

      await template.save();
    } else {
      template = await LearningPathTemplate.create({
        name,
        jobRole,
        difficulty,
        description,
        steps,
        isActive
      });
    }

    res.status(200).json({ message: "Template saved successfully", template });
  } catch (error) {
    console.error("createOrUpdateTemplate error:", error);
    res.status(500).json({ message: "Error saving template", error: error.message });
  }
};

// ─── RESOURCES ───
exports.listResources = async (req, res) => {
  try {
    const resources = await LearningResource.find().populate("skill");
    res.status(200).json({ resources });
  } catch (error) {
    console.error("listResources error:", error);
    res.status(500).json({ message: "Error loading learning resources", error: error.message });
  }
};

exports.createOrUpdateResource = async (req, res) => {
  try {
    const { resourceId, skill, title, type, url, description, estimatedDurationMins } = req.body;
    let resource;

    if (resourceId) {
      resource = await LearningResource.findById(resourceId);
      if (!resource) return res.status(404).json({ message: "Resource not found" });

      if (skill) resource.skill = skill;
      if (title) resource.title = title;
      if (type) resource.type = type;
      if (url) resource.url = url;
      if (description) resource.description = description;
      if (estimatedDurationMins) resource.estimatedDurationMins = estimatedDurationMins;

      await resource.save();
    } else {
      resource = await LearningResource.create({
        skill,
        title,
        type,
        url,
        description,
        estimatedDurationMins
      });
    }

    res.status(200).json({ message: "Resource saved successfully", resource });
  } catch (error) {
    console.error("createOrUpdateResource error:", error);
    res.status(500).json({ message: "Error saving resource", error: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await LearningResource.findByIdAndDelete(id);
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("deleteResource error:", error);
    res.status(500).json({ message: "Error deleting resource", error: error.message });
  }
};

// ─── ANALYTICS ───
exports.getLearningAnalytics = async (req, res) => {
  try {
    const enrolledPaths = await UserLearningPath.find().populate("jobRole").populate("templateUsed");
    const popularPaths = {};
    let totalCompleted = 0;
    let totalDays = 0;
    let completedCount = 0;

    enrolledPaths.forEach(path => {
      const templateName = path.templateUsed?.name || "Dynamic Path";
      popularPaths[templateName] = (popularPaths[templateName] || 0) + 1;

      const isAllComplete = path.steps.every(s => s.status === "completed");
      if (isAllComplete) {
        totalCompleted++;
      }
    });

    const completionRate = enrolledPaths.length > 0 ? Math.round((totalCompleted / enrolledPaths.length) * 100) : 0;

    res.status(200).json({
      popularPaths,
      completionRate,
      totalEnrolledCount: enrolledPaths.length
    });
  } catch (error) {
    console.error("getLearningAnalytics error:", error);
    res.status(500).json({ message: "Error compiling analytics", error: error.message });
  }
};

// ─── AI RECOMMENDATIONS ───
exports.aiRecommendRoadmap = async (req, res) => {
  try {
    const { roleId } = req.body;
    const role = await JobRole.findById(roleId).populate("competencyAreas.associatedSkills");
    if (!role) return res.status(404).json({ message: "Job Role not found" });

    const skillList = [];
    role.competencyAreas.forEach(ca => {
      ca.associatedSkills.forEach(s => {
        skillList.push(s.name);
      });
    });

    const prompt = `You are a career development specialist. Suggest a sequenced learning roadmap for the Job Role "${role.name}" with the following skills: [${skillList.join(", ")}].
    Provide:
    1. Ideal step sequence (order numbers)
    2. Estimated learning duration for each step (e.g. 5 days)
    3. Custom milestone names for major checkpoints
    Return ONLY valid JSON matching this schema:
    {
      "roadmapName": "Frontend Roadmap AI Blueprint",
      "steps": [
        { "skillName": "HTML", "stepNumber": 1, "durationDays": 5, "milestone": "Web Basics Complete" }
      ],
      "reasoning": "Brief explanation of recommendations..."
    }`;

    const recommendation = await aiService.callGemini(prompt);
    res.status(200).json({ recommendation });
  } catch (error) {
    console.error("aiRecommendRoadmap error:", error);
    res.status(502).json({ message: "AI recommendation parsing failed", error: error.message });
  }
};
