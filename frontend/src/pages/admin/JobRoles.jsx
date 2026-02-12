// import React, { useEffect, useState } from "react";
// import axiosDash from "../../api/axiosDash";
// import { useTheme } from "../../context/ThemeContext";

// const JobRoles = () => {
//   const { darkMode } = useTheme(); // ✅ global theme
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");

//   const [editingRole, setEditingRole] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editDescription, setEditDescription] = useState("");

//   // Fetch roles
//   const fetchRoles = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosDash.get("/");
//       setRoles(res.data.roles);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create role
//   const createRole = async () => {
//     if (!name || !description) return alert("Name & description required!");
//     try {
//       const res = await axiosDash.post("/create", { name, description });
//       setRoles([res.data.role, ...roles]);
//       setName("");
//       setDescription("");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to create role");
//     }
//   };

//   // Publish role
//   const publishRole = async (id) => {
//     try {
//       await axiosDash.patch(`/${id}/publish`);
//       fetchRoles();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to publish role");
//     }
//   };

//   // Edit modal
//   const openEditModal = (role) => {
//     setEditingRole(role);
//     setEditName(role.name);
//     setEditDescription(role.description);
//   };

//   const updateRole = async () => {
//     try {
//       await axiosDash.put(`/${editingRole._id}`, {
//         name: editName,
//         description: editDescription,
//       });
//       setEditingRole(null);
//       fetchRoles();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update role");
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   return (
//     <div
//       className={`p-6 min-h-screen transition-colors duration-300 ${
//         darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
//       }`}
//     >
//       {/* PAGE TITLE */}
//       <h1 className="text-3xl font-bold mb-6">
//         Job Roles
//       </h1>

//       {/* CREATE ROLE */}
//       <div
//         className={`p-6 rounded-2xl shadow mb-8 transition-colors duration-300 ${
//           darkMode ? "bg-gray-900" : "bg-white"
//         }`}
//       >
//         <h2 className="text-xl font-semibold mb-4">
//           Add New Role
//         </h2>

//         <div className="flex flex-col md:flex-row gap-4">
//           <input
//             type="text"
//             placeholder="Role Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className={`flex-1 rounded-lg p-3 border transition-colors duration-300
//               ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700 focus:ring-blue-400" : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"}
//               focus:outline-none
//             `}
//           />

//           <input
//             type="text"
//             placeholder="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className={`flex-1 rounded-lg p-3 border transition-colors duration-300
//               ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700 focus:ring-blue-400" : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"}
//               focus:outline-none
//             `}
//           />

//           <button
//             onClick={createRole}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Create
//           </button>
//         </div>
//       </div>

//       {/* STATES */}
//       {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {/* ROLES GRID */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {!loading &&
//           !error &&
//           roles.map((role) => (
//             <div
//               key={role._id}
//               className={`p-5 rounded-2xl shadow hover:shadow-lg transition-colors duration-300 ${
//                 darkMode ? "bg-gray-900" : "bg-white"
//               }`}
//             >
//               <h3 className="text-lg font-bold mb-2">
//                 {role.name}
//               </h3>

//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 {role.description}
//               </p>

//               <span
//                 className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 transition-colors duration-300 ${
//                   role.status === "published"
//                     ? darkMode
//                       ? "bg-green-900 text-green-300"
//                       : "bg-green-100 text-green-700"
//                     : darkMode
//                     ? "bg-yellow-900 text-yellow-300"
//                     : "bg-yellow-100 text-yellow-700"
//                 }`}
//               >
//                 {role.status.toUpperCase()}
//               </span>

//               {role.status === "draft" && (
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => openEditModal(role)}
//                     className={`px-3 py-1 rounded transition-colors duration-300 ${
//                       darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
//                     }`}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => publishRole(role._id)}
//                     className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                   >
//                     Publish
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//       </div>

//       {/* EDIT MODAL */}
//       {editingRole && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div
//             className={`p-6 rounded-2xl w-full max-w-md shadow-xl transition-colors duration-300 ${
//               darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
//             }`}
//           >
//             <h2 className="text-xl font-semibold mb-4">
//               Edit Role
//             </h2>

//             <input
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//               className={`w-full mb-3 p-3 rounded-lg border transition-colors duration-300 ${
//                 darkMode
//                   ? "bg-gray-800 text-gray-100 border-gray-700 focus:ring-blue-400"
//                   : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
//               } focus:outline-none`}
//             />

//             <input
//               value={editDescription}
//               onChange={(e) => setEditDescription(e.target.value)}
//               className={`w-full mb-4 p-3 rounded-lg border transition-colors duration-300 ${
//                 darkMode
//                   ? "bg-gray-800 text-gray-100 border-gray-700 focus:ring-blue-400"
//                   : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
//               } focus:outline-none`}
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setEditingRole(null)}
//                 className={`px-4 py-2 rounded transition-colors duration-300 ${
//                   darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"
//                 }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={updateRole}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobRoles;
import React, { useEffect, useState } from "react";
import axiosDash from "../../api/axiosDash";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const JobRoles = () => {
  const { darkMode } = useTheme();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingRole, setEditingRole] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

  const createRole = async () => {
    if (!name || !description) return alert("Name & description required!");
    try {
      const res = await axiosDash.post("/create", { name, description });
      setRoles([res.data.role, ...roles]);
      setName("");
      setDescription("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create role");
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
  };

  const updateRole = async () => {
    try {
      await axiosDash.put(`/${editingRole._id}`, {
        name: editName,
        description: editDescription,
      });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div
      className={`relative min-h-screen p-8 overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-10 tracking-tight">
          Job Roles Management
        </h1>

        {/* CREATE ROLE CARD */}
        <div
          className={`relative p-8 rounded-3xl backdrop-blur-xl border shadow-xl mb-12 transition-all duration-500 ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white/80 border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold mb-6">Add New Role</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`flex-1 rounded-xl p-3 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02]
              ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`flex-1 rounded-xl p-3 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02]
              ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            />

            <button
              onClick={createRole}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Create Role
            </button>
          </div>
        </div>

        {/* STATES */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-gray-300/20 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {/* ROLES GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            !error &&
            roles.map((role) => (
              <motion.div
                key={role._id}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`relative p-6 rounded-3xl backdrop-blur-xl border shadow-lg transition-all duration-500 ${
                  darkMode
                    ? "bg-white/5 border-white/10"
                    : "bg-white/80 border-gray-200"
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{role.name}</h3>
                <p className="opacity-70 mb-4">{role.description}</p>

                <span
                  className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold mb-4 ${
                    role.status === "published"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full mr-2 animate-pulse bg-current"></span>
                  {role.status.toUpperCase()}
                </span>

                {role.status === "draft" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(role)}
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:scale-105 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => publishRole(role._id)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:scale-105 transition"
                    >
                      Publish
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`p-8 rounded-3xl w-full max-w-md shadow-2xl border ${
                darkMode
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold mb-6">Edit Role</h2>

              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mb-4 p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full mb-6 p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-white/10 hover:scale-105 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={updateRole}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:scale-105 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobRoles;
