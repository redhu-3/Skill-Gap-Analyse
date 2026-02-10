import { Bars3Icon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

const AdminHeader = ({ onMenuClick }) => {
  const { darkMode, toggleTheme } = useTheme();

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