// const express = require("express");
// const router = express.Router();
// const { enrollInJobRole } = require("../controllers/userRoleController");
// const { protect, verifyRole } = require("../middleware/authMiddleware");

// // User enrolls in job role
// router.post(
//   "/enroll/:roleId",
//   protect,
//   verifyRole("user"),
//   enrollInJobRole
// );

// module.exports = router;
const express = require("express");
const router = express.Router();
const { enrollInJobRole } = require("../controllers/userRoleController");
const { protect, verifyRoles } = require("../middleware/authMiddleware"); // ✅ verifyRoles

// User enrolls in job role
router.post(
  "/enroll/:roleId",
  protect,
  verifyRoles(["user", "viewer"]),
  enrollInJobRole
);

module.exports = router;