import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

/* ================= MAIN COMPONENT ================= */
const GapAnalytics = () => {
  const { darkMode } = useTheme();
  const [gapStats, setGapStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGapStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          "http://localhost:5000/api/gap/admin/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setGapStats(res.data.topGaps);
        }
      } catch (err) {
        console.error("Gap stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGapStats();
  }, []);

  // Calculate the max gap count for proportional bar widths
  const maxGapCount = gapStats.length > 0
    ? Math.max(...gapStats.map((g) => g.gapCount))
    : 1;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "core":
        return {
          bg: "bg-rose-500/10",
          text: "text-rose-500",
          barBg: "bg-gradient-to-r from-rose-500 to-rose-600",
        };
      case "secondary":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-500",
          barBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        };
      default:
        return {
          bg: "bg-sky-500/10",
          text: "text-sky-500",
          barBg: "bg-gradient-to-r from-sky-500 to-sky-600",
        };
    }
  };

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
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
            📊 Platform Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight">
            Gap Analytics
          </h1>
          <p className="mt-3 opacity-70 text-sm">
            Monitor the most common skill gaps across all enrolled learners.
            Use this data to prioritize curriculum improvements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-full">
          <ChartBarIcon className="w-5 h-5" />
          Top {gapStats.length} Gaps
        </div>
      </motion.div>

      {/* ===== SUMMARY STATS ROW ===== */}
      {!loading && gapStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          {/* Total Gap Instances */}
          <div
            className={`rounded-3xl p-6 border shadow-sm ${
              darkMode
                ? "bg-gray-800/60 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block mb-2">
              Total Gap Instances
            </span>
            <span className="text-3xl font-extrabold text-rose-500">
              {gapStats.reduce((sum, g) => sum + g.gapCount, 0)}
            </span>
          </div>

          {/* Core Gaps */}
          <div
            className={`rounded-3xl p-6 border shadow-sm ${
              darkMode
                ? "bg-gray-800/60 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block mb-2">
              Core Skill Gaps
            </span>
            <span className="text-3xl font-extrabold text-rose-500">
              {gapStats.filter((g) => g.priority === "core").length}
            </span>
            <span className="text-xs opacity-50 ml-2">skills</span>
          </div>

          {/* Most Common Gap */}
          <div
            className={`rounded-3xl p-6 border shadow-sm ${
              darkMode
                ? "bg-gray-800/60 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block mb-2">
              Most Common Gap
            </span>
            <span className="text-xl font-extrabold text-indigo-500">
              {gapStats[0]?.skillName || "—"}
            </span>
            <span className="text-xs opacity-50 ml-2">
              ({gapStats[0]?.gapCount || 0} learners)
            </span>
          </div>
        </motion.div>
      )}

      {/* ===== LOADING SKELETON ===== */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-20 rounded-3xl animate-pulse ${
                darkMode ? "bg-gray-800/40" : "bg-gray-200/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {!loading && gapStats.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-12 rounded-3xl border shadow-sm text-center ${
            darkMode
              ? "bg-gray-800/40 border-gray-700/50"
              : "bg-gray-50/50 border-gray-200"
          }`}
        >
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-60" />
          <h3 className="text-xl font-bold mb-2">No Skill Gaps Detected</h3>
          <p className="opacity-60 text-sm max-w-md mx-auto">
            All enrolled learners are either fully job-ready or have not started
            their pathways yet. Gaps will appear here as learners progress
            through assessments.
          </p>
        </motion.div>
      )}

      {/* ===== GAP RANKING TABLE ===== */}
      {!loading && gapStats.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase font-bold tracking-widest opacity-40">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Skill Name</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Priority</span>
            <span className="col-span-3">Gap Distribution</span>
          </div>

          {/* Gap Rows */}
          {gapStats.map((gap, idx) => {
            const style = getPriorityStyle(gap.priority);
            const barWidth = Math.max(
              (gap.gapCount / maxGapCount) * 100,
              8
            );

            return (
              <motion.div
                key={gap._id || idx}
                variants={itemVariants}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-5 rounded-2xl border shadow-sm transition hover:shadow-md ${
                  darkMode
                    ? "bg-gray-800/60 border-gray-700 hover:bg-gray-800/80"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                      idx < 3
                        ? "bg-rose-500/10 text-rose-500"
                        : darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Skill Name */}
                <div className="col-span-4">
                  <span className="font-semibold text-base">
                    {gap.skillName}
                  </span>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-500">
                    {gap.category}
                  </span>
                </div>

                {/* Priority */}
                <div className="col-span-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
                  >
                    {gap.priority}
                  </span>
                </div>

                {/* Gap Bar */}
                <div className="col-span-3 flex items-center gap-3">
                  <div
                    className={`flex-1 h-3 rounded-full overflow-hidden ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{
                        duration: 0.8,
                        delay: idx * 0.08,
                      }}
                      className={`h-full rounded-full ${style.barBg}`}
                    />
                  </div>
                  <span className="text-sm font-bold min-w-[2.5rem] text-right">
                    {gap.gapCount}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ===== INSIGHT BANNER ===== */}
      {!loading && gapStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 p-6 rounded-3xl border flex items-start gap-4 ${
            darkMode
              ? "bg-amber-500/5 border-amber-500/10"
              : "bg-amber-50 border-amber-200/50"
          }`}
        >
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">Actionable Insight</h4>
            <p className="text-xs opacity-75 leading-relaxed">
              The top-ranked gaps represent the most impactful areas for
              curriculum improvement. Consider adding more resources, practice
              exercises, or alternative assessment paths for{" "}
              <strong className="text-amber-600 dark:text-amber-400">
                {gapStats[0]?.skillName}
              </strong>{" "}
              — it currently has the highest number of learners struggling.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GapAnalytics;
