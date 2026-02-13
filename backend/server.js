require("dotenv").config();
require("./utils/googleAuth"); // 👈 MUST be at top for passport

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("cookie-session");
const jobRoleRoutes = require("./routes/jobRoleRoutes");
const skillRoutes = require("./routes/skillRoutes");
const questionRoutes = require("./routes/questionRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentRuleRoutes = require("./routes/assessmentRuleRoutes");
const userRoleRoutes = require("./routes/userRoleRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const authRoutes=require("./routes/authRoutes")
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");
const aiQuestionRoutes = require("./routes/aiQuestionRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");
const assessmentAdminRoutes=require("./routes/assessmentAdminRoutes")

const app = express();

// ---------------- MIDDLEWARE ----------------
//app.use(cors());
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//     credentials: true,
//   })
// );


// app.use(express.json());
// ---------------- MIDDLEWARE ----------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://skill-gap-analyse-gold.vercel.app", // ✅ your Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / mobile apps

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ---------------- SESSION ----------------
app.use(
  session({
    name: "skill_session",
    keys: ["secretkey"],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());

// ---------------- ROUTES ----------------
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // 👈 new user routes
const enrollmentRoutes = require("./routes/enrollmentRoutes");

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job-roles", jobRoleRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/questions", questionRoutes);
//app.use("/api/assessment-rules", assessmentRuleRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/user-roles", userRoleRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/auth", authRoutes);
app.use("/api/code", codeExecutionRoutes);
app.use("/api/ai",aiQuestionRoutes);
app.use("/api/admin", adminProfileRoutes);
app.use("/api/admin/assessments",assessmentAdminRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/admin/assessment-rules", assessmentRuleRoutes);
const chatRoutes = require("./routes/chatRoutes");

app.use(chatRoutes);

// ---------------- TEST ----------------
app.get("/", (req, res) => {
  res.send("Skill Gap Analysis Backend is running");
});


// ---------------- DB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error));
  

  
// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
});
