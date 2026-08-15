// frontend/src/pages/admin/resume/ProjectMapping.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useTheme } from "../../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const ProjectMapping = () => {
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    projectPattern: "",
    mappedSkills: [],
  });

  useEffect(() => {
    fetchProjects();
    fetchSkills();
  }, []);

  const fetchProjects = async (searchVal = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/resume-intelligence/projects?search=${searchVal}`);
      setProjects(res.data.projects);
    } catch (err) {
      showToast("Failed to fetch project mappings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axiosInstance.get("/skills");
      setSkills(res.data.skills);
    } catch (err) {
      showToast("Failed to fetch skills.", "error");
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchProjects(val);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ projectPattern: "", mappedSkills: [] });
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      projectPattern: item.projectPattern,
      mappedSkills: item.mappedSkills.map(sk => sk._id || sk),
    });
    setShowFormModal(true);
  };

  const handleToggleSkill = (skillId) => {
    const selected = [...formData.mappedSkills];
    const index = selected.indexOf(skillId);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(skillId);
    }
    setFormData({ ...formData, mappedSkills: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectPattern.trim() || formData.mappedSkills.length === 0) {
      showToast("Please provide a project phrase and select at least one skill.", "error");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/admin/resume-intelligence/projects/${editingId}`, formData);
        showToast("Project mapping updated successfully!", "success");
      } else {
        await axiosInstance.post("/admin/resume-intelligence/projects", formData);
        showToast("Project mapping created successfully!", "success");
      }
      setShowFormModal(false);
      fetchProjects(search);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save project mapping.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project mapping?")) return;
    try {
      await axiosInstance.delete(`/admin/resume-intelligence/projects/${id}`);
      showToast("Project mapping deleted successfully!", "success");
      fetchProjects(search);
    } catch (err) {
      showToast("Failed to delete project mapping.", "error");
    }
  };

  const cardBg = darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200";
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
    darkMode ? "bg-gray-900 border-gray-600 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-300 focus:border-indigo-500"
  }`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-55 via-white to-violet-55 text-gray-900"
    }`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium border ${
              toast.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {toast.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            📋 Resume Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Project Mappings
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Associate common project names and patterns with the technology skills they demonstrate.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md"
        >
          <PlusIcon className="w-4 h-4" />
          Add Project Mapping
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4 max-w-md">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 opacity-45" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={handleSearchChange}
            className={`pl-10 ${inputClass}`}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Table list */}
      {!loading && (
        <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${darkMode ? "bg-gray-900/60" : "bg-gray-50"}`}>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60">Project Title / Pattern</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60">Associated Skills</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/25">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-sm opacity-50">
                      No projects found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  projects.map((item) => (
                    <tr key={item._id} className={`transition-colors ${darkMode ? "hover:bg-gray-800/40" : "hover:bg-gray-50"}`}>
                      <td className="p-4 text-sm font-semibold">{item.projectPattern}</td>
                      <td className="p-4 text-sm">
                        <div className="flex flex-wrap gap-1.5">
                          {item.mappedSkills.map((sk) => (
                            <span
                              key={sk._id || sk}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            >
                              <TagIcon className="w-3 h-3" />
                              {sk.name || "Unknown Skill"}
                            </span>
                          ))}
                          {item.mappedSkills.length === 0 && <span className="text-xs opacity-50">None</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">
              {editingId ? "Edit Project Mapping" : "Add Project Mapping"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Project Title Pattern</label>
                <input
                  type="text"
                  placeholder="e.g. E-Commerce Application"
                  value={formData.projectPattern}
                  onChange={(e) => setFormData({ ...formData, projectPattern: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 opacity-70">Associate Skills</label>
                <div className={`grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 rounded-xl border ${
                  darkMode ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"
                }`}>
                  {skills.map((s) => {
                    const isChecked = formData.mappedSkills.includes(s._id);
                    return (
                      <label
                        key={s._id}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition ${
                          isChecked
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : darkMode ? "bg-gray-900 hover:bg-gray-850 text-gray-400 border border-transparent" : "bg-white hover:bg-gray-100 text-gray-700 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSkill(s._id)}
                          className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-150 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  {editingId ? "Save Changes" : "Create Project Mapping"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectMapping;
