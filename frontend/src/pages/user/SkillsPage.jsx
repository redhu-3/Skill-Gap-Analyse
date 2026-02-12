
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

//       if (res.data.skill.status === "locked") {
//         setError("This skill is locked. Complete previous skills to unlock it.");
//         return;
//       }

//       setSkill(res.data.skill);
//       setAssessments(res.data.assessments || []);
//     } catch (err) {
//       console.error("Failed to load skill details", err);
//       setError(
//         err.response?.data?.message || "Failed to fetch skill details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <p className="p-10">Loading skill details...</p>;
//   if (error) return <p className="p-10 text-red-500">{error}</p>;
//   if (!skill) return <p className="p-10 text-gray-500">No skill found</p>;

//   return (
//     <div
//       className={`min-h-screen px-6 py-12 ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
//       }`}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* SKILL INFO */}
//         <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
//         <p className="mb-2 opacity-70">{skill.description || "No description"}</p>
//         <p className="mb-6">
//           <strong>Status:</strong>{" "}
//           {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
//         </p>

//         {/* ASSESSMENTS */}
//         <h2 className="text-2xl font-semibold mb-4">Assessments</h2>
//         {assessments.length === 0 ? (
//           <p className="opacity-70">No assessments available</p>
//         ) : (
//           <div className="space-y-4">
//             {assessments.map((a) => (
//               <div
//                 key={a._id}
//                 className={`border rounded-2xl p-6 flex justify-between items-center ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700"
//                     : "bg-white border-gray-200"
//                 }`}
//               >
//                 <div>
//                   <h3 className="font-semibold text-lg">
//                     {a.name} (Level {a.level})
//                   </h3>
//                   <p className="text-sm opacity-70">⏱ Time: {a.timer / 60} minutes</p>
//                   <p className="text-sm opacity-70">🔁 Max Attempts: {a.maxAttempts}</p>
//                   <p className="text-sm opacity-70">🎯 Passing: {a.minPassingPercentage}%</p>
//                 </div>

//                 <button
//                   onClick={() => navigate(`/assessment/${a._id}`)}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
//                 >
//                   Get Started
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
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

  // 🔥 NEW STATES
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

      if (res.data.skill.status === "locked") {
        setError("This skill is locked. Complete previous skills to unlock it.");
        return;
      }

      setSkill(res.data.skill);
      setAssessments(res.data.assessments || []);
    } catch (err) {
      console.error("Failed to load skill details", err);
      setError(
        err.response?.data?.message || "Failed to fetch skill details."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FETCH ATTEMPTS
  const handleViewAttempts = async (assessmentId) => {
    try {
      const res = await axiosInstance.get(
        `/assessments/attempts/${assessmentId}`
      );

      setAttemptData(res.data);
      setShowAttemptModal(true);
    } catch (err) {
      console.error("Failed to fetch attempts", err);
      alert("Could not load attempts.");
    }
  };

  const handleStartAssessment = async (assessmentId) => {
  try {
    const res = await axiosInstance.get(
      `/assessments/attempts/${assessmentId}`
    );

    if (res.data.attemptsLeft <= 0) {
      alert("Maximum attempts reached. You cannot attempt this test again.");
      return;
    }

    navigate(`/assessment/${assessmentId}`);
  } catch (err) {
    console.error("Error checking attempts", err);
    alert("Unable to verify attempts. Try again.");
  }
};

  if (loading) return <p className="p-10">Loading skill details...</p>;
  if (error) return <p className="p-10 text-red-500">{error}</p>;
  if (!skill) return <p className="p-10 text-gray-500">No skill found</p>;

  return (
    <div
      className={`min-h-screen px-6 py-12 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* SKILL INFO */}
        <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
        <p className="mb-2 opacity-70">
          {skill.description || "No description"}
        </p>
        <p className="mb-6">
          <strong>Status:</strong>{" "}
          {skill.status === "locked" ? "Locked 🔒" : "Available ✅"}
        </p>

        {/* ASSESSMENTS */}
        <h2 className="text-2xl font-semibold mb-4">Assessments</h2>

        {assessments.length === 0 ? (
          <p className="opacity-70">No assessments available</p>
        ) : (
          <div className="space-y-4">
            {assessments.map((a) => (
             <div
    key={a._id}
    className={`border rounded-2xl p-6 flex justify-between items-center ${
      a.isCompleted
        ? "bg-green-100 border-green-400"
        : a.isLocked
        ? "bg-gray-200 border-gray-300 opacity-70"
        : darkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200"
    }`}
  >
                <div>
                  <h3 className="font-semibold text-lg">
                    {a.name} (Level {a.level})
                  </h3>
                  <p className="text-sm opacity-70">
                    ⏱ Time: {a.timer / 60} minutes
                  </p>
                  <p className="text-sm opacity-70">
                    🔁 Max Attempts: {a.maxAttempts}
                  </p>
                  <p className="text-sm opacity-70">
                    🎯 Passing: {a.minPassingPercentage}%
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStartAssessment(a._id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
                  >
                    Get Started
                  </button>

                  <button
                    onClick={() => handleViewAttempts(a._id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
                  >
                    View Attempts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 ATTEMPTS MODAL */}
      {showAttemptModal && attemptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">
              Assessment Attempts
            </h2>

            <p className="mb-2">
              <strong>Total Attempts:</strong>{" "}
              {attemptData.totalAttempts}
            </p>
            <p className="mb-4">
              <strong>Attempts Left:</strong>{" "}
              {attemptData.attemptsLeft}
            </p>

            {attemptData.attempts.length === 0 ? (
              <p className="opacity-70">No attempts yet.</p>
            ) : (
              attemptData.attempts.map((attempt, index) => (
                <div
                  key={index}
                  className={`border p-4 mb-3 rounded-xl ${
                    darkMode
                      ? "border-gray-700"
                      : "border-gray-300"
                  }`}
                >
                  <p>
                    <strong>Attempt #{attempt.attemptNumber}</strong>
                  </p>
                  <p>Score: {attempt.score}%</p>
                  <p>
                    Passed: {attempt.passed ? "Yes ✅" : "No ❌"}
                  </p>

                  <p>
                    Date:{" "}
                    {new Date(
                      attempt.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            )}

            <button
              onClick={() => setShowAttemptModal(false)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
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
