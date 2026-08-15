// frontend/src/pages/admin/ResourceManager.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LinkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BookmarkIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

const ResourceManager = () => {
  const { darkMode } = useTheme();

  const [resources, setResources] = useState([]);
  const [skills, setSkills] = useState([]);

  // Form states
  const [selectedSkill, setSelectedSkill] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("course");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [editingResourceId, setEditingResourceId] = useState(null);

  // Statuses
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resRes, skillsRes] = await Promise.all([
        axiosInstance.get("/admin/learning/resources"),
        axiosInstance.get("/skills")
      ]);

      setResources(resRes.data.resources || []);
      const skillList = skillsRes.data.skills || skillsRes.data || [];
      setSkills(skillList);
      if (skillList.length > 0) setSelectedSkill(skillList[0]._id);
    } catch (err) {
      setError("Failed to load learning resources.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return showToast("Title and URL are required.", "error");

    setSaving(true);
    try {
      const payload = {
        resourceId: editingResourceId,
        skill: selectedSkill,
        title,
        type,
        url,
        description,
        estimatedDurationMins: durationMins
      };

      await axiosInstance.post("/admin/learning/resources", payload);
      showToast("Learning Resource saved successfully!", "success");
      clearForm();
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save resource.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this learning resource?")) return;
    try {
      await axiosInstance.delete(`/admin/learning/resources/${id}`);
      showToast("Resource deleted successfully.", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to delete resource.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearForm = () => {
    setTitle("");
    setType("course");
    setUrl("");
    setDescription("");
    setDurationMins(60);
    setEditingResourceId(null);
  };

  const loadResourceIntoForm = (res) => {
    setEditingResourceId(res._id);
    setSelectedSkill(res.skill?._id || res.skill);
    setTitle(res.title);
    setType(res.type);
    setUrl(res.url);
    setDescription(res.description || "");
    setDurationMins(res.estimatedDurationMins || 60);
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
    darkMode ? "bg-gray-900 border-gray-600 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-300 focus:border-indigo-500"
  }`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
               : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900"
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          📚 Resources
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Learning Resource Manager
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Associate courses, videos, tutorials, MDN articles, and platforms with specific target skills.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm border bg-rose-500/10 text-rose-400 border-rose-500/20">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Add / Edit Resource Form */}
          <div className="xl:col-span-1 space-y-4">
            <div className={base}>
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5 text-indigo-400" />
                {editingResourceId ? "Edit Resource" : "Add Resource"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Target Skill</label>
                  <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className={inputClass}>
                    {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Resource Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. JS Complete Tutorial"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
                    <option value="course">Course</option>
                    <option value="video">Video</option>
                    <option value="documentation">Documentation</option>
                    <option value="article">Article</option>
                    <option value="practice_platform">Practice Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Resource URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={e => setDurationMins(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-70">Short Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows="3"
                    className={inputClass}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {editingResourceId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-md"
                  >
                    {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
                    {editingResourceId ? "Update" : "Add Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resources Table List */}
          <div className="xl:col-span-2 space-y-4">
            <div className={base}>
              <h2 className="text-lg font-bold mb-4">Resource Catalogue ({resources.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-700/30 font-semibold opacity-70">
                      <th className="py-3 px-4">Skill</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((res) => (
                      <tr key={res._id} className="border-b border-gray-700/10 hover:bg-gray-50/5">
                        <td className="py-3 px-4 font-semibold">{res.skill?.name || "Deleted Skill"}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={res.title}>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            {res.title}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            res.type === "course" ? "bg-indigo-500/10 text-indigo-400" :
                            res.type === "video" ? "bg-amber-500/10 text-amber-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {res.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs opacity-75">{res.estimatedDurationMins || 60} mins</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <button
                            onClick={() => loadResourceIntoForm(res)}
                            className="p-1.5 rounded-lg border border-transparent hover:bg-gray-700/20 text-indigo-400"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(res._id)}
                            className="p-1.5 rounded-lg border border-transparent hover:bg-rose-500/10 text-rose-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
