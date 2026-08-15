// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";
// import { motion } from "framer-motion";
// import { FaArrowDown, FaLock, FaCheckCircle } from "react-icons/fa";
// import { useTheme } from "../../context/ThemeContext";

// const Roadmap = () => {
//   const { jobRoleId } = useParams();
//   const navigate = useNavigate();
//   const { darkMode } = useTheme();

//   const [roadmap, setRoadmap] = useState([]);
//   const [roleName, setRoleName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [starting, setStarting] = useState(false);

//   /* ================= FETCH ROADMAP ================= */
//   useEffect(() => {
//     const fetchRoadmap = async () => {
//       try {
//         const res = await axiosInstance.get(`/roadmap/${jobRoleId}`);
//         setRoadmap(res.data.roadmap);
//         setRoleName(res.data.jobRole);
//       } catch (err) {
//         setError("Failed to load roadmap");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRoadmap();
//   }, [jobRoleId]);

//   /* ================= START LEARNING ================= */
//   const handleStartLearning = async () => {
//     try {
//       setStarting(true);

//       const res = await axiosInstance.post(
//         `/skills/job-role/${jobRoleId}/start-learning`
//       );

//       console.log("Skill started:", res.data);

//       // ✅ Navigate to first unlocked skill returned by backend
//       navigate(`/skills/${res.data.skillId}`);
//     } catch (err) {
//       alert(err.response?.data?.message || "Unable to start learning");
//     } finally {
//       setStarting(false);
//     }
//   };

//   if (loading) return <p className="p-10">Loading roadmap...</p>;
//   if (error) return <p className="p-10 text-red-500">{error}</p>;

//   return (
//     <div
//       className={`min-h-screen px-6 py-12 ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
//       }`}
//     >
//       <div className="max-w-3xl mx-auto">
//         {/* HEADER */}
//         <div className="mb-12 text-center">
//           <h1 className="text-4xl font-extrabold mb-2">
//             {roleName} Roadmap 🧭
//           </h1>
//           <p className="opacity-70">
//             Skills unlock one by one after assessment completion
//           </p>
//         </div>

//         {/* ROADMAP */}
//         <div className="flex flex-col items-center">
//           {roadmap.map((skill, index) => (
//             <div key={skill._id} className="w-full flex flex-col items-center">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className={`w-full rounded-2xl p-6 border shadow-md ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700"
//                     : "bg-white border-gray-200"
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-xl font-semibold">{skill.name}</h3>

//                   {skill.status === "completed" && (
//                     <FaCheckCircle className="text-green-500" />
//                   )}
//                   {skill.status === "locked" && (
//                     <FaLock className="text-red-500" />
//                   )}
//                 </div>

//                 <p className="text-sm opacity-70 mt-2">
//                   {skill.status === "locked"
//                     ? "Complete previous skill to unlock"
//                     : skill.status === "completed"
//                     ? "Completed"
//                     : "Available"}
//                 </p>
//               </motion.div>

//               {index !== roadmap.length - 1 && (
//                 <FaArrowDown className="my-6 opacity-40" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* CTA */}
//         <div className="mt-16 text-center">
//           <button
//             onClick={handleStartLearning}
//             disabled={starting}
//             className={`px-8 py-4 rounded-2xl text-white font-semibold transition ${
//               starting
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-indigo-600 hover:bg-indigo-700"
//             }`}
//           >
//             {starting ? "Starting..." : "Start Learning 🚀"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Roadmap;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { FaLock, FaCheckCircle, FaArrowDown, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Roadmap = () => {
  const { jobRoleId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [roadmap, setRoadmap] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [masteredExpanded, setMasteredExpanded] = useState(false);

  /* ================= FETCH ROADMAP ================= */
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get(`/roadmap/${jobRoleId}`);
        // Ensure skills are sorted by order/level
        const sortedRoadmap = res.data.roadmap.sort((a, b) => a.order - b.order);

        // Determine which skills are locked based on previous completions
        let previousCompleted = true;
        const updatedRoadmap = sortedRoadmap.map((skill) => {
          if (!previousCompleted) {
            return { ...skill, status: "locked" };
          }
          if (skill.status === "completed") {
            previousCompleted = true;
          } else if (skill.status === "in-progress") {
            previousCompleted = false;
          }
          return skill;
        });

        setRoadmap(updatedRoadmap);
        setRoleName(res.data.jobRole);
      } catch (err) {
        console.error(err);
        setError("Failed to load roadmap");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [jobRoleId]);

  /* ================= START LEARNING ================= */
  const handleStartLearning = async () => {
    try {
      setStarting(true);

      // Start first unlocked skill
      const firstUnlocked = roadmap.find((s) => s.status === "in-progress");
      if (!firstUnlocked) {
        alert("No skills available to start.");
        return;
      }

      const res = await axiosInstance.post(
        `/skills/job-role/${jobRoleId}/start-learning`,
        { skillId: firstUnlocked._id }
      );

      // Navigate to first unlocked skill
      navigate(`/skills/${res.data.skillId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to start learning");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <p className="p-10">Loading roadmap...</p>;
  if (error) return <p className="p-10 text-red-500">{error}</p>;

  return (
    <div
      className={`min-h-screen px-6 py-12 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-2">
            {roleName} Roadmap 🧭
          </h1>
          <p className="opacity-70">
            Skills unlock one by one after completing all assessments
          </p>
        </div>

        {/* ROADMAP */}
        <div className="flex flex-col items-center">
          {/* MASTERED SKILLS SECTION */}
          {roadmap.filter(s => s.status === "completed").length > 0 && (
            <div className={`w-full rounded-2xl mb-8 border shadow-sm overflow-hidden ${darkMode ? "bg-indigo-900/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"}`}>
              <div className="p-4 flex justify-between items-center bg-indigo-500/10 cursor-pointer" onClick={() => setMasteredExpanded(!masteredExpanded)}>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Mastered Skills ({roadmap.filter(s => s.status === "completed").length})</span>
                </div>
                {masteredExpanded ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown className="text-indigo-500" />}
              </div>
              <AnimatePresence>
                {masteredExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-4 space-y-3">
                      {roadmap.filter(s => s.status === "completed").map((skill) => (
                        <div key={skill._id} className={`p-3 rounded-xl flex items-center justify-between border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                          <h3 className="font-semibold">{skill.name}</h3>
                          <FaCheckCircle className="text-emerald-500 w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* LEARNING PATH SECTION */}
          {roadmap.filter(s => s.status !== "completed").map((skill, index, arr) => (
            <div key={skill._id} className="w-full flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full rounded-2xl p-6 border shadow-md ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } ${
                  skill.status === "locked" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{skill.name}</h3>

                  {skill.status === "completed" && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                  {skill.status === "locked" && (
                    <FaLock className="text-red-500" />
                  )}
                </div>

                <p className="text-sm opacity-70 mt-2">
                  {skill.status === "locked"
                    ? "Complete previous skill to unlock"
                    : skill.status === "completed"
                    ? "Completed ✅"
                    : "Available to start"}
                </p>
              </motion.div>

              {index !== arr.length - 1 && (
                <FaArrowDown className="my-6 opacity-40" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={handleStartLearning}
            disabled={
              starting || !roadmap.some((s) => s.status === "in-progress")
            }
            className={`px-8 py-4 rounded-2xl text-white font-semibold transition ${
              starting || !roadmap.some((s) => s.status === "in-progress")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {starting ? "Starting..." : "Start Learning 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
