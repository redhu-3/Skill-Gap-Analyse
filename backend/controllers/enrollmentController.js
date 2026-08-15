const mongoose = require("mongoose");
const UserRoleEnrollment = require("../models/UserRoleEnrollment");
const UserSkill = require("../models/UserSkill");
const Skill = require("../models/Skill");
const JobRole = require("../models/JobRole");
const DiagnosticResult = require("../models/DiagnosticResult");

/**
 * USER: Enroll into a Job Role
 * Triggered when user clicks "Get Started"
 */
exports.enrollInJobRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobRoleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobRoleId)) {
      return res.status(400).json({ message: "Invalid Job Role ID" });
    }

    // 1️⃣ Check Job Role
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole || jobRole.status !== "published") {
      return res.status(404).json({ message: "Job role not available" });
    }

    // 2️⃣ Prevent duplicate enrollment
    const existingEnrollment = await UserRoleEnrollment.findOne({
      user: userId,
      jobRole: jobRoleId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "You are already enrolled in this job role",
      });
    }

    // 3️⃣ Create enrollment
    const enrollment = await UserRoleEnrollment.create({
      user: userId,
      jobRole: jobRoleId,
      roleVersion: jobRole.version,
      status: "active",
    });

    // 4️⃣ Get skills in correct order (topological order)
    const skills = await Skill.find({ jobRole: jobRoleId })
      .sort({ createdAt: 1 }) // temporary; later replace with topo sort
      .lean();

    if (skills.length === 0) {
      return res.status(400).json({
        message: "No skills found for this job role",
      });
    }

    // 5️⃣ Check diagnostic results for auto-completion
    const diagnostic = await DiagnosticResult.findOne({ user: userId });
    const masteredSkills = new Set();
    if (diagnostic && diagnostic.scoresBySkillName) {
      for (const [skillName, score] of diagnostic.scoresBySkillName.entries()) {
        if (score >= 80) { // If they scored 80% or higher, consider it mastered
          masteredSkills.add(skillName);
        }
      }
    }

    // 6️⃣ Create UserSkill entries
    let firstUnlockedSkillId = null;
    let foundUnlocked = false;

    const userSkillDocs = skills.map((skill) => {
      let status = "locked";
      
      // Auto-complete if mastered
      if (masteredSkills.has(skill.name)) {
        status = "completed";
      } 
      else if (!foundUnlocked) {
        status = "in-progress";
        firstUnlockedSkillId = skill._id;
        foundUnlocked = true;
      }

      return {
        user: userId,
        jobRole: jobRoleId,
        skill: skill._id,
        status,
        score: status === "completed" ? 100 : 0,
        attempts: 0,
      };
    });

    await UserSkill.insertMany(userSkillDocs);

    res.status(201).json({
      message: "Enrollment successful. Your journey has started!",
      enrollmentId: enrollment._id,
      firstSkillId: firstUnlockedSkillId || skills[0]._id,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error enrolling in job role",
      error: error.message,
    });
  }
};
