const express = require("express");
const passport = require("passport");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const { getDashboardStats } = require("../controllers/adminDashboardController");
const { verify } = require("jsonwebtoken");
// ---------------- Admin Register/Login ----------------
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;