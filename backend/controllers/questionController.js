
const Question = require("../models/Question");

const Assessment = require("../models/Assessment"); // ← ADD THIS
const mongoose = require("mongoose");

// Admin: Add a question
// exports.addQuestion = async (req, res) => {
//   try {
//     const {
//       skill,
//       assessment = null,
//       type,
//       difficulty = "medium",
//       questionText,
//       options=[],
//       correctAnswer,
//       language,
//       testCases=[],
   
//     } = req.body;

//     // Required fields validation
//     if (!skill && !assessment) {
//       return res.status(400).json({ message: "Either skill or assessment is required" });
//     }
//     if (!type || !questionText) {
//       return res.status(400).json({ message: "Question type and text are required" });
//     }

//     // Type-specific validations
//     if (type === "mcq" && (!options || options.length < 2 || !correctAnswer)) {
//       return res.status(400).json({ message: "MCQ must have at least 2 options and correct answer" });
//     }
//     if (type === "fill-blank" && !correctAnswer) {
//       return res.status(400).json({ message: "Fill-blank type requires a correct answer" });
//     }
//     if (type === "coding" && (!language || !testCases || testCases.length === 0)) {
//       return res.status(400).json({ message: "Coding type requires language and test cases" });
//     }

//     const question = new Question({
//       skill,
//       assessment,
//       type,
//       difficulty,
//       questionText,
//       options,
//       correctAnswer,
//       language,
//       testCases,
//       createdBy: req.user.id,
//     });

//     await question.save();

//     res.status(201).json({ message: "Question added successfully", question });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding question", error: error.message });
//   }
// };

// Admin: Add a question
exports.addQuestion = async (req, res) => {
  try {
    const {
      skill,
      assessment = null,
      type,
      difficulty = "medium",
      questionText,
      options = [],
      correctAnswer,
      language,
      testCases = [],
    } = req.body;

    // Basic validation
    if (!skill && !assessment) {
      return res
        .status(400)
        .json({ message: "Either skill or assessment is required" });
    }

    if (!type || !questionText) {
      return res
        .status(400)
        .json({ message: "Question type and question text are required" });
    }

    // Type-specific validations
    if (type === "mcq") {
      if (!options || options.length < 2 || !correctAnswer) {
        return res.status(400).json({
          message: "MCQ must have at least 2 options and a correct answer",
        });
      }
    }

    if (type === "fill-blank") {
      if (!correctAnswer) {
        return res.status(400).json({
          message: "Fill-blank question requires a correct answer",
        });
      }
    }

    if (type === "coding") {
      if (!language || !testCases || testCases.length === 0) {
        return res.status(400).json({
          message: "Coding question requires language and at least one test case",
        });
      }
    }

    // 🔒 STRICT TOTAL QUESTIONS LIMIT (ONLY IF ASSESSMENT EXISTS)
    if (assessment) {
      const assessmentData = await Assessment.findById(assessment);
      if (!assessmentData) {
        return res
          .status(404)
          .json({ message: "Assessment not found" });
      }

      const existingCount = await Question.countDocuments({
        assessment,
      });

      if (existingCount >= assessmentData.totalQuestions) {
        return res.status(400).json({
          message: `You have already added ${assessmentData.totalQuestions} questions. You cannot add more.`,
        });
      }
    }

    // Create question
    const question = new Question({
      skill,
      assessment,
      type,
      difficulty,
      questionText,
      options,
      correctAnswer,
      language,
      testCases,
      createdBy: req.user.id,
    });

    await question.save();

    res.status(201).json({
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding question",
      error: error.message,
    });
  }
};

// Get random questions for a skill or assessment
exports.getRandomQuestions = async (req, res) => {
  try {
    const { skill, assessment, difficulty, limit = 10 } = req.query;

    if (!skill && !assessment) {
      return res.status(400).json({ message: "Skill or assessment is required" });
    }

    const matchQuery = { status: "active" };
    if (skill) matchQuery.skill = new mongoose.Types.ObjectId(skill);
    if (assessment) matchQuery.assessment = new mongoose.Types.ObjectId(assessment);
    if (difficulty) matchQuery.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: matchQuery },
      { $sample: { size: Number(limit) } },
    ]);

    res.status(200).json({ count: questions.length, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};

// Get all questions by skill
exports.getQuestionsBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const questions = await Question.find({ skill: skillId, status: "active" });
    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};

// Admin: Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Question not found" });

    res.json({ message: "Question updated successfully", question: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating question", error: error.message });
  }
};

// Admin: Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Question not found" });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting question", error: error.message });
  }
};

exports.getQuestionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const questions = await Question.find({ assessment: assessmentId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch questions by assessment",
      error: error.message,
    });
  }
};