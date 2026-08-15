const express = require("express");
const router = express.Router();
const { protect, verifyRoles } = require("../middleware/authMiddleware");
const { createSkill, getSkillsByJobRole, updateSkill, setPrerequisites, getSkillWithPrerequisites, getPrerequisiteData, getCurrentSkill, getSkillDetails, startLearning, deleteSkill } = require("../controllers/skillController");
const Skill=require("../models/Skill")
const UserSkill = require("../models/UserSkill");

// Admin: Add new skill
router.post("/create", protect, verifyRoles(["admin"]), createSkill);
router.get("/job-role/:jobRoleId", protect, verifyRoles(["admin", "manager", "contributor", "viewer", "user"]), getSkillsByJobRole);
// Admin: Update a skill
router.put("/update/:skillId", protect, verifyRoles(["admin"]), updateSkill);
// Admin: Set / Update skill prerequisites
router.put("/prerequisites/:skillId", protect, verifyRoles(["admin"]), setPrerequisites);
// Admin: Delete a skill
router.delete("/delete/:skillId", protect, verifyRoles(["admin"]), deleteSkill);
// Get a skill with its prerequisites
router.get("/:skillId", protect, verifyRoles(["admin", "manager", "contributor", "viewer", "user"]), getSkillWithPrerequisites);
router.get("/:skillId/details",protect,verifyRoles(["admin", "manager", "contributor", "viewer", "user"]),getSkillDetails)

router.post("/job-role/:jobRoleId/start-learning",protect,verifyRoles(["admin", "manager", "contributor", "viewer", "user"]),startLearning)
router.get(
  "/:skillId/prerequisites",
  protect,
  verifyRoles(["admin", "manager", "contributor", "viewer", "user"]),
  getPrerequisiteData
);

router.get(
  "/roadmap/:jobRoleId",
  protect,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { jobRoleId } = req.params;

      const skills = await Skill.find({ jobRole: jobRoleId })
        .populate("prerequisites")
        .sort({ createdAt: 1 });

      const userSkills = await UserSkill.find({
        user: userId,
        jobRole: jobRoleId,
      });

      const userSkillMap = {};
      userSkills.forEach(us => {
        userSkillMap[us.skill.toString()] = us;
      });

      const roadmap = skills.map(skill => {
        const us = userSkillMap[skill._id.toString()];

        return {
          _id: skill._id,
          name: skill.name,
          prerequisites: skill.prerequisites.map(p => p._id),
          status: us ? us.status : "locked",
        };
      });

      res.json({ roadmap });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ------------------ USER ROUTES ------------------
// Get all skills for a specific job role (accessible to all logged-in users)
router.get(
  "/job-role-public/:jobRoleId",
  protect,
  async (req, res) => {
    try {
      const { jobRoleId } = req.params;

      const skills = await Skill.find({ jobRole: jobRoleId });

      res.status(200).json({ skills });
    } catch (error) {
      console.error("Job-role-public error:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  }
);


// Get all skills completed/assigned for the logged-in user
router.get(
  "/user/skills",
  protect,
  async (req, res) => {
    try {
 
    const userId = req.user._id || req.user.id;

      // Example: assuming you have a "UserSkill" collection linking user -> skill -> status -> score
      const userSkills = await UserSkill.find({ user: userId });

      res.status(200).json({ userSkills });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user skills", error: error.message });
    }
  }
);



module.exports = router;
