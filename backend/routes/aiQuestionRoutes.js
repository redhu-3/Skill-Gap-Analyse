const express = require("express");
const router = express.Router();
const { generateQuestion } = require("../controllers/aiQuestionController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

router.post(
  "/generate",
  protect,
  verifyRole("admin"),
  generateQuestion
);

module.exports = router;
