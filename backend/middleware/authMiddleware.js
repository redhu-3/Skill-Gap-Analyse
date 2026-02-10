// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Protect routes - verify token
exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Verify role
exports.verifyRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== role)
    return res.status(403).json({ message: "Forbidden: Access denied" });
  next();
};
