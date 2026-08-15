import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";
import CSVImportModal from "../../components/admin/CSVImportModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon,
  XMarkIcon, AcademicCapIcon, AdjustmentsHorizontalIcon,
  ChevronRightIcon, KeyIcon, LockClosedIcon, ClockIcon, ArrowDownIcon
} from "@heroicons/react/24/outline";

const priorityStyle = {
  core: "bg-admin-danger-light text-admin-danger border-admin-danger/20",
  secondary: "bg-admin-warning-light text-admin-warning border-admin-warning/20",
  optional: "bg-admin-success-light text-admin-success border-admin-success/20",
};

const Skills = () => {
  const { darkMode } = useTheme();
  const { hasPermission, currentUser } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data
  const [jobRoles, setJobRoles] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // UI Selection State
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); 

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newSkill, setNewSkill] = useState({
    name: "", category: "", requiredProficiency: 0, priority: "core", weightage: 0, isMandatory: true, competencyArea: "",
  });

  const [editingSkill, setEditingSkill] = useState(null);
  const [editSkillData, setEditSkillData] = useState({
    name: "", category: "", requiredProficiency: 0, priority: "core", weightage: 0, isMandatory: true, competencyArea: "",
  });

  const [prereqSkill, setPrereqSkill] = useState(null);
  const [selectedPrereqs, setSelectedPrereqs] = useState([]);

  const [skillToDelete, setSkillToDelete] = useState(null);

  useEffect(() => {
    if (searchParams.get("import") === "true") {
      setIsImportModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleImportSuccess = () => fetchJobRoles();

  /* --- DATA FETCHING --- */
  const fetchJobRoles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/job-roles");
      setJobRoles(res.data.roles);
      if (res.data.roles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(res.data.roles[0]._id);
      }
      res.data.roles.forEach((role) => fetchSkills(role._id));
    } catch (err) {
      setError("Failed to fetch job roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (roleId) => {
    try {
      const res = await axiosInstance.get(`/skills/job-role/${roleId}`);
      setSkillsMap((prev) => ({ ...prev, [roleId]: res.data.skills }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const res = await axiosInstance.get("/job-roles/access-requests/outgoing");
      setOutgoingRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchJobRoles(); 
    fetchOutgoingRequests();
  }, []);

  /* --- ACTIONS --- */
  const addSkill = async () => {
    const { name, category } = newSkill;
    if (!name || !category) return;
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/skills/create", {
        ...newSkill,
        requiredProficiency: Number(newSkill.requiredProficiency),
        weightage: Number(newSkill.weightage),
        jobRoleId: selectedRoleId,
      });
      setSkillsMap(prev => ({
        ...prev,
        [selectedRoleId]: [res.data.skill, ...(prev[selectedRoleId] || [])],
      }));
      setNewSkill({ name: "", category: "", requiredProficiency: 0, priority: "core", weightage: 0, isMandatory: true, competencyArea: "" });
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setEditSkillData({
      name: skill.name, category: skill.category, requiredProficiency: skill.requiredProficiency,
      priority: skill.priority || "core", weightage: skill.weightage || 0,
      isMandatory: skill.isMandatory !== undefined ? skill.isMandatory : true, competencyArea: skill.competencyArea || "",
    });
  };

  const updateSkill = async () => {
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/skills/update/${editingSkill._id}`, {
        ...editSkillData,
        requiredProficiency: Number(editSkillData.requiredProficiency),
        weightage: Number(editSkillData.weightage),
      });
      fetchSkills(selectedRoleId);
      if (selectedSkill && selectedSkill._id === editingSkill._id) {
        setSelectedSkill({...editingSkill, ...editSkillData});
      }
      setEditingSkill(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`/skills/delete/${skillToDelete._id}`);
      fetchSkills(selectedRoleId);
      if (selectedSkill?._id === skillToDelete._id) setSelectedSkill(null);
      setSkillToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPrereqModal = (skill) => {
    setPrereqSkill(skill);
    setSelectedPrereqs((skill.prerequisites || []).map((p) => (typeof p === "object" ? p._id : p)));
  };

  const updatePrerequisites = async () => {
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/skills/prerequisites/${prereqSkill._id}`, { prerequisiteIds: selectedPrereqs });
      await fetchSkills(selectedRoleId);
      
      if (selectedSkill && selectedSkill._id === prereqSkill._id) {
        const updatedSkills = (skillsMap[selectedRoleId] || []);
        const newSelected = updatedSkills.find(s => s._id === prereqSkill._id);
        if (newSelected) setSelectedSkill(newSelected);
      }
      setPrereqSkill(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update prerequisites");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAccess = async () => {
    try {
      await axiosInstance.post("/job-roles/access-requests", { jobRoleId: selectedRoleId, message: "Requesting access to manage skills." });
      alert("Access request sent!");
      fetchOutgoingRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request access");
    }
  };

  /* --- DATA PROCESSING --- */
  const selectedRole = jobRoles.find(r => r._id === selectedRoleId);
  const roleSkills = skillsMap[selectedRoleId] || [];
  
  const filteredSkills = roleSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || skill.category?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "core") return skill.priority === "core";
    if (filterType === "optional") return skill.priority === "optional";
    if (filterType === "required") return skill.isMandatory;
    return true;
  });

  // Permissions & Ownership
  let isOwner = false;
  let accessStatus = "none";
  let expiry = null;

  if (selectedRole) {
    const creatorId = typeof selectedRole.createdBy === 'object' ? selectedRole.createdBy?._id : selectedRole.createdBy;
    isOwner = creatorId === currentUser?.id;
    
    const request = outgoingRequests.find(r => (r.jobRoleId?._id || r.jobRoleId) === selectedRole._id);
    if (request) {
      if (request.status === "Pending") accessStatus = "pending";
      if (request.status === "Approved") {
        if (new Date(request.accessExpiresAt) > new Date()) {
          accessStatus = "approved";
          expiry = new Date(request.accessExpiresAt).toLocaleString();
        } else {
          accessStatus = "expired";
        }
      }
    }
  }
  
  const canModify = isOwner || accessStatus === "approved";

  // Shared Styles
  const inputClass = `w-full px-4 py-3 min-h-[44px] rounded-xl border text-[13px] font-medium transition-all bg-admin-bg border-admin-border focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/30 text-admin-text placeholder-admin-text-muted outline-none`;
  const labelClass = "block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted";
  
  const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4 rounded-[16px] border border-admin-border/50 bg-admin-surface animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-admin-bg"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 w-32 rounded bg-admin-bg"></div>
        <div className="h-3 w-24 rounded bg-admin-bg"></div>
      </div>
      <div className="h-6 w-20 rounded-md bg-admin-bg"></div>
      <div className="h-6 w-20 rounded-md bg-admin-bg"></div>
      <div className="w-8 h-8 rounded-full bg-admin-bg"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0">
      
      {/* MAIN WORKSPACE */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${selectedSkill ? 'md:mr-[420px]' : ''}`}>
        
        {/* HEADER & ROLE SELECTOR */}
        <div className="sticky top-0 z-20 pt-6 px-6 md:px-10 pb-4 backdrop-blur-2xl border-b shadow-sm bg-admin-surface/70 border-admin-border/50">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-admin-primary border border-admin-primary/20 bg-admin-primary-light px-2.5 py-0.5 rounded-md">
                  Skill Architecture
                </span>
              </div>
              <h1 className="text-[28px] md:text-[32px] font-black tracking-tight text-admin-text">Skill Matrix</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {hasPermission("skillRelation:import") && (
                <button onClick={() => setIsImportModalOpen(true)} className="px-5 py-2.5 rounded-[12px] text-[13px] font-bold border transition-colors bg-admin-bg border-admin-border/50 hover:border-admin-border hover:bg-admin-surface-elevated text-admin-text">
                  Import CSV
                </button>
              )}
              {canModify && hasPermission("skill:create") && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCreateModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-admin-primary hover:bg-admin-primary-hover text-white rounded-[12px] text-[13px] font-bold shadow-[0_4px_16px_var(--admin-glow)] transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add Skill Node
                </motion.button>
              )}
            </div>
          </div>

          {/* Job Role Navigator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {jobRoles.map(role => (
              <button
                key={role._id}
                onClick={() => { setSelectedRoleId(role._id); setSelectedSkill(null); }}
                className={`flex-none px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all border ${
                  selectedRoleId === role._id
                    ? "bg-admin-primary-light text-admin-primary border-admin-primary/30"
                    : "bg-admin-surface-floating border-admin-border/50 text-admin-text-muted hover:border-admin-border hover:text-admin-text"
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
          
          {selectedRole ? (
            <div className="max-w-5xl mx-auto">
              
              {/* Role Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-[22px] font-black tracking-tight mb-1 text-admin-text">{selectedRole.name}</h2>
                  <div className="flex items-center gap-3">
                    <p className="text-[13px] font-medium text-admin-text-muted">
                      {isOwner ? "Created by You" : `Created by ${selectedRole.createdBy?.name || "Admin"}`}
                    </p>
                    {!isOwner && (
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border ${
                        canModify 
                          ? "bg-admin-success-light text-admin-success border-admin-success/20"
                          : "bg-admin-bg text-admin-text-muted border-admin-border"
                      }`}>
                        {canModify ? `Temp Access (Exp: ${expiry.split(',')[0]})` : "View Only"}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4">
                  <div className="px-6 py-3 rounded-[16px] text-center border bg-admin-surface border-admin-border/50 shadow-sm">
                    <p className="text-[20px] font-black text-admin-text">{roleSkills.length}</p>
                    <p className="text-[10px] uppercase font-bold text-admin-text-muted tracking-widest">Total Skills</p>
                  </div>
                  <div className="px-6 py-3 rounded-[16px] text-center border bg-admin-surface border-admin-border/50 shadow-sm">
                    <p className="text-[20px] font-black text-admin-text">{roleSkills.filter(s => s.isMandatory).length}</p>
                    <p className="text-[10px] uppercase font-bold text-admin-text-muted tracking-widest">Required</p>
                  </div>
                </div>
              </div>

              {!canModify && accessStatus !== "pending" && (
                <div className="mb-10 p-5 rounded-[16px] border flex items-center justify-between bg-admin-primary-light border-admin-primary/20">
                  <div>
                    <h4 className="font-bold text-[14px] mb-1 text-admin-primary">Explore Skills</h4>
                    <p className="text-[12px] text-admin-primary/70 font-medium">You need temporary access to add or edit skills for this role.</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={requestAccess} className="px-5 py-2.5 bg-admin-primary text-white text-[12px] font-bold rounded-[12px] shadow-sm hover:bg-admin-primary-hover transition-colors">
                    Request Access
                  </motion.button>
                </div>
              )}
              {accessStatus === "pending" && (
                <div className="mb-10 p-5 rounded-[16px] border flex items-center gap-4 bg-admin-warning-light border-admin-warning/20 text-admin-warning">
                  <ClockIcon className="w-5 h-5 animate-pulse" />
                  <p className="text-[13px] font-bold">Access Request Pending...</p>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center p-1 rounded-xl w-full md:w-auto bg-admin-bg/80 border border-admin-border/50">
                  {['all', 'core', 'required', 'optional'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[12px] font-bold capitalize transition-all ${
                        filterType === f ? 'bg-admin-surface text-admin-text shadow-sm border border-admin-border/50' : 'text-admin-text-muted hover:text-admin-text border border-transparent'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                
                <div className="relative w-full md:w-[280px]">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 min-h-[40px] rounded-[12px] border text-[13px] font-bold transition-colors focus:outline-none focus:ring-1 bg-admin-bg/80 border-admin-border/50 focus:border-admin-primary focus:ring-admin-primary/30 text-admin-text placeholder-admin-text-muted"
                  />
                </div>
              </div>

              {/* Skills Matrix */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
                </div>
              ) : filteredSkills.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredSkills.map((skill, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        key={skill._id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-[16px] border cursor-pointer transition-all hover:shadow-md ${
                          selectedSkill?._id === skill._id 
                            ? "bg-admin-primary-light border-admin-primary/40 ring-1 ring-admin-primary/30"
                            : "bg-admin-surface border-admin-border/50 hover:border-admin-border"
                        }`}
                      >
                        {/* Number & Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <span className="text-[12px] font-black opacity-30 text-admin-text-muted w-6 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[14px] truncate pr-4 text-admin-text tracking-tight">{skill.name}</h3>
                            <p className="text-[12px] font-medium text-admin-text-muted truncate pr-4 mt-0.5">{skill.category}</p>
                          </div>
                        </div>

                        {/* Pills */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 md:mt-0">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${priorityStyle[skill.priority] || priorityStyle.core}`}>
                            {skill.priority || "Core"}
                          </span>
                          {skill.isMandatory && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border bg-admin-bg text-admin-text-muted border-admin-border/50">
                              Required
                            </span>
                          )}
                          {skill.weightage > 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border bg-admin-primary-light text-admin-primary border-admin-primary/20">
                              {skill.weightage}% Wt
                            </span>
                          )}
                        </div>

                        {/* Chevron */}
                        <div className="hidden md:flex items-center justify-end w-10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <ChevronRightIcon className="w-5 h-5 text-admin-text-muted" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-16 text-center rounded-[24px] border border-dashed bg-admin-surface/30 border-admin-border flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-admin-bg border border-admin-border/50 flex items-center justify-center mb-4">
                     <AdjustmentsHorizontalIcon className="w-8 h-8 text-admin-text-muted opacity-50" />
                  </div>
                  <h3 className="text-[16px] font-black mb-1 text-admin-text">No Skills Found</h3>
                  <p className="text-[13px] font-medium mb-6 text-admin-text-muted">
                    This role doesn't have any skills matching your current filters.
                  </p>
                  {canModify && hasPermission("skill:create") && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCreateModalOpen(true)} className="px-6 py-3 bg-admin-primary text-white rounded-[12px] text-[13px] font-bold shadow-[0_4px_16px_var(--admin-glow)] transition-colors">
                      Add First Skill
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[40vh]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-[24px] bg-admin-surface-floating border border-admin-border/50 shadow-xl flex items-center justify-center mx-auto mb-6">
                  <AcademicCapIcon className="w-10 h-10 text-admin-text-muted" />
                </div>
                <h3 className="text-[18px] font-black text-admin-text mb-2">No Matrix Selected</h3>
                <p className="font-medium text-[13px] text-admin-text-muted max-w-xs mx-auto">Select a Job Role from the navigation bar above to view its skill architecture.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE PANEL (SKILL DETAILS) */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[420px] z-40 border-l shadow-2xl flex flex-col bg-admin-surface border-admin-border/50 text-admin-text"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-6 border-b border-admin-border/50 bg-admin-surface/90 backdrop-blur-md">
              <h3 className="font-black text-[18px] tracking-tight">Node Details</h3>
              <button onClick={() => setSelectedSkill(null)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide">
              <div>
                <h2 className="text-[26px] font-black tracking-tight mb-2 leading-tight">{selectedSkill.name}</h2>
                <p className="font-bold text-admin-text-muted text-[13px] mb-6">{selectedSkill.category}</p>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${priorityStyle[selectedSkill.priority] || priorityStyle.core}`}>
                    {selectedSkill.priority || "Core"}
                  </span>
                  {selectedSkill.isMandatory && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border bg-admin-bg text-admin-text-muted border-admin-border/50">
                      Required
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className={labelClass}>Description</h4>
                <div className="p-5 rounded-[16px] text-[13px] leading-relaxed bg-admin-bg text-admin-text border border-admin-border/50 font-medium">
                  {selectedSkill.description || "No description provided."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-[16px] bg-admin-surface-floating border border-admin-border/50">
                  <h4 className={labelClass}>Weightage</h4>
                  <p className="font-black text-[24px] text-admin-primary">{selectedSkill.weightage}%</p>
                </div>
                <div className="p-5 rounded-[16px] bg-admin-surface-floating border border-admin-border/50">
                  <h4 className={labelClass}>Required Prof.</h4>
                  <p className="font-black text-[24px] text-admin-secondary">{selectedSkill.requiredProficiency}%</p>
                </div>
                {selectedSkill.competencyArea && (
                  <div className="col-span-2 p-5 rounded-[16px] bg-admin-surface-floating border border-admin-border/50">
                    <h4 className={labelClass}>Competency Area</h4>
                    <p className="font-bold text-[14px] text-admin-text">{selectedSkill.competencyArea}</p>
                  </div>
                )}
              </div>

              {/* Dependency Graph Simulation */}
              <div>
                <h4 className={labelClass}>Prerequisites Flow</h4>
                <div className="p-6 rounded-[20px] border bg-admin-surface-floating border-admin-border/50">
                  {selectedSkill.prerequisites && selectedSkill.prerequisites.length > 0 ? (
                    <div className="flex flex-col gap-3 items-center">
                      {selectedSkill.prerequisites.map(p => {
                        const pid = typeof p === "object" ? p._id : p;
                        const pName = skillsMap[selectedRoleId]?.find((s) => s._id === pid)?.name || "Unknown Skill";
                        return (
                          <div key={pid} className="flex flex-col items-center w-full">
                            <span className="px-4 py-2.5 rounded-xl text-[12px] font-bold w-full text-center bg-admin-surface border border-admin-border/50 shadow-sm text-admin-text">
                              {pName}
                            </span>
                            <div className="w-[2px] h-4 bg-admin-border/50 my-1"></div>
                          </div>
                        );
                      })}
                      <span className="px-4 py-2.5 rounded-xl text-[12px] font-black w-full text-center border-2 border-admin-primary text-admin-primary bg-admin-primary-light shadow-[0_0_12px_var(--admin-glow)]">
                        {selectedSkill.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-admin-border flex items-center justify-center mx-auto mb-3">
                         <span className="w-2 h-2 rounded-full bg-admin-text-muted opacity-50"></span>
                      </div>
                      <p className="text-[12px] font-bold text-admin-text-muted">No dependencies required.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            {canModify && (
              <div className="p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md flex flex-col gap-3">
                <div className="flex gap-3 w-full">
                  {hasPermission("skillRelation:edit") && (
                    <button onClick={() => openPrereqModal(selectedSkill)} className="flex-1 py-3 rounded-xl text-[13px] font-bold border transition-colors border-admin-border hover:bg-admin-surface-elevated text-admin-text">
                      Prerequisites
                    </button>
                  )}
                  {hasPermission("skill:edit") && (
                    <button onClick={() => openEditModal(selectedSkill)} className="flex-1 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors shadow-sm">
                      Edit Node
                    </button>
                  )}
                </div>
                {hasPermission("skill:delete") && (
                  <button onClick={() => setSkillToDelete(selectedSkill)} className="w-full py-3 rounded-xl text-[13px] font-bold border border-admin-danger/20 text-admin-danger transition-colors hover:bg-admin-danger-light hover:border-admin-danger/40">
                    Delete Skill
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border">
              
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 md:px-8 border-b border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <h2 className="text-[20px] font-black text-admin-text">Add New Skill</h2>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Skill Name *</label>
                    <input type="text" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Category *</label>
                    <input type="text" value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Competency Area</label>
                    <input type="text" value={newSkill.competencyArea} onChange={e => setNewSkill({...newSkill, competencyArea: e.target.value})} className={inputClass} />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Priority</label>
                    <div className="relative">
                      <select value={newSkill.priority} onChange={e => setNewSkill({...newSkill, priority: e.target.value})} className={`${inputClass} appearance-none pr-10`}>
                        <option value="core">Core</option>
                        <option value="secondary">Secondary</option>
                        <option value="optional">Optional</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-admin-text-muted">▼</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-3 cursor-pointer font-bold text-[13px] text-admin-text">
                      <input type="checkbox" checked={newSkill.isMandatory} onChange={e => setNewSkill({...newSkill, isMandatory: e.target.checked})} className="w-5 h-5 accent-admin-primary rounded border-admin-border" />
                      Mandatory Requirement
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>Weightage (%)</label>
                    <input type="number" min="0" max="100" value={newSkill.weightage} onChange={e => setNewSkill({...newSkill, weightage: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Req. Proficiency (%)</label>
                    <input type="number" min="0" max="100" value={newSkill.requiredProficiency} onChange={e => setNewSkill({...newSkill, requiredProficiency: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex gap-3 justify-end p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <button onClick={() => setCreateModalOpen(false)} className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addSkill} disabled={isSubmitting || !newSkill.name || !newSkill.category} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  Add Node
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingSkill && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSkill(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border">
              
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 md:px-8 border-b border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <h2 className="text-[20px] font-black text-admin-text">Edit Skill</h2>
                <button onClick={() => setEditingSkill(null)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Skill Name *</label>
                    <input type="text" value={editSkillData.name} onChange={e => setEditSkillData({...editSkillData, name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Category *</label>
                    <input type="text" value={editSkillData.category} onChange={e => setEditSkillData({...editSkillData, category: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Competency Area</label>
                    <input type="text" value={editSkillData.competencyArea} onChange={e => setEditSkillData({...editSkillData, competencyArea: e.target.value})} className={inputClass} />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Priority</label>
                    <div className="relative">
                      <select value={editSkillData.priority} onChange={e => setEditSkillData({...editSkillData, priority: e.target.value})} className={`${inputClass} appearance-none pr-10`}>
                        <option value="core">Core</option>
                        <option value="secondary">Secondary</option>
                        <option value="optional">Optional</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-admin-text-muted">▼</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-3 cursor-pointer font-bold text-[13px] text-admin-text">
                      <input type="checkbox" checked={editSkillData.isMandatory} onChange={e => setEditSkillData({...editSkillData, isMandatory: e.target.checked})} className="w-5 h-5 accent-admin-primary rounded border-admin-border" />
                      Mandatory Requirement
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>Weightage (%)</label>
                    <input type="number" min="0" max="100" value={editSkillData.weightage} onChange={e => setEditSkillData({...editSkillData, weightage: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Req. Proficiency (%)</label>
                    <input type="number" min="0" max="100" value={editSkillData.requiredProficiency} onChange={e => setEditSkillData({...editSkillData, requiredProficiency: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex gap-3 justify-end p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
                <button onClick={() => setEditingSkill(null)} className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={updateSkill} disabled={isSubmitting || !editSkillData.name || !editSkillData.category} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREREQUISITES MODAL */}
      <AnimatePresence>
        {prereqSkill && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrereqSkill(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-[24px] shadow-2xl border bg-admin-surface-floating border-admin-border">
              <div className="p-6 border-b border-admin-border/50">
                <h2 className="text-[20px] font-black mb-1 text-admin-text">Set Prerequisites</h2>
                <p className="text-[10px] font-bold text-admin-primary uppercase tracking-widest">{prereqSkill.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {(skillsMap[selectedRoleId] || []).filter(s => s._id !== prereqSkill._id).map(s => (
                  <label key={s._id} className={`flex items-center gap-4 p-4 rounded-[16px] cursor-pointer border transition-colors ${selectedPrereqs.includes(s._id) ? 'bg-admin-primary-light border-admin-primary/40 shadow-sm' : 'bg-admin-surface border-admin-border/50 hover:border-admin-border'}`}>
                    <input
                      type="checkbox"
                      checked={selectedPrereqs.includes(s._id)}
                      onChange={(e) => e.target.checked ? setSelectedPrereqs([...selectedPrereqs, s._id]) : setSelectedPrereqs(selectedPrereqs.filter((id) => id !== s._id))}
                      className="w-5 h-5 accent-admin-primary rounded border-admin-border"
                    />
                    <span className="font-bold text-[13px] flex-1 text-admin-text tracking-tight">{s.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${priorityStyle[s.priority] || priorityStyle.core}`}>{s.priority || "Core"}</span>
                  </label>
                ))}
              </div>
              <div className="p-6 border-t border-admin-border/50 flex gap-3 justify-end bg-admin-surface-floating/90 backdrop-blur-md">
                <button onClick={() => setPrereqSkill(null)} className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={updatePrerequisites} disabled={isSubmitting} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  Save Flow
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {skillToDelete && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSkillToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="relative w-full max-w-sm p-8 rounded-[24px] shadow-2xl border text-center bg-admin-surface-floating border-admin-border">
              <div className="w-16 h-16 rounded-[20px] bg-admin-danger-light text-admin-danger flex items-center justify-center mx-auto mb-6 border border-admin-danger/20">
                <TrashIcon className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] font-black mb-2 text-admin-text">Delete Skill?</h3>
              <p className="text-[13px] mb-2 font-bold text-admin-text px-4 py-2 bg-admin-bg rounded-lg border border-admin-border/50 inline-block">{skillToDelete.name}</p>
              <p className="text-[12px] mb-8 mt-4 text-admin-text-muted font-medium">
                This skill will be removed from this Matrix. Prerequisite references will be updated automatically.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setSkillToDelete(null)} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmDeleteSkill} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold bg-admin-danger hover:bg-admin-danger/90 text-white transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportSuccess={handleImportSuccess} />
    </div>
  );
};

export default Skills;
