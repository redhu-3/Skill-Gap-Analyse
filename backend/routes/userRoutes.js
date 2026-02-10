const express = require("express");
const passport = require("passport");
const router = express.Router();
const { registerUser, loginUser,getMe,getProfile,getStats } = require("../controllers/userController");
const { protect, verifyRole } = require("../middleware/authMiddleware");
const { getUserRoadmap } = require("../controllers/roadmapController");

// ---------------- Normal Register/Login ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);



// ---------------- Example Protected Route ----------------
router.get("/dashboard", protect, verifyRole("user"), (req, res) => {
  res.send("Welcome User Dashboard");
});

// User: Get roadmap for selected job role
router.get("/roadmap/:jobRoleId", protect, verifyRole("user"), getUserRoadmap);

router.get("/me",protect,verifyRole("user"),getMe)

router.get("/profile", protect, verifyRole("user"), getProfile);

router.get("/stats", protect,verifyRole("user"), getStats);


module.exports = router;
