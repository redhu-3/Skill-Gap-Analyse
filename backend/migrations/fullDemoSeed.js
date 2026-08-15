/**
 * fullDemoSeed.js
 * Seeds rich demo data across all Phase 1-7 features.
 * Run: node backend/migrations/fullDemoSeed.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const Skill        = require("../models/Skill");
const JobRole      = require("../models/JobRole");
const Question     = require("../models/Question");
const Assessment   = require("../models/Assessment");
const ReadinessConfig = require("../models/ReadinessConfig");
const LearningPathTemplate = require("../models/LearningPathTemplate");
const LearningResource     = require("../models/LearningResource");
const SkillAlias           = require("../models/SkillAlias");
const ResumeKeywordMapping = require("../models/ResumeKeywordMapping");
const CertificationMapping = require("../models/CertificationMapping");
const ProjectMapping       = require("../models/ProjectMapping");
const ExperienceMapping    = require("../models/ExperienceMapping");
const ResumeParserConfig   = require("../models/ResumeParserConfig");
const Admin        = require("../models/Admin");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  // ─── Find an Admin for createdBy fields ──────────────────────────────────
  const admin = await Admin.findOne();
  if (!admin) {
    console.error("❌ No admin user found. Please register an admin first.");
    process.exit(1);
  }
  console.log(`Using admin: ${admin.email}`);

  // ─── 1. ENSURE JOB ROLES ─────────────────────────────────────────────────
  console.log("\n📌 Seeding Job Roles...");
  const roleNames = [
    { name: "Full Stack Developer",   description: "Builds complete web applications front-to-back.", experienceLevel: "mid",    category: "Engineering",  industry: "Software Development" },
    { name: "Data Scientist",          description: "Extracts insights from data using ML and statistics.", experienceLevel: "senior", category: "Data & AI",    industry: "Software Development" },
    { name: "Cloud DevOps Engineer",   description: "Manages cloud infrastructure and CI/CD pipelines.", experienceLevel: "mid",    category: "DevOps",       industry: "Software Development" },
  ];

  const roles = [];
  for (const r of roleNames) {
    let role = await JobRole.findOne({ name: r.name });
    if (!role) {
      role = await JobRole.create({ ...r, createdBy: admin._id, status: "published" });
      console.log(`  + Created role: ${r.name}`);
    } else {
      console.log(`  ~ Exists: ${r.name}`);
    }
    roles.push(role);
  }

  // ─── 2. ENSURE SKILLS ────────────────────────────────────────────────────
  console.log("\n📌 Seeding Skills...");
  const skillDefs = [
    // Full Stack
    { name: "React",        category: "Frontend", jobRole: roles[0]._id, priority: "core", isMandatory: true,  weightage: 20, competencyArea: "UI Development" },
    { name: "Node.js",      category: "Backend",  jobRole: roles[0]._id, priority: "core", isMandatory: true,  weightage: 20, competencyArea: "Backend Development" },
    { name: "MongoDB",      category: "Database", jobRole: roles[0]._id, priority: "core", isMandatory: true,  weightage: 15, competencyArea: "Data Management" },
    { name: "REST APIs",    category: "Backend",  jobRole: roles[0]._id, priority: "core", isMandatory: false, weightage: 15, competencyArea: "Backend Development" },
    { name: "TypeScript",   category: "Frontend", jobRole: roles[0]._id, priority: "secondary", isMandatory: false, weightage: 10, competencyArea: "UI Development" },
    { name: "Docker",       category: "DevOps",   jobRole: roles[0]._id, priority: "optional", isMandatory: false, weightage: 10, competencyArea: "Deployment" },
    { name: "Git",          category: "Tools",    jobRole: roles[0]._id, priority: "core", isMandatory: true,  weightage: 10, competencyArea: "Version Control" },
    // Data Science
    { name: "Python",       category: "Programming", jobRole: roles[1]._id, priority: "core", isMandatory: true,  weightage: 25, competencyArea: "Data Engineering" },
    { name: "Machine Learning", category: "AI/ML", jobRole: roles[1]._id, priority: "core", isMandatory: true,  weightage: 25, competencyArea: "Modelling" },
    { name: "SQL",          category: "Database", jobRole: roles[1]._id, priority: "core", isMandatory: true,  weightage: 20, competencyArea: "Data Management" },
    { name: "Data Visualization", category: "Analytics", jobRole: roles[1]._id, priority: "secondary", isMandatory: false, weightage: 15, competencyArea: "Analytics" },
    { name: "TensorFlow",   category: "AI/ML",    jobRole: roles[1]._id, priority: "secondary", isMandatory: false, weightage: 15, competencyArea: "Modelling" },
    // DevOps
    { name: "AWS",          category: "Cloud",    jobRole: roles[2]._id, priority: "core", isMandatory: true,  weightage: 25, competencyArea: "Cloud Infrastructure" },
    { name: "Kubernetes",   category: "DevOps",   jobRole: roles[2]._id, priority: "core", isMandatory: true,  weightage: 25, competencyArea: "Container Orchestration" },
    { name: "CI/CD",        category: "DevOps",   jobRole: roles[2]._id, priority: "core", isMandatory: true,  weightage: 20, competencyArea: "Automation" },
    { name: "Terraform",    category: "IaC",      jobRole: roles[2]._id, priority: "secondary", isMandatory: false, weightage: 15, competencyArea: "Cloud Infrastructure" },
    { name: "Linux",        category: "Systems",  jobRole: roles[2]._id, priority: "core", isMandatory: false, weightage: 15, competencyArea: "Systems" },
  ];

  const skills = {};
  for (const sd of skillDefs) {
    let sk = await Skill.findOne({ name: sd.name, jobRole: sd.jobRole });
    if (!sk) {
      sk = await Skill.create({ ...sd, createdBy: admin._id, status: "active" });
      console.log(`  + Created skill: ${sd.name}`);
    } else {
      console.log(`  ~ Exists: ${sd.name}`);
    }
    skills[sd.name] = sk;
  }

  // ─── 3. QUESTIONS ────────────────────────────────────────────────────────
  console.log("\n📌 Seeding Questions...");
  const questionSets = [
    // React questions
    {
      skill: skills["React"]._id,
      jobRole: roles[0]._id,
      questionText: "What is the Virtual DOM in React and why is it used?",
      difficulty: "easy",
      type: "mcq",
      options: [
        "A direct copy of the browser DOM stored in memory",
        "A lightweight JavaScript representation of the DOM that enables efficient updates",
        "A browser plugin that enhances rendering",
        "A server-side rendering technique",
      ],
      correctAnswer: "A lightweight JavaScript representation of the DOM that enables efficient updates",
      competencyArea: "UI Development",
    },
    {
      skill: skills["React"]._id,
      jobRole: roles[0]._id,
      questionText: "Which React hook is used to perform side effects in functional components?",
      difficulty: "easy",
      type: "mcq",
      options: ["useState", "useContext", "useEffect", "useReducer"],
      correctAnswer: "useEffect",
      competencyArea: "UI Development",
    },
    {
      skill: skills["React"]._id,
      jobRole: roles[0]._id,
      questionText: "What is the difference between controlled and uncontrolled components in React?",
      difficulty: "medium",
      type: "mcq",
      options: [
        "Controlled components manage their own state, uncontrolled rely on React state",
        "Controlled components are driven by React state, uncontrolled rely on the DOM",
        "There is no difference",
        "Uncontrolled components are always preferred",
      ],
      correctAnswer: "Controlled components are driven by React state, uncontrolled rely on the DOM",
      competencyArea: "UI Development",
    },
    // Node.js questions
    {
      skill: skills["Node.js"]._id,
      jobRole: roles[0]._id,
      questionText: "What is the event loop in Node.js?",
      difficulty: "medium",
      type: "mcq",
      options: [
        "A loop that handles HTTP requests only",
        "A mechanism that allows Node.js to perform non-blocking I/O operations",
        "A loop for handling DOM events",
        "A garbage collection cycle",
      ],
      correctAnswer: "A mechanism that allows Node.js to perform non-blocking I/O operations",
      competencyArea: "Backend Development",
    },
    {
      skill: skills["Node.js"]._id,
      jobRole: roles[0]._id,
      questionText: "What does the require() function do in Node.js?",
      difficulty: "easy",
      type: "mcq",
      options: ["Imports a module", "Creates a new process", "Starts an HTTP server", "Declares a variable"],
      correctAnswer: "Imports a module",
      competencyArea: "Backend Development",
    },
    // Python/ML questions
    {
      skill: skills["Python"]._id,
      jobRole: roles[1]._id,
      questionText: "What is a Python list comprehension?",
      difficulty: "easy",
      type: "mcq",
      options: [
        "A way to create a dictionary from a list",
        "A concise way to create lists using a single line expression",
        "A built-in sorting function",
        "A type of Python class",
      ],
      correctAnswer: "A concise way to create lists using a single line expression",
      competencyArea: "Data Engineering",
    },
    {
      skill: skills["Machine Learning"]._id,
      jobRole: roles[1]._id,
      questionText: "What is overfitting in machine learning?",
      difficulty: "medium",
      type: "mcq",
      options: [
        "When a model performs well on training data but poorly on unseen data",
        "When a model is too simple to capture patterns",
        "When training takes too long",
        "When the model has too few parameters",
      ],
      correctAnswer: "When a model performs well on training data but poorly on unseen data",
      competencyArea: "Modelling",
    },
    // AWS questions
    {
      skill: skills["AWS"]._id,
      jobRole: roles[2]._id,
      questionText: "What is Amazon S3?",
      difficulty: "easy",
      type: "mcq",
      options: ["A database service", "An object storage service", "A compute service", "A load balancing service"],
      correctAnswer: "An object storage service",
      competencyArea: "Cloud Infrastructure",
    },
    {
      skill: skills["Kubernetes"]._id,
      jobRole: roles[2]._id,
      questionText: "What is a Pod in Kubernetes?",
      difficulty: "medium",
      type: "mcq",
      options: [
        "A cluster of servers",
        "The smallest deployable unit containing one or more containers",
        "A type of service",
        "A storage volume",
      ],
      correctAnswer: "The smallest deployable unit containing one or more containers",
      competencyArea: "Container Orchestration",
    },
    // MongoDB question
    {
      skill: skills["MongoDB"]._id,
      jobRole: roles[0]._id,
      questionText: "What type of database is MongoDB?",
      difficulty: "easy",
      type: "mcq",
      options: ["Relational database", "Document-oriented NoSQL database", "Graph database", "Column-family database"],
      correctAnswer: "Document-oriented NoSQL database",
      competencyArea: "Data Management",
    },
  ];

  for (const q of questionSets) {
    const exists = await Question.findOne({ questionText: q.questionText });
    if (!exists) {
      await Question.create({ ...q, createdBy: admin._id, status: "active" });
      console.log(`  + Created Q: "${q.questionText.substring(0, 50)}..."`);
    } else {
      console.log(`  ~ Exists: "${q.questionText.substring(0, 50)}..."`);
    }
  }

  // ─── 4. ASSESSMENTS ──────────────────────────────────────────────────────
  console.log("\n📌 Seeding Assessments...");
  const assessmentDefs = [
    {
      name: "React Fundamentals Assessment",
      skill: skills["React"]._id,
      level: 1,
      timer: 1800,
      minPassingPercentage: 70,
      maxAttempts: 3,
      totalQuestions: 5,
      randomPick: 5,
      selectionMode: "dynamic_pool",
      blueprint: { totalQuestions: 5, difficultyDistribution: { easy: 40, medium: 40, hard: 20 } },
      status: "published",
    },
    {
      name: "Node.js Backend Assessment",
      skill: skills["Node.js"]._id,
      level: 2,
      timer: 2400,
      minPassingPercentage: 75,
      maxAttempts: 2,
      totalQuestions: 5,
      randomPick: 5,
      selectionMode: "dynamic_pool",
      blueprint: { totalQuestions: 5, difficultyDistribution: { easy: 30, medium: 50, hard: 20 } },
      status: "published",
    },
    {
      name: "Machine Learning Concepts",
      skill: skills["Machine Learning"]._id,
      level: 3,
      timer: 3600,
      minPassingPercentage: 80,
      maxAttempts: 2,
      totalQuestions: 10,
      randomPick: 10,
      selectionMode: "adaptive",
      blueprint: { totalQuestions: 10, difficultyDistribution: { easy: 20, medium: 50, hard: 30 } },
      adaptiveRules: { baseDifficulty: "medium", thresholdToUpgrade: 2, thresholdToDowngrade: 1 },
      status: "published",
    },
    {
      name: "AWS Cloud Practitioner Test",
      skill: skills["AWS"]._id,
      level: 2,
      timer: 3000,
      minPassingPercentage: 72,
      maxAttempts: 3,
      totalQuestions: 5,
      randomPick: 5,
      selectionMode: "dynamic_pool",
      blueprint: { totalQuestions: 5, difficultyDistribution: { easy: 40, medium: 40, hard: 20 } },
      status: "published",
    },
  ];

  for (const a of assessmentDefs) {
    const exists = await Assessment.findOne({ name: a.name });
    if (!exists) {
      await Assessment.create({ ...a, version: 1, createdBy: admin._id });
      console.log(`  + Created assessment: ${a.name}`);
    } else {
      console.log(`  ~ Exists: ${a.name}`);
    }
  }

  // ─── 5. READINESS CONFIG ─────────────────────────────────────────────────
  console.log("\n📌 Seeding Readiness Config...");
  let rc = await ReadinessConfig.findOne();
  if (!rc) {
    rc = await ReadinessConfig.create({
      formulas: { assessmentWeight: 0.7, skillCompletionWeight: 0.3, mandatorySkillPenalty: 0.25 },
      gapRules: [
        { label: "Critical Gap",  minThreshold: 0,  maxThreshold: 40, color: "#ef4444", priority: "high" },
        { label: "Moderate Gap",  minThreshold: 40, maxThreshold: 70, color: "#f59e0b", priority: "medium" },
        { label: "Strong Skill",  minThreshold: 70, maxThreshold: 100,color: "#10b981", priority: "low" },
      ],
      industryLevels: [
        { label: "Beginner",        minThreshold: 0,  maxThreshold: 40, color: "#6366f1" },
        { label: "Developing",      minThreshold: 40, maxThreshold: 65, color: "#f59e0b" },
        { label: "Industry Ready",  minThreshold: 65, maxThreshold: 85, color: "#10b981" },
        { label: "Expert",          minThreshold: 85, maxThreshold: 100,color: "#8b5cf6" },
      ],
      benchmarks: { defaultBenchmarkScore: 80, allowRoleOverrides: true },
      recommendationRules: [
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 60, recommendationType: "learning_path" },
        { triggerMetric: "gap_percentage", thresholdOperator: "gt", thresholdValue: 40, recommendationType: "projects" },
      ],
    });
    console.log("  + Created ReadinessConfig");
  } else {
    console.log("  ~ ReadinessConfig already exists");
  }

  // ─── 6. LEARNING PATH TEMPLATES ──────────────────────────────────────────
  console.log("\n📌 Seeding Learning Path Templates...");
  const templateDefs = [
    {
      name: "Full Stack Beginner Path",
      jobRole: roles[0]._id,
      difficulty: "beginner",
      description: "A structured beginner roadmap to become a Full Stack Developer.",
      steps: [
        { stepNumber: 1, skill: skills["Git"]._id,     estimatedDuration: { value: 3, unit: "days" },  milestone: "Version Control Basics" },
        { stepNumber: 2, skill: skills["React"]._id,   estimatedDuration: { value: 14, unit: "days" }, milestone: "Frontend Fundamentals" },
        { stepNumber: 3, skill: skills["Node.js"]._id, estimatedDuration: { value: 14, unit: "days" }, milestone: "Backend Complete" },
        { stepNumber: 4, skill: skills["MongoDB"]._id, estimatedDuration: { value: 7, unit: "days" },  milestone: "Database Integration" },
        { stepNumber: 5, skill: skills["REST APIs"]._id, estimatedDuration: { value: 7, unit: "days" }, milestone: "API Layer" },
        { stepNumber: 6, skill: skills["Docker"]._id,  estimatedDuration: { value: 5, unit: "days" },  milestone: "Containerization" },
      ],
      isActive: true,
    },
    {
      name: "Data Science Fast Track",
      jobRole: roles[1]._id,
      difficulty: "fast_track",
      description: "An accelerated data science path for professionals with Python basics.",
      steps: [
        { stepNumber: 1, skill: skills["Python"]._id,           estimatedDuration: { value: 7, unit: "days" },  milestone: "Python Proficiency" },
        { stepNumber: 2, skill: skills["SQL"]._id,              estimatedDuration: { value: 7, unit: "days" },  milestone: "Data Querying" },
        { stepNumber: 3, skill: skills["Machine Learning"]._id, estimatedDuration: { value: 21, unit: "days" }, milestone: "ML Foundations" },
        { stepNumber: 4, skill: skills["Data Visualization"]._id, estimatedDuration: { value: 7, unit: "days" }, milestone: "Visualization" },
        { stepNumber: 5, skill: skills["TensorFlow"]._id,       estimatedDuration: { value: 14, unit: "days" }, milestone: "Deep Learning" },
      ],
      isActive: true,
    },
  ];

  for (const t of templateDefs) {
    const exists = await LearningPathTemplate.findOne({ name: t.name });
    if (!exists) {
      await LearningPathTemplate.create(t);
      console.log(`  + Created template: ${t.name}`);
    } else {
      console.log(`  ~ Exists: ${t.name}`);
    }
  }

  // ─── 7. LEARNING RESOURCES ───────────────────────────────────────────────
  console.log("\n📌 Seeding Learning Resources...");
  const resourceDefs = [
    { skill: skills["React"]._id,   title: "React Official Documentation",  type: "documentation", url: "https://react.dev",                        estimatedDurationMins: 120 },
    { skill: skills["React"]._id,   title: "React – The Complete Guide",    type: "course",        url: "https://udemy.com/course/react-the-complete-guide", estimatedDurationMins: 3600 },
    { skill: skills["Node.js"]._id, title: "Node.js Official Docs",         type: "documentation", url: "https://nodejs.org/en/docs",                estimatedDurationMins: 90 },
    { skill: skills["Node.js"]._id, title: "Node.js & Express Crash Course",type: "video",         url: "https://youtube.com/watch?v=ENrzD9HAZK4",  estimatedDurationMins: 90 },
    { skill: skills["Python"]._id,  title: "Python for Everybody – Coursera",type: "course",       url: "https://coursera.org/specializations/python",estimatedDurationMins: 2400 },
    { skill: skills["Machine Learning"]._id, title: "ML Crash Course – Google", type: "course", url: "https://developers.google.com/machine-learning/crash-course", estimatedDurationMins: 600 },
    { skill: skills["AWS"]._id,     title: "AWS Free Tier Getting Started",  type: "documentation", url: "https://aws.amazon.com/free",               estimatedDurationMins: 60 },
    { skill: skills["AWS"]._id,     title: "AWS Certified Cloud Practitioner Prep", type: "course", url: "https://acloudguru.com",                   estimatedDurationMins: 1200 },
    { skill: skills["Docker"]._id,  title: "Docker Get Started Guide",       type: "documentation", url: "https://docs.docker.com/get-started",      estimatedDurationMins: 120 },
    { skill: skills["Kubernetes"]._id, title: "Kubernetes Basics – k8s.io",  type: "documentation", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics", estimatedDurationMins: 180 },
  ];

  for (const r of resourceDefs) {
    const exists = await LearningResource.findOne({ title: r.title });
    if (!exists) {
      await LearningResource.create(r);
      console.log(`  + Created resource: ${r.title}`);
    } else {
      console.log(`  ~ Exists: ${r.title}`);
    }
  }

  // ─── 8. RESUME CONFIG ────────────────────────────────────────────────────
  console.log("\n📌 Seeding Resume Parser Config...");
  let rpc = await ResumeParserConfig.findOne();
  if (!rpc) {
    rpc = await ResumeParserConfig.create({
      confidenceWeights: { exactMatch: 100, aliasMatch: 95, keywordMatch: 80, fuzzyMatch: 70 },
      thresholds: { highMin: 90, mediumMin: 70, lowMin: 0 },
      rules: { enableFuzzyMatching: true, fuzzyThreshold: 0.8, caseSensitive: false },
      roleMatching: { formulaType: "weighted_sum", customFormula: "(skillWeight * score) / totalWeight", minMatchPercentage: 60 },
      benchmarks: { industryCompareEnabled: true, competencyTargetScore: 75 },
      workflow: { autoTransitionToUnderReview: true, requireAdminApprovalForExport: true },
    });
    console.log("  + Created ResumeParserConfig");
  } else {
    console.log("  ~ ResumeParserConfig already exists");
  }

  // ─── 9. SKILL ALIASES ────────────────────────────────────────────────────
  console.log("\n📌 Seeding Skill Aliases...");
  const aliasDefs = [
    { alias: "ReactJS",             skill: skills["React"]._id },
    { alias: "React.js",            skill: skills["React"]._id },
    { alias: "NodeJS",              skill: skills["Node.js"]._id },
    { alias: "Node",                skill: skills["Node.js"]._id },
    { alias: "Express.js",          skill: skills["Node.js"]._id },
    { alias: "Mongo",               skill: skills["MongoDB"]._id },
    { alias: "ML",                  skill: skills["Machine Learning"]._id },
    { alias: "Amazon Web Services", skill: skills["AWS"]._id },
    { alias: "K8s",                 skill: skills["Kubernetes"]._id },
    { alias: "Py",                  skill: skills["Python"]._id },
    { alias: "TF",                  skill: skills["TensorFlow"]._id },
    { alias: "Continuous Integration", skill: skills["CI/CD"]._id },
    { alias: "TypeScript (TS)",     skill: skills["TypeScript"]._id },
  ];

  for (const a of aliasDefs) {
    const exists = await SkillAlias.findOne({ alias: a.alias });
    if (!exists) {
      await SkillAlias.create({ ...a, createdBy: admin._id });
      console.log(`  + Alias: ${a.alias}`);
    } else {
      console.log(`  ~ Exists: ${a.alias}`);
    }
  }

  // ─── 10. RESUME KEYWORD MAPPINGS ─────────────────────────────────────────
  console.log("\n📌 Seeding Resume Keyword Mappings...");
  const keywordDefs = [
    { keyword: "RESTful API",           skill: skills["REST APIs"]._id },
    { keyword: "REST API Development",  skill: skills["REST APIs"]._id },
    { keyword: "API Integration",       skill: skills["REST APIs"]._id },
    { keyword: "Cloud Deployment",      skill: skills["AWS"]._id },
    { keyword: "Deep Learning",         skill: skills["Machine Learning"]._id },
    { keyword: "Neural Networks",       skill: skills["Machine Learning"]._id },
    { keyword: "Data Modelling",        skill: skills["MongoDB"]._id },
    { keyword: "Relational Database",   skill: skills["SQL"]._id },
    { keyword: "Container Deployment",  skill: skills["Docker"]._id },
    { keyword: "Infrastructure as Code", skill: skills["Terraform"]._id },
    { keyword: "Data Charts",           skill: skills["Data Visualization"]._id },
    { keyword: "Pipeline Automation",   skill: skills["CI/CD"]._id },
  ];

  for (const k of keywordDefs) {
    const exists = await ResumeKeywordMapping.findOne({ keyword: k.keyword });
    if (!exists) {
      await ResumeKeywordMapping.create({ ...k, createdBy: admin._id });
      console.log(`  + Keyword: ${k.keyword}`);
    } else {
      console.log(`  ~ Exists: ${k.keyword}`);
    }
  }

  // ─── 11. CERTIFICATION MAPPINGS ──────────────────────────────────────────
  console.log("\n📌 Seeding Certification Mappings...");
  const certDefs = [
    {
      certificationName: "AWS Certified Cloud Practitioner",
      mappedSkills: [skills["AWS"]._id, skills["Docker"]._id, skills["Linux"]._id],
    },
    {
      certificationName: "AWS Solutions Architect Associate",
      mappedSkills: [skills["AWS"]._id, skills["Terraform"]._id, skills["Kubernetes"]._id],
    },
    {
      certificationName: "Google Professional Data Engineer",
      mappedSkills: [skills["Python"]._id, skills["SQL"]._id, skills["Machine Learning"]._id],
    },
    {
      certificationName: "Meta React Developer Certificate",
      mappedSkills: [skills["React"]._id, skills["JavaScript"] ? skills["JavaScript"]._id : skills["TypeScript"]._id],
    },
    {
      certificationName: "MongoDB Certified Developer Associate",
      mappedSkills: [skills["MongoDB"]._id, skills["Node.js"]._id],
    },
    {
      certificationName: "Certified Kubernetes Administrator (CKA)",
      mappedSkills: [skills["Kubernetes"]._id, skills["Docker"]._id, skills["Linux"]._id],
    },
  ];

  for (const c of certDefs) {
    const exists = await CertificationMapping.findOne({ certificationName: c.certificationName });
    if (!exists) {
      await CertificationMapping.create({ ...c, createdBy: admin._id });
      console.log(`  + Certification: ${c.certificationName}`);
    } else {
      console.log(`  ~ Exists: ${c.certificationName}`);
    }
  }

  // ─── 12. PROJECT MAPPINGS ────────────────────────────────────────────────
  console.log("\n📌 Seeding Project Mappings...");
  const projectDefs = [
    {
      projectPattern: "E-Commerce Web Application",
      mappedSkills: [skills["React"]._id, skills["Node.js"]._id, skills["MongoDB"]._id, skills["REST APIs"]._id],
    },
    {
      projectPattern: "Portfolio Website",
      mappedSkills: [skills["React"]._id, skills["TypeScript"]._id],
    },
    {
      projectPattern: "Machine Learning Pipeline",
      mappedSkills: [skills["Python"]._id, skills["Machine Learning"]._id, skills["TensorFlow"]._id, skills["SQL"]._id],
    },
    {
      projectPattern: "Cloud Infrastructure Setup",
      mappedSkills: [skills["AWS"]._id, skills["Terraform"]._id, skills["Docker"]._id, skills["Kubernetes"]._id],
    },
    {
      projectPattern: "Real-Time Chat Application",
      mappedSkills: [skills["React"]._id, skills["Node.js"]._id, skills["MongoDB"]._id],
    },
    {
      projectPattern: "Data Analysis Dashboard",
      mappedSkills: [skills["Python"]._id, skills["SQL"]._id, skills["Data Visualization"]._id],
    },
    {
      projectPattern: "CI/CD Automation Pipeline",
      mappedSkills: [skills["CI/CD"]._id, skills["Docker"]._id, skills["Kubernetes"]._id, skills["Linux"]._id],
    },
  ];

  for (const p of projectDefs) {
    const exists = await ProjectMapping.findOne({ projectPattern: p.projectPattern });
    if (!exists) {
      await ProjectMapping.create({ ...p, createdBy: admin._id });
      console.log(`  + Project: ${p.projectPattern}`);
    } else {
      console.log(`  ~ Exists: ${p.projectPattern}`);
    }
  }

  // ─── 13. EXPERIENCE MAPPINGS ─────────────────────────────────────────────
  console.log("\n📌 Seeding Experience Mappings...");
  const expDefs = [
    { experiencePattern: "Developed responsive UIs using React and TypeScript",    mappedSkills: [skills["React"]._id, skills["TypeScript"]._id] },
    { experiencePattern: "Built RESTful APIs using Node.js and Express",           mappedSkills: [skills["Node.js"]._id, skills["REST APIs"]._id] },
    { experiencePattern: "Designed NoSQL database schemas in MongoDB",             mappedSkills: [skills["MongoDB"]._id] },
    { experiencePattern: "Deployed containerized applications using Docker and Kubernetes", mappedSkills: [skills["Docker"]._id, skills["Kubernetes"]._id] },
    { experiencePattern: "Provisioned cloud infrastructure on AWS using Terraform",mappedSkills: [skills["AWS"]._id, skills["Terraform"]._id] },
    { experiencePattern: "Built and trained machine learning models with TensorFlow", mappedSkills: [skills["Machine Learning"]._id, skills["TensorFlow"]._id, skills["Python"]._id] },
    { experiencePattern: "Analysed large datasets using SQL and Python",           mappedSkills: [skills["SQL"]._id, skills["Python"]._id] },
    { experiencePattern: "Created dashboards for data visualization",              mappedSkills: [skills["Data Visualization"]._id] },
    { experiencePattern: "Set up CI/CD pipelines using GitHub Actions",            mappedSkills: [skills["CI/CD"]._id, skills["Git"]._id] },
    { experiencePattern: "Managed Linux servers and system administration tasks",  mappedSkills: [skills["Linux"]._id] },
  ];

  for (const e of expDefs) {
    const exists = await ExperienceMapping.findOne({ experiencePattern: e.experiencePattern });
    if (!exists) {
      await ExperienceMapping.create({ ...e, createdBy: admin._id });
      console.log(`  + Experience: "${e.experiencePattern.substring(0, 55)}..."`);
    } else {
      console.log(`  ~ Exists: "${e.experiencePattern.substring(0, 55)}..."`);
    }
  }

  console.log("\n✅ Full Demo Seed Completed Successfully!");
  console.log("─────────────────────────────────────────");
  console.log(`  Job Roles:             ${roles.length}`);
  console.log(`  Skills:                ${Object.keys(skills).length}`);
  console.log(`  Questions:             ${questionSets.length}`);
  console.log(`  Assessments:           ${assessmentDefs.length}`);
  console.log(`  Learning Templates:    ${templateDefs.length}`);
  console.log(`  Learning Resources:    ${resourceDefs.length}`);
  console.log(`  Skill Aliases:         ${aliasDefs.length}`);
  console.log(`  Keyword Mappings:      ${keywordDefs.length}`);
  console.log(`  Certification Maps:    ${certDefs.length}`);
  console.log(`  Project Maps:          ${projectDefs.length}`);
  console.log(`  Experience Maps:       ${expDefs.length}`);
  console.log("─────────────────────────────────────────");

  await mongoose.connection.close();
};

run().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
