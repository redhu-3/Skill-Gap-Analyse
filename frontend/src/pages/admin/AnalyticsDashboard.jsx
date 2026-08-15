// frontend/src/pages/admin/AnalyticsDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";

const API = "http://localhost:5000/api/analytics";

// ── Gradient colours for bars ──────────────────────────────────────────────────
const DEMAND_COLOURS  = ["#6366f1","#7c3aed","#8b5cf6","#a78bfa","#c4b5fd","#818cf8"];
const IMPORT_COLOURS  = ["#06b6d4","#0891b2","#0ea5e9","#38bdf8","#7dd3fc","#22d3ee"];

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-[16px] shadow-xl text-[12px] border backdrop-blur-md bg-theme-surface border-theme-border text-theme-text">
      <p className="font-semibold mb-1 truncate max-w-[180px]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value?.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
};

// ── Mini stat card ────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, icon: Icon, colour, darkMode }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="relative overflow-hidden rounded-[24px] p-6 border shadow-sm bg-theme-surface border-theme-border transition-colors hover:border-theme-border-hover"
  >
    <div
      className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10"
      style={{ background: colour }}
    />
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-xl" style={{ background: colour + "22" }}>
        <Icon className="w-5 h-5" style={{ color: colour }} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-theme-text-muted">
        {label}
      </span>
    </div>
    <p className="text-[28px] font-extrabold text-theme-text tracking-tight">
      {value !== null && value !== undefined ? Number(value).toFixed(2) : "—"}
    </p>
  </motion.div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-[18px] font-bold text-theme-text">{title}</h2>
    {subtitle && <p className="text-[13px] text-theme-text-muted mt-1 font-medium">{subtitle}</p>}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const { darkMode } = useTheme();
  const { hasPermission } = usePermission();

  const [demand,     setDemand]     = useState(null);
  const [importance, setImportance] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("competency"); // "competency" | "jobRole"

  // Detect the correct auth token
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");

  useEffect(() => {
    if (!hasPermission("analytics:view")) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [dRes, iRes] = await Promise.all([
          axios.get(`${API}/demand`, { headers }),
          axios.get(`${API}/importance`, { headers }),
        ]);
        setDemand(dRes.data);
        setImportance(iRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  // ── CSV download (admin only) ─────────────────────────────────────────────
  const downloadCSV = () => {
    const rows = [
      ["Type", "Group", "Average", "Min", "Max", "Count"],
      ...(demand?.byCompetency || []).map((r) => [
        "Demand", r.competencyArea, r.average, r.min, r.max, r.count,
      ]),
      ...(importance?.byCompetency || []).map((r) => [
        "Importance", r.competencyArea, r.average, r.min, r.max, r.count,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!hasPermission("analytics:view")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in">
        <div className="text-center opacity-60 text-theme-text-muted">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium">You don't have access to Analytics.</p>
        </div>
      </div>
    );
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in">
        <div className="flex flex-col items-center gap-4 text-theme-text-muted">
          <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
          <p className="opacity-60 text-[13px] font-bold">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in">
        <div className="text-center text-rose-500">
          <p className="text-lg font-semibold">Failed to load analytics</p>
          <p className="text-sm opacity-70 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const demandCompetency  = demand?.byCompetency  || [];
  const importCompetency  = importance?.byCompetency || [];
  const demandJobRole     = demand?.byJobRole     || [];
  const importJobRole     = importance?.byJobRole || [];
  const dGlobal           = demand?.global        || {};
  const iGlobal           = importance?.global    || {};

  // Merge jobRole data for combined line chart
  const jobRoleMap = {};
  demandJobRole.forEach((r) => {
    jobRoleMap[r.jobRoleName] = { name: r.jobRoleName, demand: r.average };
  });
  importJobRole.forEach((r) => {
    if (jobRoleMap[r.jobRoleName]) {
      jobRoleMap[r.jobRoleName].importance = r.average;
    } else {
      jobRoleMap[r.jobRoleName] = { name: r.jobRoleName, importance: r.average };
    }
  });
  const combinedJobRole = Object.values(jobRoleMap);

  // Merge competency data for combined view
  const compMap = {};
  demandCompetency.forEach((r) => {
    compMap[r.competencyArea] = { name: r.competencyArea, demand: r.average, demandCount: r.count };
  });
  importCompetency.forEach((r) => {
    if (compMap[r.competencyArea]) {
      compMap[r.competencyArea].importance = r.average;
    } else {
      compMap[r.competencyArea] = { name: r.competencyArea, importance: r.average };
    }
  });
  const combinedComp = Object.values(compMap);

  return (
    <div className="px-6 md:px-12 py-10 transition-all duration-500 animate-in fade-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-12"
      >
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-theme-text">Analytics Dashboard</h1>
          <p className="mt-2 text-theme-text-muted text-[13px] md:text-[14px] font-medium">
            Industry demand &amp; importance scores across competencies and job roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[12px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/20">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            Live Data
          </span>
          {hasPermission("analytics:download") && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCSV}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-primary text-white text-[13px] font-bold shadow-lg hover:bg-theme-primary-hover transition"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Global stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <MiniStat label="Demand Avg"   value={dGlobal.average} icon={ChartBarIcon}       colour="#6366f1" darkMode={darkMode} />
        <MiniStat label="Demand Min"   value={dGlobal.min}     icon={ChartBarIcon}       colour="#818cf8" darkMode={darkMode} />
        <MiniStat label="Demand Max"   value={dGlobal.max}     icon={ArrowTrendingUpIcon} colour="#a78bfa" darkMode={darkMode} />
        <MiniStat label="Import Avg"   value={iGlobal.average} icon={StarIcon}           colour="#06b6d4" darkMode={darkMode} />
        <MiniStat label="Import Min"   value={iGlobal.min}     icon={StarIcon}           colour="#38bdf8" darkMode={darkMode} />
        <MiniStat label="Import Max"   value={iGlobal.max}     icon={BriefcaseIcon}      colour="#0ea5e9" darkMode={darkMode} />
      </div>

      {/* ── Tab toggle ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-8 bg-theme-bg p-1 rounded-xl w-fit border border-theme-border">
        {["competency", "jobRole"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-[13px] font-bold transition ${
              activeTab === tab
                ? "bg-theme-surface text-theme-text shadow-sm"
                : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50"
            }`}
          >
            {tab === "competency" ? "By Competency Area" : "By Job Role"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "competency" ? (
          <motion.div
            key="competency"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12"
          >
            {/* Demand by Competency */}
            <div className="p-6 rounded-[24px] border shadow-sm bg-theme-surface border-theme-border">
              <SectionHeader
                title="🔥 Industry Demand Score"
                subtitle="Average demand score per competency area"
              />
              {demandCompetency.length === 0 ? (
                <p className="text-center opacity-50 py-12 text-sm text-theme-text-muted">
                  No demand data yet. Add <code>industryDemandScore</code> to skills.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={demandCompetency} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 12) + "…" : v)}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Bar dataKey="average" name="Demand Avg" radius={[6, 6, 0, 0]}>
                      {demandCompetency.map((_, i) => (
                        <Cell key={i} fill={DEMAND_COLOURS[i % DEMAND_COLOURS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Importance by Competency */}
            <div className="p-6 rounded-[24px] border shadow-sm bg-theme-surface border-theme-border">
              <SectionHeader
                title="⭐ Importance Score"
                subtitle="Average importance score per competency area"
              />
              {importCompetency.length === 0 ? (
                <p className="text-center opacity-50 py-12 text-sm text-theme-text-muted">
                  No importance data yet. Add <code>importanceScore</code> to skills.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={importCompetency} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 12) + "…" : v)}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Bar dataKey="average" name="Importance Avg" radius={[6, 6, 0, 0]}>
                      {importCompetency.map((_, i) => (
                        <Cell key={i} fill={IMPORT_COLOURS[i % IMPORT_COLOURS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Combined competency comparison */}
            {combinedComp.length > 0 && (
              <div className="xl:col-span-2 p-6 rounded-[24px] border shadow-sm bg-theme-surface border-theme-border">
                <SectionHeader
                  title="📊 Demand vs Importance — Competency Comparison"
                  subtitle="Side-by-side average scores per competency"
                />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={combinedComp} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      tickFormatter={(v) => (v?.length > 10 ? v.slice(0, 10) + "…" : v)}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Legend />
                    <Bar dataKey="demand"     name="Demand"     fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="importance" name="Importance" fill="#06b6d4" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="jobRole"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 mb-12"
          >
            {/* Combined Line Chart by Job Role */}
            <div className="p-6 rounded-[24px] border shadow-sm bg-theme-surface border-theme-border">
              <SectionHeader
                title="📈 Scores by Job Role"
                subtitle="Demand and importance trends across all job roles"
              />
              {combinedJobRole.length === 0 ? (
                <p className="text-center opacity-50 py-12 text-sm text-theme-text-muted">
                  No per-job-role data available yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={combinedJobRole} margin={{ left: -10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 12) + "…" : v)}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="demand"
                      name="Demand"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="importance"
                      name="Importance"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#06b6d4", strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Demand bar by job role */}
            {demandJobRole.length > 0 && (
              <div className="p-6 rounded-[24px] border shadow-sm bg-theme-surface border-theme-border">
                <SectionHeader title="🔥 Demand by Job Role" />
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={demandJobRole} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis
                      dataKey="jobRoleName"
                      tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      tickFormatter={(v) => (v?.length > 12 ? v.slice(0, 12) + "…" : v)}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Bar dataKey="average" name="Demand Avg" radius={[6, 6, 0, 0]}>
                      {demandJobRole.map((_, i) => (
                        <Cell key={i} fill={DEMAND_COLOURS[i % DEMAND_COLOURS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;
