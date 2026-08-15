// frontend/src/pages/admin/LearningAnalytics.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BookmarkSquareIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const LearningAnalytics = () => {
  const { darkMode } = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/learning/analytics");
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to load learning path analytics reports.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`;

  // Prepare chart data
  const popularPathsChart = analytics?.popularPaths
    ? Object.keys(analytics.popularPaths).map(key => ({
        name: key,
        "Enrolled Learners": analytics.popularPaths[key]
      }))
    : [];

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900"
    }`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            📊 Analytics
          </span>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Learning Path Analytics
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Monitor active roadmap progress, course engagement rates, and curriculum milestones completion.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm border bg-rose-500/10 text-rose-400 border-rose-500/20">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && analytics && (
        <div className="space-y-8">
          {/* Summary counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Total Enrolled Pathways</div>
              <div className="text-3xl font-extrabold">{analytics.totalEnrolledCount || 0}</div>
            </div>
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Pathways Completion Rate</div>
              <div className="text-3xl font-extrabold text-emerald-400">{analytics.completionRate || 0}%</div>
            </div>
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Curriculum Active Steps</div>
              <div className="text-3xl font-extrabold text-indigo-400">{popularPathsChart.reduce((sum, item) => sum + item["Enrolled Learners"], 0)}</div>
            </div>
          </div>

          {/* Graph Section */}
          <div className="grid grid-cols-1 gap-8">
            <div className={base}>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BookmarkSquareIcon className="w-5 h-5 text-indigo-400" />
                Popular Learning Pathways Enrollment
              </h2>
              {popularPathsChart.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularPathsChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                      <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderColor: darkMode ? "#374151" : "#e5e7eb", color: darkMode ? "#fff" : "#000" }} />
                      <Bar dataKey="Enrolled Learners" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm opacity-60 text-center py-16">No active curriculum roadmap engagements tracked yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAnalytics;
