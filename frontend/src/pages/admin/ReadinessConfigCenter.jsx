// frontend/src/pages/admin/ReadinessConfigCenter.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ReadinessConfigCenter = () => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("formulas");
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/readiness/config");
      setConfig(res.data.config);
    } catch (err) {
      setError("Failed to load readiness configurations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await axiosInstance.post("/admin/readiness/config", config);
      setConfig(res.data.config);
      showToast("Readiness configurations updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // State modifiers
  const updateFormula = (key, val) => {
    setConfig(prev => ({
      ...prev,
      formulas: { ...prev.formulas, [key]: Number(val) }
    }));
  };

  const addGapRule = () => {
    setConfig(prev => ({
      ...prev,
      gapRules: [
        ...prev.gapRules,
        { label: "New Gap Level", minThreshold: 0, maxThreshold: 50, color: "#a855f7", priority: "medium" }
      ]
    }));
  };

  const deleteGapRule = (index) => {
    setConfig(prev => ({
      ...prev,
      gapRules: prev.gapRules.filter((_, i) => i !== index)
    }));
  };

  const updateGapRule = (index, field, val) => {
    const updated = [...config.gapRules];
    updated[index][field] = field.includes("Threshold") ? Number(val) : val;
    setConfig(prev => ({ ...prev, gapRules: updated }));
  };

  const addIndustryLevel = () => {
    setConfig(prev => ({
      ...prev,
      industryLevels: [
        ...prev.industryLevels,
        { label: "New Level", minThreshold: 0, maxThreshold: 50, color: "#6366f1" }
      ]
    }));
  };

  const deleteIndustryLevel = (index) => {
    setConfig(prev => ({
      ...prev,
      industryLevels: prev.industryLevels.filter((_, i) => i !== index)
    }));
  };

  const updateIndustryLevel = (index, field, val) => {
    const updated = [...config.industryLevels];
    updated[index][field] = field.includes("Threshold") ? Number(val) : val;
    setConfig(prev => ({ ...prev, industryLevels: updated }));
  };

  const addRecRule = () => {
    setConfig(prev => ({
      ...prev,
      recommendationRules: [
        ...prev.recommendationRules,
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 60, recommendationType: "learning_path" }
      ]
    }));
  };

  const deleteRecRule = (index) => {
    setConfig(prev => ({
      ...prev,
      recommendationRules: prev.recommendationRules.filter((_, i) => i !== index)
    }));
  };

  const updateRecRule = (index, field, val) => {
    const updated = [...config.recommendationRules];
    updated[index][field] = field === "thresholdValue" ? Number(val) : val;
    setConfig(prev => ({ ...prev, recommendationRules: updated }));
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`;
  const inputClass = `px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
    darkMode ? "bg-gray-900 border-gray-600 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-300 focus:border-indigo-500"
  }`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900"
    }`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium border ${
              toast.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {toast.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            🧠 Career Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Readiness Configuration Center
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Manage readiness score weights, custom gap severity labels, benchmark values, and practice recommendations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !config}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
        >
          {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <Cog6ToothIcon className="w-4 h-4" />}
          {saving ? "Saving Changes..." : "Save Settings"}
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

      {!loading && config && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            {[
              { id: "formulas", label: "Readiness Formulas", icon: Cog6ToothIcon },
              { id: "gapRules", label: "Skill Gap Rules", icon: ExclamationTriangleIcon },
              { id: "industryLevels", label: "Industry Levels", icon: AcademicCapIcon },
              { id: "recommendationRules", label: "Recommendation Rules", icon: LightBulbIcon }
            ].map(t => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl border transition-all ${
                    activeTab === t.id
                      ? "bg-indigo-500/15 border-indigo-500/35 text-indigo-400 shadow-sm"
                      : darkMode ? "border-transparent text-gray-400 hover:bg-gray-800/40" : "border-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Config Forms Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "formulas" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={base}>
                  <h2 className="text-xl font-bold mb-6">Readiness Formula Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Assessment Score Weight</span>
                        <span className="text-indigo-400">{Math.round(config.formulas.assessmentWeight * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.formulas.assessmentWeight}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateFormula("assessmentWeight", val);
                          updateFormula("skillCompletionWeight", 1 - val);
                        }}
                        className="w-full h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer accent-indigo-500"
                      />
                      <p className="text-xs opacity-50 mt-1">Relative weight of passed assessment grades in skill scores.</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Skill Completion Status Weight</span>
                        <span className="text-indigo-400">{Math.round(config.formulas.skillCompletionWeight * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.formulas.skillCompletionWeight}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateFormula("skillCompletionWeight", val);
                          updateFormula("assessmentWeight", 1 - val);
                        }}
                        className="w-full h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer accent-indigo-500"
                      />
                      <p className="text-xs opacity-50 mt-1">Relative weight given to completing skill curriculum steps.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-700/20">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Mandatory Skill Failure Penalty</span>
                        <span className="text-rose-400">{Math.round(config.formulas.mandatorySkillPenalty * 100)}% Penalty</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={config.formulas.mandatorySkillPenalty}
                        onChange={e => updateFormula("mandatorySkillPenalty", e.target.value)}
                        className="w-full h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer accent-rose-500"
                      />
                      <p className="text-xs opacity-50 mt-1">Percentage penalty applied to overall readiness when a mandatory skill fails to meet its benchmark.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-700/20">
                      <h3 className="text-sm font-semibold mb-3">Global Benchmark Settings</h3>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 opacity-70">Default Skill Target Score (%)</label>
                        <input
                          type="number"
                          value={config.benchmarks.defaultBenchmarkScore}
                          onChange={e => setConfig(prev => ({
                            ...prev,
                            benchmarks: { ...prev.benchmarks, defaultBenchmarkScore: Number(e.target.value) }
                          }))}
                          className={`w-32 ${inputClass}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "gapRules" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={base}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Skill Gap Severity Thresholds</h2>
                    <button
                      onClick={addGapRule}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add Severity Rule
                    </button>
                  </div>

                  <div className="space-y-4">
                    {config.gapRules.map((rule, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-gray-700/20 bg-gray-500/5">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Label</label>
                          <input
                            type="text"
                            value={rule.label}
                            onChange={e => updateGapRule(idx, "label", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Min (%)</label>
                          <input
                            type="number"
                            value={rule.minThreshold}
                            onChange={e => updateGapRule(idx, "minThreshold", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Max (%)</label>
                          <input
                            type="number"
                            value={rule.maxThreshold}
                            onChange={e => updateGapRule(idx, "maxThreshold", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">Color HEX</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={rule.color.startsWith("#") ? rule.color : "#6366f1"}
                              onChange={e => updateGapRule(idx, "color", e.target.value)}
                              className="w-10 h-10 border border-gray-700/30 rounded-xl cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={rule.color}
                              onChange={e => updateGapRule(idx, "color", e.target.value)}
                              className={`w-28 ${inputClass}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">Priority</label>
                          <select
                            value={rule.priority || "medium"}
                            onChange={e => updateGapRule(idx, "priority", e.target.value)}
                            className={inputClass}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <button
                          onClick={() => deleteGapRule(idx)}
                          className="mt-5 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "industryLevels" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={base}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Industry Readiness Categorization</h2>
                    <button
                      onClick={addIndustryLevel}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add Level
                    </button>
                  </div>

                  <div className="space-y-4">
                    {config.industryLevels.map((level, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-gray-700/20 bg-gray-500/5">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Category Label</label>
                          <input
                            type="text"
                            value={level.label}
                            onChange={e => updateIndustryLevel(idx, "label", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Min (%)</label>
                          <input
                            type="number"
                            value={level.minThreshold}
                            onChange={e => updateIndustryLevel(idx, "minThreshold", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Max (%)</label>
                          <input
                            type="number"
                            value={level.maxThreshold}
                            onChange={e => updateIndustryLevel(idx, "maxThreshold", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">Color HEX</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={level.color.startsWith("#") ? level.color : "#3b82f6"}
                              onChange={e => updateIndustryLevel(idx, "color", e.target.value)}
                              className="w-10 h-10 border border-gray-700/30 rounded-xl cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={level.color}
                              onChange={e => updateIndustryLevel(idx, "color", e.target.value)}
                              className={`w-28 ${inputClass}`}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteIndustryLevel(idx)}
                          className="mt-5 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "recommendationRules" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={base}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Recommendation Trigger Triggers</h2>
                    <button
                      onClick={addRecRule}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add Trigger Rule
                    </button>
                  </div>

                  <div className="space-y-4">
                    {config.recommendationRules.map((rule, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-gray-700/20 bg-gray-500/5">
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">If Skill Metric</label>
                          <select
                            value={rule.triggerMetric}
                            onChange={e => updateRecRule(idx, "triggerMetric", e.target.value)}
                            className={inputClass}
                          >
                            <option value="score">Composite Score</option>
                            <option value="gap_percentage">Gap Score</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">Operator</label>
                          <select
                            value={rule.thresholdOperator}
                            onChange={e => updateRecRule(idx, "thresholdOperator", e.target.value)}
                            className={inputClass}
                          >
                            <option value="lt">is Less Than (&lt;)</option>
                            <option value="lte">is Less/Equal (&le;)</option>
                            <option value="gt">is Greater Than (&gt;)</option>
                            <option value="gte">is Greater/Equal (&ge;)</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-semibold mb-1 opacity-70">Value (%)</label>
                          <input
                            type="number"
                            value={rule.thresholdValue}
                            onChange={e => updateRecRule(idx, "thresholdValue", e.target.value)}
                            className={`w-full ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 opacity-70">Recommend Item</label>
                          <select
                            value={rule.recommendationType}
                            onChange={e => updateRecRule(idx, "recommendationType", e.target.value)}
                            className={inputClass}
                          >
                            <option value="learning_path">Curated Learning Paths</option>
                            <option value="projects">Targeted Project Kits</option>
                            <option value="interview_prep">Technical Interview Sets</option>
                          </select>
                        </div>
                        <button
                          onClick={() => deleteRecRule(idx)}
                          className="mt-5 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessConfigCenter;
