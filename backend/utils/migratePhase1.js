const JobRole = require("../models/JobRole");
const Skill = require("../models/Skill");
const RoleTemplate = require("../models/RoleTemplate");

const migratePhase1 = async () => {
  try {
    console.log("Running Phase 1 Database Migrations...");

    // 1. Migrate JobRoles
    const jobRoleResult = await JobRole.updateMany(
      { category: { $exists: false } },
      {
        $set: {
          category: "General",
          industry: "Software Development",
          experienceLevel: "junior",
          "estimatedLearningDuration.value": 90,
          "estimatedLearningDuration.unit": "days",
          competencyAreas: [{ name: "Core Skills", description: "", weightage: 100, associatedSkills: [] }],
          isPreset: false
        }
      }
    );
    if (jobRoleResult.modifiedCount > 0) {
      console.log(`Migrated ${jobRoleResult.modifiedCount} Job Roles.`);
    }

    // 2. Migrate Skills
    const skillResult = await Skill.updateMany(
      { priority: { $exists: false } },
      {
        $set: {
          priority: "core",
          isMandatory: true,
          weightage: 0,
          competencyArea: "Core Skills"
        }
      }
    );
    if (skillResult.modifiedCount > 0) {
      console.log(`Migrated ${skillResult.modifiedCount} Skills.`);
    }

    // 3. Seed Role Templates
    const defaultTemplates = [
      {
        name: "Frontend Developer",
        description: "Responsible for implementing visual elements that users see and interact with in a web application.",
        category: "Frontend",
        industry: "Software Development",
        experienceLevel: "junior",
        estimatedLearningDuration: { value: 90, unit: "days" },
        competencyAreas: [
          { name: "Frontend Fundamentals", description: "Core HTML, CSS and JavaScript skills required for any frontend role.", weightage: 40 },
          { name: "UI Development", description: "Modern UI framework and component-based development.", weightage: 35 },
          { name: "Version Control", description: "Source control and collaborative development workflows.", weightage: 10 },
          { name: "Deployment", description: "CI/CD pipelines and hosting platforms.", weightage: 15 }
        ],
        skills: [
          {
            name: "HTML",
            category: "Web Foundations",
            priority: "core",
            isMandatory: true,
            weightage: 10,
            competencyArea: "Frontend Fundamentals",
            prerequisites: []
          },
          {
            name: "CSS",
            category: "Web Foundations",
            priority: "core",
            isMandatory: true,
            weightage: 10,
            competencyArea: "Frontend Fundamentals",
            prerequisites: []
          },
          {
            name: "JavaScript",
            category: "Programming Languages",
            priority: "core",
            isMandatory: true,
            weightage: 20,
            competencyArea: "Frontend Fundamentals",
            prerequisites: ["HTML", "CSS"]
          },
          {
            name: "React",
            category: "Frameworks & Libraries",
            priority: "core",
            isMandatory: true,
            weightage: 35,
            competencyArea: "UI Development",
            prerequisites: ["JavaScript"]
          },
          {
            name: "Git",
            category: "Tools",
            priority: "secondary",
            isMandatory: true,
            weightage: 10,
            competencyArea: "Version Control",
            prerequisites: []
          },
          {
            name: "Hosting & CI/CD",
            category: "Deployment",
            priority: "optional",
            isMandatory: false,
            weightage: 15,
            competencyArea: "Deployment",
            prerequisites: ["React", "Git"]
          }
        ]
      },
      {
        name: "Backend Developer",
        description: "Responsible for server-side logic, database management, integration, and API security.",
        category: "Backend",
        industry: "Software Development",
        experienceLevel: "junior",
        estimatedLearningDuration: { value: 90, unit: "days" },
        competencyAreas: [
          { name: "Server Languages & Runtimes", description: "Server-side runtime environments and backend programming languages.", weightage: 35 },
          { name: "Databases & Storage", description: "Relational and NoSQL data persistence and querying.", weightage: 25 },
          { name: "APIs & Security", description: "RESTful API design, authentication and authorization.", weightage: 20 },
          { name: "Version Control & Deployment", description: "Git workflows and cloud deployment fundamentals.", weightage: 20 }
        ],
        skills: [
          {
            name: "Node.js",
            category: "Server Runtimes",
            priority: "core",
            isMandatory: true,
            weightage: 35,
            competencyArea: "Server Languages & Runtimes",
            prerequisites: []
          },
          {
            name: "MongoDB",
            category: "Databases",
            priority: "core",
            isMandatory: true,
            weightage: 25,
            competencyArea: "Databases & Storage",
            prerequisites: []
          },
          {
            name: "Express APIs & JWT Security",
            category: "APIs",
            priority: "core",
            isMandatory: true,
            weightage: 20,
            competencyArea: "APIs & Security",
            prerequisites: ["Node.js"]
          },
          {
            name: "Git & Deployment basics",
            category: "Tools",
            priority: "secondary",
            isMandatory: true,
            weightage: 20,
            competencyArea: "Version Control & Deployment",
            prerequisites: []
          }
        ]
      },
      {
        name: "Data Scientist",
        description: "Applies math, statistics, and machine learning models to analyze complex datasets and solve business challenges.",
        category: "Data & Analytics",
        industry: "Software Development",
        experienceLevel: "junior",
        estimatedLearningDuration: { value: 4, unit: "months" },
        competencyAreas: [
          { name: "Programming Foundations", description: "Python and general programming principles for data science.", weightage: 30 },
          { name: "Mathematics & Statistics", description: "Statistical reasoning, probability and linear algebra.", weightage: 25 },
          { name: "Data Processing", description: "Data wrangling, EDA and pandas/numpy pipelines.", weightage: 20 },
          { name: "Machine Learning & AI", description: "Supervised and unsupervised ML model development and evaluation.", weightage: 25 }
        ],
        skills: [
          {
            name: "Python Programming",
            category: "Programming Languages",
            priority: "core",
            isMandatory: true,
            weightage: 30,
            competencyArea: "Programming Foundations",
            prerequisites: []
          },
          {
            name: "Mathematics & Statistics",
            category: "Math Foundations",
            priority: "core",
            isMandatory: true,
            weightage: 25,
            competencyArea: "Mathematics & Statistics",
            prerequisites: []
          },
          {
            name: "Data Analysis & Pandas",
            category: "Data Processing",
            priority: "core",
            isMandatory: true,
            weightage: 20,
            competencyArea: "Data Processing",
            prerequisites: ["Python Programming"]
          },
          {
            name: "Machine Learning Models",
            category: "ML Algorithms",
            priority: "core",
            isMandatory: true,
            weightage: 25,
            competencyArea: "Machine Learning & AI",
            prerequisites: ["Data Analysis & Pandas", "Mathematics & Statistics"]
          }
        ]
      },
      {
        name: "DevOps Engineer",
        description: "Bridges development and operations to automate build systems, testing, and continuous cloud deployment pipelines.",
        category: "Cloud & DevOps",
        industry: "Software Development",
        experienceLevel: "junior",
        estimatedLearningDuration: { value: 3, unit: "months" },
        competencyAreas: [
          { name: "Operating Systems Foundations", description: "Linux and shell scripting for server administration.", weightage: 20 },
          { name: "CI/CD & Automation", description: "Pipeline automation and continuous delivery workflows.", weightage: 30 },
          { name: "Containerization", description: "Docker-based container packaging and image management.", weightage: 25 },
          { name: "Cloud Orchestration", description: "Kubernetes-based orchestration and cloud infrastructure.", weightage: 25 }
        ],
        skills: [
          {
            name: "Linux Administration",
            category: "Operating Systems",
            priority: "core",
            isMandatory: true,
            weightage: 20,
            competencyArea: "Operating Systems Foundations",
            prerequisites: []
          },
          {
            name: "CI/CD Pipelines",
            category: "Automation Tools",
            priority: "core",
            isMandatory: true,
            weightage: 30,
            competencyArea: "CI/CD & Automation",
            prerequisites: []
          },
          {
            name: "Docker Containers",
            category: "Containerization",
            priority: "core",
            isMandatory: true,
            weightage: 25,
            competencyArea: "Containerization",
            prerequisites: ["Linux Administration"]
          },
          {
            name: "Kubernetes Orchestration",
            category: "Orchestration Tools",
            priority: "core",
            isMandatory: true,
            weightage: 25,
            competencyArea: "Cloud Orchestration",
            prerequisites: ["Docker Containers"]
          }
        ]
      }
    ];

    for (const temp of defaultTemplates) {
      const exists = await RoleTemplate.findOne({ name: temp.name });
      if (!exists) {
        await RoleTemplate.create(temp);
        console.log(`Seeded template role: "${temp.name}"`);
      }
    }

    console.log("Phase 1 Migrations & Seeding Completed successfully.");
  } catch (error) {
    console.error("Error running Phase 1 Migrations & Seeding:", error);
  }
};

module.exports = migratePhase1;
