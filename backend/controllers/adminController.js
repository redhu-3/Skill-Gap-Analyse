const Admin = require("../models/Admin");
const User = require("../models/User"); // ✅ check User collection too
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ---------------- Register Admin ----------------
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email exists in Admin OR User
    const existingAdmin = await Admin.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingAdmin || existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered as Admin or User" });
    }

    const admin = new Admin({ name, email, password });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Login Admin ----------------
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
