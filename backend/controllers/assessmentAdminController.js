const Assessment = require("../models/Assessment");
const Skill = require("../models/Skill");

// Admin: Create an assessment for a skill
exports.createAssessment = async (req, res) => {
  try {
    const {
      skill,
      name,
      level,
      totalQuestions,
      randomPick,
      timer,
      minPassingPercentage,
      maxAttempts,
    } = req.body;

    if (
      !skill ||
      !name ||
      level == null ||
      !totalQuestions ||
      !randomPick ||
      !timer ||
      minPassingPercentage == null ||
      !maxAttempts
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure skill exists
    const skillExists = await Skill.findById(skill);
    if (!skillExists) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const assessment = await Assessment.create({
      skill,
      name,
      level,
      totalQuestions,
      randomPick,
      timer,
      minPassingPercentage,
      maxAttempts,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Assessment created successfully",
      assessment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating assessment", error: error.message });
  }
};



exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("skill", "name category");
    res.status(200).json({ count: assessments.length, assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching assessments", error: error.message });
  }
};

// Admin: Update assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({
      message: "Assessment updated successfully",
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating assessment",
      error: error.message,
    });
  }
};

// Admin: Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAssessment = await Assessment.findByIdAndDelete(id);

    if (!deletedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting assessment",
      error: error.message,
    });
  }
};

exports.getAssessmentsBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const assessments = await Assessment.find({ skill: skillId });

    res.status(200).json({ assessments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
};
