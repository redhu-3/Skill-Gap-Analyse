const Admin = require("../models/Admin");

// ================= GET ADMIN PROFILE =================
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("🔥 GET ADMIN PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE ADMIN PROFILE =================
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = password; // hashed by schema pre-save

    await admin.save();

    res.status(200).json({
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("🔥 UPDATE ADMIN PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
