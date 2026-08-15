// frontend/src/pages/admin/resume/ConfidenceRules.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useTheme } from "../../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScaleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ConfidenceRules = () => {
  const { darkMode } = useTheme();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/resume-intelligence/config");
      setConfig(res.data.config);
    } catch (err) {
      showToast("Failed to fetch confidence rules.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Basic Validation: highMin >= mediumMin >= lowMin
      if (config.thresholds.highMin < config.thresholds.mediumMin || config.thresholds.mediumMin < config.thresholds.lowMin) {
        showToast("Invalid confidence thresholds. High must be >= Medium and Medium >= Low.", "error");
        setSaving(false);
        return;
      }

      const res = await axiosInstance.post("/admin/resume-intelligence/config", config);
      setConfig(res.data.config);
      showToast("Confidence and matching rules saved successfully!", "success");
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

  const cardBg = darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200";
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
    darkMode ? "bg-gray-900 border-gray-600 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-300 focus:border-indigo-500"
  }`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-55 via-white to-violet-55 text-gray-900"
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
            📋 Resume Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Confidence & Matching Rules
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Define match-type weights, threshold tags, matching formulas, and benchmark metrics.
          </p>
        </div>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && config && (
        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          {/* Section 1: Match Type Confidence Weights */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-400">
              <ScaleIcon className="w-5 h-5" />
              Extraction Confidence Weights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Exact Match Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.confidenceWeights.exactMatch}
                  onChange={(e) => setConfig({
                    ...config,
                    confidenceWeights: { ...config.confidenceWeights, exactMatch: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Alias Match Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.confidenceWeights.aliasMatch}
                  onChange={(e) => setConfig({
                    ...config,
                    confidenceWeights: { ...config.confidenceWeights, aliasMatch: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Keyword Match Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.confidenceWeights.keywordMatch}
                  onChange={(e) => setConfig({
                    ...config,
                    confidenceWeights: { ...config.confidenceWeights, keywordMatch: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Fuzzy Match Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.confidenceWeights.fuzzyMatch}
                  onChange={(e) => setConfig({
                    ...config,
                    confidenceWeights: { ...config.confidenceWeights, fuzzyMatch: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Threshold Categories */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2">Confidence Threshold Thresholds</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">High Confidence Min (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.thresholds.highMin}
                  onChange={(e) => setConfig({
                    ...config,
                    thresholds: { ...config.thresholds, highMin: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Medium Confidence Min (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.thresholds.mediumMin}
                  onChange={(e) => setConfig({
                    ...config,
                    thresholds: { ...config.thresholds, mediumMin: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Low Confidence Min (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.thresholds.lowMin}
                  onChange={(e) => setConfig({
                    ...config,
                    thresholds: { ...config.thresholds, lowMin: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Role Matching Rules */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2">Resume Role Matching Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Formula Method</label>
                <select
                  value={config.roleMatching.formulaType}
                  onChange={(e) => setConfig({
                    ...config,
                    roleMatching: { ...config.roleMatching, formulaType: e.target.value }
                  })}
                  className={inputClass}
                >
                  <option value="weighted_sum">Weighted Sum Score</option>
                  <option value="simple_coverage">Simple Skill Coverage</option>
                  <option value="mandatory_first">Mandatory Skills Required First</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Minimum Role Match Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.roleMatching.minMatchPercentage}
                  onChange={(e) => setConfig({
                    ...config,
                    roleMatching: { ...config.roleMatching, minMatchPercentage: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 opacity-70">Custom Evaluation Formula Script</label>
                <input
                  type="text"
                  value={config.roleMatching.customFormula}
                  onChange={(e) => setConfig({
                    ...config,
                    roleMatching: { ...config.roleMatching, customFormula: e.target.value }
                  })}
                  className={inputClass}
                />
                <span className="text-[10px] opacity-50 block mt-1">Available variables: skillWeight, score, totalWeight, coverage.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Benchmark Comparison Rules */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2">Resume Benchmark Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-500/5 md:col-span-2">
                <div>
                  <span className="text-sm font-semibold block">Enable Industry Benchmark Comparison</span>
                  <span className="text-xs opacity-60">Compares parsed resume skill levels against target industry statistics.</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.benchmarks.industryCompareEnabled}
                  onChange={(e) => setConfig({
                    ...config,
                    benchmarks: { ...config.benchmarks, industryCompareEnabled: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Competency Benchmark Target (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.benchmarks.competencyTargetScore}
                  onChange={(e) => setConfig({
                    ...config,
                    benchmarks: { ...config.benchmarks, competencyTargetScore: Number(e.target.value) }
                  })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving Changes..." : "Save Rule Engine"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ConfidenceRules;
