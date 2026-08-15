// frontend/src/pages/admin/AssessmentAnalytics.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBarIcon, ArrowTrendingUpIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";

const AssessmentAnalytics = () => {
  const { darkMode } = useTheme();
  const { hasPermission } = usePermission();

  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axiosInstance.get("/skills");
      const data = res.data.skills || res.data || [];
      setSkills(data);
      if (data.length > 0) {
        setSelectedSkill(data[0]._id);
        fetchAssessments(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssessments = async (skillId) => {
    try {
      const res = await axiosInstance.get(`/skills/${skillId}`);
      const list = res.data.assessments || [];
      setAssessments(list);
      if (list.length > 0) {
        setSelectedAssessment(list[0]._id);
        fetchAnalytics(list[0]._id);
      } else {
        setSelectedAssessment("");
        setAnalytics(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (assId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/admin/assessments/analytics/${assId}`);
      setAnalytics(res.data.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (skillId) => {
    setSelectedSkill(skillId);
    fetchAssessments(skillId);
  };

  const handleAssessmentChange = (assId) => {
    setSelectedAssessment(assId);
    if (assId) fetchAnalytics(assId);
  };

  if (!hasPermission("analytics:view")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center opacity-60">
          <ShieldExclamationIcon className="w-16 h-16 mx-auto mb-4 text-rose-500" />
          <p className="text-lg font-medium">You don't have access to Assessment Analytics.</p>
        </div>
      </div>
    );
  }

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
    darkMode ? 'bg-gray-900 border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-300 focus:border-indigo-500'
  }`;

  // Prepare chart data for question success rates
  const chartData = analytics?.questionMetrics?.map((m, index) => ({
    name: `Q${index + 1}`,
    successRate: m.successRate || 0,
    text: m.question?.questionText || ""
  })) || [];

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white'
               : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900'
    }`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          📊 Reports
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Assessment Analytics
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Monitor assessment attempt metrics, pass rates, and question success rates.
        </p>
      </motion.div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-xs font-semibold mb-1.5 opacity-70">Select Target Skill</label>
          <select value={selectedSkill} onChange={e => handleSkillChange(e.target.value)} className={inputClass}>
            {skills.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 opacity-70">Select Assessment</label>
          <select value={selectedAssessment} onChange={e => handleAssessmentChange(e.target.value)} className={inputClass}>
            {assessments.map(a => <option key={a._id} value={a._id}>{a.name} (Level {a.level})</option>)}
            {assessments.length === 0 && <option value="">No Assessments Available</option>}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm border bg-rose-500/10 text-rose-400 border-rose-500/20">
          {error}
        </div>
      )}

      {!loading && !analytics && selectedAssessment && (
        <div className={`${base} text-center py-12`}>
          <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm opacity-60">No attempts logged for this assessment blueprint yet.</p>
        </div>
      )}

      {!loading && analytics && (
        <div className="space-y-8">
          {/* Stats Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Total Attempts</div>
              <div className="text-3xl font-extrabold">{analytics.attemptCount || 0}</div>
            </div>
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Average Passing Rate</div>
              <div className="text-3xl font-extrabold text-emerald-400">{(analytics.passRate || 0).toFixed(1)}%</div>
            </div>
            <div className={base}>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Average Score</div>
              <div className="text-3xl font-extrabold text-indigo-400">{(analytics.averageScore || 0).toFixed(1)}%</div>
            </div>
          </div>

          {/* Success rate bar chart */}
          {chartData.length > 0 && (
            <div className={base}>
              <h2 className="text-lg font-bold mb-6">Question Success Rates (%)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis dataKey="name" tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                    <YAxis domain={[0, 100]} tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderColor: darkMode ? "#374151" : "#e5e7eb", color: darkMode ? "#fff" : "#000" }} />
                    <Bar dataKey="successRate" name="Success Rate %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Individual Question Audit Logs */}
          <div className={base}>
            <h2 className="text-lg font-bold mb-4">Question Audit & Analytics Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-700/30 font-semibold opacity-70">
                    <th className="py-3 px-4">Q#</th>
                    <th className="py-3 px-4">Question Text</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Total Attempts</th>
                    <th className="py-3 px-4">Success Rate</th>
                    <th className="py-3 px-4">Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.questionMetrics?.map((m, index) => {
                    const isTooHard = m.successRate < 40;
                    return (
                      <tr key={index} className="border-b border-gray-700/10 hover:bg-gray-50/5">
                        <td className="py-3.5 px-4 font-semibold">Q{index + 1}</td>
                        <td className="py-3.5 px-4 truncate max-w-xs" title={m.question?.questionText}>
                          {m.question?.questionText || "Legacy Deleted Question"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            m.question?.difficulty === "hard" ? "bg-rose-500/10 text-rose-400" :
                            m.question?.difficulty === "medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {m.question?.difficulty || "medium"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{m.totalAttempts}</td>
                        <td className={`py-3.5 px-4 font-bold ${isTooHard ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {(m.successRate || 0).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4">
                          {isTooHard ? (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
                              ⚠️ Check Rules
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentAnalytics;
