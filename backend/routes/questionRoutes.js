const express = require("express");
const router = express.Router();

const { addQuestion,getRandomQuestions,getQuestionsBySkill,updateQuestion,deleteQuestion,getQuestionsByAssessment} = require("../controllers/questionController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin: Add question
router.post(
  "/",
  protect,
  verifyRole("admin"),
  addQuestion
);

router.get("/skill/:skillId", protect, verifyRole("admin"), getQuestionsBySkill);
// Update question
router.put("/:id", protect, verifyRole("admin"), updateQuestion);

// Delete question
router.delete("/:id", protect, verifyRole("admin"), deleteQuestion);

router.get(
  "/random",
  protect,
  verifyRole("user"),
  getRandomQuestions
);
router.get("/assessment/:assessmentId", protect, verifyRole("admin"), getQuestionsByAssessment);

// USER



module.exports = router;
