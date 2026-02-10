import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import JobRoles from "../pages/admin/JobRoles";
import PublishRoles from "../pages/admin/PublishRoles";
import Profile from "../pages/admin/Profile";
import Skills from "../pages/admin/Skills";
import Questions from "../pages/admin/Questions";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Base Admin Layout */}
      <Route path="/" element={<AdminLayout />}>
        {/* Dashboard page */}
        <Route index element={<Dashboard />} /> {/* This is /admin */}
        <Route path="dashboard" element={<Dashboard />} /> {/* This is /admin/dashboard */}
        <Route path="job-roles" element={<JobRoles />} />
        <Route path="skills" element={<Skills />} />
            {/* 🔥 QUESTION BANK ROUTE */}
        <Route path="questions" element={<Questions />} />

        <Route path="publish-roles" element={<PublishRoles />} />
        <Route path="profile" element={<Profile />} />
        {/* Redirect any unknown admin path to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
