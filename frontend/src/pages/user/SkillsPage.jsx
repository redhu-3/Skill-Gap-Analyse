
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
        <p className="mb-2 opacity-70">{skill.description || "No description"}</p>
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
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {a.name} (Level {a.level})
                  </h3>
                  <p className="text-sm opacity-70">⏱ Time: {a.timer / 60} minutes</p>
                  <p className="text-sm opacity-70">🔁 Max Attempts: {a.maxAttempts}</p>
                  <p className="text-sm opacity-70">🎯 Passing: {a.minPassingPercentage}%</p>
                </div>

                <button
                  onClick={() => navigate(`/assessment/${a._id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
