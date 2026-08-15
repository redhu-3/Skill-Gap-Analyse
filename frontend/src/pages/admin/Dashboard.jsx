import React, { useEffect, useState } from "react";
import axiosDash from "../../api/axiosDash";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckBadgeIcon,
  DocumentCheckIcon,
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { usePermission } from "../../context/PermissionContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = usePermission();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalRoles: 0,
    myRoles: 0,
    otherRoles: 0,
    totalSkills: 0,
    totalAssessments: 0,
    totalQuestions: 0,
    publishedRoles: 0,
    draftRoles: 0,
    pendingRequests: 0,
    activeTemporaryAccess: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const statsRes = await axios.get("http://localhost:5000/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rawStats = statsRes.data.data;

        const rolesRes = await axiosDash.get("/");
        const allRoles = rolesRes.data.roles || [];
        
        let myRolesCount = 0;
        let otherRolesCount = 0;
        let publishedCount = 0;
        let draftCount = 0;

        allRoles.forEach(r => {
          const creatorId = typeof r.createdBy === 'object' ? r.createdBy?._id : r.createdBy;
          if (creatorId === currentUser?.id) {
            myRolesCount++;
          } else {
            otherRolesCount++;
          }
          if (r.status === "published") publishedCount++;
          else draftCount++;
        });

        const incomingRes = await axiosDash.get("/access-requests/incoming");
        const outgoingRes = await axiosDash.get("/access-requests/outgoing");
        
        const incoming = incomingRes.data.requests || [];
        const outgoing = outgoingRes.data.requests || [];

        const pendingIncoming = incoming.filter(req => req.status === "Pending").length;
        const activeOutgoing = outgoing.filter(req => 
          req.status === "Approved" && new Date(req.accessExpiresAt) > new Date()
        ).length;

        setStats({
          totalRoles: rawStats?.totalRoles || allRoles.length,
          myRoles: myRolesCount,
          otherRoles: otherRolesCount,
          totalSkills: rawStats?.totalSkills || 0,
          totalAssessments: rawStats?.totalAssessments || 0,
          totalQuestions: rawStats?.totalQuestions || 0,
          publishedRoles: publishedCount,
          draftRoles: draftCount,
          pendingRequests: pendingIncoming,
          activeTemporaryAccess: activeOutgoing
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] animate-in fade-in">
        <div className="w-10 h-10 border-[3px] border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Premium surface classes
  const surfaceClass = "bg-admin-surface/80 backdrop-blur-xl border border-admin-border/50 rounded-[24px] shadow-sm hover:border-admin-border transition-colors duration-300";

  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* 1. HERO / COMMAND CENTER HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-black text-admin-text mb-2 tracking-tight transition-colors">
            Command Center
          </h1>
          <p className="text-[13px] md:text-[14px] text-admin-text-muted font-medium transition-colors">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Admin'}. Manage your career intelligence network.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/admin/job-roles")}
          className="flex items-center gap-2 px-6 py-3.5 bg-admin-primary hover:bg-admin-primary-hover text-white rounded-xl text-[13px] font-bold shadow-[0_4px_16px_var(--admin-glow)] transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Create Job Role
        </motion.button>
      </motion.div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
        
        {/* LEFT COLUMN: Visualizations & Metrics */}
        <div className="xl:col-span-2 flex flex-col gap-6 xl:gap-8">
          
          {/* 2 & 4. CAREER ECOSYSTEM VISUALIZATION & OWNERSHIP */}
          <motion.div variants={itemVariants} className={`${surfaceClass} p-8 lg:p-12 relative overflow-hidden group`}>
            
            {/* Ambient Inner Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-admin-primary/10 blur-[100px] pointer-events-none transition-colors duration-1000 group-hover:bg-admin-primary/20" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h2 className="text-[18px] lg:text-[20px] font-black text-admin-text tracking-tight transition-colors">Skill Ecosystem</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-admin-primary bg-admin-primary-light px-3 py-1.5 rounded-md border border-admin-primary/20 transition-colors">Network View</span>
            </div>

            {/* Tree Visualization */}
            <div className="relative z-10 flex flex-col items-center pb-4">
              
              {/* Root Node */}
              <div className="flex flex-col items-center relative cursor-default">
                {/* Node pulse ring */}
                <div className="absolute inset-0 w-[72px] h-[72px] rounded-[24px] bg-admin-primary/20 animate-ping opacity-60 mx-auto" />
                
                <div className="relative w-[72px] h-[72px] rounded-[24px] bg-admin-surface border border-admin-primary/40 flex items-center justify-center mb-4 shadow-[0_0_24px_var(--admin-glow)] group-hover:border-admin-primary group-hover:shadow-[0_0_32px_var(--admin-glow)] transition-all duration-500">
                  <BriefcaseIcon className="w-8 h-8 text-admin-primary" />
                </div>
                <h3 className="text-[36px] font-black text-admin-text mb-1 transition-colors leading-none">{stats.totalRoles}</h3>
                <p className="text-[12px] font-bold uppercase tracking-widest text-admin-text-muted transition-colors">Total Roles</p>
              </div>

              {/* Connecting Lines */}
              <div className="relative w-full max-w-[400px] h-16 my-4">
                {/* Vertical Stem */}
                <div className="absolute top-0 left-1/2 w-[2px] h-8 bg-gradient-to-b from-admin-primary/60 to-admin-primary/20 -translate-x-1/2" />
                {/* Horizontal Branch */}
                <div className="absolute top-8 left-[15%] right-[15%] h-[2px] bg-admin-primary/20" />
                {/* Left Drop */}
                <div className="absolute top-8 left-[15%] w-[2px] h-8 bg-gradient-to-b from-admin-primary/20 to-admin-primary/60" />
                {/* Right Drop */}
                <div className="absolute top-8 right-[15%] w-[2px] h-8 bg-gradient-to-b from-admin-primary/20 to-admin-success/60" />
              </div>

              {/* Branch Nodes (Ownership) */}
              <div className="w-full max-w-[500px] flex justify-between px-4">
                
                {/* My Roles Node */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate("/admin/job-roles?filter=mine")}
                  className="flex flex-col items-center text-center cursor-pointer p-6 rounded-[24px] bg-admin-surface hover:bg-admin-surface-elevated border border-transparent hover:border-admin-border/50 transition-all w-[45%]"
                >
                  <div className="w-14 h-14 rounded-[16px] bg-admin-primary-light border border-admin-primary/30 flex items-center justify-center mb-4 transition-all shadow-sm shadow-admin-glow/20">
                    <UserIcon className="w-6 h-6 text-admin-primary" />
                  </div>
                  <h4 className="text-[28px] font-black text-admin-text mb-1 transition-colors leading-none">{stats.myRoles}</h4>
                  <p className="text-[13px] font-bold text-admin-text transition-colors">My Roles</p>
                </motion.div>

                {/* Other Admin Roles Node */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  onClick={() => navigate("/admin/job-roles?filter=others")}
                  className="flex flex-col items-center text-center cursor-pointer p-6 rounded-[24px] bg-admin-surface hover:bg-admin-surface-elevated border border-transparent hover:border-admin-border/50 transition-all w-[45%]"
                >
                  <div className="w-14 h-14 rounded-[16px] bg-admin-success-light border border-admin-success/30 flex items-center justify-center mb-4 transition-all shadow-sm shadow-admin-success-light">
                    <UsersIcon className="w-6 h-6 text-admin-success" />
                  </div>
                  <h4 className="text-[28px] font-black text-admin-text mb-1 transition-colors leading-none">{stats.otherRoles}</h4>
                  <p className="text-[13px] font-bold text-admin-text transition-colors">Other Admins</p>
                </motion.div>

              </div>
            </div>
          </motion.div>

          {/* 3. WORKSPACE SNAPSHOT */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6">
            
            {/* Metric Module */}
            {[
              { label: "Published", val: stats.publishedRoles, icon: CheckBadgeIcon, color: "text-admin-success", bg: "bg-admin-success-light" },
              { label: "Drafts", val: stats.draftRoles, icon: ClockIcon, color: "text-admin-warning", bg: "bg-admin-warning-light" },
              { label: "Skills", val: stats.totalSkills, icon: AcademicCapIcon, color: "text-admin-secondary", bg: "bg-admin-secondary-light" },
              { label: "Assessments", val: stats.totalAssessments, icon: DocumentCheckIcon, color: "text-admin-danger", bg: "bg-admin-danger-light" }
            ].map((m, i) => (
              <div key={i} className="bg-admin-surface-elevated/60 backdrop-blur-md border border-admin-border/50 rounded-[20px] p-6 flex flex-col justify-between group cursor-default transition-all duration-300 hover:border-admin-border hover:bg-admin-surface-elevated">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-[12px] ${m.bg} ${m.color} flex items-center justify-center transition-colors`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[32px] font-black text-admin-text leading-none mb-2 transition-colors">{m.val}</h4>
                  <p className="text-[11px] font-bold text-admin-text-muted uppercase tracking-widest transition-colors">{m.label}</p>
                </div>
              </div>
            ))}

          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 flex flex-col gap-6 xl:gap-8">
          
          {/* 5. COLLABORATION STATUS */}
          <motion.div variants={itemVariants} className={`${surfaceClass} p-8 relative flex flex-col`}>
            <h3 className="text-[16px] font-black text-admin-text tracking-tight mb-6 flex items-center gap-2 transition-colors">
              <ShieldCheckIcon className="w-5 h-5 text-admin-primary" />
              Collaboration
            </h3>

            <div className="space-y-4 flex-1">
              {/* Pending Requests */}
              <div className="bg-admin-surface-floating rounded-[16px] p-5 flex items-center justify-between border border-admin-border/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${stats.pendingRequests > 0 ? 'bg-admin-warning shadow-[0_0_8px_var(--admin-warning)] animate-pulse' : 'bg-admin-border-hover'}`} />
                  <div>
                    <p className="text-[13px] font-bold text-admin-text transition-colors">Pending Requests</p>
                    <p className="text-[11px] font-medium text-admin-text-muted">Incoming access requests</p>
                  </div>
                </div>
                <span className="text-[20px] font-black text-admin-text transition-colors">{stats.pendingRequests}</span>
              </div>

              {/* Active Temp Access */}
              <div className="bg-admin-surface-floating rounded-[16px] p-5 flex items-center justify-between border border-admin-border/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${stats.activeTemporaryAccess > 0 ? 'bg-admin-success shadow-[0_0_8px_var(--admin-success)]' : 'bg-admin-border-hover'}`} />
                  <div>
                    <p className="text-[13px] font-bold text-admin-text transition-colors">Active Temp Access</p>
                    <p className="text-[11px] font-medium text-admin-text-muted">Currently unlocked roles</p>
                  </div>
                </div>
                <span className="text-[20px] font-black text-admin-text transition-colors">{stats.activeTemporaryAccess}</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/admin/access-requests")}
              className="w-full mt-6 px-5 py-3.5 bg-admin-surface-elevated hover:bg-admin-border border border-admin-border/50 hover:border-admin-border rounded-[12px] text-[13px] font-bold text-admin-text transition-colors flex items-center justify-center gap-2"
            >
              Review Requests <ArrowRightIcon className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* 6. QUICK ACTIONS - Interactive Rows */}
          <motion.div variants={itemVariants} className={`${surfaceClass} p-8 flex-1`}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-5 transition-colors">
              Command Actions
            </h3>
            
            <div className="space-y-3">
              {[
                { label: "Create Job Role", desc: "Start a new career matrix", icon: PlusIcon, color: "text-admin-primary", bg: "bg-admin-primary-light", path: "/admin/job-roles", borderHover: "hover:border-admin-primary/30" },
                { label: "Manage Skills", desc: "Update skill architectures", icon: AcademicCapIcon, color: "text-admin-secondary", bg: "bg-admin-secondary-light", path: "/admin/skills", borderHover: "hover:border-admin-secondary/30" },
                { label: "Assessment Studio", desc: "Create tests and questions", icon: DocumentCheckIcon, color: "text-admin-danger", bg: "bg-admin-danger-light", path: "/admin/questions", borderHover: "hover:border-admin-danger/30" }
              ].map((action, i) => (
                <motion.button 
                  key={i}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(action.path)}
                  className={`w-full group flex items-center gap-4 p-4 rounded-[16px] bg-admin-surface-floating border border-admin-border/50 ${action.borderHover} hover:bg-admin-surface transition-colors text-left`}
                >
                  <div className={`w-12 h-12 rounded-[12px] ${action.bg} ${action.color} flex items-center justify-center shrink-0 transition-colors`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-admin-text mb-0.5 transition-colors">{action.label}</p>
                    <p className="text-[11px] font-medium text-admin-text-muted transition-colors">{action.desc}</p>
                  </div>
                  <ArrowRightIcon className={`w-4 h-4 text-admin-text-muted group-hover:${action.color} transition-colors`} />
                </motion.button>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
      
    </motion.div>
  );
};

export default Dashboard;
