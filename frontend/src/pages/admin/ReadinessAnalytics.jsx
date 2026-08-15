// frontend/src/pages/admin/ReadinessAnalytics.jsx
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartBarIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

const ReadinessAnalytics = () => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [skillsMap, setSkillsMap] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, skillsRes] = await Promise.all([
        axiosInstance.get("/admin/readiness/analytics"),
        axiosInstance.get("/skills")
      ]);

      setAnalytics(analyticsRes.data);

      const skillList = skillsRes.data.skills || skillsRes.data || [];
      const map = {};
      skillList.forEach(s => {
        map[s._id] = s;
      });
      setSkillsMap(map);
    } catch (err) {
      setError("Failed to compile readiness analytics reports.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`;

  // Prepare Chart Data
  const roleChartData = analytics?.averageReadinessByRole?.map(item => ({
    name: item.roleName,
    "Avg Readiness %": item.averageScore,
    "Learner Count": item.userCount
  })) || [];

  const distributionChartData = analytics?.industryLevelDistribution
    ? Object.keys(analytics.industryLevelDistribution).map(key => ({
        name: key,
        value: analytics.industryLevelDistribution[key]
      }))
    : [];

  const topMandatoryFailed = analytics?.failedMandatorySkills
    ? Object.keys(analytics.failedMandatorySkills).map(key => ({
        skillName: skillsMap[key]?.name || `Skill ID: ${key}`,
        count: analytics.failedMandatorySkills[key]
      })).sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900"
    }`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
            📊 Reports
          </span>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Readiness Analytics
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Track company-wide target skill readiness, match indexes, and talent distributions.
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
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Average Readiness by Role */}
            <div className={base}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-indigo-400" />
                Average Readiness by Job Role
              </h2>
              {roleChartData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                      <YAxis domain={[0, 100]} tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderColor: darkMode ? "#374151" : "#e5e7eb", color: darkMode ? "#fff" : "#000" }} />
                      <Bar dataKey="Avg Readiness %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm opacity-60 text-center py-16">No enrolled job roles or users tracked yet.</p>
              )}
            </div>

            {/* Distribution */}
            <div className={base}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-violet-400" />
                Industry Readiness Level Distribution
              </h2>
              {distributionChartData.some(d => d.value > 0) ? (
                <div className="h-72 flex items-center justify-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-2 text-sm">
                    {distributionChartData.map((d, index) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-semibold">{d.name}:</span>
                        <span className="opacity-70">{d.value} User(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm opacity-60 text-center py-16">No users assigned to any industry readiness index levels.</p>
              )}
            </div>
          </div>

          {/* Failed Mandatory Skills Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={base}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5 text-rose-500" />
                Critical Failures: Mandatory Skill Benchmarks
              </h2>
              {topMandatoryFailed.length > 0 ? (
                <div className="space-y-4">
                  {topMandatoryFailed.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border border-rose-500/10 bg-rose-500/5">
                      <span className="font-bold text-sm">{item.skillName}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500 text-white font-semibold">
                        {item.count} User Failure(s)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-60 text-center py-16">Excellent! No users have failed mandatory skill benchmarks.</p>
              )}
            </div>

            <div className={base}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
                Most Common Target Skill Gaps
              </h2>
              {analytics?.skillGapsCount && Object.keys(analytics.skillGapsCount).length > 0 ? (
                <div className="space-y-4">
                  {Object.keys(analytics.skillGapsCount)
                    .map(key => ({
                      name: skillsMap[key]?.name || `Skill ID: ${key}`,
                      count: analytics.skillGapsCount[key]
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border border-gray-700/20 bg-gray-500/5">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          {item.count} Gap(s) Logged
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm opacity-60 text-center py-16">All user competencies are complete and aligned with target role benchmarks.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessAnalytics;
