import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  SparklesIcon,
  LightBulbIcon,
  ScaleIcon,
  LinkIcon,
  RectangleGroupIcon,
  ClipboardDocumentCheckIcon,
  QueueListIcon,
  ClockIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  MapIcon,
  BookOpenIcon,
  TagIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        if (!token) return;
        
        // Fetch count of AI recommendations needing review
        const [resGenerated, resUnderReview] = await Promise.all([
          axiosInstance.get("/ai-recommendations/queue?status=ai_generated&limit=1"),
          axiosInstance.get("/ai-recommendations/queue?status=under_review&limit=1"),
        ]);
        
        setPendingCount((resGenerated.data.total || 0) + (resUnderReview.data.total || 0));
      } catch (err) {
        console.error("Failed to fetch pending queue count:", err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-300 ${
      isActive
        ? darkMode
          ? "bg-indigo-900 text-indigo-300"
          : "bg-indigo-100 text-indigo-700"
        : darkMode
        ? "text-gray-300 hover:bg-gray-800"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const aiLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors duration-300 relative group ${
      isActive
        ? darkMode
          ? "bg-violet-950/60 text-violet-300 border-r-2 border-violet-500"
          : "bg-violet-50 text-violet-700 border-r-2 border-violet-600"
        : darkMode
        ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside
      className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col justify-between
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-r border-gray-200"}
      `}
    >
      <nav className="py-4 flex-1 overflow-y-auto scrollbar-none">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <HomeIcon className="h-5 w-5" />
          {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/admin/job-roles" className={linkClass}>
          <BriefcaseIcon className="h-5 w-5" />
          {!collapsed && "Job Roles"}
        </NavLink>

        <NavLink to="/admin/access-requests" className={linkClass}>
          <LockClosedIcon className="h-5 w-5" />
          {!collapsed && "Access Requests"}
        </NavLink>

        <NavLink to="/admin/skills" className={linkClass}>
          <PuzzlePieceIcon className="h-5 w-5" />
          {!collapsed && "Skills"}
        </NavLink>

        <NavLink to="/admin/questions" className={linkClass}>
          <QuestionMarkCircleIcon className="h-5 w-5" />
          {!collapsed && "Questions"}
        </NavLink>

        <NavLink to="/admin/gap-analytics" className={linkClass}>
          <ChartBarIcon className="h-5 w-5" />
          {!collapsed && "Gap Analytics"}
        </NavLink>

        {/* ── Assessments Section (NEW) ── */}
        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />
        {!collapsed ? (
          <div className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider mb-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
            Assessments
          </div>
        ) : (
          <div className="text-center text-[10px] text-indigo-500 font-bold mb-1">AS</div>
        )}

        <NavLink to="/admin/assessments/blueprint" className={linkClass}>
          <CheckCircleIcon className="h-5 w-5" />
          {!collapsed && "Blueprint Builder"}
        </NavLink>

        <NavLink to="/admin/assessments/analytics" className={linkClass}>
          <ChartBarIcon className="h-5 w-5" />
          {!collapsed && "Analytics Dashboard"}
        </NavLink>

        <NavLink to="/admin/assessments/versions" className={linkClass}>
          <ClockIcon className="h-5 w-5" />
          {!collapsed && "Version Manager"}
        </NavLink>

        {/* ── Career Intelligence Section ── */}
        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />
        
        {!collapsed ? (
          <div className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider mb-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
            Career Intelligence
          </div>
        ) : (
          <div className="text-center text-[10px] text-violet-500 font-bold mb-1">AI</div>
        )}

        <NavLink to="/admin/ai/role-generator" className={aiLinkClass}>
          <SparklesIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Role Generator"}
        </NavLink>

        <NavLink to="/admin/ai/skill-recommender" className={aiLinkClass}>
          <LightBulbIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Skill Recommender"}
        </NavLink>

        <NavLink to="/admin/ai/weightage-advisor" className={aiLinkClass}>
          <ScaleIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Weightage Advisor"}
        </NavLink>

        <NavLink to="/admin/ai/dependency-advisor" className={aiLinkClass}>
          <LinkIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Dependency Advisor"}
        </NavLink>

        <NavLink to="/admin/ai/competency-advisor" className={aiLinkClass}>
          <RectangleGroupIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Competency Advisor"}
        </NavLink>

        <NavLink to="/admin/ai/assessment-planner" className={aiLinkClass}>
          <ClipboardDocumentCheckIcon className="h-4.5 w-4.5 text-violet-400" />
          {!collapsed && "AI Assessment Planner"}
        </NavLink>

        <NavLink to="/admin/ai/queue" className={aiLinkClass}>
          <div className="relative">
            <QueueListIcon className="h-4.5 w-4.5 text-violet-400" />
            {collapsed && pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-1 ring-white dark:ring-gray-900" />
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Approval Queue</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </div>
          )}
        </NavLink>

        {/* ── Readiness Scoring Engine ── */}
        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />
        {!collapsed ? (
          <div className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider mb-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
            Readiness Scoring
          </div>
        ) : (
          <div className="text-center text-[10px] text-indigo-500 font-bold mb-1">RE</div>
        )}

        <NavLink to="/admin/readiness/config" className={linkClass}>
          <Cog6ToothIcon className="h-5 w-5" />
          {!collapsed && "Readiness Engine"}
        </NavLink>

        <NavLink to="/admin/readiness/analytics" className={linkClass}>
          <ChartBarIcon className="h-5 w-5" />
          {!collapsed && "Readiness Analytics"}
        </NavLink>

        {/* ── Learning Intelligence ── */}
        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />
        {!collapsed ? (
          <div className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider mb-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
            Learning Intelligence
          </div>
        ) : (
          <div className="text-center text-[10px] text-emerald-500 font-bold mb-1">LP</div>
        )}

        <NavLink to="/admin/learning/roadmaps" className={linkClass}>
          <MapIcon className="h-5 w-5" />
          {!collapsed && "Roadmap Templates"}
        </NavLink>

        <NavLink to="/admin/learning/resources" className={linkClass}>
          <BookOpenIcon className="h-5 w-5" />
          {!collapsed && "Resource Manager"}
        </NavLink>

        <NavLink to="/admin/learning/analytics" className={linkClass}>
          <ChartBarIcon className="h-5 w-5" />
          {!collapsed && "Learning Analytics"}
        </NavLink>

        {/* ── Resume Intelligence ── */}
        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />
        {!collapsed ? (
          <div className={`px-4 py-1 text-[10px] uppercase font-bold tracking-wider mb-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
            Resume Intelligence
          </div>
        ) : (
          <div className="text-center text-[10px] text-violet-500 font-bold mb-1">RI</div>
        )}

        <NavLink to="/admin/resume/aliases" className={linkClass}>
          <TagIcon className="h-5 w-5" />
          {!collapsed && "Skill Alias Manager"}
        </NavLink>

        <NavLink to="/admin/resume/keywords" className={linkClass}>
          <CodeBracketIcon className="h-5 w-5" />
          {!collapsed && "Keyword Mapping"}
        </NavLink>

        <NavLink to="/admin/resume/parsing-rules" className={linkClass}>
          <Cog6ToothIcon className="h-5 w-5" />
          {!collapsed && "Parsing Rules"}
        </NavLink>

        <NavLink to="/admin/resume/certifications" className={linkClass}>
          <AcademicCapIcon className="h-5 w-5" />
          {!collapsed && "Certification Mapping"}
        </NavLink>

        <NavLink to="/admin/resume/projects" className={linkClass}>
          <FolderIcon className="h-5 w-5" />
          {!collapsed && "Project Mapping"}
        </NavLink>

        <NavLink to="/admin/resume/experiences" className={linkClass}>
          <BriefcaseIcon className="h-5 w-5" />
          {!collapsed && "Experience Mapping"}
        </NavLink>

        <NavLink to="/admin/resume/confidence-rules" className={linkClass}>
          <ScaleIcon className="h-5 w-5" />
          {!collapsed && "Confidence Rules"}
        </NavLink>

        <NavLink to="/admin/resume/analytics" className={linkClass}>
          <ChartBarIcon className="h-5 w-5" />
          {!collapsed && "Resume Analytics"}
        </NavLink>

        <div className="my-4 border-t border-gray-800/20 dark:border-gray-700/30" />

        <NavLink to="/admin/profile" className={linkClass}>
          <UserIcon className="h-5 w-5" />
          {!collapsed && "Profile"}
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-300 shrink-0
          ${darkMode ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50"}
        `}
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        {!collapsed && "Logout"}
      </button>
    </aside>
  );
};

export default AdminSidebar;
