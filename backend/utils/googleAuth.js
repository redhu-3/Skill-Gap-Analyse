const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, {
            message: "Email not available from Google",
          });
        }

        let requestedRole;
        try {
          requestedRole = JSON.parse(req.query.state)?.role;
        } catch {
          return done(null, false, { message: "Invalid role data" });
        }

        if (!requestedRole) {
          return done(null, false, { message: "Role missing" });
        }

        // 🔍 Check both DBs
        const existingUser = await User.findOne({ email });
        const existingAdmin = await Admin.findOne({ email });

        let user;
        let role;

        // =============================
        // CASE 1: Exists in USER DB
        // =============================
        if (existingUser) {
          if (requestedRole !== "user") {
            return done(null, false, { message: "Wrong role selected" });
          }
          user = existingUser;
          role = "user";
        }

        // =============================
        // CASE 2: Exists in ADMIN DB
        // =============================
        else if (existingAdmin) {
          if (requestedRole !== "admin") {
            return done(null, false, { message: "Wrong role selected" });
          }
          user = existingAdmin;
          role = "admin";
        }

        // =============================
        // CASE 3: First-time Google user
        // =============================
        else {
          if (requestedRole === "user") {
            user = await User.create({
              name: profile.displayName,
              email,
              password: "google-auth",
              role: "user",
            });
            role = "user";
          } else if (requestedRole === "admin") {
            user = await Admin.create({
              name: profile.displayName,
              email,
              password: "google-auth",
              role: "admin",
            });
            role = "admin";
          } else {
            return done(null, false, { message: "Invalid role" });
          }
        }

        // =============================
        // JWT
        // =============================
        const token = jwt.sign(
          { id: user._id, role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return done(null, {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role,
          },
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Required by passport
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
