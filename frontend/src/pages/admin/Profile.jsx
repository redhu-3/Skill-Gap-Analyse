// import React, { useEffect, useState } from "react";
// import axiosDash from "../../api/axiosInstance";
// import { useTheme } from "../../context/ThemeContext";
// import { Pencil, Camera, X, Save } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";

// const Profile = () => {
//   const { darkMode } = useTheme();

//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);

//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     role: "admin",
//     createdAt: "",
//   });

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const [avatar, setAvatar] = useState(null);
//   const [preview, setPreview] = useState(null);

//   // ================= FETCH PROFILE =================
//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get("/admin/profile");
//       setProfile(res.data);
//       setForm({
//         name: res.data.name,
//         email: res.data.email,
//         password: "",
//       });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // ================= IMAGE HANDLER =================
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setAvatar(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   // ================= SAVE =================
//   const handleSave = async () => {
//     try {
//       await axiosInstance.put("/admin/profile", form);
//       setEditMode(false);
//       fetchProfile();
//     } catch (err) {
//       alert(err.response?.data?.message || "Update failed");
//     }
//   };

//   if (loading) return <p className="p-6">Loading...</p>;

//   return (
//     <div
//       className={`p-6 min-h-screen transition-colors duration-300 ${
//         darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
//       }`}
//     >
//       {/* PAGE TITLE */}
//       <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

//       {/* CARD */}
//       <div
//         className={`rounded-3xl overflow-hidden shadow-xl transition-colors duration-300 ${
//           darkMode ? "bg-gray-900" : "bg-white"
//         }`}
//       >
//         {/* COVER */}
//         <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative" />

//         {/* CONTENT */}
//         <div className="p-6 relative">
//           {/* AVATAR */}
//           <div className="absolute -top-16 left-6">
//             <div className="relative">
//               <img
//                 src={
//                   preview ||
//                   "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
//                 }
//                 alt="profile"
//                 className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover"
//               />

//               {editMode && (
//                 <label className="absolute bottom-2 right-2 bg-black/60 p-2 rounded-full cursor-pointer">
//                   <Camera size={16} />
//                   <input
//                     type="file"
//                     hidden
//                     accept="image/*"
//                     onChange={handleImageChange}
//                   />
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* ACTION BUTTONS */}
//           <div className="flex justify-end gap-3 mb-6">
//             {!editMode ? (
//               <button
//                 onClick={() => setEditMode(true)}
//                 className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 <Pencil size={16} /> Edit Profile
//               </button>
//             ) : (
//               <>
//                 <button
//                   onClick={() => setEditMode(false)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded transition ${
//                     darkMode
//                       ? "bg-gray-700 hover:bg-gray-600"
//                       : "bg-gray-200 hover:bg-gray-300"
//                   }`}
//                 >
//                   <X size={16} /> Cancel
//                 </button>

//                 <button
//                   onClick={handleSave}
//                   className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                 >
//                   <Save size={16} /> Save
//                 </button>
//               </>
//             )}
//           </div>

//           {/* FORM */}
//           <div className="grid md:grid-cols-2 gap-6 mt-12">
//             {/* NAME */}
//             <div>
//               <label className="text-sm font-medium">Full Name</label>
//               <input
//                 disabled={!editMode}
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm({ ...form, name: e.target.value })
//                 }
//                 className={`w-full mt-2 p-3 rounded-lg border transition ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700"
//                     : "bg-white border-gray-300"
//                 }`}
//               />
//             </div>

//             {/* EMAIL */}
//             <div>
//               <label className="text-sm font-medium">Email Address</label>
//               <input
//                 disabled
//                 value={form.email}
//                 className={`w-full mt-2 p-3 rounded-lg border ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700"
//                     : "bg-gray-100 border-gray-300"
//                 }`}
//               />
//             </div>

//             {/* PASSWORD */}
//             {editMode && (
//               <div>
//                 <label className="text-sm font-medium">
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm({ ...form, password: e.target.value })
//                   }
//                   placeholder="Leave empty to keep current"
//                   className={`w-full mt-2 p-3 rounded-lg border transition ${
//                     darkMode
//                       ? "bg-gray-800 border-gray-700"
//                       : "bg-white border-gray-300"
//                   }`}
//                 />
//               </div>
//             )}
//           </div>

//           {/* ACCOUNT INFO */}
//           <div className="mt-10 border-t pt-6">
//             <h3 className="font-semibold mb-4">Account Information</h3>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div
//                 className={`p-4 rounded-xl ${
//                   darkMode ? "bg-gray-800" : "bg-gray-100"
//                 }`}
//               >
//                 <p className="text-sm text-gray-400">Account Status</p>
//                 <p className="text-green-500 font-semibold">Active</p>
//               </div>

//               <div
//                 className={`p-4 rounded-xl ${
//                   darkMode ? "bg-gray-800" : "bg-gray-100"
//                 }`}
//               >
//                 <p className="text-sm text-gray-400">Member Since</p>
//                 <p className="font-semibold">
//                   {new Date(profile.createdAt).toLocaleDateString(
//                     "en-US",
//                     { month: "long", year: "numeric" }
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { Pencil, Camera, X, Save } from "lucide-react";

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
      await axiosInstance.put("/admin/profile", form);
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div
      className={`min-h-screen px-4 py-8 transition-colors ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 max-w-4xl mx-auto">
        Profile Settings
      </h1>

      {/* CARD CONTAINER */}
      <div
        className={`max-w-4xl mx-auto rounded-3xl shadow-xl overflow-hidden ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* COVER */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-indigo-600" />

        {/* CONTENT */}
        <div className="relative px-6 sm:px-10 pb-10">
          {/* AVATAR */}
          <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
            <div className="relative">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover"
              />

              {editMode && (
                <label className="absolute bottom-1 right-1 bg-black/60 p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 mb-8">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Pencil size={16} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <X size={16} /> Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={16} /> Save
                </button>
              </>
            )}
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input
                disabled={!editMode}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={`w-full mt-2 p-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <input
                disabled
                value={form.email}
                className={`w-full mt-2 p-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-100 border-gray-300"
                }`}
              />
            </div>

            {/* PASSWORD */}
            {editMode && (
              <div>
                <label className="text-sm font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Leave empty to keep current"
                  className={`w-full mt-2 p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>
            )}
          </div>

          {/* ACCOUNT INFO (SIMPLIFIED) */}
          <div className="mt-10 border-t pt-6">
            <h3 className="font-semibold mb-3">Account Status</h3>
            <div
              className={`p-4 rounded-xl inline-block ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <p className="text-green-500 font-semibold">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
