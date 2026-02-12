import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const AdminLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-gray-900"
      }`}
    >
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center px-8 py-4 backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/10">

        {/* LEFT - Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-white/20 transition"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 relative">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/20 transition"
          >
            {darkMode ? (
              <SunIcon className="w-6 h-6 text-yellow-400" />
            ) : (
              <MoonIcon className="w-6 h-6 text-indigo-600" />
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-1 rounded-full hover:scale-110 transition"
          >
            <UserCircleIcon className="w-9 h-9" />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 top-14 w-44 rounded-2xl shadow-xl backdrop-blur-lg border ${
                  darkMode
                    ? "bg-gray-900/80 border-gray-700"
                    : "bg-white/90 border-gray-200"
                }`}
              >
                <button
                  onClick={() => navigate("/admin/profile")}
                  className="block w-full text-left px-4 py-3 hover:bg-indigo-500/10 rounded-t-2xl"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-b-2xl"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== SIDEBAR (LEFT SLIDE) ===== */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 120 }}
              className={`fixed top-0 left-0 h-full w-72 z-50 shadow-2xl backdrop-blur-xl p-6 ${
                darkMode
                  ? "bg-gray-900/90 border-r border-gray-800"
                  : "bg-white/95 border-r border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-4">
                <MenuItem label="Dashboard" onClick={() => navigate("/admin/dashboard")} />
                <MenuItem label="Job Roles" onClick={() => navigate("/admin/job-roles")} />
                <MenuItem label="Skills" onClick={() => navigate("/admin/skills")} />
                <MenuItem label="Questions" onClick={() => navigate("/admin/questions")} />
                <MenuItem label="Profile" onClick={() => navigate("/admin/profile")} />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== PAGE CONTENT ===== */}
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
};

const MenuItem = ({ label, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl font-medium transition bg-indigo-500/10 hover:bg-indigo-500/20"
    >
      {label}
    </motion.button>
  );
};

export default AdminLayout;
