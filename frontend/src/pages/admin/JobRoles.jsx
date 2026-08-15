import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosDash from "../../api/axiosDash";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  CheckBadgeIcon,
  DocumentDuplicateIcon,
  KeyIcon,
  LockClosedIcon,
  XMarkIcon,
  InformationCircleIcon,
  UsersIcon,
  ClockIcon,
  UserIcon
} from "@heroicons/react/24/outline";

const JobRoles = () => {
  const { darkMode } = useTheme();
  const { hasPermission, currentUser } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  // Data States
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // Filter States
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get("filter") || "all";
  const [filterType, setFilterType] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToRequest, setRoleToRequest] = useState(null);
  const [accessMessage, setAccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (Create)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [learningDuration, setLearningDuration] = useState("");

  // Form States (Edit)
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editExperienceLevel, setEditExperienceLevel] = useState("");
  const [editLearningDuration, setEditLearningDuration] = useState("");

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axiosDash.get("/");
      setRoles(res.data.roles);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const res = await axiosDash.get("/access-requests/outgoing");
      setOutgoingRequests(res.data.requests);
    } catch (err) {
      console.error("Failed to fetch outgoing requests", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchOutgoingRequests();
  }, []);

  // Update URL silently when filter changes
  useEffect(() => {
    if (filterType !== initialFilter) {
      navigate(`?filter=${filterType}`, { replace: true });
    }
  }, [filterType, navigate, initialFilter]);

  /* --- API ACTIONS --- */
  const requestAccess = async () => {
    if (!roleToRequest) return;
    try {
      setIsSubmitting(true);
      await axiosDash.post("/access-requests", { jobRoleId: roleToRequest._id, message: accessMessage });
      fetchOutgoingRequests();
      setRoleToRequest(null);
      setAccessMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request access");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRole = async () => {
    if (!name || !description) return;
    try {
      setIsSubmitting(true);
      const res = await axiosDash.post("/create", {
        name, description, industry, experienceLevel,
        estimatedLearningDuration: { value: learningDuration, unit: "days" }
      });
      setRoles([res.data.role, ...roles]);
      setName(""); setDescription(""); setIndustry(""); setLearningDuration("");
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishRole = async (id) => {
    try {
      await axiosDash.patch(`/${id}/publish`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish role");
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditName(role.name);
    setEditDescription(role.description);
    setEditIndustry(role.industry || "");
    setEditExperienceLevel(role.experienceLevel || "mid");
    setEditLearningDuration(role.estimatedLearningDuration?.value || "");
  };

  const updateRole = async () => {
    try {
      setIsSubmitting(true);
      await axiosDash.put(`/${editingRole._id}`, {
        name: editName,
        description: editDescription,
        industry: editIndustry,
        experienceLevel: editExperienceLevel,
        estimatedLearningDuration: { value: editLearningDuration, unit: "days" }
      });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createNewVersion = async (id) => {
    try {
      await axiosDash.post(`/${id}/new-version`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create new version");
    }
  };

  const deleteRoleConfirm = async () => {
    if (!roleToDelete) return;
    try {
      setIsSubmitting(true);
      await axiosDash.delete(`/${roleToDelete._id}`);
      fetchRoles();
      setRoleToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete role");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --- DATA PROCESSING --- */
  const searchedRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myRoles = searchedRoles.filter(role => {
    const creatorId = typeof role.createdBy === 'object' ? role.createdBy?._id : role.createdBy;
    return creatorId === currentUser?.id;
  });

  const otherRoles = searchedRoles.filter(role => {
    const creatorId = typeof role.createdBy === 'object' ? role.createdBy?._id : role.createdBy;
    return creatorId !== currentUser?.id;
  });

  const getFilteredData = () => {
    if (filterType === "mine") return { mine: myRoles, others: [] };
    if (filterType === "others") return { mine: [], others: otherRoles };
    return { mine: myRoles, others: otherRoles };
  };

  const displayData = getFilteredData();

  /* --- HELPERS --- */
  const getAccessState = (role) => {
    const request = outgoingRequests.find(r => (r.jobRoleId?._id || r.jobRoleId) === role._id);
    if (!request) return { status: "none" };
    if (request.status === "Pending") return { status: "pending" };
    if (request.status === "Approved") {
      if (new Date(request.accessExpiresAt) > new Date()) {
        return { status: "approved", expiry: new Date(request.accessExpiresAt).toLocaleString() };
      }
      return { status: "expired" };
    }
    if (request.status === "Declined") return { status: "declined" };
    return { status: "none" };
  };

  // Input Box System
  const inputClass = `w-full px-4 py-3 min-h-[44px] rounded-xl border text-[13px] font-medium transition-all bg-admin-bg border-admin-border focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/30 text-admin-text placeholder-admin-text-muted outline-none`;

  /* --- RENDERERS --- */
  const RoleCard = ({ role, isOwner }) => {
    const access = getAccessState(role);
    const canModify = isOwner || access.status === "approved";
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        whileHover={{ y: -2 }}
        className="relative flex flex-col p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 bg-admin-surface border border-admin-border/50 hover:border-admin-border backdrop-blur-xl"
      >
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 pr-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isOwner ? 'bg-admin-primary-light border-admin-primary/20 text-admin-primary border' : 'bg-admin-success-light border-admin-success/20 text-admin-success border'
            }`}>
              <BriefcaseIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-tight text-admin-text line-clamp-1">{role.name}</h3>
              <p className="text-[11px] mt-0.5 font-bold text-admin-text-muted flex items-center gap-1.5">
                {isOwner ? "Created by You" : `Created by: ${role.createdBy?.name || "Other Admin"}`}
                {role.version && role.version > 1 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-admin-bg border border-admin-border text-[9px] uppercase tracking-widest">
                    v{role.version}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center">
             <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              role.status === "published" 
                ? "bg-admin-success-light text-admin-success border-admin-success/20"
                : "bg-admin-warning-light text-admin-warning border-admin-warning/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${role.status === "published" ? "bg-admin-success animate-pulse" : "bg-admin-warning"}`}></span>
              {role.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-admin-bg border border-admin-border/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-0.5">Industry</p>
            <p className="text-[12px] font-bold text-admin-text truncate">{role.industry || "General"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-0.5">Experience</p>
            <p className="text-[12px] font-bold text-admin-text capitalize">{role.experienceLevel || "Mid"}</p>
          </div>
        </div>

        <p className="text-[13px] mb-6 flex-1 line-clamp-2 text-admin-text-muted leading-relaxed">
          {role.description}
        </p>

        {/* Temporary Access Info */}
        {!isOwner && (
          <div className="mb-4 mt-auto">
            {access.status === "approved" && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-[12px] font-bold bg-admin-success-light text-admin-success border border-admin-success/20">
                <KeyIcon className="w-4 h-4" />
                <span>Unlocked until {access.expiry.split(',')[0]}</span>
              </div>
            )}
            {access.status === "pending" && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-[12px] font-bold bg-admin-warning-light text-admin-warning border border-admin-warning/20">
                <ClockIcon className="w-4 h-4" />
                <span>Access Request Pending...</span>
              </div>
            )}
            {(access.status === "none" || access.status === "expired" || access.status === "declined") && (
              <div className="flex items-center justify-between p-3 rounded-xl text-[12px] font-bold bg-admin-bg text-admin-text-muted border border-admin-border/50">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>View Only Access</span>
                </div>
                <button 
                  onClick={() => setRoleToRequest(role)} 
                  className="text-admin-primary hover:text-admin-primary-hover transition-colors underline"
                >
                  Request
                </button>
              </div>
            )}
          </div>
        )}

        <hr className="mb-4 border-admin-border/50 mt-auto" />

        {/* Actions Zone */}
        <div className="flex flex-wrap items-center gap-2">
          {canModify && (
            <>
              {role.status === "draft" && hasPermission("jobRole:edit") && (
                <button onClick={() => openEditModal(role)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors bg-admin-bg border border-admin-border hover:border-admin-primary/50 text-admin-text hover:text-admin-primary">
                  <PencilIcon className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {role.status === "draft" && hasPermission("jobRole:create") && (
                <button onClick={() => publishRole(role._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-admin-success text-white hover:bg-emerald-600 transition-colors shadow-sm">
                  <CheckBadgeIcon className="w-3.5 h-3.5" /> Publish
                </button>
              )}
              {role.status === "published" && hasPermission("jobRole:create") && (
                <button onClick={() => createNewVersion(role._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors bg-admin-primary-light text-admin-primary hover:bg-admin-primary hover:text-white">
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Next Version
                </button>
              )}
              {isOwner && hasPermission("jobRole:delete") && (
                <button onClick={() => setRoleToDelete(role)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors bg-admin-bg hover:bg-admin-danger-light text-admin-text-muted hover:text-admin-danger border border-transparent hover:border-admin-danger/20">
                  <TrashIcon className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const SkeletonCard = () => (
    <div className="p-6 rounded-[24px] border bg-admin-surface border-admin-border/50">
      <div className="flex gap-4 mb-6 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-admin-bg"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 rounded bg-admin-bg w-3/4"></div>
          <div className="h-3 rounded bg-admin-bg w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-8 animate-pulse">
        <div className="h-3 rounded bg-admin-bg"></div>
        <div className="h-3 rounded bg-admin-bg w-5/6"></div>
      </div>
      <div className="h-10 rounded-xl bg-admin-bg w-full animate-pulse"></div>
    </div>
  );

  return (
    <div className="w-full pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-admin-primary border border-admin-primary/20 bg-admin-primary-light px-2.5 py-0.5 rounded-md">
              Career Matrix
            </span>
          </div>
          <h1 className="text-[28px] md:text-[32px] font-black tracking-tight mb-2 text-admin-text">
            Job Role Workspace
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium text-admin-text-muted">
            Design and manage career paths, required skills, and role ecosystems.
          </p>
        </div>
        
        {hasPermission("jobRole:create") && (
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-admin-primary hover:bg-admin-primary-hover text-white rounded-[12px] text-[13px] font-bold shadow-[0_4px_16px_var(--admin-glow)] transition-colors"
          >
            <PlusIcon className="w-5 h-5" /> Create Job Role
          </motion.button>
        )}
      </div>

      {/* COMMAND BAR */}
      <div className="sticky top-0 z-20 p-3 mb-10 rounded-[20px] border backdrop-blur-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-colors bg-admin-surface/70 border-admin-border">
        
        {/* Filters */}
        <div className="flex items-center p-1 rounded-xl w-full md:w-auto bg-admin-bg/80 border border-admin-border/50">
          {['all', 'mine', 'others'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[12px] font-bold capitalize transition-all ${
                filterType === f 
                  ? 'bg-admin-surface text-admin-text shadow-sm border border-admin-border/50' 
                  : 'text-admin-text-muted hover:text-admin-text border border-transparent'
              }`}
            >
              {f === 'others' ? 'Other Admins' : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[320px]">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
          <input
            type="text"
            placeholder="Search job roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 min-h-[40px] rounded-[12px] border text-[13px] font-bold transition-colors focus:outline-none focus:ring-1 bg-admin-bg/80 border-admin-border/50 focus:border-admin-primary focus:ring-admin-primary/30 text-admin-text placeholder-admin-text-muted"
          />
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-[16px] mb-8 flex items-center gap-3 border bg-admin-danger-light border-admin-danger/20 text-admin-danger">
          <InformationCircleIcon className="w-5 h-5" />
          <p className="font-bold text-[13px]">{error}</p>
          <button onClick={fetchRoles} className="ml-auto underline text-[12px] font-bold hover:text-admin-danger/80">Try Again</button>
        </div>
      )}

      {/* CONTENT GRIDS */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* MY ROLES */}
          {(filterType === "all" || filterType === "mine") && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-admin-primary-light flex items-center justify-center text-admin-primary border border-admin-primary/20">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black tracking-tight text-admin-text">My Job Roles</h2>
                  <p className="text-[12px] font-medium text-admin-text-muted">Career paths you have created and own.</p>
                </div>
              </div>
              
              {displayData.mine.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {displayData.mine.map(role => <RoleCard key={role._id} role={role} isOwner={true} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="p-12 text-center rounded-[24px] border border-dashed bg-admin-surface/30 border-admin-border flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-admin-bg border border-admin-border/50 flex items-center justify-center mb-4">
                    <BriefcaseIcon className="w-8 h-8 text-admin-text-muted opacity-50" />
                  </div>
                  <h3 className="text-[16px] font-black mb-1 text-admin-text">No Roles Created</h3>
                  <p className="text-[13px] font-medium mb-6 text-admin-text-muted max-w-sm">
                    You haven't built any career matrices yet. Create one to begin mapping skills.
                  </p>
                  {hasPermission("jobRole:create") && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCreateModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-admin-primary text-white rounded-xl text-[13px] font-bold shadow-[0_4px_16px_var(--admin-glow)] transition-colors">
                      <PlusIcon className="w-4 h-4" /> Create Job Role
                    </motion.button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* OTHER ADMIN ROLES */}
          {(filterType === "all" || filterType === "others") && (
            <section>
              <div className="mb-6 flex items-center gap-3 pt-6 border-t border-admin-border/50">
                <div className="w-8 h-8 rounded-lg bg-admin-success-light flex items-center justify-center text-admin-success border border-admin-success/20">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[18px] font-black tracking-tight text-admin-text">Other Admin Roles</h2>
                  <p className="text-[12px] font-medium text-admin-text-muted">Collaboration workspace — request access to edit.</p>
                </div>
              </div>
              
              {displayData.others.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {displayData.others.map(role => <RoleCard key={role._id} role={role} isOwner={false} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="p-12 text-center rounded-[24px] border border-dashed bg-admin-surface/30 border-admin-border flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-admin-bg border border-admin-border/50 flex items-center justify-center mb-4">
                    <UsersIcon className="w-8 h-8 text-admin-text-muted opacity-50" />
                  </div>
                  <h3 className="text-[16px] font-black mb-1 text-admin-text">No Collaborative Roles</h3>
                  <p className="text-[13px] font-medium text-admin-text-muted max-w-sm">
                    No other administrators have published or drafted roles visible to you.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODALS SYSTEM */}
      {/* We use a shared layout structure for modals to keep the UI consistent */}
      
      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.96, y: 16 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border flex flex-col"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 md:px-8 border-b border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <h2 className="text-[20px] font-black text-admin-text">Create Job Role</h2>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-admin-text-muted">Basic Identity</h3>
                <div className="space-y-5 mb-8 p-5 rounded-[20px] border border-admin-border/50 bg-admin-surface">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Job Role Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Description *</label>
                    <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe responsibilities..." className={`${inputClass} resize-none py-3`} />
                  </div>
                </div>

                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-admin-text-muted">Career Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 p-5 rounded-[20px] border border-admin-border/50 bg-admin-surface">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Industry</label>
                    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Experience Level</label>
                    <div className="relative">
                      <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                        <option value="beginner">Beginner</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-admin-text-muted">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Est. Learning Duration (Days)</label>
                    <input type="number" value={learningDuration} onChange={(e) => setLearningDuration(e.target.value)} placeholder="e.g. 90" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex gap-3 justify-end p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <button onClick={() => setCreateModalOpen(false)} className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={createRole} disabled={isSubmitting || !name || !description} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL - Follows same structural logic */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRole(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.96, y: 16 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border flex flex-col"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 md:px-8 border-b border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <h2 className="text-[20px] font-black text-admin-text">Edit Job Role</h2>
                <button onClick={() => setEditingRole(null)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-admin-text-muted">Basic Identity</h3>
                <div className="space-y-5 mb-8 p-5 rounded-[20px] border border-admin-border/50 bg-admin-surface">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Job Role Name *</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Description *</label>
                    <textarea rows="3" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`${inputClass} resize-none py-3`} />
                  </div>
                </div>

                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-admin-text-muted">Career Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 p-5 rounded-[20px] border border-admin-border/50 bg-admin-surface">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Industry</label>
                    <input type="text" value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Experience Level</label>
                    <div className="relative">
                      <select value={editExperienceLevel} onChange={(e) => setEditExperienceLevel(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                        <option value="beginner">Beginner</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-admin-text-muted">▼</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted">Est. Learning Duration (Days)</label>
                    <input type="number" value={editLearningDuration} onChange={(e) => setEditLearningDuration(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex gap-3 justify-end p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <button onClick={() => setEditingRole(null)} className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={updateRole} disabled={isSubmitting || !editName || !editDescription} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {roleToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setRoleToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-sm p-8 rounded-[24px] shadow-2xl border text-center bg-admin-surface-floating border-admin-border">
              <div className="w-16 h-16 rounded-[20px] bg-admin-danger-light text-admin-danger flex items-center justify-center mx-auto mb-6 border border-admin-danger/20">
                <TrashIcon className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] font-black mb-2 text-admin-text">Delete Role?</h3>
              <p className="text-[13px] mb-2 font-bold text-admin-text px-4 py-2 bg-admin-bg rounded-lg border border-admin-border/50 inline-block">{roleToDelete.name}</p>
              <p className="text-[12px] mb-8 mt-4 text-admin-text-muted font-medium">
                This will permanently delete the role and all associated structural data.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setRoleToDelete(null)} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={deleteRoleConfirm} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold bg-admin-danger hover:bg-admin-danger/90 text-white transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Deleting...' : 'Confirm'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST ACCESS MODAL */}
      <AnimatePresence>
        {roleToRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setRoleToRequest(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-md p-6 md:p-8 rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-admin-primary-light text-admin-primary border border-admin-primary/20 flex items-center justify-center shrink-0">
                  <KeyIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-admin-text">Request Access</h3>
                  <p className="text-[12px] mt-0.5 font-bold text-admin-text-muted line-clamp-1">{roleToRequest.name}</p>
                </div>
              </div>
              <p className="text-[13px] mb-6 font-medium text-admin-text-muted p-4 bg-admin-bg rounded-xl border border-admin-border/50">
                Your request will be sent to the owner (<span className="font-bold text-admin-text">{roleToRequest.createdBy?.name || "Admin"}</span>) for approval.
              </p>
              
              <div className="mb-8">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 text-admin-text-muted">Message (Optional)</label>
                <textarea 
                  rows="3" 
                  value={accessMessage} 
                  onChange={(e) => setAccessMessage(e.target.value)} 
                  placeholder="Explain why you need modification access..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-admin-border/50">
                <button onClick={() => setRoleToRequest(null)} className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={requestAccess} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-admin-primary hover:bg-admin-primary-hover text-white transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobRoles;
