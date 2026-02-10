const express = require("express");
const passport = require("passport");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

// ---------------- Admin Register/Login ----------------
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);


module.exports = router;