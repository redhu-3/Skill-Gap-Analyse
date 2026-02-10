
// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../api/axiosInstance"; // centralized axios
// import { useTheme } from "../../context/ThemeContext";

// const Skills = () => {
//   const { darkMode } = useTheme();

//   // State
//   const [jobRoles, setJobRoles] = useState([]);
//   const [skillsMap, setSkillsMap] = useState({}); // {roleId: [skills]}
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Search
//   const [searchQuery, setSearchQuery] = useState("");

//   // Add Job Role
//   const [newJobRoleName, setNewJobRoleName] = useState("");
//   const [newJobRoleDesc, setNewJobRoleDesc] = useState("");

//   // Add Skill
//   const [newSkill, setNewSkill] = useState({
//     name: "",
//     category: "",
//     requiredProficiency: 0,
//   });
//   const [selectedRoleForSkill, setSelectedRoleForSkill] = useState(null);

//   // Edit Skill
//   const [editingSkill, setEditingSkill] = useState(null);
//   const [editSkillData, setEditSkillData] = useState({
//     name: "",
//     category: "",
//     requiredProficiency: 0,
//   });

//   // Prerequisites
//   const [prereqSkill, setPrereqSkill] = useState(null);
//   const [selectedPrereqs, setSelectedPrereqs] = useState([]);
  

//   // Fetch all job roles
//   const fetchJobRoles = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get("/job-roles");
//       setJobRoles(res.data.roles);

//       // Fetch skills for each role
//       res.data.roles.forEach(async (role) => {
//         await fetchSkills(role._id);
//       });
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch job roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch skills for a role
//   const fetchSkills = async (roleId) => {
//     try {
//       const res = await axiosInstance.get(`/skills/job-role/${roleId}`);
//       setSkillsMap((prev) => ({ ...prev, [roleId]: res.data.skills }));
//     } catch (err) {
//       console.error("Failed to fetch skills", err);
//     }
//   };

//   // Add new job role
//   const addJobRole = async () => {
//     if (!newJobRoleName || !newJobRoleDesc) return alert("All fields required");
//     try {
//       const res = await axiosInstance.post("/job-roles/create", {
//         name: newJobRoleName,
//         description: newJobRoleDesc,
//       });
//       setJobRoles([...jobRoles, res.data.role]);
//       setNewJobRoleName("");
//       setNewJobRoleDesc("");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to add job role");
//     }
//   };

//   // Add new skill
//   const addSkill = async (roleId) => {
//     const { name, category, requiredProficiency } = newSkill;
//     if (!name || !category || !requiredProficiency) return alert("All fields required");
//     try {
//       const res = await axiosInstance.post(`/skills/create`, {
//         name,
//         category,
//         requiredProficiency,
//         jobRoleId: roleId,
//       });
//       setSkillsMap((prev) => ({
//         ...prev,
//         [roleId]: [res.data.skill, ...(prev[roleId] || [])],
//       }));
//       setNewSkill({ name: "", category: "", requiredProficiency: 0 });
//       setSelectedRoleForSkill(null);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to add skill");
//     }
//   };

//   // Open edit skill modal
//   const openEditModal = (skill) => {
//     setEditingSkill(skill);
//     setEditSkillData({
//       name: skill.name,
//       category: skill.category,
//       requiredProficiency: skill.requiredProficiency,
//     });
//   };

//   // Update skill
//   const updateSkill = async () => {
//     try {
//       await axiosInstance.put(`/skills/update/${editingSkill._id}`, editSkillData);
//       fetchSkills(editingSkill.jobRoleId);
//       setEditingSkill(null);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update skill");
//     }
//   };

//   // Open prerequisites modal
//   const openPrereqModal = async (skill) => {
//   setPrereqSkill(skill);

//   const roleId =
//     typeof skill.jobRole === "object"
//       ? skill.jobRole._id
//       : skill.jobRole;

//   try {
//     // Always fetch fresh skills for this role
//     const res = await axiosInstance.get(
//       `/skills/job-role/${roleId}`
//     );

//     setSkillsMap((prev) => ({
//       ...prev,
//       [roleId]: res.data.skills,
//     }));

//     // Pre-select existing prerequisites
//     setSelectedPrereqs(
//       (skill.prerequisites || []).map((p) =>
//         typeof p === "object" ? p._id : p
//       )
//     );
//   } catch (err) {
//     alert("Failed to load prerequisite skills");
//   }
// };


//   // Update prerequisites
//   const updatePrerequisites = async () => {
//     try {
//       await axiosInstance.put(`/skills/prerequisites/${prereqSkill._id}`, {
//         prerequisiteIds: selectedPrereqs,
//       });
//       fetchSkills(prereqSkill.jobRoleId);
//       setPrereqSkill(null);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update prerequisites");
//     }
//   };

//   useEffect(() => {
//     fetchJobRoles();
//   }, []);

//   // Filter job roles by search
//   const filteredRoles = jobRoles.filter((role) =>
//     role.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className={`p-6 min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
//       <h1 className="text-3xl font-bold mb-6">Skill Management</h1>

//       {/* Search */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Search job roles..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full md:w-1/2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {loading && <p>Loading...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {/* Job Roles */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {filteredRoles.map((role) => (
//           <div key={role._id} className={`p-5 rounded-2xl shadow transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
//             <h2 className="text-xl font-semibold mb-4">{role.name}</h2>
//             <p className="text-gray-500 mb-4">{role.description}</p>

//             {/* Skills */}
//             <div className="grid md:grid-cols-2 gap-4">
//               {(skillsMap[role._id] || []).map((skill, idx) => (
//                 <div key={skill._id} className={`p-3 rounded-lg shadow hover:shadow-lg relative ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
//                   <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
//                     {idx + 1}
//                   </div>

//                   <h3 className="font-semibold">{skill.name}</h3>
//                   <p className="text-sm">Category: {skill.category}</p>
//                   <p className="text-sm">Proficiency: {skill.requiredProficiency}%</p>
//                   <p className="text-sm">
//                     Prerequisites: {(skill.prerequisites || []).map((s) => s.name).join(", ") || "None"}
//                   </p>

//                   <div className="flex gap-2 mt-2">
//                     <button
//                       onClick={() => openEditModal(skill)}
//                       className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => openPrereqModal(skill)}
//                       className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
//                     >
//                       Prerequisites
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Add Skill */}
//             {selectedRoleForSkill === role._id ? (
//               <div className="mt-4 p-3 rounded-lg border border-dashed">
//                 <input
//                   type="text"
//                   placeholder="Skill Name"
//                   value={newSkill.name}
//                   onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
//                   className="mb-2 w-full p-2 rounded border"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Category"
//                   value={newSkill.category}
//                   onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
//                   className="mb-2 w-full p-2 rounded border"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Required Proficiency"
//                   value={newSkill.requiredProficiency}
//                   onChange={(e) => setNewSkill({ ...newSkill, requiredProficiency: e.target.value })}
//                   className="mb-2 w-full p-2 rounded border"
//                 />
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => addSkill(role._id)}
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                   >
//                     Add Skill
//                   </button>
//                   <button
//                     onClick={() => setSelectedRoleForSkill(null)}
//                     className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <button
//                 onClick={() => setSelectedRoleForSkill(role._id)}
//                 className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 Add New Skill
//               </button>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Add New Job Role */}
//       <div className={`mt-6 p-5 rounded-2xl shadow transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
//         <h2 className="text-xl font-semibold mb-3">Add New Job Role</h2>
//         <input
//           type="text"
//           placeholder="Role Name"
//           value={newJobRoleName}
//           onChange={(e) => setNewJobRoleName(e.target.value)}
//           className="mb-2 w-full p-2 rounded border"
//         />
//         <input
//           type="text"
//           placeholder="Description"
//           value={newJobRoleDesc}
//           onChange={(e) => setNewJobRoleDesc(e.target.value)}
//           className="mb-2 w-full p-2 rounded border"
//         />
//         <button
//           onClick={addJobRole}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Add Job Role
//         </button>
//       </div>

//       {/* Edit Skill Modal */}
//       {editingSkill && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className={`p-6 rounded-2xl w-full max-w-md shadow-xl transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
//             <h2 className="text-xl font-semibold mb-4">Edit Skill</h2>
//             <input
//               value={editSkillData.name}
//               onChange={(e) => setEditSkillData({ ...editSkillData, name: e.target.value })}
//               className="w-full mb-3 p-2 rounded border"
//               placeholder="Skill Name"
//             />
//             <input
//               value={editSkillData.category}
//               onChange={(e) => setEditSkillData({ ...editSkillData, category: e.target.value })}
//               className="w-full mb-3 p-2 rounded border"
//               placeholder="Category"
//             />
//             <input
//               type="number"
//               value={editSkillData.requiredProficiency}
//               onChange={(e) => setEditSkillData({ ...editSkillData, requiredProficiency: e.target.value })}
//               className="w-full mb-4 p-2 rounded border"
//               placeholder="Required Proficiency"
//             />
//             <div className="flex justify-end gap-3">
//               <button onClick={() => setEditingSkill(null)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
//               <button onClick={updateSkill} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Prerequisites Modal */}
//      {/* Prerequisites Modal */}
// {prereqSkill && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//     <div className={`p-6 rounded-2xl w-full max-w-md shadow-xl transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
//       <h2 className="text-xl font-semibold mb-4">Set Prerequisites for {prereqSkill.name}</h2>

//       <div className="max-h-64 overflow-y-auto mb-4">
//         {(skillsMap[prereqSkill.jobRoleId] || [])
//           .filter((s) => s._id !== prereqSkill._id) // exclude current skill
//           .map((s) => (
//             <label key={s._id} className="flex items-center gap-2 mb-2">
//               <input
//                 type="checkbox"
//                 checked={selectedPrereqs.includes(s._id)}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedPrereqs([...selectedPrereqs, s._id]);
//                   } else {
//                     setSelectedPrereqs(selectedPrereqs.filter(id => id !== s._id));
//                   }
//                 }}
//                 className="w-4 h-4 accent-purple-600"
//               />
//               <span className="px-2 py-1 bg-gray-200 rounded">{s.name}</span>
//             </label>
//           ))}
//       </div>

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={() => setPrereqSkill(null)}
//           className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={updatePrerequisites}
//           className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
//         >
//           Save
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default Skills;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const Skills = () => {
  const { darkMode } = useTheme();

  const [jobRoles, setJobRoles] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    requiredProficiency: 0,
  });
  const [selectedRoleForSkill, setSelectedRoleForSkill] = useState(null);

  const [editingSkill, setEditingSkill] = useState(null);
  const [editSkillData, setEditSkillData] = useState({
    name: "",
    category: "",
    requiredProficiency: 0,
  });

  const [prereqSkill, setPrereqSkill] = useState(null);
  const [selectedPrereqs, setSelectedPrereqs] = useState([]);

  /* ---------------- FETCH ---------------- */

  const fetchJobRoles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/job-roles");
      setJobRoles(res.data.roles);

      res.data.roles.forEach((role) => {
        fetchSkills(role._id);
      });
    } catch (err) {
      setError("Failed to fetch job roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (roleId) => {
    const res = await axiosInstance.get(`/skills/job-role/${roleId}`);
    setSkillsMap((prev) => ({ ...prev, [roleId]: res.data.skills }));
  };

  useEffect(() => {
    fetchJobRoles();
  }, []);

  /* ---------------- ADD SKILL ---------------- */

  const addSkill = async (roleId) => {
    const { name, category, requiredProficiency } = newSkill;
    if (!name || !category) return alert("All fields required");

    const res = await axiosInstance.post("/skills/create", {
      ...newSkill,
      jobRoleId: roleId,
    });

    setSkillsMap((prev) => ({
      ...prev,
      [roleId]: [res.data.skill, ...(prev[roleId] || [])],
    }));

    setNewSkill({ name: "", category: "", requiredProficiency: 0 });
    setSelectedRoleForSkill(null);
  };

  /* ---------------- EDIT SKILL ---------------- */

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setEditSkillData({
      name: skill.name,
      category: skill.category,
      requiredProficiency: skill.requiredProficiency,
    });
  };

  const updateSkill = async () => {
    await axiosInstance.put(
      `/skills/update/${editingSkill._id}`,
      editSkillData
    );

    const roleId =
      typeof editingSkill.jobRole === "object"
        ? editingSkill.jobRole._id
        : editingSkill.jobRole;

    fetchSkills(roleId);
    setEditingSkill(null);
  };

  /* ---------------- PREREQUISITES ---------------- */

  const openPrereqModal = async (skill) => {
    setPrereqSkill(skill);

    const roleId =
      typeof skill.jobRole === "object"
        ? skill.jobRole._id
        : skill.jobRole;

    await fetchSkills(roleId);

    setSelectedPrereqs(
      (skill.prerequisites || []).map((p) =>
        typeof p === "object" ? p._id : p
      )
    );
  };

  const updatePrerequisites = async () => {
    await axiosInstance.put(
      `/skills/prerequisites/${prereqSkill._id}`,
      { prerequisiteIds: selectedPrereqs }
    );

    const roleId =
      typeof prereqSkill.jobRole === "object"
        ? prereqSkill.jobRole._id
        : prereqSkill.jobRole;

    fetchSkills(roleId);
    setPrereqSkill(null);
  };

  /* ---------------- UI ---------------- */

  const filteredRoles = jobRoles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`p-6 min-h-screen ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">Skill Management</h1>

      <input
        className="w-full md:w-1/2 p-3 rounded-lg border mb-6"
        placeholder="Search job roles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role._id}
            className={`p-5 rounded-2xl shadow ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">{role.name}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {(skillsMap[role._id] || []).map((skill, idx) => (
                <div
                  key={skill._id}
                  className={`p-3 rounded-lg shadow ${
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="font-semibold">{skill.name}</div>
                  <p className="text-sm">
                    Prerequisites:{" "}
                    {(skill.prerequisites || [])
                      .map((p) => {
                        const id = typeof p === "object" ? p._id : p;
                        return (
                          skillsMap[role._id]?.find((s) => s._id === id)
                            ?.name || "—"
                        );
                      })
                      .join(", ") || "None"}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openPrereqModal(skill)}
                      className="px-2 py-1 bg-purple-600 text-white rounded"
                    >
                      Prerequisites
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedRoleForSkill === role._id ? (
              <div className="mt-4">
                <input
                  className="w-full p-2 mb-2 border rounded"
                  placeholder="Skill Name"
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, name: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  placeholder="Category"
                  value={newSkill.category}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, category: e.target.value })
                  }
                />
                <button
                  onClick={() => addSkill(role._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Add Skill
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedRoleForSkill(role._id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              >
                Add New Skill
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PREREQ MODAL */}
      {prereqSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div
            className={`p-6 rounded-2xl w-full max-w-md ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              Set Prerequisites
            </h2>

            <div className="max-h-64 overflow-y-auto">
              {(skillsMap[
                typeof prereqSkill.jobRole === "object"
                  ? prereqSkill.jobRole._id
                  : prereqSkill.jobRole
              ] || [])
                .filter((s) => s._id !== prereqSkill._id)
                .map((s) => (
                  <label key={s._id} className="flex gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedPrereqs.includes(s._id)}
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedPrereqs([...selectedPrereqs, s._id])
                          : setSelectedPrereqs(
                              selectedPrereqs.filter((id) => id !== s._id)
                            )
                      }
                    />
                    {s.name}
                  </label>
                ))}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setPrereqSkill(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={updatePrerequisites}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
