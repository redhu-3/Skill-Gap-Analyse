// const express = require("express");
// const router = express.Router();
// const { 
//   getSkillQuestions,
//   submitSkillAssessment,
//   getAssessmentQuestions,
//   submitAssessment,
//   getAssessmentAttempts,
//   // Phase 4 additions
//   startAssessmentSession,
//   getNextQuestion,
//   submitSessionQuestion,
//   submitSessionAssessment
// } = require("../controllers/assessmentController");
// const { protect, verifyRole } = require("../middleware/authMiddleware");

// // User attempts assessment for a skill
// //router.post("/attempt", protect, verifyRole("user"), attemptAssessment);

// // Fetch random questions for a skill
// router.get("/skill/:skillId", protect, verifyRole("user"), getSkillQuestions);

// // GET: Fetch random questions
// router.get("/attempts/:assessmentId", protect, verifyRole("user"), getAssessmentAttempts);

// // POST: Submit answers
// //router.post("/submit/:skill", protect, verifyRole("user"), submitSkillAssessment);

// // Fetch questions by assessment
// router.get(
//   "/assessment/:assessmentId",
//   protect,
//   verifyRole("user"),
//   getAssessmentQuestions
// );

// //Submit answers for an assessment
// router.post(
//   "/submit/assessment/:assessmentId",
//   protect,
//   verifyRole("user"),
//   submitAssessment
// );

// // ── Phase 4 Adaptive & Dynamic Session Endpoints ──
// router.post("/session/start/:assessmentId", protect, verifyRole("user"), startAssessmentSession);
// router.get("/session/:sessionId/next", protect, verifyRole("user"), getNextQuestion);
// router.post("/session/:sessionId/question", protect, verifyRole("user"), submitSessionQuestion);
// router.post("/session/:sessionId/submit", protect, verifyRole("user"), submitSessionAssessment);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { 
  getSkillQuestions,
  submitSkillAssessment,
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentAttempts,
  startAssessmentSession,
  getNextQuestion,
  submitSessionQuestion,
  submitSessionAssessment
} = require("../controllers/assessmentController");
const { protect, verifyRoles } = require("../middleware/authMiddleware"); // ✅ verifyRoles

// Fetch random questions for a skill
router.get("/skill/:skillId", protect, verifyRoles(["user", "viewer"]), getSkillQuestions);

// GET: Fetch attempts
router.get("/attempts/:assessmentId", protect, verifyRoles(["user", "viewer"]), getAssessmentAttempts);

// Fetch questions by assessment
router.get(
  "/assessment/:assessmentId",
  protect,
  verifyRoles(["user", "viewer"]),
  getAssessmentQuestions
);

// Submit answers for an assessment
router.post(
  "/submit/assessment/:assessmentId",
  protect,
  verifyRoles(["user", "viewer"]),
  submitAssessment
);

// Phase 4 Adaptive & Dynamic Session Endpoints
router.post("/session/start/:assessmentId",  protect, verifyRoles(["user", "viewer"]), startAssessmentSession);
router.get("/session/:sessionId/next",       protect, verifyRoles(["user", "viewer"]), getNextQuestion);
router.post("/session/:sessionId/question",  protect, verifyRoles(["user", "viewer"]), submitSessionQuestion);
router.post("/session/:sessionId/submit",    protect, verifyRoles(["user", "viewer"]), submitSessionAssessment);

module.exports = router;