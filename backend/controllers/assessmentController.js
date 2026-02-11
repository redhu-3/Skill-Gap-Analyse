const UserSkill = require("../models/UserSkill");
const Skill = require("../models/Skill");
const Question = require("../models/Question");
const Assessment = require("../models/Assessment");
const UserAssessment = require("../models/UserAssessment");
const AssessmentRule = require("../models/AssessmentRule");
const mongoose = require("mongoose");
const axios=require("axios");
const UserQuestionAttempt = require("../models/UserQuestionAttempt");
// User attempts a skill assessment
// exports.attemptAssessment = async (req, res) => {
//   try {
//     const { skill: skillId, answers } = req.body;
//     const userId = req.user.id;

//     if (!skillId || !answers || !Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ message: "Skill and answers are required" });
//     }

//     // 1️⃣ Fetch skill and required proficiency
//     const skill = await Skill.findById(skillId);
//     if (!skill) {
//       return res.status(404).json({ message: "Skill not found" });
//     }

//     // 2️⃣ Fetch questions answered by user
//     const questionIds = answers.map(a => a.questionId);
//     const questions = await Question.find({ _id: { $in: questionIds } });

//     if (questions.length !== answers.length) {
//       return res.status(400).json({ message: "Some questions are invalid" });
//     }

//     // 3️⃣ Calculate score
//     let correctCount = 0;
//     answers.forEach(answer => {
//       const question = questions.find(q => q._id.toString() === answer.questionId);
//       if (question && question.correctAnswer === answer.answer) {
//         correctCount++;
//       }
//     });

//     const score = (correctCount / questions.length) * 100;
//     const passed = score >= skill.requiredProficiency;

//     // 4️⃣ Update UserSkill
//     let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
//     if (!userSkill) {
//       userSkill = new UserSkill({ user: userId, skill: skillId });
//     }

//     userSkill.score = score;
//     userSkill.status = passed ? "completed" : "in-progress";
//     userSkill.attempts = (userSkill.attempts || 0) + 1;

//     await userSkill.save();

//     // 5️⃣ Return result
//     res.status(200).json({
//       message: "Assessment submitted",
//       skill: skill.name,
//       score,
//       passed,
//       attempts: userSkill.attempts,
//       status: userSkill.status,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error submitting assessment", error: error.message });
//   }
// };

// Get random questions for a skill
exports.getSkillQuestions = async (req, res) => {
  try {
    const skillId = req.params.skillId;

    const questions = await Question.find({ skill: skillId, status: "active" });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this skill" });
    }

    // Shuffle questions randomly
    const shuffled = questions
      .map(q => ({ ...q.toObject(), sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(q => {
        delete q.sort;
        return q;
      });

    res.status(200).json({ questions: shuffled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};



// GET: Fetch random questions for a skill
// exports.attemptSkill = async (req, res) => {
//   try {
//     const { skill: skillId } = req.params; // skill ID
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(skillId)) {
//       return res.status(400).json({ message: "Invalid skill ID" });
//     }

//     // Fetch the assessment rule for this skill
//     const rule = await AssessmentRule.findOne({ assessment: { $in: await Assessment.find({ skill: skillId }).distinct("_id") } });
//     if (!rule) {
//       return res.status(400).json({ message: "Assessment rule not configured for this skill" });
//     }

//     // Fetch user's current attempts for this skill
//     let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
//     if (!userSkill) userSkill = new UserSkill({ user: userId, skill: skillId });

//     // Check max attempts
//     if (userSkill.attempts >= rule.maxAttempts) {
//       return res.status(403).json({ message: "Maximum attempts reached for this skill" });
//     }

//     // Fetch questions randomly according to the rule
//     const questions = await Question.aggregate([
//       { $match: { skill: new mongoose.Types.ObjectId(skillId), status: "active" } },
//       { $sample: { size: rule.numQuestions } },
//     ]);

//     if (!questions.length) {
//       return res.status(404).json({ message: "No questions available for this skill" });
//     }

//     res.status(200).json({
//       questions,
//       attemptsLeft: rule.maxAttempts - userSkill.attempts,
//       rule,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching skill questions", error: error.message });
//   }
// };




// POST: Submit answers for a skill assessment
exports.submitSkillAssessment = async (req, res) => {
  try {
    const { skill: skillId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ message: "Invalid skill ID" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    // Fetch assessment rule for this skill
    const assessmentIds = await Assessment.find({ skill: skillId }).distinct("_id");
    const rule = await AssessmentRule.findOne({ assessment: { $in: assessmentIds } });
    if (!rule) return res.status(400).json({ message: "Assessment rule not set for this skill" });

    // Fetch user's skill record
    let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
    if (!userSkill) userSkill = new UserSkill({ user: userId, skill: skillId });

    // Check max attempts
    if (userSkill.attempts >= rule.maxAttempts) {
      return res.status(403).json({ message: "Maximum attempts reached for this skill" });
    }

    // Fetch questions answered
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds }, skill: skillId, status: "active" });

    if (!questions.length) {
      return res.status(400).json({ message: "No valid questions found for this skill" });
    }

    // Calculate score
    let correctCount = 0;
    for (let q of questions) {
      const userAnswer = answers.find(a => a.questionId === q._id.toString())?.answer;
      if (q.type === "mcq" && userAnswer === q.correctAnswer) correctCount++;
    }

    const scorePercentage = (correctCount / questions.length) * 100;

    // Update UserSkill
    userSkill.attempts += 1;
    userSkill.score = scorePercentage;
    userSkill.lastAttemptAt = new Date();
    userSkill.status = scorePercentage >= rule.minPassingPercentage ? "completed" : "in-progress";

    await userSkill.save();

    // Unlock dependent skills
    if (userSkill.status === "completed") {
      const nextSkills = await Skill.find({ prerequisites: skillId });
      for (let next of nextSkills) {
        const exists = await UserSkill.findOne({ user: userId, skill: next._id });
        if (!exists) {
          await UserSkill.create({ user: userId, skill: next._id, status: "in-progress" });
        }
      }
    }

    res.status(200).json({
      message: "Skill assessment submitted successfully",
      score: scorePercentage,
      status: userSkill.status,
      attemptsLeft: rule.maxAttempts - userSkill.attempts,
      lastAttemptAt: userSkill.lastAttemptAt,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting skill assessment", error: error.message });
  }
};



// GET: Fetch questions for an assessment (user)
// exports.getAssessmentQuestions = async (req, res) => {
//   try {
//     const { assessmentId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
//       return res.status(400).json({ message: "Invalid assessment ID" });
//     }

//     const assessment = await Assessment.findById(assessmentId);
//     if (!assessment) {
//       return res.status(404).json({ message: "Assessment not found or inactive" });
//     }

//     // Fetch random questions according to assessment.randomPick
//     const questions = await Question.aggregate([
//       { $match: { assessment: new mongoose.Types.ObjectId(assessmentId), status: "active" } },
//       { $sample: { size: assessment.randomPick } }
//     ]);

//     if (!questions.length) {
//       return res.status(404).json({ message: "No questions found for this assessment" });
//     }

//     res.status(200).json({
//       assessment: {
//         id: assessment._id,
//         name: assessment.name,
//         level: assessment.level,
//         timer: assessment.timer, // fixed
//       },
//       questions,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error fetching assessment questions",
//       error: error.message,
//     });
//   }
// };



exports.getAssessmentQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found or inactive" });
    }

    // Fetch random questions according to assessment.randomPick
    const questions = await Question.aggregate([
      { $match: { assessment: new mongoose.Types.ObjectId(assessmentId), status: "active" } },
      { $sample: { size: assessment.randomPick } }
    ]);

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this assessment" });
    }

    // Remove hidden test cases from coding questions
    const formattedQuestions = questions.map(q => {
      if (q.type === "coding" && q.testCases?.length) {
        return {
          ...q,
          testCases: q.testCases.filter(tc => !tc.isHidden), // only public
        };
      }
      return q;
    });

    res.status(200).json({
      assessment: {
        id: assessment._id,
        name: assessment.name,
        level: assessment.level,
        timer: assessment.timer,
      },
      questions: formattedQuestions,
    });

  } catch (error) {
    console.error("Get Assessment Questions Error:", error);
    res.status(500).json({
      message: "Error fetching assessment questions",
      error: error.message,
    });
  }
};


// controllers/assessmentController.js



exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const skillId = assessment.skill;

    const userSkill = await UserSkill.findOne({
      user: userId,
      skill: skillId,
    });

    if (!userSkill) {
      return res.status(403).json({ message: "Skill not in progress" });
    }

    const questionIds = answers.map((a) => a.questionId);

    const questions = await Question.find({
      _id: { $in: questionIds },
      assessment: assessmentId,
      status: "active",
    });

    if (questions.length !== answers.length) {
      return res.status(400).json({
        message: "Some questions are invalid",
      });
    }

    let correctCount = 0;

    // =========================
    // ✅ EVALUATE QUESTIONS
    // =========================

    for (const question of questions) {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      if (!userAnswer) continue;

      // -----------------------
      // 🧠 CODING QUESTION
      // -----------------------
      if (question.type === "coding") {

        const attempt = await UserQuestionAttempt.findOne({
          user: userId,
          question: question._id,
          assessment: assessmentId,
        });

        if (attempt && attempt.isCorrect) {
          correctCount++;
        }

      }
      // -----------------------
      // 📝 MCQ / FILL
      // -----------------------
      else {

        const isCorrect =
          String(question.correctAnswer).trim() ===
          String(userAnswer.answer).trim();

        // Store attempt
        await UserQuestionAttempt.findOneAndUpdate(
          {
            user: userId,
            question: question._id,
            assessment: assessmentId,
          },
          {
            answer: userAnswer.answer,
            isCorrect,
          },
          { upsert: true }
        );

        if (isCorrect) {
          correctCount++;
        }
      }
    }

    // =========================
    // 🎯 CALCULATE SCORE
    // =========================

    const totalQuestions = questions.length;
    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= assessment.minPassingPercentage;

    const attemptNumber =
      (await UserAssessment.countDocuments({
        user: userId,
        assessment: assessmentId,
      })) + 1;

    await UserAssessment.create({
      user: userId,
      skill: skillId,
      assessment: assessmentId,
      level: assessment.level,
      score,
      passed,
      attemptNumber,
    });

    // =========================
    // 🚀 UPDATE SKILL PROGRESS
    // =========================

    if (passed) {
      if (!userSkill.completedAssessmentLevels.includes(assessment.level)) {
        userSkill.completedAssessmentLevels.push(assessment.level);
      }

      userSkill.currentAssessmentLevel = assessment.level + 1;

      const totalLevels = await Assessment.countDocuments({
        skill: skillId,
      });

      if (
        userSkill.completedAssessmentLevels.length === totalLevels
      ) {
        userSkill.status = "completed";
      }

      await userSkill.save();
    }

    // =========================
    // ✅ RESPONSE
    // =========================

    return res.json({
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions,
      currentAssessmentLevel: userSkill.currentAssessmentLevel,
      skillStatus: userSkill.status,
    });

  } catch (error) {
    console.error("Submit Assessment Error:", error);
    return res.status(500).json({
      message: "Error submitting assessment",
      error: error.message,
    });
  }
};
