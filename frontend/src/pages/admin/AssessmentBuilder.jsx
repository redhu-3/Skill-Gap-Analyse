import React, { useState, useEffect } from "react";
import axiosDash from "../../api/axiosDash";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";
import { motion } from "framer-motion";
import { SparklesIcon, BookmarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const AssessmentBuilder = () => {
  const { darkMode } = useTheme();
  const { currentUser } = usePermission();

  // State
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const [form, setForm] = useState({
    name: "",
    level: 1,
    timer: 1800, // seconds (30 mins)
    minPassingPercentage: 70,
    maxAttempts: 3,
    selectionMode: "static",
    blueprint: {
      totalQuestions: 10,
      difficultyDistribution: { easy: 40, medium: 40, hard: 20 }
    },
    adaptiveRules: {
      baseDifficulty: "easy",
      thresholdToUpgrade: 2,
      thresholdToDowngrade: 1
    },
    skillThresholds: [],
    skillWeightages: []
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // We need roles to check ownership/permissions
    axiosDash.get("/").then(res => {
      const fetchedRoles = res.data.roles || [];
      setRoles(fetchedRoles);
      if (fetchedRoles.length > 0) {
        setSelectedRole(fetchedRoles[0]._id);
      }
    });
    axiosInstance.get("/job-roles/access-requests/outgoing").then(res => setOutgoingRequests(res.data.requests || []));
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchSkillsByRole(selectedRole);
    }
  }, [selectedRole]);

  const fetchSkillsByRole = async (roleId) => {
    try {
      const res = await axiosInstance.get(`/skills/job-role/${roleId}`);
      const data = res.data.skills || res.data || [];
      setSkills(data);
      if (data.length > 0) {
        setSelectedSkill(data[0]._id);
        fetchAssessmentsForSkill(data[0]._id);
      } else {
        setSkills([]);
        setSelectedSkill("");
        setAssessments([]);
      }
    } catch (err) {
      console.error(err);
      setSkills([]);
      setSelectedSkill("");
      setAssessments([]);
    }
  };

  const fetchAssessmentsForSkill = async (skillId) => {
    try {
      const res = await axiosInstance.get(`/skills/${skillId}`);
      // Find assessments
      const assessmentList = res.data.assessments || [];
      setAssessments(assessmentList);
      if (assessmentList.length > 0) {
        loadAssessmentIntoForm(assessmentList[0]);
      } else {
        resetForm(skillId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssessmentIntoForm = (a) => {
    setSelectedAssessment(a._id);
    setForm({
      name: a.name || "",
      level: a.level || 1,
      timer: a.timer || 1800,
      minPassingPercentage: a.minPassingPercentage || 70,
      maxAttempts: a.maxAttempts || 3,
      selectionMode: a.selectionMode || "static",
      blueprint: a.blueprint || {
        totalQuestions: 10,
        difficultyDistribution: { easy: 40, medium: 40, hard: 20 }
      },
      adaptiveRules: a.adaptiveRules || {
        baseDifficulty: "easy",
        thresholdToUpgrade: 2,
        thresholdToDowngrade: 1
      },
      skillThresholds: a.skillThresholds || [],
      skillWeightages: a.skillWeightages || []
    });
  };

  const resetForm = (skillId) => {
    setSelectedAssessment("");
    setForm({
      name: "New Assessment Blueprint",
      level: 1,
      timer: 1800,
      minPassingPercentage: 70,
      maxAttempts: 3,
      selectionMode: "static",
      blueprint: {
        totalQuestions: 10,
        difficultyDistribution: { easy: 40, medium: 40, hard: 20 }
      },
      adaptiveRules: {
        baseDifficulty: "easy",
        thresholdToUpgrade: 2,
        thresholdToDowngrade: 1
      },
      skillThresholds: [{ skill: skillId, minPassingPercentage: 70 }],
      skillWeightages: [{ skill: skillId, weight: 1.0 }]
    });
  };

  const handleSkillChange = (skillId) => {
    setSelectedSkill(skillId);
    fetchAssessmentsForSkill(skillId);
  };

  const handleAssessmentChange = (assId) => {
    if (assId === "new") {
      resetForm(selectedSkill);
    } else {
      const match = assessments.find(a => a._id === assId);
      if (match) loadAssessmentIntoForm(match);
    }
  };

  // AI Recommendation Trigger
  const handleAiSuggest = async () => {
    if (!selectedSkill) return;
    setAiLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.post("/admin/assessments/recommend-blueprint", {
        skillId: selectedSkill
      });
      const rec = res.data.recommendation;
      if (rec) {
        setForm(prev => ({
          ...prev,
          timer: (rec.suggestedTimeLimit || 30) * 60,
          minPassingPercentage: rec.passingPercentage || 75,
          blueprint: {
            totalQuestions: rec.totalQuestions || 15,
            difficultyDistribution: {
              easy: rec.difficultyDistribution?.easy || 30,
              medium: rec.difficultyDistribution?.medium || 50,
              hard: rec.difficultyDistribution?.hard || 20
            }
          },
          skillWeightages: [{ skill: selectedSkill, weight: rec.skillWeight || 1.0 }]
        }));
        setMessage({ type: "success", text: `🪄 AI Suggestion Applied: ${rec.reasoning || ""}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "AI recommendation failed. Please try manual rules." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Validate distributions sum to 100
    if (form.selectionMode === "dynamic_pool") {
      const totalDist = Number(form.blueprint.difficultyDistribution.easy) +
        Number(form.blueprint.difficultyDistribution.medium) +
        Number(form.blueprint.difficultyDistribution.hard);
      if (totalDist !== 100) {
        setMessage({ type: "error", text: `Difficulty distribution percentages must sum to 100% (currently ${totalDist}%)` });
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        assessmentId: selectedAssessment || null,
        skillId: selectedSkill,
        ...form
      };
      const res = await axiosInstance.post("/admin/assessments/blueprints", payload);
      setMessage({ type: "success", text: "Assessment blueprint configuration saved successfully!" });
      fetchAssessmentsForSkill(selectedSkill);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save configuration." });
    } finally {
      setSaving(false);
    }
  };

  /* ===================== PERMISSION CHECK ===================== */
  const selectedRoleObj = roles.find(r => r._id === selectedRole);
  
  const creatorId = selectedRoleObj && (typeof selectedRoleObj.createdBy === 'object' ? selectedRoleObj.createdBy?._id : selectedRoleObj.createdBy);
  const isOwner = creatorId === currentUser?.id;
  
  const request = outgoingRequests.find(r => (r.jobRoleId?._id || r.jobRoleId) === selectedRole);
  let accessStatus = "none";
  if (request && request.status === "Approved" && new Date(request.accessExpiresAt) > new Date()) {
    accessStatus = "approved";
  }
  
  const canModify = selectedRole ? (isOwner || accessStatus === "approved") : false;

  const base = "rounded-[24px] border border-admin-border bg-admin-surface shadow-sm p-6";
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-admin-border bg-admin-bg text-admin-text text-[13px] outline-none transition focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/30";

  return (
    <div className="w-full min-h-screen px-6 md:px-12 py-10 transition-all duration-500 animate-in fade-in">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-admin-primary-light text-admin-primary border border-admin-primary/20 mb-3">
          ⚡ Assessments
        </span>
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-admin-text">
          Blueprint Builder
        </h1>
        <p className="mt-2 text-[13px] md:text-[14px] font-medium text-admin-text-muted">
          Configure static, dynamic question pools, and adaptive testing configurations.
        </p>
      </motion.div>

      {/* Select Skill & Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-admin-surface p-4 rounded-[24px] border border-admin-border">
        <div className="flex-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5 block">Job Role</label>
          <select 
            className={inputClass}
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            <option value="">Select a Role</option>
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5 block">Skill</label>
          <select 
            className={inputClass}
            value={selectedSkill}
            onChange={e => handleSkillChange(e.target.value)}
          >
            {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        {canModify && (
          <div className="flex-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5 block">Assessment Blueprint</label>
            <select 
              className={inputClass}
              value={selectedAssessment}
              onChange={e => handleAssessmentChange(e.target.value)}
            >
              <option value="new">+ Create New Blueprint</option>
              {assessments.map(a => <option key={a._id} value={a._id}>{a.name} (L{a.level})</option>)}
            </select>
          </div>
        )}
      </div>

      {!canModify && (
        <div className="mt-8 p-6 rounded-[24px] border bg-admin-highlight/10 border-admin-highlight/20 text-admin-highlight">
          <p className="font-bold text-[14px] mb-1">View Only Mode</p>
          <p className="text-[13px] opacity-90">You do not own the Job Role for this skill. Request access on the Job Roles page to modify assessments.</p>
        </div>
      )}

      {message.text && (
        <div className={`mb-6 p-4 rounded-[16px] text-[13px] font-bold border ${message.type === "success"
            ? "bg-admin-success/10 text-admin-success border-admin-success/20"
            : "bg-admin-danger/10 text-admin-danger border-admin-danger/20"
          }`}>
          {message.text}
        </div>
      )}

      {/* Form content */}
      {canModify && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Core Parameters */}
          <div className={base}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[16px] font-bold text-admin-text">General Parameters</h2>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-admin-primary hover:bg-admin-primary-hover text-white transition disabled:opacity-50"
              >
                {aiLoading ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                🪄 Ask AI to Design Blueprint
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Assessment Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Difficulty Level (1-4)</label>
                <select
                  value={form.level}
                  onChange={e => setForm(p => ({ ...p, level: Number(e.target.value) }))}
                  className={inputClass}
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Intermediate</option>
                  <option value={3}>3 - Advanced</option>
                  <option value={4}>4 - Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Global Time Limit (sec)</label>
                <input
                  type="number"
                  value={form.timer}
                  onChange={e => setForm(p => ({ ...p, timer: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Max Attempts Allowed</label>
                <input
                  type="number"
                  value={form.maxAttempts}
                  onChange={e => setForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mode & Question Pools */}
          <div className={base}>
            <h2 className="text-[16px] font-bold text-admin-text mb-6">Question Selection Mode</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { id: "static", title: "Static", desc: "Manually chosen questions" },
                { id: "dynamic_pool", title: "Dynamic Pool", desc: "Calculated ratio rules" },
                { id: "adaptive", title: "Adaptive Quiz", desc: "Real-time difficulty stepping" }
              ].map(m => (
                <div
                  key={m.id}
                  onClick={() => setForm(p => ({ ...p, selectionMode: m.id }))}
                  className={`p-4 rounded-[16px] border text-center cursor-pointer transition-all ${form.selectionMode === m.id
                      ? "border-admin-primary bg-admin-primary-light ring-1 ring-admin-primary/30"
                      : "bg-admin-bg border-admin-border hover:border-admin-border-hover"
                    }`}
                >
                  <div className={`font-bold text-[13px] mb-1 ${form.selectionMode === m.id ? 'text-admin-primary' : 'text-admin-text'}`}>{m.title}</div>
                  <div className="text-[11px] font-medium text-admin-text-muted leading-tight">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Dynamic Pool controls */}
            {form.selectionMode === "dynamic_pool" && (
              <div className="space-y-6 border-t border-admin-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Total Questions to Serve</label>
                    <input
                      type="number"
                      value={form.blueprint.totalQuestions}
                      onChange={e => setForm(p => ({
                        ...p,
                        blueprint: { ...p.blueprint, totalQuestions: Number(e.target.value) }
                      }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-admin-text mb-3">Difficulty Distribution (%)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest text-admin-success">Easy %</label>
                      <input
                        type="number"
                        value={form.blueprint.difficultyDistribution.easy}
                        onChange={e => setForm(p => ({
                          ...p,
                          blueprint: {
                            ...p.blueprint,
                            difficultyDistribution: { ...p.blueprint.difficultyDistribution, easy: Number(e.target.value) }
                          }
                        }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest text-admin-highlight">Medium %</label>
                      <input
                        type="number"
                        value={form.blueprint.difficultyDistribution.medium}
                        onChange={e => setForm(p => ({
                          ...p,
                          blueprint: {
                            ...p.blueprint,
                            difficultyDistribution: { ...p.blueprint.difficultyDistribution, medium: Number(e.target.value) }
                          }
                        }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold mb-1 tracking-widest text-admin-danger">Hard %</label>
                      <input
                        type="number"
                        value={form.blueprint.difficultyDistribution.hard}
                        onChange={e => setForm(p => ({
                          ...p,
                          blueprint: {
                            ...p.blueprint,
                            difficultyDistribution: { ...p.blueprint.difficultyDistribution, hard: Number(e.target.value) }
                          }
                        }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Adaptive controls */}
            {form.selectionMode === "adaptive" && (
              <div className="space-y-6 border-t border-admin-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Start Difficulty Tier</label>
                    <select
                      value={form.adaptiveRules.baseDifficulty}
                      onChange={e => setForm(p => ({
                        ...p,
                        adaptiveRules: { ...p.adaptiveRules, baseDifficulty: e.target.value }
                      }))}
                      className={inputClass}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Upgrade Streak Limit</label>
                    <input
                      type="number"
                      value={form.adaptiveRules.thresholdToUpgrade}
                      onChange={e => setForm(p => ({
                        ...p,
                        adaptiveRules: { ...p.adaptiveRules, thresholdToUpgrade: Number(e.target.value) }
                      }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Downgrade Streak Limit</label>
                    <input
                      type="number"
                      value={form.adaptiveRules.thresholdToDowngrade}
                      onChange={e => setForm(p => ({
                        ...p,
                        adaptiveRules: { ...p.adaptiveRules, thresholdToDowngrade: Number(e.target.value) }
                      }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Thresholds & Weights */}
        <div className="space-y-8">
          {/* Target Passing Limit */}
          <div className={base}>
            <h2 className="text-[16px] font-bold text-admin-text mb-6">Passing Requirements</h2>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1.5">Global Min Passing Score (%)</label>
              <input
                type="number"
                value={form.minPassingPercentage}
                onChange={e => setForm(p => ({ ...p, minPassingPercentage: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-admin-primary hover:bg-admin-primary-hover text-white text-[14px] font-bold transition shadow-lg shadow-admin-primary/20 disabled:opacity-50"
            >
              <BookmarkIcon className="w-5 h-5" />
              {saving ? "Saving Draft..." : "Save Configuration Draft"}
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
};

export default AssessmentBuilder;
