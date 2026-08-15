// frontend/src/pages/admin/AssessmentVersionManager.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowsRightLeftIcon,
  RocketLaunchIcon,
  ShieldExclamationIcon,
  DocumentDuplicateIcon,
  CheckBadgeIcon,
  ArchiveBoxIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// ─── Status Metadata ────────────────────────────────────────────────────────
const STATUS_META = {
  draft:    { label: "Draft",    color: "text-admin-text-muted",    bg: "bg-admin-border border-admin-border-hover",    icon: DocumentDuplicateIcon },
  review:   { label: "Review",   color: "text-admin-highlight",   bg: "bg-admin-highlight/10 border-admin-highlight/20",  icon: EyeIcon },
  approved: { label: "Approved", color: "text-admin-secondary",     bg: "bg-admin-secondary/10 border-admin-secondary/20",      icon: CheckBadgeIcon },
  published:{ label: "Published",color: "text-admin-success", bg: "bg-admin-success/10 border-admin-success/20", icon: RocketLaunchIcon },
  archived: { label: "Archived", color: "text-admin-danger",    bg: "bg-admin-danger/10 border-admin-danger/20",    icon: ArchiveBoxIcon },
};

// Allowed transitions per current status
const TRANSITIONS = {
  draft:    [{ to: "review",   label: "Submit for Review",  icon: EyeIcon,          cls: "from-admin-highlight to-yellow-500" }],
  review:   [
    { to: "approved", label: "Approve Version",   icon: CheckBadgeIcon,   cls: "from-admin-secondary to-blue-500" },
    { to: "draft",    label: "Return to Draft",   icon: ArrowPathIcon,    cls: "from-gray-500 to-gray-600" },
  ],
  approved: [
    { to: "published",label: "Publish Version",   icon: RocketLaunchIcon, cls: "from-admin-success to-teal-500" },
    { to: "draft",    label: "Return to Draft",   icon: ArrowPathIcon,    cls: "from-gray-500 to-gray-600" },
  ],
  published:[{ to: "archived", label: "Archive Version",   icon: ArchiveBoxIcon,   cls: "from-admin-danger to-pink-500" }],
  archived: [],
};

// ─── Diff Helpers ─────────────────────────────────────────────────────────────
function extractDiffableFields(v) {
  if (!v) return {};
  return {
    name: v.name,
    level: v.level,
    timer: v.timer,
    minPassingPercentage: v.minPassingPercentage,
    maxAttempts: v.maxAttempts,
    selectionMode: v.selectionMode,
    "blueprint.totalQuestions": v.blueprint?.totalQuestions,
    "blueprint.easy%": v.blueprint?.difficultyDistribution?.easy,
    "blueprint.medium%": v.blueprint?.difficultyDistribution?.medium,
    "blueprint.hard%": v.blueprint?.difficultyDistribution?.hard,
    "adaptiveRules.baseDifficulty": v.adaptiveRules?.baseDifficulty,
    "adaptiveRules.thresholdToUpgrade": v.adaptiveRules?.thresholdToUpgrade,
    "adaptiveRules.thresholdToDowngrade": v.adaptiveRules?.thresholdToDowngrade,
  };
}

function DiffTable({ v1, v2 }) {
  const f1 = extractDiffableFields(v1);
  const f2 = extractDiffableFields(v2);
  const keys = Array.from(new Set([...Object.keys(f1), ...Object.keys(f2)]));

  return (
    <div className="overflow-x-auto rounded-[16px] border border-admin-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-bold uppercase tracking-widest border-b border-admin-border bg-admin-bg">
            <th className="py-3 px-4 text-left text-admin-text-muted">Field</th>
            <th className="py-3 px-4 text-left text-admin-text">v{v1?.version}</th>
            <th className="py-3 px-4 text-left text-admin-text">v{v2?.version}</th>
            <th className="py-3 px-4 text-left text-admin-text-muted">Changed?</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const changed = String(f1[k]) !== String(f2[k]);
            return (
              <tr
                key={k}
                className={`border-b border-admin-border transition-colors hover:bg-admin-bg/50 ${changed ? "bg-admin-highlight/5" : ""}`}
              >
                <td className="py-3 px-4 font-mono text-[11px] text-admin-text-muted">{k}</td>
                <td className="py-3 px-4 text-[13px] text-admin-text">{f1[k] !== undefined ? String(f1[k]) : "–"}</td>
                <td className={`py-3 px-4 text-[13px] font-bold ${changed ? "text-admin-highlight" : "text-admin-text"}`}>
                  {f2[k] !== undefined ? String(f2[k]) : "–"}
                </td>
                <td className="py-3 px-4">
                  {changed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-admin-highlight bg-admin-highlight/10 px-2 py-0.5 rounded-full">
                      ✦ Changed
                    </span>
                  ) : (
                    <span className="text-[12px] text-admin-text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Version Card ─────────────────────────────────────────────────────────────
function VersionCard({ version, index, isFirst, onSelect, isSelected, onTransition, transitioning }) {
  const meta = STATUS_META[version.status] || STATUS_META.draft;
  const StatusIcon = meta.icon;
  const transitions = TRANSITIONS[version.status] || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center border-2 shadow-sm z-10 ${
          version.isActiveVersion
            ? "border-admin-success bg-admin-success/20"
            : "border-admin-border-hover bg-admin-bg"
        }`}>
          <StatusIcon className={`w-5 h-5 ${meta.color}`} />
        </div>
        {!isFirst && <div className="w-[2px] flex-1 mt-2 bg-admin-border" />}
      </div>

      {/* Card body */}
      <div className={`flex-1 mb-8 rounded-[20px] border p-6 transition-all ${
        isSelected
          ? "border-admin-primary bg-admin-surface shadow-md ring-1 ring-admin-primary/30"
          : "border-admin-border bg-admin-surface hover:border-admin-border-hover"
      }`}>
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="text-[16px] font-bold text-admin-text">Version {version.version}</span>
              {version.isActiveVersion && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-admin-success/15 text-admin-success border border-admin-success/20 uppercase tracking-widest">
                  ● Active
                </span>
              )}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-[12px] text-admin-text-muted mt-1 font-medium">
              {version.name} · Level {version.level} ·{" "}
              {version.createdBy?.name || "System"} ·{" "}
              {new Date(version.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(version)}
              className={`text-[12px] flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all font-bold ${
                isSelected
                  ? "bg-admin-primary-light text-admin-primary border-admin-primary/30"
                  : "border-admin-border text-admin-text hover:border-admin-primary hover:text-admin-primary"
              }`}
            >
              <ArrowsRightLeftIcon className="w-4 h-4" />
              {isSelected ? "Comparing" : "Compare"}
            </button>
          </div>
        </div>

        {/* Blueprint summary pills */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          {[
            { label: `${version.blueprint?.totalQuestions ?? 10} Questions`, color: "text-admin-primary bg-admin-primary-light border border-admin-primary/10" },
            { label: `Easy ${version.blueprint?.difficultyDistribution?.easy ?? 40}%`, color: "text-admin-success bg-admin-success/10 border border-admin-success/10" },
            { label: `Med ${version.blueprint?.difficultyDistribution?.medium ?? 40}%`, color: "text-admin-highlight bg-admin-highlight/10 border border-admin-highlight/10" },
            { label: `Hard ${version.blueprint?.difficultyDistribution?.hard ?? 20}%`, color: "text-admin-danger bg-admin-danger/10 border border-admin-danger/10" },
            { label: version.selectionMode?.replace("_", " ") ?? "static", color: "text-admin-text bg-admin-bg border border-admin-border" },
            { label: `Pass ≥ ${version.minPassingPercentage ?? 70}%`, color: "text-admin-text bg-admin-bg border border-admin-border" },
          ].map((p) => (
            <span key={p.label} className={`text-[11px] font-bold px-3 py-1 rounded-full ${p.color}`}>
              {p.label}
            </span>
          ))}
        </div>

        {/* Transition action buttons */}
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-admin-border">
            {transitions.map((t) => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.to}
                  disabled={transitioning}
                  onClick={() => onTransition(version._id, t.to)}
                  className={`flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-xl text-white bg-gradient-to-r ${t.cls} hover:opacity-90 transition-all disabled:opacity-40 shadow-sm`}
                >
                  {transitioning ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <TIcon className="w-4 h-4" />
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AssessmentVersionManager = () => {
  const { darkMode } = useTheme();

  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(1);

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Diff state
  const [compareVersions, setCompareVersions] = useState([]);
  const [showDiff, setShowDiff] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // ── Fetch skills ──
  useEffect(() => {
    axiosInstance.get("/skills").then((res) => {
      const list = res.data.skills || res.data || [];
      setSkills(list);
      if (list.length > 0) setSelectedSkill(list[0]._id);
    }).catch(console.error);
  }, []);

  // ── Fetch versions when skill/level changes ──
  const fetchVersions = useCallback(async () => {
    if (!selectedSkill) return;
    setLoading(true);
    setError("");
    setCompareVersions([]);
    setShowDiff(false);
    try {
      const res = await axiosInstance.get("/admin/assessments/versions", {
        params: { skillId: selectedSkill, level: selectedLevel },
      });
      setVersions(res.data.versions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load versions.");
    } finally {
      setLoading(false);
    }
  }, [selectedSkill, selectedLevel]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  // ── Handle compare selection ──
  const handleSelectForCompare = (version) => {
    setCompareVersions((prev) => {
      const exists = prev.find((v) => v._id === version._id);
      if (exists) return prev.filter((v) => v._id !== version._id);
      if (prev.length >= 2) return [prev[1], version];
      return [...prev, version];
    });
    setShowDiff(false);
  };

  // ── Handle status transition ──
  const handleTransition = async (assessmentId, newStatus) => {
    setTransitioning(true);
    try {
      if (newStatus === "published") {
        await axiosInstance.put(`/admin/assessments/versions/${assessmentId}/publish`);
      } else {
        await axiosInstance.patch(`/admin/assessments/versions/${assessmentId}/transition`, { status: newStatus });
      }
      showToast(`Version successfully moved to ${STATUS_META[newStatus]?.label}.`, "success");
      fetchVersions();
    } catch (err) {
      showToast(err.response?.data?.message || "Transition failed.", "error");
    } finally {
      setTransitioning(false);
    }
  };

  // ── Toast helper ──
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Shared classes
  const card = "rounded-[24px] border border-admin-border bg-admin-surface shadow-sm p-6";
  const select = "px-4 py-2.5 rounded-xl border border-admin-border bg-admin-bg text-admin-text text-[13px] outline-none transition focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/30";

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 transition-all duration-500 animate-in fade-in w-full">

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-bold border ${
              toast.type === "success"
                ? "bg-admin-success/10 text-admin-success border-admin-success/20"
                : "bg-admin-danger/10 text-admin-danger border-admin-danger/20"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircleIcon className="w-5 h-5" />
              : <XCircleIcon className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-admin-primary-light text-admin-primary border border-admin-primary/20 mb-3">
          🕰️ Version Control
        </span>
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-admin-text">
          Assessment Version Manager
        </h1>
        <p className="mt-2 text-[13px] md:text-[14px] font-medium text-admin-text-muted">
          Review blueprint history, compare versions, and manage the publishing workflow.
        </p>
      </motion.div>

      {/* ── Filters ── */}
      <div className={`${card} mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-2">Target Skill</label>
            <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className={`w-full ${select}`}>
              {skills.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-2">Assessment Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))} className={`w-full ${select}`}>
              {[1, 2, 3, 4, 5].map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchVersions}
              className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold rounded-xl bg-admin-primary text-white hover:bg-admin-primary-hover transition-all shadow-md w-full md:w-auto justify-center"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-5 rounded-[16px] text-[13px] font-bold border bg-admin-danger/10 text-admin-danger border-admin-danger/20 flex items-center gap-3">
          <ShieldExclamationIcon className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-[3px] border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && versions.length === 0 && (
        <div className={`${card} text-center py-20 flex flex-col items-center justify-center border-dashed`}>
          <ClockIcon className="w-12 h-12 mb-4 text-admin-text-muted opacity-50" />
          <p className="text-[14px] font-bold text-admin-text">No versions found for this combination.</p>
          <p className="text-[13px] mt-1 text-admin-text-muted font-medium">Create a blueprint in the Blueprint Builder to get started.</p>
        </div>
      )}

      {/* ── Compare Banner ── */}
      {compareVersions.length > 0 && (
        <div className="mb-6 p-5 rounded-[20px] border bg-admin-bg border-admin-primary/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-admin-primary-light flex items-center justify-center text-admin-primary">
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </div>
            <span className="text-[14px] font-bold text-admin-text">
              {compareVersions.length === 1
                ? `v${compareVersions[0].version} selected — select one more to compare`
                : `Comparing v${compareVersions[0].version} ↔ v${compareVersions[1].version}`}
            </span>
          </div>
          <div className="flex gap-2">
            {compareVersions.length === 2 && (
              <button
                onClick={() => setShowDiff((d) => !d)}
                className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold rounded-xl bg-admin-primary text-white hover:bg-admin-primary-hover transition-all shadow-sm"
              >
                {showDiff ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                {showDiff ? "Hide Diff" : "Show Diff"}
              </button>
            )}
            <button
              onClick={() => { setCompareVersions([]); setShowDiff(false); }}
              className="px-5 py-2.5 text-[12px] font-bold rounded-xl border border-admin-border text-admin-text hover:bg-admin-surface hover:text-admin-danger hover:border-admin-danger/30 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Diff Viewer ── */}
      <AnimatePresence>
        {showDiff && compareVersions.length === 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${card} mb-8 overflow-hidden`}
          >
            <h2 className="text-[16px] font-bold mb-5 flex items-center gap-2 text-admin-text">
              <ArrowsRightLeftIcon className="w-5 h-5 text-admin-primary" />
              Blueprint Diff — v{compareVersions[0].version} → v{compareVersions[1].version}
            </h2>
            <DiffTable v1={compareVersions[0]} v2={compareVersions[1]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Version Timeline ── */}
      {!loading && versions.length > 0 && (
        <div className="relative pl-2">
          {/* Vertical line */}
          <div className="absolute left-7 top-10 bottom-0 w-[2px] bg-admin-border" />

          {versions.map((v, idx) => (
            <VersionCard
              key={v._id}
              version={v}
              index={idx}
              isFirst={idx === versions.length - 1}
              onSelect={handleSelectForCompare}
              isSelected={compareVersions.some((cv) => cv._id === v._id)}
              onTransition={handleTransition}
              transitioning={transitioning}
            />
          ))}
        </div>
      )}

      {/* ── Workflow Legend ── */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`${card} mt-10 border-dashed`}
        >
          <h3 className="text-[11px] font-bold mb-5 text-admin-text-muted uppercase tracking-widest">Status Workflow</h3>
          <div className="flex flex-wrap items-center gap-4">
            {["draft", "review", "approved", "published", "archived"].map((s, i, arr) => {
              const meta = STATUS_META[s];
              const Icon = meta.icon;
              return (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRightIcon className="w-4 h-4 text-admin-text-muted opacity-50" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[12px] font-medium mt-4 text-admin-text-muted">
            Versions must be Published to appear on the learner assessment flow. Only one version can be Active (Published) at a time.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentVersionManager;
