

// // // import React, { useEffect, useState } from "react";
// // // import { useNavigate, useParams } from "react-router-dom";
// // // import axiosInstance from "../../api/axiosInstance";
// // // import { useTheme } from "../../context/ThemeContext";

// // // const SkillsPage = () => {
// // //   const { skillId } = useParams();
// // //   const navigate = useNavigate();
// // //   const { darkMode } = useTheme();

// // //   const [loading, setLoading] = useState(true);
// // //   const [skill, setSkill] = useState(null);
// // //   const [assessments, setAssessments] = useState([]);
// // //   const [error, setError] = useState("");

// // //   // 🔥 NEW STATES
// // //   const [attemptData, setAttemptData] = useState(null);
// // //   const [showAttemptModal, setShowAttemptModal] = useState(false);

// // //   useEffect(() => {
// // //     if (!skillId) {
// // //       navigate("/job-roles");
// // //       return;
// // //     }
// // //     fetchSkillDetails();
// // //   }, [skillId]);

// // //   const fetchSkillDetails = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await axiosInstance.get(`/skills/${skillId}/details`);

// // //       if (res.data.skill.status === "locked") {
// // //         setError("This skill is locked. Complete previous skills to unlock it.");
// // //         return;
// // //       }

// // //       setSkill(res.data.skill);
// // //       setAssessments(res.data.assessments || []);
// // //     } catch (err) {
// // //       console.error("Failed to load skill details", err);
// // //       setError(
// // //         err.response?.data?.message || "Failed to fetch skill details."
// // //       );
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // 🔥 FETCH ATTEMPTS
// // //   const handleViewAttempts = async (assessmentId) => {
// // //     try {
// // //       const res = await axiosInstance.get(
// // //         `/assessments/attempts/${assessmentId}`
// // //       );

// // //       setAttemptData(res.data);
// // //       setShowAttemptModal(true);
// // //     } catch (err) {
// // //       console.error("Failed to fetch attempts", err);
// // //       alert("Could not load attempts.");
// // //     }
// // //   };

// // //   const handleStartAssessment = async (assessmentId) => {
// // //   try {
// // //     const res = await axiosInstance.get(
// // //       `/assessments/attempts/${assessmentId}`
// // //     );

// // //     if (res.data.attemptsLeft <= 0) {
// // //       alert("Maximum attempts reached. You cannot attempt this test again.");
// // //       return;
// // //     }

// // //     navigate(`/assessment/${assessmentId}`);
// // //   } catch (err) {
// // //     console.error("Error checking attempts", err);
// // //     alert("Unable to verify attempts. Try again.");
// // //   }
// // // };

// // //   if (loading) return <p className="p-10">Loading skill details...</p>;
// // //   if (error) return <p className="p-10 text-red-500">{error}</p>;
// // //   if (!skill) return <p className="p-10 text-gray-500">No skill found</p>;

// // //   return (
// // //     <div
// // //       className={`min-h-screen px-6 py-12 ${
// // //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
// // //       }`}
// // //     >
// // //       <div className="max-w-4xl mx-auto">
// // //         {/* SKILL INFO */}
// // //         <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
// // //         <p className="mb-2 opacity-70">
// // //           {skill.description || "No description"}
// // //         </p>
// // //         <p className="mb-6">
// // //           <strong>Status:</strong>{" "}
// // //           {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
// // //         </p>

// // //         {/* ASSESSMENTS */}
// // //         <h2 className="text-2xl font-semibold mb-4">Assessments</h2>

// // //         {assessments.length === 0 ? (
// // //           <p className="opacity-70">No assessments available</p>
// // //         ) : (
// // //           <div className="space-y-4">
// // //             {assessments.map((a) => (
// // //              <div
// // //     key={a._id}
// // //     className={`border rounded-2xl p-6 flex justify-between items-center ${
// // //       a.isCompleted
// // //         ? "bg-green-100 border-green-400"
// // //         : a.isLocked
// // //         ? "bg-gray-200 border-gray-300 opacity-70"
// // //         : darkMode
// // //         ? "bg-gray-800 border-gray-700"
// // //         : "bg-white border-gray-200"
// // //     }`}
// // //   >
// // //                 <div>
// // //                   <h3 className="font-semibold text-lg">
// // //                     {a.name} (Level {a.level})
// // //                   </h3>
// // //                   <p className="text-sm opacity-70">
// // //                     ⏱ Time: {a.timer / 60} minutes
// // //                   </p>
// // //                   <p className="text-sm opacity-70">
// // //                     🔁 Max Attempts: {a.maxAttempts}
// // //                   </p>
// // //                   <p className="text-sm opacity-70">
// // //                     🎯 Passing: {a.minPassingPercentage}%
// // //                   </p>
// // //                 </div>

// // //                 {/* BUTTONS */}
// // //                 <div className="flex gap-3">
// // //                   <button
// // //                     onClick={() => handleStartAssessment(a._id)}
// // //                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
// // //                   >
// // //                     Get Started
// // //                   </button>

// // //                   <button
// // //                     onClick={() => handleViewAttempts(a._id)}
// // //                     className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
// // //                   >
// // //                     View Attempts
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* 🔥 ATTEMPTS MODAL */}
// // //       {showAttemptModal && attemptData && (
// // //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //           <div
// // //             className={`w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl ${
// // //               darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
// // //             }`}
// // //           >
// // //             <h2 className="text-xl font-bold mb-4">
// // //               Assessment Attempts
// // //             </h2>

// // //             <p className="mb-2">
// // //               <strong>Total Attempts:</strong>{" "}
// // //               {attemptData.totalAttempts}
// // //             </p>
// // //             <p className="mb-4">
// // //               <strong>Attempts Left:</strong>{" "}
// // //               {attemptData.attemptsLeft}
// // //             </p>

// // //             {attemptData.attempts.length === 0 ? (
// // //               <p className="opacity-70">No attempts yet.</p>
// // //             ) : (
// // //               attemptData.attempts.map((attempt, index) => (
// // //                 <div
// // //                   key={index}
// // //                   className={`border p-4 mb-3 rounded-xl ${
// // //                     darkMode
// // //                       ? "border-gray-700"
// // //                       : "border-gray-300"
// // //                   }`}
// // //                 >
// // //                   <p>
// // //                     <strong>Attempt #{attempt.attemptNumber}</strong>
// // //                   </p>
// // //                   <p>Score: {attempt.score}%</p>
// // //                   <p>
// // //                     Passed: {attempt.passed ? "Yes ✅" : "No ❌"}
// // //                   </p>

// // //                   <p>
// // //                     Date:{" "}
// // //                     {new Date(
// // //                       attempt.createdAt
// // //                     ).toLocaleString()}
// // //                   </p>
// // //                 </div>
// // //               ))
// // //             )}

// // //             <button
// // //               onClick={() => setShowAttemptModal(false)}
// // //               className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
// // //             >
// // //               Close
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default SkillsPage;
// // import React, { useEffect, useState } from "react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import axiosInstance from "../../api/axiosInstance";
// // import { useTheme } from "../../context/ThemeContext";

// // const SkillsPage = () => {
// //   const { skillId } = useParams();
// //   const navigate = useNavigate();
// //   const { darkMode } = useTheme();

// //   const [loading, setLoading] = useState(true);
// //   const [skill, setSkill] = useState(null);
// //   const [assessments, setAssessments] = useState([]);
// //   const [error, setError] = useState("");

// //   // 🔥 New states for attempts modal
// //   const [attemptData, setAttemptData] = useState(null);
// //   const [showAttemptModal, setShowAttemptModal] = useState(false);

// //   useEffect(() => {
// //     if (!skillId) {
// //       navigate("/job-roles");
// //       return;
// //     }
// //     fetchSkillDetails();
// //   }, [skillId]);

// //   const fetchSkillDetails = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axiosInstance.get(`/skills/${skillId}/details`);

// //       if (res.data.skill.status === "locked") {
// //         setError("This skill is locked. Complete previous skills to unlock it.");
// //         return;
// //       }

// //       setSkill(res.data.skill);
// //       setAssessments(res.data.assessments || []);
// //     } catch (err) {
// //       console.error("Failed to load skill details", err);
// //       setError(
// //         err.response?.data?.message || "Failed to fetch skill details."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 🔥 Fetch assessment attempts
// //   const handleViewAttempts = async (assessmentId) => {
// //     try {
// //       const res = await axiosInstance.get(
// //         `/assessments/attempts/${assessmentId}`
// //       );
// //       setAttemptData(res.data);
// //       setShowAttemptModal(true);
// //     } catch (err) {
// //       console.error("Failed to fetch attempts", err);
// //       alert("Could not load attempts.");
// //     }
// //   };

// //   // 🔥 Start assessment with attempts check
// //   const handleStartAssessment = async (assessmentId, isLocked) => {
// //     if (isLocked) {
// //       alert("This assessment is locked. Complete previous assessments to unlock it.");
// //       return;
// //     }

// //     try {
// //       const res = await axiosInstance.get(
// //         `/assessments/attempts/${assessmentId}`
// //       );

// //       if (res.data.attemptsLeft <= 0) {
// //         alert("Maximum attempts reached. You cannot attempt this test again.");
// //         return;
// //       }

// //       navigate(`/assessment/${assessmentId}`);
// //     } catch (err) {
// //       console.error("Error checking attempts", err);
// //       alert("Unable to verify attempts. Try again.");
// //     }
// //   };

// //   if (loading) return <p className="p-10">Loading skill details...</p>;
// //   if (error) return <p className="p-10 text-red-500">{error}</p>;
// //   if (!skill) return <p className="p-10 text-gray-500">No skill found</p>;

// //   return (
// //     <div
// //       className={`min-h-screen px-6 py-12 ${
// //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
// //       }`}
// //     >
// //       <div className="max-w-4xl mx-auto">
// //         {/* SKILL INFO */}
// //         <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
// //         <p className="mb-2 opacity-70">{skill.description || "No description"}</p>
// //         <p className="mb-6">
// //           <strong>Status:</strong> {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
// //         </p>

// //         {/* ASSESSMENTS */}
// //         <h2 className="text-2xl font-semibold mb-4">Assessments</h2>

// //         {assessments.length === 0 ? (
// //           <p className="opacity-70">No assessments available</p>
// //         ) : (
// //           <div className="space-y-4">
// //             {assessments.map((a) => (
// //               <div
// //                 key={a._id}
// //                 className={`border rounded-2xl p-6 flex justify-between items-center transition-all ${
// //                   a.isCompleted
// //                     ? "bg-green-100 border-green-400"
// //                     : a.isLocked
// //                     ? `${darkMode ? "bg-gray-700" : "bg-gray-200"} opacity-50 cursor-not-allowed`
// //                     : darkMode
// //                     ? "bg-gray-800 border-gray-700"
// //                     : "bg-white border-gray-200"
// //                 }`}
// //               >
// //                 <div>
// //                   <h3 className="font-semibold text-lg">
// //                     {a.name} (Level {a.level})
// //                   </h3>
// //                   <p className="text-sm opacity-70">⏱ Time: {a.timer / 60} minutes</p>
// //                   <p className="text-sm opacity-70">🔁 Max Attempts: {a.maxAttempts}</p>
// //                   <p className="text-sm opacity-70">🎯 Passing: {a.minPassingPercentage}%</p>
// //                 </div>

// //                 {/* BUTTONS */}
// //                 <div className="flex gap-3">
// //                   <button
// //                     onClick={() => handleStartAssessment(a._id, a.isLocked)}
// //                     disabled={a.isLocked}
// //                     className={`px-4 py-2 rounded-2xl font-semibold text-white transition ${
// //                       a.isLocked
// //                         ? "bg-gray-400 cursor-not-allowed"
// //                         : "bg-indigo-600 hover:bg-indigo-700"
// //                     }`}
// //                   >
// //                     {a.isLocked ? "Locked 🔒" : "Get Started"}
// //                   </button>

// //                   <button
// //                     onClick={() => handleViewAttempts(a._id)}
// //                     className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
// //                   >
// //                     View Attempts
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* 🔥 ATTEMPTS MODAL */}
// //       {showAttemptModal && attemptData && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //           <div
// //             className={`w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl ${
// //               darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
// //             }`}
// //           >
// //             <h2 className="text-xl font-bold mb-4">Assessment Attempts</h2>

// //             <p className="mb-2">
// //               <strong>Total Attempts:</strong> {attemptData.totalAttempts}
// //             </p>
// //             <p className="mb-4">
// //               <strong>Attempts Left:</strong> {attemptData.attemptsLeft}
// //             </p>

// //             {attemptData.attempts.length === 0 ? (
// //               <p className="opacity-70">No attempts yet.</p>
// //             ) : (
// //               attemptData.attempts.map((attempt, index) => (
// //                 <div
// //                   key={index}
// //                   className={`border p-4 mb-3 rounded-xl ${
// //                     darkMode ? "border-gray-700" : "border-gray-300"
// //                   }`}
// //                 >
// //                   <p>
// //                     <strong>Attempt #{attempt.attemptNumber}</strong>
// //                   </p>
// //                   <p>Score: {attempt.score}%</p>
// //                   <p>Passed: {attempt.passed ? "Yes ✅" : "No ❌"}</p>
// //                   <p>Date: {new Date(attempt.createdAt).toLocaleString()}</p>
// //                 </div>
// //               ))
// //             )}

// //             <button
// //               onClick={() => setShowAttemptModal(false)}
// //               className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
// //             >
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default SkillsPage;
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";
// import { useTheme } from "../../context/ThemeContext";

// const SkillsPage = () => {
//   const { skillId } = useParams();
//   const navigate = useNavigate();
//   const { darkMode } = useTheme();

//   const [loading, setLoading] = useState(true);
//   const [skill, setSkill] = useState(null);
//   const [assessments, setAssessments] = useState([]);
//   const [error, setError] = useState("");

//   const [attemptData, setAttemptData] = useState(null);
//   const [showAttemptModal, setShowAttemptModal] = useState(false);

//   useEffect(() => {
//     if (!skillId) {
//       navigate("/job-roles");
//       return;
//     }
//     fetchSkillDetails();
//   }, [skillId]);

//   const fetchSkillDetails = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(`/skills/${skillId}/details`);

//       setSkill(res.data.skill);
//       setAssessments(res.data.assessments || []);
//     } catch (err) {
//       console.error("Failed to load skill details", err);
//       setError(err.response?.data?.message || "Failed to fetch skill details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewAttempts = async (assessmentId) => {
//     try {
//       const res = await axiosInstance.get(`/assessments/attempts/${assessmentId}`);
//       setAttemptData(res.data);
//       setShowAttemptModal(true);
//     } catch (err) {
//       console.error("Failed to fetch attempts", err);
//       alert("Could not load attempts.");
//     }
//   };

//   const handleStartAssessment = async (assessmentId, isLocked) => {
//     if (isLocked) {
//       alert("This assessment is locked. Complete previous assessments to unlock it.");
//       return;
//     }

//     try {
//       const res = await axiosInstance.get(`/assessments/attempts/${assessmentId}`);
//       if (res.data.attemptsLeft <= 0) {
//         alert("Maximum attempts reached. You cannot attempt this test again.");
//         return;
//       }
//       navigate(`/assessment/${assessmentId}`);
//     } catch (err) {
//       console.error("Error checking attempts", err);
//       alert("Unable to verify attempts. Try again.");
//     }
//   };

//   if (loading) return <p className="p-10 text-lg font-medium text-gray-500">Loading skill details...</p>;
//   if (error) return <p className="p-10 text-lg font-medium text-red-500">{error}</p>;
//   if (!skill) return <p className="p-10 text-lg font-medium text-gray-500">No skill found</p>;

//   return (
//     <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen py-12 px-6`}>
//       <div className="max-w-4xl mx-auto">
//         {/* Skill Header */}
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-4xl font-extrabold tracking-wide">{skill.name}</h1>
//           <span
//             className={`px-4 py-2 rounded-full font-semibold text-sm ${
//               skill.status === "locked"
//                 ? "bg-red-100 text-red-700"
//                 : "bg-green-100 text-green-800"
//             }`}
//           >
//             {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
//           </span>
//         </div>

//         {/* Assessments Section */}
//         <h2 className="text-2xl font-bold mb-4 border-b pb-2">Assessments</h2>
//         {assessments.length === 0 ? (
//           <p className="text-gray-400 italic">No assessments available</p>
//         ) : (
//           <div className="grid md:grid-cols-2 gap-6">
//             {assessments.map((a) => (
//               <div
//                 key={a._id}
//                 className={`rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-transform transform hover:scale-105 ${
//                   a.isCompleted
//                     ? "bg-green-50 border-green-300"
//                     : a.isLocked
//                     ? `${darkMode ? "bg-gray-700" : "bg-gray-200"} opacity-60 cursor-not-allowed`
//                     : darkMode
//                     ? "bg-gray-800 border-gray-700"
//                     : "bg-white border border-gray-200"
//                 }`}
//               >
//                 <div className="mb-4">
//                   <h3 className="text-xl font-semibold mb-1">{a.name}</h3>
//                   <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Level {a.level}</p>
//                   <p className="text-gray-400 dark:text-gray-400 text-sm">⏱ {a.timer / 60} min</p>
//                 </div>

//                 <div className="flex gap-3 mt-auto">
//                   <button
//                     onClick={() => handleStartAssessment(a._id, a.isLocked)}
//                     disabled={a.isLocked}
//                     className={`flex-1 px-4 py-2 rounded-xl font-semibold text-white text-sm transition ${
//                       a.isLocked
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-indigo-600 hover:bg-indigo-700"
//                     }`}
//                   >
//                     {a.isLocked ? "Locked 🔒" : "Start"}
//                   </button>
//                   <button
//                     onClick={() => handleViewAttempts(a._id)}
//                     className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-600 hover:bg-gray-700 text-white transition"
//                   >
//                     Attempts
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Attempts Modal */}
//       {showAttemptModal && attemptData && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//           <div className={`w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
//             <h2 className="text-2xl font-bold mb-4 text-center">Assessment Attempts</h2>

//             <p className="mb-2"><strong>Total Attempts:</strong> {attemptData.totalAttempts}</p>
//             <p className="mb-4"><strong>Attempts Left:</strong> {attemptData.attemptsLeft}</p>

//             {attemptData.attempts.length === 0 ? (
//               <p className="text-gray-400 italic">No attempts yet.</p>
//             ) : (
//               <div className="space-y-3">
//                 {attemptData.attempts.map((attempt, index) => (
//                   <div key={index} className={`p-4 rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-sm`}>
//                     <p><strong>Attempt #{attempt.attemptNumber}</strong></p>
//                     <p>Score: {attempt.score}%</p>
//                     <p>Passed: {attempt.passed ? "Yes ✅" : "No ❌"}</p>
//                     <p>Date: {new Date(attempt.createdAt).toLocaleString()}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <button
//               onClick={() => setShowAttemptModal(false)}
//               className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SkillsPage;
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const SkillsPage = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState("");

  const [attemptData, setAttemptData] = useState(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  useEffect(() => {
    if (!skillId) {
      navigate("/job-roles");
      return;
    }
    fetchSkillDetails();
  }, [skillId]);

  const fetchSkillDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/skills/${skillId}/details`);
      setSkill(res.data.skill);
      setAssessments(res.data.assessments || []);
    } catch (err) {
      console.error("Failed to load skill details", err);
      setError(err.response?.data?.message || "Failed to fetch skill details.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempts = async (assessmentId) => {
    try {
      const res = await axiosInstance.get(`/assessments/attempts/${assessmentId}`);
      setAttemptData(res.data);
      setShowAttemptModal(true);
    } catch (err) {
      console.error("Failed to fetch attempts", err);
      alert("Could not load attempts.");
    }
  };

  const handleStartAssessment = (assessmentId) => {
    navigate(`/assessment/${assessmentId}`);
  };

  if (loading)
    return <p className="p-10 text-lg font-medium text-gray-500">Loading skill details...</p>;
  if (error) return <p className="p-10 text-lg font-medium text-red-500">{error}</p>;
  if (!skill) return <p className="p-10 text-lg font-medium text-gray-500">No skill found</p>;

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen py-12 px-6`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Skill Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold tracking-wide">{skill.name}</h1>
          <span
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              skill.status === "locked"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-800"
            }`}
          >
            {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
          </span>
        </div>

        {/* Assessments Section */}
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Assessments</h2>
        {assessments.length === 0 ? (
          <p className="text-gray-400 italic">No assessments available</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assessments.map((a) => (
              <div
                key={a._id}
                className={`rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-1">{a.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">Level {a.level}</p>
                  <p className="text-gray-400 text-sm">⏱ {a.timer / 60} min</p>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => handleStartAssessment(a._id)}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold text-white text-sm bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleViewAttempts(a._id)}
                    className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-600 hover:bg-gray-700 text-white transition"
                  >
                    Attempts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempts Modal */}
      {showAttemptModal && attemptData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Assessment Attempts</h2>

            <p className="mb-2">
              <strong>Total Attempts:</strong> {attemptData.totalAttempts}
            </p>
            <p className="mb-4">
              <strong>Attempts Left:</strong> {attemptData.attemptsLeft}
            </p>

            {attemptData.attempts.length === 0 ? (
              <p className="text-gray-400 italic">No attempts yet.</p>
            ) : (
              <div className="space-y-3">
                {attemptData.attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } shadow-sm`}
                  >
                    <p>
                      <strong>Attempt #{attempt.attemptNumber}</strong>
                    </p>
                    <p>Score: {attempt.score}%</p>
                    <p>Passed: {attempt.passed ? "Yes ✅" : "No ❌"}</p>
                    <p>Date: {new Date(attempt.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAttemptModal(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
