// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "../../api/axiosInstance";

// const SkillsPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [skill, setSkill] = useState(null);
//   const [assessments, setAssessments] = useState([]);
//   const navigate = useNavigate();
//   const { skillId } = useParams();

//   useEffect(() => {
//     if (!skillId) {
//       navigate("/job-roles");
//       return;
//     }
//     fetchSkillDetails();
//   }, [skillId]);

//   const fetchSkillDetails = async () => {
//     try {
//       const res = await axios.get(`/skills/${skillId}/details`);

//       setSkill(res.data.skill);
//       setAssessments(res.data.assessments || []);
//     } catch (error) {
//       console.error("Failed to load skill details", error);
//       navigate("/job-roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   if (!skill) {
//     return <div className="p-6">No skill found</div>;
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* SKILL INFO */}
//       <h1 className="text-2xl font-bold mb-2">{skill.name}</h1>
//       <p className="mb-2 text-gray-700">
//         {skill.description || "No description"}
//       </p>
//       <p className="mb-6">
//         <strong>Status:</strong> {skill.status}
//       </p>

//       {/* ASSESSMENTS */}
//       <h2 className="text-xl font-semibold mb-4">Assessments</h2>

//       {assessments.length === 0 ? (
//         <p>No assessments available</p>
//       ) : (
//         <div className="space-y-4">
//           {assessments.map((a) => (
//             <div
//               key={a._id}
//               className="border rounded p-4 flex justify-between items-center"
//             >
//               <div>
//                 <h3 className="font-semibold text-lg">
//                   {a.name} (Level {a.level})
//                 </h3>

//                 <p className="text-sm text-gray-600">
//                   ⏱ Time: {a.timer / 60} minutes
//                 </p>

//                 <p className="text-sm text-gray-600">
//                   🔁 Max Attempts: {a.maxAttempts}
//                 </p>

//                 <p className="text-sm text-gray-600">
//                   🎯 Passing: {a.minPassingPercentage}%
//                 </p>
//               </div>

//               <button
//                 onClick={() => navigate(`/assessment/${a._id}`)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 Get Started
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SkillsPage;
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";

const SkillsPage = () => {
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const navigate = useNavigate();
  const { skillId } = useParams();

  useEffect(() => {
    if (!skillId) {
      navigate("/job-roles");
      return;
    }
    fetchSkillDetails();
  }, [skillId]);

  const fetchSkillDetails = async () => {
    try {
      const res = await axios.get(`/skills/${skillId}/details`);
      setSkill(res.data.skill);
      setAssessments(res.data.assessments || []);
    } catch (error) {
      console.error("Failed to load skill details", error);
      navigate("/job-roles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!skill) return <div className="p-6">No skill found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* SKILL INFO */}
      <h1 className="text-2xl font-bold mb-2">{skill.name}</h1>
      <p className="mb-2 text-gray-700">
        {skill.description || "No description"}
      </p>
      <p className="mb-6">
        <strong>Status:</strong> {skill.status}
      </p>

      {/* ASSESSMENTS */}
      <h2 className="text-xl font-semibold mb-4">Assessments</h2>

      {assessments.length === 0 ? (
        <p>No assessments available</p>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div
              key={a._id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {a.name} (Level {a.level})
                </h3>

                <p className="text-sm text-gray-600">
                  ⏱ Time: {a.timer / 60} minutes
                </p>

                <p className="text-sm text-gray-600">
                  🔁 Max Attempts: {a.maxAttempts}
                </p>

                <p className="text-sm text-gray-600">
                  🎯 Passing: {a.minPassingPercentage}%
                </p>
              </div>

              {/* ✅ PASS ASSESSMENT ID */}
              <button
                onClick={() => navigate(`/assessment/${a._id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
