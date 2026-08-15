const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user =
      (await User.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (!user) {
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user =
      (await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      })) ||
      (await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }));

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await emailService.sendPasswordConfirmEmail(user.email, user.name);

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};