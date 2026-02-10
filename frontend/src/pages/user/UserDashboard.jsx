import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaRoad,
  FaBriefcase,
  FaChartLine,
} from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

/* ---------------- animations ---------------- */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  /* ---------------- fetch data ---------------- */
  useEffect(() => {
    axiosInstance.get("/user/me").then((res) => setUser(res.data));
    axiosInstance.get("/user/stats").then((res) => setStats(res.data));
  }, []);

  /* ---------------- close dropdown ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  const progress =
    stats?.hasRole && stats.totalSkills
      ? Math.round((stats.completedSkills / stats.totalSkills) * 100)
      : 0;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      {/* ---------- ambient glow ---------- */}
      <div
        className={`absolute -top-40 -left-40 w-[500px] h-[500px] blur-3xl rounded-full opacity-30 ${
          darkMode ? "bg-indigo-900" : "bg-indigo-200"
        }`}
      />

      {/* ---------- TOP RIGHT CONTROLS (FIXED) ---------- */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
          >
            {user.name[0].toUpperCase()}
          </button>

          {openMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute right-0 mt-3 w-44 rounded-xl shadow-xl border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700"
              >
                <FaUserCircle /> View Profile
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
              >
                <FaSignOutAlt /> Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20"
      >
        {/* ---------- HEADER ---------- */}
        <motion.div variants={item} className="mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Hello,{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {user.name}
            </span>{" "}
            👋
          </h1>

          <p className="mt-3 text-lg opacity-70">
            Welcome back. Let’s build your career.
          </p>

          {/* ---------- PROGRESS ---------- */}
          {stats?.hasRole && (
            <div className="mt-6 max-w-md">
              <div className="flex justify-between mb-1 text-sm">
                <span>Current Job Role Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-3 rounded-full bg-indigo-600 transition-all"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* ---------- PRIMARY CARD ---------- */}
        <motion.div
          variants={item}
          className={`rounded-3xl p-12 border shadow-xl ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <h2 className="text-3xl font-semibold mb-4">
            Choose your career path 🚀
          </h2>

          <p className="opacity-70 max-w-2xl mb-8">
            Select a job role and we’ll create a personalized learning roadmap.
          </p>

          <button
            onClick={() => navigate("/user/job-roles")}
            className="px-10 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Explore Job Roles
          </button>
        </motion.div>

        {/* ---------- SECONDARY ACTIONS ---------- */}
        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            {
              title: "Job Roles",
              icon: <FaBriefcase />,
              route: "/user/job-roles",
            },
            {
              title: "Roadmap",
              icon: <FaRoad />,
              route: "/roadmap",
            },
            {
              title: "Stats",
              icon: <FaChartLine />,
              route: "/stats",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -6 }}
              onClick={() => navigate(card.route)}
              className={`cursor-pointer rounded-2xl p-8 border flex items-center gap-4 transition ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl text-indigo-600 dark:text-indigo-400">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
