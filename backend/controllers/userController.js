const User = require("../models/User");
const Admin = require("../models/Admin"); // ✅ check admin collection too
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JobRole=require("../models/JobRole")
const UserRole = require("../models/User");

// ---------------- Register User ----------------
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if email exists in either collection
    let existingUser = await User.findOne({ email });
    let existingAdmin = await Admin.findOne({ email });

    if (existingUser || existingAdmin) {
      return res
        .status(400)
        .json({ message: "Email already registered as Admin or User" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Login User ----------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/userController.js
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");

//     res.json({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       theme: user.theme,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeRole = await UserRole.findOne({
      user: req.user.id,
      status: "active",
    }).populate("jobRole");

    res.json({
      ...user.toObject(),
      activeJobRole: activeRole?.jobRole?.name || null,
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt,
      theme: user.theme
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getStats = async (req, res) => {
  try {
    const userRole = await UserRole.findOne({
      user: req.user.id,
      status: "active"
    });

    if (!userRole) {
      return res.json({
        hasRole: false
      });
    }

    res.json({
      hasRole: true,
      completedSkills: userRole.completedSkills.length,
      totalSkills: userRole.totalSkills
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
