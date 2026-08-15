// frontend/src/pages/admin/resume/ParsingRules.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useTheme } from "../../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ParsingRules = () => {
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
      showToast("Failed to fetch parsing configurations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosInstance.post("/admin/resume-intelligence/config", config);
      setConfig(res.data.config);
      showToast("Parsing rules saved successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save parsing rules.", "error");
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
            Resume Parsing Rules
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Configure match sensitivity, fuzzy Levenshtein thresholds, and workflow options.
          </p>
        </div>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && config && (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {/* Section 1: Match Logic */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5 text-indigo-400" />
              Parsing Matching Controls
            </h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-500/5">
              <div>
                <span className="text-sm font-semibold block">Enable Fuzzy Matching</span>
                <span className="text-xs opacity-60">Allows matching skills with minor typos or syntax variations.</span>
              </div>
              <input
                type="checkbox"
                checked={config.rules.enableFuzzyMatching}
                onChange={(e) => setConfig({
                  ...config,
                  rules: { ...config.rules, enableFuzzyMatching: e.target.checked }
                })}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {config.rules.enableFuzzyMatching && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Fuzzy Levenshtein Similarity</span>
                  <span className="text-indigo-400 font-bold">{Math.round(config.rules.fuzzyThreshold * 100)}% Match</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={config.rules.fuzzyThreshold}
                  onChange={(e) => setConfig({
                    ...config,
                    rules: { ...config.rules, fuzzyThreshold: Number(e.target.value) }
                  })}
                  className="w-full h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs opacity-50 block mt-1">Lower values allow fuzzier mappings (e.g. Node vs Nodd).</span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-500/5">
              <div>
                <span className="text-sm font-semibold block">Case Sensitive Analysis</span>
                <span className="text-xs opacity-60">Matches terms only if they match exact casing (e.g. AWS vs aws).</span>
              </div>
              <input
                type="checkbox"
                checked={config.rules.caseSensitive}
                onChange={(e) => setConfig({
                  ...config,
                  rules: { ...config.rules, caseSensitive: e.target.checked }
                })}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Review Workflow Config */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h2 className="text-lg font-bold mb-2">Resume Review Workflow</h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-500/5">
              <div>
                <span className="text-sm font-semibold block">Auto Transition To "Under Review"</span>
                <span className="text-xs opacity-60">Automatically moves parsed resumes to Under Review status.</span>
              </div>
              <input
                type="checkbox"
                checked={config.workflow.autoTransitionToUnderReview}
                onChange={(e) => setConfig({
                  ...config,
                  workflow: { ...config.workflow, autoTransitionToUnderReview: e.target.checked }
                })}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-500/5">
              <div>
                <span className="text-sm font-semibold block">Require Admin Approval For Export</span>
                <span className="text-xs opacity-60">Admin checklist signature required before saving user skill outputs.</span>
              </div>
              <input
                type="checkbox"
                checked={config.workflow.requireAdminApprovalForExport}
                onChange={(e) => setConfig({
                  ...config,
                  workflow: { ...config.workflow, requireAdminApprovalForExport: e.target.checked }
                })}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
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
              {saving ? "Saving Changes..." : "Save Config Options"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ParsingRules;
