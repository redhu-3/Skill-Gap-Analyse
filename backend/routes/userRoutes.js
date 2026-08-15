// const express = require("express");
// const passport = require("passport");
// const router = express.Router();
// const { registerUser, loginUser,getMe,getProfile,getStats } = require("../controllers/userController");
// const { protect, verifyRole ,verifyRoles} = require("../middleware/authMiddleware");
// const { getUserRoadmap } = require("../controllers/roadmapController");

// // ---------------- Normal Register/Login ----------------
// router.post("/register", registerUser);
// router.post("/login", loginUser);



// // ---------------- Example Protected Route ----------------
// router.get("/dashboard", protect, verifyRole(["user", "viewer"]), (req, res) => {
//   res.send("Welcome User Dashboard");
// });

// // User: Get roadmap for selected job role
// router.get("/roadmap/:jobRoleId", protect, verifyRole(["user", "viewer"]), getUserRoadmap);

// router.get("/me",protect,verifyRole(["user", "viewer"]),getMe)

// router.get("/profile", protect, verifyRole(["user", "viewer"]), getProfile);

// router.get("/stats", protect,verifyRole(["user", "viewer"]), getStats);


// module.exports = router;

const express = require("express");
const passport = require("passport");
const router = express.Router();
const { registerUser, loginUser, getMe, getProfile, getStats } = require("../controllers/userController");
const { protect, verifyRoles } = require("../middleware/authMiddleware"); // ✅ verifyRoles (plural)
const { getUserRoadmap } = require("../controllers/roadmapController");

// ---------------- Normal Register/Login ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ---------------- Protected Routes ----------------
// ✅ verifyRoles(["user", "viewer"]) — accepts both roles so existing & new users all pass
router.get("/dashboard", protect, verifyRoles(["user", "viewer"]), (req, res) => {
  res.send("Welcome User Dashboard");
});

router.get("/roadmap/:jobRoleId", protect, verifyRoles(["user", "viewer"]), getUserRoadmap);

router.get("/me", protect, verifyRoles(["user", "viewer"]), getMe);

router.get("/profile", protect, verifyRoles(["user", "viewer"]), getProfile);

router.get("/stats", protect, verifyRoles(["user", "viewer"]), getStats);

module.exports = router;