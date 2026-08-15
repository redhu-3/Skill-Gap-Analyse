// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import AdminLayout from "../layouts/AdminLayout";
// import Dashboard from "../pages/admin/Dashboard";
// import JobRoles from "../pages/admin/JobRoles";
// import PublishRoles from "../pages/admin/PublishRoles";
// import Profile from "../pages/admin/Profile";
// import Skills from "../pages/admin/Skills";
// import Questions from "../pages/admin/Questions";
// import GapAnalytics from "../pages/admin/GapAnalytics";
// import AnalyticsDashboard from "../pages/admin/AnalyticsDashboard";
// import AssessmentBuilder from "../pages/admin/AssessmentBuilder";
// import AssessmentAnalytics from "../pages/admin/AssessmentAnalytics";
// import AssessmentVersionManager from "../pages/admin/AssessmentVersionManager";
// import ReadinessConfigCenter from "../pages/admin/ReadinessConfigCenter";
// import ReadinessAnalytics from "../pages/admin/ReadinessAnalytics";
// import RoadmapBuilder from "../pages/admin/RoadmapBuilder";
// import ResourceManager from "../pages/admin/ResourceManager";
// import LearningAnalytics from "../pages/admin/LearningAnalytics";

// // Resume Intelligence pages
// import SkillAliasManager from "../pages/admin/resume/SkillAliasManager";
// import KeywordMapping from "../pages/admin/resume/KeywordMapping";
// import ParsingRules from "../pages/admin/resume/ParsingRules";
// import CertificationMapping from "../pages/admin/resume/CertificationMapping";
// import ProjectMapping from "../pages/admin/resume/ProjectMapping";
// import ExperienceMapping from "../pages/admin/resume/ExperienceMapping";
// import ConfidenceRules from "../pages/admin/resume/ConfidenceRules";
// import ResumeAnalytics from "../pages/admin/resume/ResumeAnalytics";

// // AI Career Intelligence pages
// import AIRoleGenerator from "../pages/admin/ai/AIRoleGenerator";
// import AISkillRecommender from "../pages/admin/ai/AISkillRecommender";
// import AIWeightageAdvisor from "../pages/admin/ai/AIWeightageAdvisor";
// import AIDependencyAdvisor from "../pages/admin/ai/AIDependencyAdvisor";
// import AICompetencyAdvisor from "../pages/admin/ai/AICompetencyAdvisor";
// import AIAssessmentPlanner from "../pages/admin/ai/AIAssessmentPlanner";
// import AIApprovalQueue from "../pages/admin/ai/AIApprovalQueue";

// const AdminRoutes = () => {
//   return (
//     <Routes>
//       {/* Base Admin Layout */}
//       <Route path="/" element={<AdminLayout />}>
//         {/* Dashboard page */}
//         <Route index element={<Dashboard />} /> {/* This is /admin */}
//         <Route path="dashboard" element={<Dashboard />} /> {/* This is /admin/dashboard */}
//         <Route path="job-roles" element={<JobRoles />} />
//         <Route path="skills" element={<Skills />} />
//         {/* 🔥 QUESTION BANK ROUTE */}
//         <Route path="questions" element={<Questions />} />
//         <Route path="gap-analytics" element={<GapAnalytics />} />
//         <Route path="analytics" element={<AnalyticsDashboard />} />
//         <Route path="publish-roles" element={<PublishRoles />} />
//         <Route path="profile" element={<Profile />} />

//         {/* Assessment Configurations */}
//         <Route path="assessments/blueprint" element={<AssessmentBuilder />} />
//         <Route path="assessments/analytics" element={<AssessmentAnalytics />} />
//         <Route path="assessments/versions" element={<AssessmentVersionManager />} />

//         {/* Readiness Engine */}
//         <Route path="readiness/config" element={<ReadinessConfigCenter />} />
//         <Route path="readiness/analytics" element={<ReadinessAnalytics />} />

//         {/* Learning Intelligence */}
//         <Route path="learning/roadmaps" element={<RoadmapBuilder />} />
//         <Route path="learning/resources" element={<ResourceManager />} />
//         <Route path="learning/analytics" element={<LearningAnalytics />} />

//         {/* Resume Intelligence */}
//         <Route path="resume/aliases" element={<SkillAliasManager />} />
//         <Route path="resume/keywords" element={<KeywordMapping />} />
//         <Route path="resume/parsing-rules" element={<ParsingRules />} />
//         <Route path="resume/certifications" element={<CertificationMapping />} />
//         <Route path="resume/projects" element={<ProjectMapping />} />
//         <Route path="resume/experiences" element={<ExperienceMapping />} />
//         <Route path="resume/confidence-rules" element={<ConfidenceRules />} />
//         <Route path="resume/analytics" element={<ResumeAnalytics />} />

//         {/* AI Career Intelligence Routes */}
//         <Route path="ai/role-generator" element={<AIRoleGenerator />} />
//         <Route path="ai/skill-recommender" element={<AISkillRecommender />} />
//         <Route path="ai/weightage-advisor" element={<AIWeightageAdvisor />} />
//         <Route path="ai/dependency-advisor" element={<AIDependencyAdvisor />} />
//         <Route path="ai/competency-advisor" element={<AICompetencyAdvisor />} />
//         <Route path="ai/assessment-planner" element={<AIAssessmentPlanner />} />
//         <Route path="ai/queue" element={<AIApprovalQueue />} />

//         {/* Redirect any unknown admin path to dashboard */}
//         <Route path="*" element={<Navigate to="dashboard" />} />
//       </Route>
//     </Routes>
//   );
// };

// export default AdminRoutes;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import JobRoles from "../pages/admin/JobRoles";
import AccessRequests from "../pages/admin/AccessRequests";
import PublishRoles from "../pages/admin/PublishRoles";
import Profile from "../pages/admin/Profile";
import Skills from "../pages/admin/Skills";
import Questions from "../pages/admin/Questions";
import AssessmentBuilder from "../pages/admin/AssessmentBuilder";
import AssessmentAnalytics from "../pages/admin/AssessmentAnalytics";
import AssessmentVersionManager from "../pages/admin/AssessmentVersionManager";
import ReadinessConfigCenter from "../pages/admin/ReadinessConfigCenter";
import ReadinessAnalytics from "../pages/admin/ReadinessAnalytics";
import RoadmapBuilder from "../pages/admin/RoadmapBuilder";
import ResourceManager from "../pages/admin/ResourceManager";
import LearningAnalytics from "../pages/admin/LearningAnalytics";

// Resume Intelligence pages
import SkillAliasManager from "../pages/admin/resume/SkillAliasManager";
import KeywordMapping from "../pages/admin/resume/KeywordMapping";
import ParsingRules from "../pages/admin/resume/ParsingRules";
import CertificationMapping from "../pages/admin/resume/CertificationMapping";
import ProjectMapping from "../pages/admin/resume/ProjectMapping";
import ExperienceMapping from "../pages/admin/resume/ExperienceMapping";
import ConfidenceRules from "../pages/admin/resume/ConfidenceRules";
import ResumeAnalytics from "../pages/admin/resume/ResumeAnalytics";

// AI Career Intelligence pages
import AIRoleGenerator from "../pages/admin/ai/AIRoleGenerator";
import AISkillRecommender from "../pages/admin/ai/AISkillRecommender";
import AIWeightageAdvisor from "../pages/admin/ai/AIWeightageAdvisor";
import AIDependencyAdvisor from "../pages/admin/ai/AIDependencyAdvisor";
import AICompetencyAdvisor from "../pages/admin/ai/AICompetencyAdvisor";
import AIAssessmentPlanner from "../pages/admin/ai/AIAssessmentPlanner";
import AIApprovalQueue from "../pages/admin/ai/AIApprovalQueue";

// ✅ Auth Guard — blocks non-admins from accessing any /admin/* route
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token or role is not admin, redirect to login
  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Base Admin Layout — wrapped in ProtectedAdminRoute */}
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Core */}
        <Route path="job-roles" element={<JobRoles />} />
        <Route path="access-requests" element={<AccessRequests />} />
        <Route path="skills" element={<Skills />} />
        <Route path="questions" element={<Questions />} />
        <Route path="publish-roles" element={<PublishRoles />} />
        <Route path="profile" element={<Profile />} />

        {/* Assessment Configurations */}
        <Route path="assessments/blueprint" element={<AssessmentBuilder />} />
        <Route path="assessments/analytics" element={<AssessmentAnalytics />} />
        <Route path="assessments/versions" element={<AssessmentVersionManager />} />

        {/* Readiness Engine */}
        <Route path="readiness/config" element={<ReadinessConfigCenter />} />
        <Route path="readiness/analytics" element={<ReadinessAnalytics />} />

        {/* Learning Intelligence */}
        <Route path="learning/roadmaps" element={<RoadmapBuilder />} />
        <Route path="learning/resources" element={<ResourceManager />} />
        <Route path="learning/analytics" element={<LearningAnalytics />} />

        {/* Resume Intelligence */}
        <Route path="resume/aliases" element={<SkillAliasManager />} />
        <Route path="resume/keywords" element={<KeywordMapping />} />
        <Route path="resume/parsing-rules" element={<ParsingRules />} />
        <Route path="resume/certifications" element={<CertificationMapping />} />
        <Route path="resume/projects" element={<ProjectMapping />} />
        <Route path="resume/experiences" element={<ExperienceMapping />} />
        <Route path="resume/confidence-rules" element={<ConfidenceRules />} />
        <Route path="resume/analytics" element={<ResumeAnalytics />} />

        {/* AI Career Intelligence */}
        <Route path="ai/role-generator" element={<AIRoleGenerator />} />
        <Route path="ai/skill-recommender" element={<AISkillRecommender />} />
        <Route path="ai/weightage-advisor" element={<AIWeightageAdvisor />} />
        <Route path="ai/dependency-advisor" element={<AIDependencyAdvisor />} />
        <Route path="ai/competency-advisor" element={<AICompetencyAdvisor />} />
        <Route path="ai/assessment-planner" element={<AIAssessmentPlanner />} />
        <Route path="ai/queue" element={<AIApprovalQueue />} />

        {/* Catch-all: redirect unknown admin paths to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;