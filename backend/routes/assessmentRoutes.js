const express = require("express");
const router = express.Router();
const { getSkillQuestions,submitSkillAssessment,getAssessmentQuestions,submitAssessment,getAssessmentAttempts} = require("../controllers/assessmentController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// User attempts assessment for a skill
//router.post("/attempt", protect, verifyRole("user"), attemptAssessment);

// Fetch random questions for a skill
router.get("/skill/:skillId", protect, verifyRole("user"), getSkillQuestions);


// GET: Fetch random questions
router.get("/attempts/:assessmentId", protect, verifyRole("user"), getAssessmentAttempts);

// POST: Submit answers
//router.post("/submit/:skill", protect, verifyRole("user"), submitSkillAssessment);

// Fetch questions by assessment
router.get(
  "/assessment/:assessmentId",
  protect,
  verifyRole("user"),
  getAssessmentQuestions
);


//Submit answers for an assessment
router.post(
  "/submit/assessment/:assessmentId",
  protect,
  verifyRole("user"),
  submitAssessment
);

module.exports = router;
