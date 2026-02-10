import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";
import { FaArrowDown, FaLock, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const Roadmap = () => {
  const { jobRoleId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [roadmap, setRoadmap] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  /* ================= FETCH ROADMAP ================= */
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get(`/roadmap/${jobRoleId}`);
        setRoadmap(res.data.roadmap);
        setRoleName(res.data.jobRole);
      } catch (err) {
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

      const res = await axiosInstance.post(
        `/skills/job-role/${jobRoleId}/start-learning`
      );

      console.log("Skill started:", res.data);

      // ✅ Navigate to first unlocked skill returned by backend
      navigate(`/skills/${res.data.skillId}`);
    } catch (err) {
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
            Skills unlock one by one after assessment completion
          </p>
        </div>

        {/* ROADMAP */}
        <div className="flex flex-col items-center">
          {roadmap.map((skill, index) => (
            <div key={skill._id} className="w-full flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full rounded-2xl p-6 border shadow-md ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
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
                    ? "Completed"
                    : "Available"}
                </p>
              </motion.div>

              {index !== roadmap.length - 1 && (
                <FaArrowDown className="my-6 opacity-40" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={handleStartLearning}
            disabled={starting}
            className={`px-8 py-4 rounded-2xl text-white font-semibold transition ${
              starting
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
