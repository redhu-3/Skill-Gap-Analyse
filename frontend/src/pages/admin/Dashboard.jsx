import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import ActionCard from "./ActionCard";
import SkeletonGrid from "./SkeletonGrid";

/* ================= MAIN DASHBOARD ================= */

const Dashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          "http://localhost:5000/api/admin/dashboard-stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div
      className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-gray-900"
      }`}
    >
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome Back 👋
          </h1>
          <p className="mt-3 opacity-70 text-sm">
            Monitor system growth and manage platform operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full">
          <ArrowTrendingUpIcon className="w-5 h-5" />
          System Running Smoothly
        </div>
      </motion.div>

      {/* ===== STATS SECTION ===== */}
      {loading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          <StatCard
            title="Job Roles"
            value={stats?.totalRoles}
            icon={BriefcaseIcon}
        
          />
          <StatCard
            title="Skills"
            value={stats?.totalSkills}
            icon={AcademicCapIcon}
      
          />
          <StatCard
            title="Questions"
            value={stats?.totalQuestions}
            icon={QuestionMarkCircleIcon}
        
          />
          <StatCard
            title="Published"
            value={stats?.publishedRoles}
            icon={CheckCircleIcon}
          
          />
        </div>
      )}

      {/* ===== QUICK ACTIONS ===== */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ActionCard
            title="Create Job Role"
            onClick={() => navigate("/admin/job-roles")}
          />
          <ActionCard
            title="Manage Skills"
            onClick={() => navigate("/admin/skills")}
          />
          <ActionCard
            title="Question Bank"
            onClick={() => navigate("/admin/questions")}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* ================= PREMIUM STAT CARD ================= */

