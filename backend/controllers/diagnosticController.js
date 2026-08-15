const mongoose = require("mongoose");
const Question = require("../models/Question");
const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");
const Assessment = require("../models/Assessment");
const DiagnosticResult = require("../models/DiagnosticResult");

/**
 * GET /api/diagnostic/test
 * Generates a random diagnostic test from active MCQs.
 */
exports.getTest = async (req, res) => {
  try {
    // We want a mix of questions. For a true diagnostic, we'd pull from diverse skills.
    // For now, randomly sample 15 active MCQ questions.
    const questions = await Question.aggregate([
      { $match: { type: "mcq", status: "active" } },
      { $sample: { size: 15 } },
      { $project: { questionText: 1, options: 1, type: 1, skill: 1, assessment: 1 } }
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No diagnostic questions available at this time." });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating diagnostic test:", error);
    res.status(500).json({ message: "Failed to generate diagnostic test" });
  }
};

/**
 * POST /api/diagnostic/submit
 * Grades the diagnostic test, matches against job roles, and saves the result.
 */
exports.submitTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers } = req.body; // Array of { questionId, answer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    // 1. Grade questions and track by Skill ID
    const skillStats = {}; // skillId -> { correct: 0, total: 0 }

    for (const ans of answers) {
      const q = await Question.findById(ans.questionId).populate("assessment");
      if (!q) continue;

      let skillId = q.skill;
      if (!skillId && q.assessment) {
        skillId = q.assessment.skill;
      }

      if (!skillId) continue;

      if (!skillStats[skillId]) {
        skillStats[skillId] = { correct: 0, total: 0 };
      }

      skillStats[skillId].total += 1;
      
      // Simple exact match for MCQ
      if (q.correctAnswer && ans.answer && q.correctAnswer.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
        skillStats[skillId].correct += 1;
      }
    }

    // 2. Map Skill IDs to names and categories
    const scoresBySkillName = {};
    const scoresByCategory = {};
    const catStats = {};

    for (const [sId, stats] of Object.entries(skillStats)) {
      const skill = await Skill.findById(sId);
      if (skill) {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        scoresBySkillName[skill.name] = Math.max(scoresBySkillName[skill.name] || 0, percentage);

        const cat = skill.category || "General";
        if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 };
        catStats[cat].correct += stats.correct;
        catStats[cat].total += stats.total;
      }
    }

    for (const [cat, stats] of Object.entries(catStats)) {
      scoresByCategory[cat] = Math.round((stats.correct / stats.total) * 100);
    }

    // 3. Match against all published Job Roles
    const publishedRoles = await JobRole.find({ status: "published" });
    const recommendedRoles = [];

    for (const role of publishedRoles) {
      const roleSkills = await Skill.find({ jobRole: role._id });
      if (roleSkills.length === 0) continue;

      let totalWeight = 0;
      let earnedWeight = 0;

      for (const rs of roleSkills) {
        let weight = rs.weightage || 10;
        if (rs.priority === "core") weight *= 2; // Core skills are twice as important

        totalWeight += weight;

        // Check if user has a score for this skill name
        const userScore = scoresBySkillName[rs.name] || 0;
        earnedWeight += (userScore / 100) * weight;
      }

      const matchScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
      
      recommendedRoles.push({
        jobRole: role._id,
        matchScore
      });
    }

    // Sort by match score descending
    recommendedRoles.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = recommendedRoles.slice(0, 5);

    // 4. Save result
    // Delete existing diagnostic if user is retaking
    await DiagnosticResult.findOneAndDelete({ user: userId });

    const result = new DiagnosticResult({
      user: userId,
      scoresByCategory,
      scoresBySkillName,
      recommendedRoles: topMatches
    });
    await result.save();

    // Populate job role details for response
    const populatedResult = await DiagnosticResult.findById(result._id).populate("recommendedRoles.jobRole");

    res.status(200).json({
      message: "Diagnostic completed successfully",
      result: populatedResult
    });

  } catch (error) {
    console.error("Error submitting diagnostic test:", error);
    res.status(500).json({ message: "Failed to submit diagnostic test" });
  }
};

/**
 * GET /api/diagnostic/results
 * Gets the user's latest diagnostic results
 */
exports.getResults = async (req, res) => {
  try {
    const result = await DiagnosticResult.findOne({ user: req.user.id })
      .populate("recommendedRoles.jobRole");
      
    res.status(200).json({ result }); // can be null if not taken
  } catch (error) {
    console.error("Error fetching diagnostic results:", error);
    res.status(500).json({ message: "Failed to fetch diagnostic results" });
  }
};
