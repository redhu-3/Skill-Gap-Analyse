// frontend/src/pages/admin/resume/KeywordMapping.jsx
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
} from "@heroicons/react/24/outline";

const KeywordMapping = () => {
  const { darkMode } = useTheme();
  const [keywords, setKeywords] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    keyword: "",
    skill: "",
  });

  useEffect(() => {
    fetchKeywords();
    fetchSkills();
  }, []);

  const fetchKeywords = async (searchVal = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/resume-intelligence/keywords?search=${searchVal}`);
      setKeywords(res.data.keywords);
    } catch (err) {
      showToast("Failed to fetch keyword mappings.", "error");
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
    fetchKeywords(val);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ keyword: "", skill: skills[0]?._id || "" });
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      keyword: item.keyword,
      skill: item.skill?._id || item.skill || "",
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keyword.trim() || !formData.skill) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/admin/resume-intelligence/keywords/${editingId}`, formData);
        showToast("Keyword mapping updated successfully!", "success");
      } else {
        await axiosInstance.post("/admin/resume-intelligence/keywords", formData);
        showToast("Keyword mapping created successfully!", "success");
      }
      setShowFormModal(false);
      fetchKeywords(search);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save keyword mapping.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this keyword mapping?")) return;
    try {
      await axiosInstance.delete(`/admin/resume-intelligence/keywords/${id}`);
      showToast("Keyword mapping deleted successfully!", "success");
      fetchKeywords(search);
    } catch (err) {
      showToast("Failed to delete keyword mapping.", "error");
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
            Resume Keyword Mapping
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Map professional skills terminology and buzzwords to their target skills.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md"
        >
          <PlusIcon className="w-4 h-4" />
          Add Keyword Mapping
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4 max-w-md">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 opacity-45" />
          <input
            type="text"
            placeholder="Search keywords..."
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

      {/* Keyword Table */}
      {!loading && (
        <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${darkMode ? "bg-gray-900/60" : "bg-gray-50"}`}>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60">Resume Term / Keyword</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60">Maps To Skill</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60">Category</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/25">
                {keywords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-sm opacity-50">
                      No keyword mappings found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  keywords.map((item) => (
                    <tr key={item._id} className={`transition-colors ${darkMode ? "hover:bg-gray-800/40" : "hover:bg-gray-50"}`}>
                      <td className="p-4 text-sm font-semibold">{item.keyword}</td>
                      <td className="p-4 text-sm font-medium text-indigo-400">
                        {item.skill?.name || "Deleted Skill"}
                      </td>
                      <td className="p-4 text-sm opacity-70">
                        {item.skill?.category || "N/A"}
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
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">
              {editingId ? "Edit Keyword Mapping" : "Add Keyword Mapping"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Resume Term / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. REST API"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Maps To Skill</label>
                <select
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  className={inputClass}
                >
                  <option value="" disabled>Select target skill</option>
                  {skills.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
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
                  {editingId ? "Save Changes" : "Create Mapping"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KeywordMapping;
