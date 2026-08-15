import { Bars3Icon, SunIcon, MoonIcon, BellIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosDash from "../api/axiosDash";

const AdminHeader = ({ onMenuClick }) => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axiosDash.get("/access-requests/incoming");
        const pendingCount = res.data.requests?.filter(req => req.status === "Pending").length || 0;
        setPendingRequests(pendingCount);
      } catch (err) {
        console.error("Failed to fetch pending requests for notifications", err);
      }
    };
    fetchPending();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40 h-16
        flex items-center justify-between px-6
        backdrop-blur-md
        border-b transition-colors duration-300
        ${
          darkMode
            ? "bg-gray-900/80 border-gray-700 text-gray-100"
            : "bg-indigo-50/80 border-indigo-100 text-gray-800"
        }
      `}
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`
            p-2 rounded-md transition
            ${darkMode ? "hover:bg-gray-800" : "hover:bg-indigo-100"}
          `}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <h1
          className={`text-lg font-semibold ${
            darkMode ? "text-indigo-400" : "text-indigo-700"
          }`}
        >
          Admin Dashboard
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-md transition
            ${darkMode ? "hover:bg-gray-800" : "hover:bg-indigo-100"}
          `}
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-indigo-600" />
          )}
        </button>

        <button
          onClick={() => navigate("/admin/access-requests")}
          className={`
            relative p-2 rounded-md transition
            ${darkMode ? "hover:bg-gray-800" : "hover:bg-indigo-100"}
          `}
        >
          <BellIcon className={`h-5 w-5 ${darkMode ? "text-gray-300" : "text-indigo-600"}`} />
          {pendingRequests > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white ring-2 ring-white dark:ring-gray-900">
              {pendingRequests}
            </span>
          )}
        </button>

        <span
          className={`text-sm ${
            darkMode ? "text-gray-300" : "text-indigo-700"
          }`}
        >
          Admin
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;