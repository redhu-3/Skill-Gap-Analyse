const express = require("express");
const passport = require("passport");

const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");


/**
 * =========================
 * START GOOGLE LOGIN
 * =========================
 */
router.get("/google", (req, res, next) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: JSON.stringify({role}), // ✅ FIX
  })(req, res, next);
});

/**
 * =========================
 * GOOGLE CALLBACK
 * =========================
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login-failed",
    session: false,
  }),
  (req, res) => {
    const { token, user } = req.user;

    res.redirect(
      `http://localhost:5173/oauth-success?token=${token}&role=${user.role}&email=${user.email}`
    );
  }
);


// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/auth/google/failure",
//     session: false,
//   }),
//   (req, res) => {
//     res.json(req.user); // 👈 shows token + role
//   }
// );

router.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google login failed" });
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;
