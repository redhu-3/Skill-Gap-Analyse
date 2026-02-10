const express = require("express");
const router = express.Router();
const { createAssessment,getAllAssessments,updateAssessment,deleteAssessment ,getAssessmentsBySkill} = require("../controllers/assessmentAdminController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin only
router.post("/", protect, verifyRole("admin"), createAssessment);
router.get("/", protect, verifyRole("admin"), getAllAssessments);

// UPDATE ✅ (THIS WAS MISSING)
router.put("/:id", protect, verifyRole("admin"), updateAssessment);

// DELETE ✅ (THIS WAS MISSING)
router.delete("/:id", protect, verifyRole("admin"), deleteAssessment);

router.get(
  "/skill/:skillId",
  protect,
  verifyRole("admin"),
  getAssessmentsBySkill
);

module.exports = router;
