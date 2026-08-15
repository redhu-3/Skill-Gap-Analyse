// frontend/src/pages/admin/resume/ResumeAnalytics.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useTheme } from "../../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  FolderOpenIcon,
  TagIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const ResumeAnalytics = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/resume-intelligence/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load resume analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const cardBg = darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-55 via-white to-violet-55 text-gray-900"
    }`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          📊 Analytics Dashboard
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Resume Intelligence Analytics
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Monitor parser rule distributions, mapping frequencies, and aggregate matching statistics.
        </p>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Summary Grid Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Skill Aliases", count: data.configSummary.aliasCount, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { label: "Keyword Rules", count: data.configSummary.keywordCount, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Certifications", count: data.configSummary.certCount, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Project Rules", count: data.configSummary.projectCount, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Experience Rules", count: data.configSummary.experienceCount, color: "text-pink-400", bg: "bg-pink-500/10" },
            ].map((item, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
                <span className="text-xs opacity-60 font-semibold">{item.label}</span>
                <span className={`text-3xl font-extrabold mt-2 ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confidence Distribution */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                Confidence Score Distribution
              </h2>
              <div className="space-y-4">
                {data.confidenceDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{item.label}</span>
                      <span className="opacity-75">{item.value}% scans</span>
                    </div>
                    <div className="w-full bg-gray-500/20 rounded-full h-2.5">
                      <div
                        className="bg-indigo-500 h-2.5 rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Type Distribution */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-purple-400" />
                Resume Match Distributions
              </h2>
              <div className="space-y-4">
                {data.matchTypeDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{item.type}</span>
                      <span className="opacity-75">{item.percentage}% matches</span>
                    </div>
                    <div className="w-full bg-gray-500/20 rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Detected Skills */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-emerald-400" />
                Most Detected Skills
              </h2>
              <div className="space-y-3">
                {data.topDetectedSkills.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-500/5">
                    <span className="font-semibold text-sm">{item.skillName}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400">
                      {item.count} detections
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Missing Gaps */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-rose-400" />
                Most Missing Skills (Role Gaps)
              </h2>
              <div className="space-y-3">
                {data.topMissingSkills.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-500/5">
                    <span className="font-semibold text-sm">{item.skillName}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/10 text-rose-400">
                      {item.count} missing
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Matched Roles */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 lg:col-span-2`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-amber-400" />
                Most Matched Target Roles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.topMatchedRoles.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-500/15 bg-gray-500/5 text-center">
                    <span className="block text-sm opacity-60 font-semibold">{item.roleName}</span>
                    <span className="block text-2xl font-extrabold text-amber-400 mt-1">{item.count}</span>
                    <span className="block text-[10px] opacity-40 mt-0.5">Scanned Matches</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalytics;
