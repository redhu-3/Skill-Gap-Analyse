const UserSkill = require("../models/UserSkill");
const Skill = require("../models/Skill");
const Question = require("../models/Question");
const Assessment = require("../models/Assessment");
const UserAssessment = require("../models/UserAssessment");
const AssessmentRule = require("../models/AssessmentRule");
const mongoose = require("mongoose");
const axios=require("axios");
const UserQuestionAttempt = require("../models/UserQuestionAttempt");

// Phase 4 Imports
const UserAssessmentSession = require("../models/UserAssessmentSession");
const AssessmentStats = require("../models/AssessmentStats");
const assessmentEngine = require("../services/assessmentEngine");

exports.getAssessmentAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    const attempts = await UserAssessment.find({
      user: userId,
      assessment: assessmentId,
    })
      .sort({ createdAt: -1 });

    const assessment = await Assessment.findById(assessmentId);

    const maxAttempts = assessment.maxAttempts || 3;

    return res.json({
      totalAttempts: attempts.length,
      maxAttempts,
      attemptsLeft: maxAttempts - attempts.length,
      attempts,
    });

  } catch (error) {
    console.error("Get Attempts Error:", error);
    return res.status(500).json({
      message: "Error fetching attempts",
    });
  }
};

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




// POST: Submit answers for a skill assessment
// exports.submitSkillAssessment = async (req, res) => {
//   try {
//     const { skill: skillId } = req.params;
//     const { answers } = req.body;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(skillId)) {
//       return res.status(400).json({ message: "Invalid skill ID" });
//     }

//     if (!Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ message: "Answers are required" });
//     }

//     // Fetch assessment rule for this skill
//     const assessmentIds = await Assessment.find({ skill: skillId }).distinct("_id");
//     const rule = await AssessmentRule.findOne({ assessment: { $in: assessmentIds } });
//     if (!rule) return res.status(400).json({ message: "Assessment rule not set for this skill" });

//     // Fetch user's skill record
//     let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
//     if (!userSkill) userSkill = new UserSkill({ user: userId, skill: skillId });

//     // Check max attempts
//     if (userSkill.attempts >= rule.maxAttempts) {
//       return res.status(403).json({ message: "Maximum attempts reached for this skill" });
//     }

//     // Fetch questions answered
//     const questionIds = answers.map(a => a.questionId);
//     const questions = await Question.find({ _id: { $in: questionIds }, skill: skillId, status: "active" });

//     if (!questions.length) {
//       return res.status(400).json({ message: "No valid questions found for this skill" });
//     }

//     // Calculate score
//     let correctCount = 0;
//     for (let q of questions) {
//       const userAnswer = answers.find(a => a.questionId === q._id.toString())?.answer;
//       if (q.type === "mcq" && userAnswer === q.correctAnswer) correctCount++;
//     }

//     const scorePercentage = (correctCount / questions.length) * 100;

//     // Update UserSkill
//     userSkill.attempts += 1;
//     userSkill.score = scorePercentage;
//     userSkill.lastAttemptAt = new Date();
//     userSkill.status = scorePercentage >= rule.minPassingPercentage ? "completed" : "in-progress";

//     await userSkill.save();

//     // Unlock dependent skills
//     if (userSkill.status === "completed") {
//       const nextSkills = await Skill.find({ prerequisites: skillId });
//       for (let next of nextSkills) {
//         const exists = await UserSkill.findOne({ user: userId, skill: next._id });
//         if (!exists) {
//           await UserSkill.create({ user: userId, skill: next._id, status: "in-progress" });
//         }
//       }
//     }

//     res.status(200).json({
//       message: "Skill assessment submitted successfully",
//       score: scorePercentage,
//       status: userSkill.status,
//       attemptsLeft: rule.maxAttempts - userSkill.attempts,
//       lastAttemptAt: userSkill.lastAttemptAt,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error submitting skill assessment", error: error.message });
//   }
// };



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



// exports.submitAssessment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { assessmentId } = req.params;
//     const { answers ,timeTaken} = req.body;

//     if (!Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ message: "Answers are required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
//       return res.status(400).json({ message: "Invalid assessment ID" });
//     }

//     const assessment = await Assessment.findById(assessmentId);
//     if (!assessment) {
//       return res.status(404).json({ message: "Assessment not found" });
//     }
    

//     const skillId = assessment.skill;

//     const userSkill = await UserSkill.findOne({
//       user: userId,
//       skill: skillId,
//     });

//     if (!userSkill) {
//       return res.status(403).json({ message: "Skill not in progress" });
//     }

//     const questionIds = answers.map((a) => a.questionId);

//     const questions = await Question.find({
//       _id: { $in: questionIds },
//       assessment: assessmentId,
//       status: "active",
//     });

//     if (questions.length !== answers.length) {
//       return res.status(400).json({
//         message: "Some questions are invalid",
//       });
//     }

//     let correctCount = 0;

//     // =========================
//     // ✅ EVALUATE QUESTIONS
//     // =========================

//     for (const question of questions) {
//       const userAnswer = answers.find(
//         (a) => a.questionId === question._id.toString()
//       );

//       if (!userAnswer) continue;

//       // -----------------------
//       // 🧠 CODING QUESTION
//       // -----------------------
//       if (question.type === "coding") {

//         const attempt = await UserQuestionAttempt.findOne({
//           user: userId,
//           question: question._id,
//           assessment: assessmentId,
//         });

//         if (attempt && attempt.isCorrect) {
//           correctCount++;
//         }

//       }
//       // -----------------------
//       // 📝 MCQ / FILL
//       // -----------------------
//       else {

//         const isCorrect =
//           String(question.correctAnswer).trim() ===
//           String(userAnswer.answer).trim();

//         // Store attempt
//         await UserQuestionAttempt.findOneAndUpdate(
//           {
//             user: userId,
//             question: question._id,
//             assessment: assessmentId,
//           },
//           {
//             answer: userAnswer.answer,
//             isCorrect,
//           },
//           { upsert: true }
//         );

//         if (isCorrect) {
//           correctCount++;
//         }
//       }
//     }

//     // =========================
//     // 🎯 CALCULATE SCORE
//     // =========================

//     const totalQuestions = questions.length;
//     const score = (correctCount / totalQuestions) * 100;
//     const passed = score >= assessment.minPassingPercentage;

//     const attemptNumber =
//       (await UserAssessment.countDocuments({
//         user: userId,
//         assessment: assessmentId,
//       })) + 1;

//     await UserAssessment.create({
//       user: userId,
//       skill: skillId,
//       assessment: assessmentId,
//       level: assessment.level,
//       score,
//       passed,
//       attemptNumber,
//        timeTaken: timeTaken || 0,  

//     });

//     // =========================
//     // 🚀 UPDATE SKILL PROGRESS
//     // =========================

//     if (passed) {
//       if (!userSkill.completedAssessmentLevels.includes(assessment.level)) {
//         userSkill.completedAssessmentLevels.push(assessment.level);
//       }

//       userSkill.currentAssessmentLevel = assessment.level + 1;

//       const totalLevels = await Assessment.countDocuments({
//         skill: skillId,
//       });

//       if (
//         userSkill.completedAssessmentLevels.length === totalLevels
//       ) {
//         userSkill.status = "completed";
//       }

//       await userSkill.save();
//     }

//     // =========================
//     // ✅ RESPONSE
//     // =========================

//     return res.json({
//       score,
//       passed,
//       correctAnswers: correctCount,
//       totalQuestions,
//       currentAssessmentLevel: userSkill.currentAssessmentLevel,
//       skillStatus: userSkill.status,
//         skillId: skillId,  
//     });

//   } catch (error) {
//     console.error("Submit Assessment Error:", error);
//     return res.status(500).json({
//       message: "Error submitting assessment",
//       error: error.message,
//     });
//   }
// };
exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;
    const { answers, timeTaken } = req.body;

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

    const userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
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
      return res.status(400).json({ message: "Some questions are invalid" });
    }

    let correctCount = 0;

    // =========================
    // ✅ EVALUATE QUESTIONS
    // =========================
    for (const question of questions) {
      const userAnswer = answers.find((a) => a.questionId === question._id.toString());
      if (!userAnswer) continue;

      if (question.type === "coding") {
        const attempt = await UserQuestionAttempt.findOne({
          user: userId,
          question: question._id,
          assessment: assessmentId,
        });
        if (attempt && attempt.isCorrect) correctCount++;
      } else {
        const isCorrect = String(question.correctAnswer).trim() === String(userAnswer.answer).trim();

        await UserQuestionAttempt.findOneAndUpdate(
          { user: userId, question: question._id, assessment: assessmentId },
          { answer: userAnswer.answer, isCorrect },
          { upsert: true }
        );

        if (isCorrect) correctCount++;
      }
    }

    // =========================
    // 🎯 CALCULATE SCORE
    // =========================
    const totalQuestions = questions.length;
    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= assessment.minPassingPercentage;

    const attemptNumber =
      (await UserAssessment.countDocuments({ user: userId, assessment: assessmentId })) + 1;

    await UserAssessment.create({
      user: userId,
      skill: skillId,
      assessment: assessmentId,
      level: assessment.level,
      score,
      passed,
      attemptNumber,
      timeTaken: timeTaken || 0,
    });

    // =========================
    // 🚀 UPDATE SKILL PROGRESS
    // =========================
    if (passed && !userSkill.completedAssessmentLevels.includes(assessment.level)) {
      userSkill.completedAssessmentLevels.push(assessment.level);
    }

    // Update current assessment level
    const allLevels = await Assessment.find({ skill: skillId }).sort({ level: 1 });
    const completedLevelsSet = new Set(userSkill.completedAssessmentLevels);

    // Check if all assessments of this skill are completed & passed
    const allAssessmentsPassed = allLevels.every(a => completedLevelsSet.has(a.level));

    if (allAssessmentsPassed) {
      userSkill.status = "completed";

      // Unlock next skills
      const nextSkills = await Skill.find({ prerequisites: skillId });
      for (const nextSkill of nextSkills) {
        const exists = await UserSkill.findOne({ user: userId, skill: nextSkill._id });
        if (!exists) {
          await UserSkill.create({
            user: userId,
            jobRole: userSkill.jobRole,
            skill: nextSkill._id,
            status: "in-progress",
          });
        }
      }
    } else {
      // Only move currentAssessmentLevel to next numeric level, but do not complete skill
      userSkill.currentAssessmentLevel = Math.max(...userSkill.completedAssessmentLevels) + 1;
    }

    await userSkill.save();

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
      skillId,
    });
  } catch (error) {
    console.error("Submit Assessment Error:", error);
    return res.status(500).json({ message: "Error submitting assessment", error: error.message });
  }
};

// ============================================================================
// ── PHASE 4 ADAPTIVE & DYNAMIC TESTING OPERATIONS ──
// ============================================================================

exports.startAssessmentSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Check if user has an active session for this assessment
    let session = await UserAssessmentSession.findOne({
      user: userId,
      assessment: assessmentId,
      submitted: false
    });

    if (session) {
      return res.status(200).json({ message: "Resuming active session", session });
    }

    // Generate pool if dynamic_pool or static
    let pool = [];
    if (assessment.selectionMode === "dynamic_pool") {
      const poolQ = await assessmentEngine.generateDynamicPool(assessment);
      pool = poolQ.map(q => q._id);
    } else if (assessment.selectionMode === "static") {
      pool = assessment.questions;
    }

    session = await UserAssessmentSession.create({
      user: userId,
      assessment: assessmentId,
      startTime: new Date(),
      questionsPool: pool,
      questionsAnswered: [],
      adaptiveState: {
        currentDifficulty: assessment.adaptiveRules?.baseDifficulty || "easy",
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0
      }
    });

    res.status(201).json({ message: "Session started", session });
  } catch (error) {
    console.error("startAssessmentSession error:", error);
    res.status(500).json({ message: "Error starting session", error: error.message });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await UserAssessmentSession.findById(sessionId).populate("assessment");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.submitted) {
      return res.status(400).json({ message: "Session already submitted" });
    }

    const assessment = session.assessment;
    const limitCount = assessment.selectionMode === "adaptive" 
      ? (assessment.blueprint?.totalQuestions || 30) 
      : (assessment.selectionMode === "dynamic_pool" 
          ? (assessment.blueprint?.totalQuestions || 10) 
          : assessment.randomPick);

    if (session.questionsAnswered.length >= limitCount) {
      return res.status(200).json({ message: "All questions completed", isFinished: true });
    }

    let question = null;
    if (assessment.selectionMode === "adaptive") {
      question = await assessmentEngine.resolveNextAdaptiveQuestion(session, assessment);
    } else {
      const answeredIds = new Set(session.questionsAnswered.map(qa => qa.question.toString()));
      const nextId = session.questionsPool.find(id => !answeredIds.has(id.toString()));
      if (nextId) {
        question = await Question.findById(nextId);
      }
    }

    if (!question) {
      return res.status(200).json({ message: "No more questions available in the pool", isFinished: true });
    }

    const formatted = question.toObject();
    if (formatted.type === "coding" && formatted.testCases?.length) {
      formatted.testCases = formatted.testCases.filter(tc => !tc.isHidden);
    }

    res.status(200).json({
      question: formatted,
      currentIndex: session.questionsAnswered.length,
      totalQuestions: limitCount,
      timer: question.timer || assessment.timer || 0
    });
  } catch (error) {
    console.error("getNextQuestion error:", error);
    res.status(500).json({ message: "Error fetching question", error: error.message });
  }
};

exports.submitSessionQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { questionId, answer, isCodingResult } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const session = await UserAssessmentSession.findById(sessionId).populate("assessment");
    if (!session || session.submitted) {
      return res.status(404).json({ message: "Active session not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const alreadyAnswered = session.questionsAnswered.some(qa => qa.question.toString() === questionId);
    if (alreadyAnswered) {
      return res.status(400).json({ message: "Question already answered in this session" });
    }

    let isCorrect = false;
    if (question.type === "coding") {
      isCorrect = isCodingResult?.isCorrect || false;
      
      await UserQuestionAttempt.findOneAndUpdate(
        { user: userId, question: questionId, assessment: session.assessment._id },
        { 
          code: answer, 
          language: isCodingResult?.language || question.language, 
          isCorrect,
          allPublicPassed: isCorrect,
          allHiddenPassed: isCorrect
        },
        { upsert: true }
      );
    } else {
      isCorrect = String(question.correctAnswer).trim() === String(answer).trim();
      
      await UserQuestionAttempt.findOneAndUpdate(
        { user: userId, question: questionId, assessment: session.assessment._id },
        { answer, isCorrect },
        { upsert: true }
      );
    }

    if (session.assessment.selectionMode === "adaptive") {
      assessmentEngine.updateAdaptiveState(session, isCorrect, session.assessment);
    }

    session.questionsAnswered.push({
      question: questionId,
      userAnswer: question.type === "coding" ? "[Code Submitted]" : String(answer),
      isCorrect,
      difficulty: question.difficulty
    });

    await session.save();

    res.status(200).json({
      message: "Answer registered",
      isCorrect,
      adaptiveState: session.adaptiveState
    });
  } catch (error) {
    console.error("submitSessionQuestion error:", error);
    res.status(500).json({ message: "Error submitting question", error: error.message });
  }
};

exports.submitSessionAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { timeTaken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await UserAssessmentSession.findById(sessionId).populate("assessment");
    if (!session || session.submitted) {
      return res.status(404).json({ message: "Active session not found" });
    }

    const assessment = session.assessment;
    const skillId = assessment.skill;

    let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
    if (!userSkill) {
      userSkill = await UserSkill.create({
        user: userId,
        skill: skillId,
        status: "in-progress"
      });
    }

    const grades = await assessmentEngine.gradeSession(session, assessment);

    const attemptNumber = (await UserAssessment.countDocuments({
      user: userId,
      assessment: assessment._id
    })) + 1;

    const userAssessment = await UserAssessment.create({
      user: userId,
      skill: skillId,
      assessment: assessment._id,
      level: assessment.level,
      score: grades.score,
      passed: grades.passed,
      attemptNumber,
      timeTaken: timeTaken || 0,
      assessmentVersion: assessment.version || 1,
      adaptiveQuestionsCount: assessment.selectionMode === "adaptive" ? session.questionsAnswered.length : 0,
      skillBreakdown: grades.skillBreakdown,
      competencyBreakdown: grades.competencyBreakdown,
      weightedScore: grades.weightedScore
    });

    session.submitted = true;
    await session.save();

    if (grades.passed && !userSkill.completedAssessmentLevels.includes(assessment.level)) {
      userSkill.completedAssessmentLevels.push(assessment.level);
    }

    const allLevels = await Assessment.find({ skill: skillId }).sort({ level: 1 });
    const completedLevelsSet = new Set(userSkill.completedAssessmentLevels);
    const allAssessmentsPassed = allLevels.every(a => completedLevelsSet.has(a.level));

    if (allAssessmentsPassed) {
      userSkill.status = "completed";

      const nextSkills = await Skill.find({ prerequisites: skillId });
      for (const nextSkill of nextSkills) {
        const exists = await UserSkill.findOne({ user: userId, skill: nextSkill._id });
        if (!exists) {
          await UserSkill.create({
            user: userId,
            jobRole: userSkill.jobRole,
            skill: nextSkill._id,
            status: "in-progress",
          });
        }
      }
    } else if (userSkill.completedAssessmentLevels.length > 0) {
      userSkill.currentAssessmentLevel = Math.max(...userSkill.completedAssessmentLevels) + 1;
    }

    await userSkill.save();

    try {
      const stats = await AssessmentStats.findOne({ assessment: assessment._id });
      const attemptsCount = (stats?.attemptCount || 0) + 1;
      const passRate = stats 
        ? ((stats.passRate * stats.attemptCount + (grades.passed ? 100 : 0)) / attemptsCount)
        : (grades.passed ? 100 : 0);
      const avgScore = stats
        ? ((stats.averageScore * stats.attemptCount + grades.score) / attemptsCount)
        : grades.score;

      const questionMetrics = stats ? [...stats.questionMetrics] : [];
      for (const item of session.questionsAnswered) {
        const qId = item.question.toString();
        let metric = questionMetrics.find(m => m.question.toString() === qId);
        if (!metric) {
          metric = { question: qId, totalAttempts: 0, successRate: 0 };
          questionMetrics.push(metric);
        }
        const total = metric.totalAttempts + 1;
        metric.successRate = (metric.successRate * metric.totalAttempts + (item.isCorrect ? 100 : 0)) / total;
        metric.totalAttempts = total;
      }

      await AssessmentStats.findOneAndUpdate(
        { assessment: assessment._id },
        { 
          attemptCount: attemptsCount, 
          passRate, 
          averageScore: avgScore,
          questionMetrics,
          lastUpdatedAt: new Date()
        },
        { upsert: true }
      );
    } catch (statsErr) {
      console.error("Failed to update AssessmentStats:", statsErr);
    }

    res.status(200).json({
      message: "Assessment submitted successfully",
      score: grades.score,
      passed: grades.passed,
      weightedScore: grades.weightedScore,
      skillStatus: userSkill.status,
      competencyBreakdown: grades.competencyBreakdown
    });
  } catch (error) {
    console.error("submitSessionAssessment error:", error);
    res.status(500).json({ message: "Error submitting assessment", error: error.message });
  }
};
