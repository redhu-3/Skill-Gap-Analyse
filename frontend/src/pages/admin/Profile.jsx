import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { PencilIcon, CameraIcon, XMarkIcon, CheckIcon, UserIcon, EnvelopeIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const Profile = () => {
  const { darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/profile");
      setProfile(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        password: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await axiosInstance.put("/admin/profile", form);
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in">
        <div className="flex flex-col items-center gap-4 text-admin-text-muted">
          <div className="w-12 h-12 border-4 border-admin-primary border-t-transparent rounded-full animate-spin" />
          <p className="opacity-60 text-[13px] font-bold uppercase tracking-widest">Loading profile…</p>
        </div>
      </div>
    );
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border text-[13px] font-medium transition-all bg-admin-bg border-admin-border text-admin-text placeholder-admin-text-muted focus:border-admin-primary focus:ring-1 focus:ring-admin-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`;
  const labelClass = "block text-[11px] font-bold uppercase tracking-widest mb-2 text-admin-text-muted";

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 transition-all duration-500 animate-in fade-in">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-2 mb-2">
          <UserIcon className="w-5 h-5 text-admin-primary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-admin-primary">Administration</span>
        </div>
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-admin-text">Profile Settings</h1>
        <p className="mt-2 text-[13px] md:text-[14px] font-medium text-admin-text-muted">
          Manage your personal information and security credentials.
        </p>
      </motion.div>

      {/* CARD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto rounded-[32px] shadow-sm border overflow-hidden bg-admin-surface border-admin-border transition-all"
      >
        {/* COVER */}
        <div className="h-32 sm:h-48 bg-admin-primary/20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-admin-surface to-transparent"></div>
        </div>

        {/* CONTENT */}
        <div className="relative px-6 sm:px-12 pb-12">
          {/* AVATAR AND ACTIONS HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 mb-8 gap-6">
            
            {/* AVATAR */}
            <div className="relative flex justify-center sm:justify-start">
              <div className="relative group">
                <img
                  src={preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="profile"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-[24px] border-4 border-admin-surface bg-admin-bg object-cover shadow-md"
                />

                {editMode && (
                  <label className="absolute -bottom-2 -right-2 bg-admin-primary text-white p-2.5 rounded-xl cursor-pointer shadow-lg hover:-translate-y-0.5 transition hover:bg-admin-primary-hover">
                    <CameraIcon className="w-5 h-5" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-center sm:justify-end gap-3 w-full sm:w-auto">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-admin-primary text-white rounded-xl text-[13px] font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary-hover transition hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  <PencilIcon className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                       setEditMode(false);
                       setForm({name: profile.name, email: profile.email, password: ""});
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold bg-admin-bg text-admin-text hover:bg-admin-border transition w-full sm:w-auto"
                  >
                    <XMarkIcon className="w-4 h-4" /> Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : <><CheckIcon className="w-4 h-4" /> Save Changes</>}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* NAME */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5"/> Full Name</span>
              </label>
              <input
                disabled={!editMode}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><EnvelopeIcon className="w-3.5 h-3.5"/> Email Address</span>
              </label>
              <input
                disabled
                value={form.email}
                className={inputClass}
              />
              {editMode && <p className="text-[10px] text-admin-text-muted mt-2 ml-1">Email cannot be changed.</p>}
            </div>

            {/* PASSWORD */}
            {editMode && (
              <div className="md:col-span-2 p-5 rounded-2xl border border-admin-border bg-admin-bg/50">
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><KeyIcon className="w-3.5 h-3.5"/> New Password</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* ACCOUNT INFO CARD */}
          <div className="mt-12 pt-8 border-t border-admin-border flex flex-col md:flex-row gap-4">
             <div className="flex-1 p-5 rounded-2xl border border-admin-border bg-admin-bg flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Account Status</p>
                  <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">Active Admin</p>
               </div>
             </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
