import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

const AdminSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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

  return (
    <aside
      className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-r border-gray-200"}
      `}
    >
      <nav className="py-4">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <HomeIcon className="h-5 w-5" />
          {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/admin/job-roles" className={linkClass}>
          <BriefcaseIcon className="h-5 w-5" />
          {!collapsed && "Job Roles"}
        </NavLink>

        <NavLink to="/admin/skills" className={linkClass}>
          <PuzzlePieceIcon className="h-5 w-5" />
          {!collapsed && "Skills"}
        </NavLink>

        <NavLink to="/admin/questions" className={linkClass}>
          <QuestionMarkCircleIcon className="h-5 w-5" />
          {!collapsed && "Questions"}
        </NavLink>

        {/* <NavLink to="/admin/publish-roles" className={linkClass}>
          <CheckCircleIcon className="h-5 w-5" />
          {!collapsed && "Publish Roles"}
        </NavLink> */}

        <NavLink to="/admin/profile" className={linkClass}>
          <UserIcon className="h-5 w-5" />
          {!collapsed && "Profile"}
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className={`absolute bottom-0 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-300
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
