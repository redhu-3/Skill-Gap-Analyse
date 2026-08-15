import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  AcademicCapIcon,
  UsersIcon,
  DocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { usePermission } from "../context/PermissionContext";
import { useTheme } from "../context/ThemeContext";
import axiosDash from "../api/axiosDash";
import CareerNetworkBackground from "../components/CareerNetworkBackground";

const AdminLayout = () => {
  const { currentUser } = usePermission();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axiosDash.get("/access-requests/incoming");
        const pendingCount = res.data.requests?.filter(req => req.status === "Pending").length || 0;
        setPendingRequests(pendingCount);
      } catch (err) {
        console.error("Failed to fetch pending requests", err);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navGroups = [
    {
      label: "MAIN",
      items: [
        { label: "Dashboard", path: "/admin/dashboard", icon: Squares2X2Icon }
      ]
    },
    {
      label: "WORKSPACE",
      items: [
        { label: "Job Roles", path: "/admin/job-roles", icon: BriefcaseIcon },
        { label: "Skills", path: "/admin/skills", icon: AcademicCapIcon },
        { label: "Assessments", path: "/admin/questions", icon: DocumentCheckIcon }
      ]
    },
    {
      label: "COLLABORATION",
      items: [
        { label: "Access Requests", path: "/admin/access-requests", icon: BellIcon, badge: pendingRequests }
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden text-admin-text transition-colors duration-300 relative z-10">
      
      {/* Brand Identity Area */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6 border-b border-admin-border/50">
        <div className="w-9 h-9 rounded-xl bg-admin-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-admin-glow">
          SM
        </div>
        <div>
          <h2 className="text-[18px] font-black tracking-tight leading-tight text-admin-text transition-colors">SkillMap</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-admin-primary transition-colors">Career Intelligence</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-3">{group.label}</h3>
            <div className="space-y-1">
              {group.items.map((item, i) => {
                // Ensure exact path matching or partial matching based on route structure
                const isActive = location.pathname.startsWith(item.path.split('?')[0]);
                  
                return (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                      isActive 
                        ? "text-admin-primary"
                        : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-elevated/50"
                    }`}
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <motion.div 
                        layoutId="sidebarActiveIndicator"
                        className="absolute inset-0 bg-admin-primary-light rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {/* Left active line indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="sidebarActiveLine"
                        className="absolute left-0 top-2 bottom-2 w-[3px] bg-admin-primary rounded-r-full shadow-[0_0_8px_var(--admin-glow)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3 w-full">
                      <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-admin-primary scale-110" : "group-hover:text-admin-primary group-hover:scale-105"}`} />
                      <span>{item.label}</span>
                      
                      {item.badge > 0 && (
                        <span className="ml-auto bg-admin-warning-light text-admin-warning border border-admin-warning/20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile / Account Area */}
      <div className="p-4 mt-auto border-t border-admin-border/50">
        <div className="p-4 rounded-[20px] bg-admin-surface-elevated border border-admin-border/50 hover:border-admin-border transition-colors duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[12px] bg-admin-bg flex items-center justify-center border border-admin-border/50 group-hover:border-admin-primary/30 transition-colors">
              <UserIcon className="w-5 h-5 text-admin-text-muted group-hover:text-admin-primary transition-colors" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold truncate text-admin-text">{currentUser?.name || "Admin"}</p>
              <p className="text-[11px] font-medium text-admin-text-muted truncate">{currentUser?.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <button onClick={() => navigate("/admin/profile")} className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold rounded-lg hover:bg-admin-bg text-admin-text-muted hover:text-admin-text transition-colors">
              <UserCircleIcon className="w-4 h-4" /> Account Profile
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold rounded-lg hover:bg-admin-danger-light text-admin-text-muted hover:text-admin-danger transition-colors">
              <ArrowRightOnRectangleIcon className="w-4 h-4" /> Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-admin-bg text-admin-text relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Absolute animated background */}
      <CareerNetworkBackground />
      
      {/* Desktop Sidebar - Fixed Width 280px for premium feel */}
      <aside className="hidden lg:block w-[280px] h-screen sticky top-0 z-40 border-r border-admin-border/50 bg-admin-surface/80 backdrop-blur-2xl transition-colors duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 border-r border-admin-border/50 bg-admin-surface shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10 scrollbar-hide">
        
        {/* Top Navbar - Compact and Premium */}
        <header className="sticky top-0 z-30 px-6 lg:px-12 h-[68px] flex items-center justify-between border-b border-admin-border/50 bg-admin-surface/60 backdrop-blur-xl transition-colors duration-300 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-elevated transition-colors border border-transparent hover:border-admin-border"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            {/* Context breadcrumb could go here */}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle - Animated Morph */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-admin-text-muted hover:text-admin-primary hover:bg-admin-primary-light transition-colors border border-transparent hover:border-admin-primary/20 relative overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                    <SunIcon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                    <MoonIcon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate("/admin/access-requests")}
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-admin-text-muted hover:text-admin-warning hover:bg-admin-warning-light transition-colors border border-transparent hover:border-admin-warning/20 relative group"
            >
              <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {pendingRequests > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-admin-warning shadow-[0_0_8px_var(--admin-warning)] animate-pulse"></span>
              )}
            </button>
            
            {/* Quick Profile Access */}
            <div 
              onClick={() => navigate("/admin/profile")}
              className="ml-2 w-10 h-10 rounded-[12px] bg-admin-surface-elevated border border-admin-border/50 flex items-center justify-center cursor-pointer shadow-sm transition-all hover:bg-admin-border hover:border-admin-border-hover group" 
            >
               <UserIcon className="w-5 h-5 text-admin-text-muted group-hover:text-admin-text transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content Container - Strict max-width and consistent padding */}
        <div className="flex-1 w-full max-w-[1440px] mx-auto p-6 md:p-8 lg:p-12 relative z-10">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;
