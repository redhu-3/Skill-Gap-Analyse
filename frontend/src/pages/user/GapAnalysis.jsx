import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoon,
  FaSun,
  FaChevronRight,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaBookOpen,
  FaLock
} from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

/* Framer Motion Animations */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

const GapAnalysis = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchGapAnalysis = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/gap/self");
        if (res.data.success) {
          setData(res.data);
        } else {
          setError("Failed to load gap analysis.");
        }
      } catch (err) {
        console.error("Gap Analysis Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to fetch gap analysis data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGapAnalysis();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg opacity-70">Calculating career intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 px-6 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}>
        <div className={`max-w-md w-full p-8 rounded-3xl border shadow-xl text-center ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        }`}>
          <FaExclamationTriangle className="text-rose-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="opacity-75 mb-6">{error}</p>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If user has no active job role enrollment
  if (!data || !data.hasRole) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}>
        {/* TOP CONTROLS */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-250 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-12 border shadow-xl ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}
          >
            <h2 className="text-4xl font-extrabold mb-4">No Active Pathway Selected</h2>
            <p className="opacity-70 max-w-lg mx-auto mb-8 text-lg">
              To analyze your skills and identify potential knowledge gaps, you need to enroll in a career path first.
            </p>
            <button
              onClick={() => navigate("/user/job-roles")}
              className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/25"
            >
              Explore Job Roles
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const { jobRole, readinessScore, formulaUsed, summary, competencyAreas, gaps } = data;

  // SVG Progress Ring calculations
  const radius = 55;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  // Color selection based on Readiness Score
  const getReadinessColor = (score) => {
    if (score < 40) return { stroke: "#f43f5e", text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Needs Development" };
    if (score < 70) return { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Progressing" };
    return { stroke: "#10b981", text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Job Ready" };
  };

  const statusColor = getReadinessColor(readinessScore);

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
    }`}>
      {/* HEADER AND THEME CONTROLS */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border hover:bg-gray-200 dark:hover:bg-gray-800 dark:border-gray-700 transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24">
        {/* BACK ACTION */}
        <button
          onClick={() => navigate("/user/dashboard")}
          className="flex items-center gap-2 mb-8 opacity-75 hover:opacity-100 transition font-semibold"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* HERO TITLE */}
        <div className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
            🔬 Career Intelligence Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Skill Gap Analysis
          </h1>
          <p className="text-lg opacity-70">
            Target Role: <strong className="text-indigo-600 dark:text-indigo-400">{jobRole.name}</strong> • {jobRole.industry} • v{jobRole.version}
          </p>
        </div>

        {/* ANALYTICS CONTAINER */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* READINESS SUMMARY CARD (LEFT 1 COLUMN) */}
          <motion.div
            variants={itemVariants}
            className={`rounded-3xl p-8 border shadow-xl flex flex-col items-center justify-between ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="text-center w-full">
              <h2 className="text-xl font-bold mb-6">Job Readiness</h2>
              
              {/* Circular Ring Progress */}
              <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke={darkMode ? "#374151" : "#e5e7eb"}
                    strokeWidth={stroke}
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke={statusColor.stroke}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Percentage Display */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold">{readinessScore}%</span>
                  <span className="text-[10px] tracking-wider uppercase opacity-60">Status</span>
                </div>
              </div>

              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                  {statusColor.label}
                </span>
                <p className="text-[11px] opacity-50 mt-3 capitalize">
                  Evaluation formula: {formulaUsed} metrics
                </p>
              </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="w-full border-t border-gray-700/50 dark:border-gray-700/50 mt-8 pt-6 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.totalSkills}</span>
                <span className="text-[10px] opacity-60 uppercase font-semibold">Total Required</span>
              </div>
              <div className="border-x border-gray-700/30">
                <span className="block text-2xl font-bold text-emerald-500">{summary.completedSkills}</span>
                <span className="text-[10px] opacity-60 uppercase font-semibold">Completed</span>
              </div>
              <div>
                <span className={`block text-2xl font-bold ${summary.totalGaps > 0 ? "text-rose-500" : "text-emerald-500"}`}>{summary.totalGaps}</span>
                <span className="text-[10px] opacity-60 uppercase font-semibold">Skill Gaps</span>
              </div>
            </div>
          </motion.div>

          {/* COMPETENCY AREAS (RIGHT 2 COLUMNS) */}
          <motion.div
            variants={itemVariants}
            className={`lg:col-span-2 rounded-3xl p-8 border shadow-xl flex flex-col justify-between ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div>
              <h2 className="text-xl font-bold mb-2">Competency Mastery</h2>
              <p className="text-sm opacity-65 mb-8">
                Your readiness grouped by high-level curriculum categories. Unlock skills to improve rates.
              </p>

              <div className="space-y-6">
                {competencyAreas.map((area, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold text-base block">{area.name}</span>
                        <span className="text-xs opacity-50 block font-normal">{area.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">{area.completionRate}%</span>
                        <span className="text-[10px] opacity-40 block font-normal">Weight: {area.weightage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${area.completionRate}%` }}
                        transition={{ duration: 1, delay: idx * 0.15 }}
                        className={`h-full rounded-full ${
                          area.completionRate === 100
                            ? "bg-emerald-500"
                            : area.completionRate > 50
                            ? "bg-indigo-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
              <FaBookOpen className="text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0" />
              <p className="text-xs opacity-80 leading-relaxed">
                Tip: Prioritize resolving <strong>Core Gaps</strong> first. Core skills are weighted heavily and represent non-negotiable industry readiness requirements.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* DETAILED GAP SEVERITY REPORT */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            🛡️ Gap Severity Breakdown
          </h2>

          <div className="space-y-8">
            {/* 1. CRITICAL GAPS (CORE) */}
            <GapCategoryFeed
              title="Critical Gaps (Core Skills)"
              description="Must resolve immediately. Standard workflows cannot unlock completely without passing these assessment levels."
              gaps={gaps.critical}
              type="critical"
              darkMode={darkMode}
              onActionClick={(id) => navigate(`/skills/${id}`)}
            />

            {/* 2. MODERATE GAPS (SECONDARY) */}
            <GapCategoryFeed
              title="Moderate Gaps (Secondary Skills)"
              description="Secondary expectations. Important for comprehensive developer capabilities."
              gaps={gaps.moderate}
              type="moderate"
              darkMode={darkMode}
              onActionClick={(id) => navigate(`/skills/${id}`)}
            />

            {/* 3. MINOR GAPS (OPTIONAL) */}
            <GapCategoryFeed
              title="Minor Gaps (Optional / Nice to Have)"
              description="Optional tools or advanced frameworks that provide additional industry leverage."
              gaps={gaps.minor}
              type="minor"
              darkMode={darkMode}
              onActionClick={(id) => navigate(`/skills/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Child Category Accordion / List Component */
const GapCategoryFeed = ({ title, description, gaps, type, darkMode, onActionClick }) => {
  const [isOpen, setIsOpen] = useState(true);

  const colors = {
    critical: { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", btn: "bg-rose-600 hover:bg-rose-700" },
    moderate: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", btn: "bg-amber-600 hover:bg-amber-700" },
    minor: { text: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20", btn: "bg-sky-600 hover:bg-sky-700" }
  }[type];

  return (
    <div className={`rounded-3xl border shadow-md p-6 ${
      darkMode ? "bg-gray-800/40 border-gray-700/50" : "bg-gray-50/50 border-gray-200"
    }`}>
      {/* Header trigger */}
      <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
            {title}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
              {gaps.length} Gaps
            </span>
          </h3>
          <p className="text-xs opacity-60 mt-1">{description}</p>
        </div>
        <button className={`p-1.5 rounded-lg hover:bg-gray-700/20 transition transform ${isOpen ? "rotate-90" : ""}`}>
          <FaChevronRight className="opacity-50" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {gaps.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <FaCheckCircle className="text-emerald-500 text-3xl" />
                <p className="text-sm font-semibold opacity-70">Category Cleared!</p>
                <p className="text-xs opacity-50">No knowledge gaps found in this priority tier.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-700/20">
                {gaps.map((skill) => (
                  <div
                    key={skill._id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition hover:shadow-md ${
                      darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-150"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-semibold text-base leading-tight">{skill.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 capitalize whitespace-nowrap">
                          {skill.category}
                        </span>
                      </div>

                      <div className="space-y-1 mt-2">
                        <span className="text-xs opacity-50 block font-normal">
                          Competency: <strong>{skill.competencyArea}</strong>
                        </span>
                        
                        {/* Prerequisites checklist */}
                        {skill.prerequisites && skill.prerequisites.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-40 block mb-1">
                              Prerequisites:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {skill.prerequisites.map((prereqId, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 opacity-80">
                                  <FaLock size={8} className="opacity-50" /> Linked Skill
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-700/10 dark:border-gray-700/20 flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize flex items-center gap-1 opacity-70">
                        Status: <span className={skill.userStatus === "in-progress" ? "text-indigo-500" : "text-rose-500"}>
                          {skill.userStatus.replace("-", " ")}
                        </span>
                      </span>
                      <button
                        onClick={() => onActionClick(skill._id)}
                        className={`text-xs text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-1 shadow-sm ${colors.btn}`}
                      >
                        Start Skill <FaChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GapAnalysis;
