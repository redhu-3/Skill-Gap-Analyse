// frontend/src/pages/admin/RoadmapBuilder.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const RoadmapBuilder = () => {
  const { darkMode } = useTheme();

  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Editor states
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesRes, skillsRes, templatesRes] = await Promise.all([
        axiosInstance.get("/job-roles"),
        axiosInstance.get("/skills"),
        axiosInstance.get("/admin/learning/templates")
      ]);

      const roleList = rolesRes.data.jobRoles || rolesRes.data || [];
      setRoles(roleList);
      if (roleList.length > 0) setSelectedRole(roleList[0]._id);

      setSkills(skillsRes.data.skills || skillsRes.data || []);
      setTemplates(templatesRes.data.templates || []);
    } catch (err) {
      setError("Failed to load roadmap templates and roles.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast("Template Name is required.", "error");
    if (steps.length === 0) return showToast("Roadmap must contain at least one step.", "error");

    setSaving(true);
    setError("");
    try {
      const payload = {
        templateId: editingTemplateId,
        name,
        jobRole: selectedRole,
        difficulty,
        description,
        steps: steps.map((s, idx) => ({
          stepNumber: idx + 1,
          skill: s.skill,
          estimatedDuration: s.estimatedDuration,
          milestone: s.milestone
        })),
        isActive
      };

      await axiosInstance.post("/admin/learning/templates", payload);
      showToast("Roadmap Template saved successfully!", "success");
      
      // Reload templates list
      const templatesRes = await axiosInstance.get("/admin/learning/templates");
      setTemplates(templatesRes.data.templates || []);
      clearEditor();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save template.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAIRecommend = async () => {
    if (!selectedRole) return showToast("Please select a target job role first.", "error");
    setGeneratingAI(true);
    setError("");
    try {
      const res = await axiosInstance.post("/admin/learning/ai-recommend", { roleId: selectedRole });
      const rec = res.data.recommendation;

      setName(rec.roadmapName || `AI ${roles.find(r => r._id === selectedRole)?.name || "Role"} Roadmap`);
      setDescription(rec.reasoning || "AI generated learning blueprint mapping.");
      
      // Map AI recommended skill names to IDs
      const mappedSteps = [];
      rec.steps.forEach(aiStep => {
        const matchingSkill = skills.find(s => s.name.toLowerCase() === aiStep.skillName.toLowerCase());
        if (matchingSkill) {
          mappedSteps.push({
            skill: matchingSkill._id,
            estimatedDuration: { value: aiStep.durationDays || 7, unit: "days" },
            milestone: aiStep.milestone || ""
          });
        }
      });

      setSteps(mappedSteps);
      showToast("AI Recommendations generated successfully!", "success");
    } catch (err) {
      showToast("AI parsing failed. Please build manually.", "error");
    } finally {
      setGeneratingAI(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearEditor = () => {
    setName("");
    setDifficulty("beginner");
    setDescription("");
    setSteps([]);
    setIsActive(true);
    setEditingTemplateId(null);
  };

  const loadTemplateIntoEditor = (tpl) => {
    setEditingTemplateId(tpl._id);
    setName(tpl.name);
    setSelectedRole(tpl.jobRole?._id || tpl.jobRole);
    setDifficulty(tpl.difficulty);
    setDescription(tpl.description || "");
    setIsActive(tpl.isActive);
    setSteps(tpl.steps.map(s => ({
      skill: s.skill?._id || s.skill,
      estimatedDuration: s.estimatedDuration,
      milestone: s.milestone || ""
    })));
  };

  // Step modifiers
  const addStep = () => {
    if (skills.length === 0) return;
    setSteps(prev => [
      ...prev,
      { skill: skills[0]._id, estimatedDuration: { value: 7, unit: "days" }, milestone: "" }
    ]);
  };

  const deleteStep = (index) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index, field, val) => {
    const updated = [...steps];
    if (field === "durationValue") {
      updated[index].estimatedDuration.value = Number(val);
    } else if (field === "durationUnit") {
      updated[index].estimatedDuration.unit = val;
    } else {
      updated[index][field] = val;
    }
    setSteps(updated);
  };

  const moveStep = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setSteps(updated);
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          🗺️ Roadmaps
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Learning Roadmap Builder
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Configure structural sequencing steps, milestone achievements, and target timelines per role.
        </p>
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

      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active templates list */}
          <div className="xl:col-span-1 space-y-4">
            <div className={base}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-indigo-400" />
                Roadmap Templates ({templates.length})
              </h2>

              <div className="space-y-3">
                {templates.map(tpl => (
                  <div
                    key={tpl._id}
                    onClick={() => loadTemplateIntoEditor(tpl)}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all ${
                      editingTemplateId === tpl._id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : darkMode ? "border-gray-700 bg-gray-900/40 hover:bg-gray-800/40" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm block">{tpl.name}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        tpl.difficulty === "beginner" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {tpl.difficulty}
                      </span>
                    </div>
                    <span className="text-xs opacity-50 block mt-1">Role: {tpl.jobRole?.name || "Dynamic"}</span>
                    <span className="text-xs opacity-40 block mt-0.5">{tpl.steps?.length || 0} Step(s)</span>
                  </div>
                ))}

                {templates.length === 0 && (
                  <p className="text-xs opacity-50 text-center py-8">No roadmap templates configured yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Builder Editor Panel */}
          <div className="xl:col-span-2 space-y-6">
            <div className={base}>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">
                  {editingTemplateId ? "Edit Roadmap Template" : "Create Roadmap Template"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIRecommend}
                    disabled={generatingAI}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {generatingAI ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                    {generatingAI ? "AI Generating..." : "AI Generate Blueprint"}
                  </button>
                  {editingTemplateId && (
                    <button
                      onClick={clearEditor}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      New Draft
                    </button>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Template Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Frontend Developer Junior Path"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Target Job Role</label>
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={inputClass}>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Difficulty Level</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="fast_track">Fast Track</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-gray-600 bg-gray-900 accent-indigo-500"
                    />
                    Active & Available
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows="2"
                    placeholder="Briefly describe target path qualifications..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Steps Area */}
              <div className="pt-6 border-t border-gray-700/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold">Roadmap Steps Timeline</h3>
                  <button
                    onClick={addStep}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-gray-700/20 bg-gray-500/5">
                      <div className="font-mono font-bold text-xs bg-indigo-500/15 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center">
                        #{idx + 1}
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-semibold mb-1 opacity-70">Target Skill</label>
                        <select
                          value={step.skill}
                          onChange={e => updateStep(idx, "skill", e.target.value)}
                          className={inputClass}
                        >
                          {skills.map(s => <option key={s._id} value={s._id}>{s.name} ({s.category})</option>)}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] font-semibold mb-1 opacity-70">Duration</label>
                        <input
                          type="number"
                          value={step.estimatedDuration.value}
                          onChange={e => updateStep(idx, "durationValue", e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] font-semibold mb-1 opacity-70">Unit</label>
                        <select
                          value={step.estimatedDuration.unit}
                          onChange={e => updateStep(idx, "durationUnit", e.target.value)}
                          className={inputClass}
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-semibold mb-1 opacity-70">Milestone (Optional)</label>
                        <input
                          type="text"
                          value={step.milestone}
                          onChange={e => updateStep(idx, "milestone", e.target.value)}
                          placeholder="e.g. Fundamentals complete"
                          className={inputClass}
                        />
                      </div>

                      <div className="flex items-center gap-1 mt-5">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveStep(idx, -1)}
                          className="p-2 rounded-xl border border-transparent hover:bg-gray-700/20 disabled:opacity-30"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === steps.length - 1}
                          onClick={() => moveStep(idx, 1)}
                          className="p-2 rounded-xl border border-transparent hover:bg-gray-700/20 disabled:opacity-30"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStep(idx)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {steps.length === 0 && (
                    <p className="text-xs opacity-50 text-center py-8">Add steps manually or click "AI Generate" above.</p>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                  >
                    {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapBuilder;
