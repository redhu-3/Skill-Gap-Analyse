import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* HEADER */}
      <AdminHeader
        onMenuClick={() => setCollapsed(!collapsed)}
      />

      {/* SIDEBAR */}
      <AdminSidebar collapsed={collapsed} />

      {/* MAIN CONTENT */}
      <main
        className={`pt-16 transition-all duration-300
          ${collapsed ? "ml-16" : "ml-64"}
          min-h-screen
          ${darkMode ? "bg-gray-950" : "bg-gray-100"}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
