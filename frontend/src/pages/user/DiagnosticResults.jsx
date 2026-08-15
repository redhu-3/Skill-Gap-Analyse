import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { ChartPieIcon, CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const DiagnosticResults = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axiosInstance.get("/diagnostic/results");
      setResult(res.data.result);
    } catch (err) {
      console.error("Failed to load results", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (jobRoleId) => {
    try {
      await axiosInstance.post(`/enrollment/job-role/${jobRoleId}`);
      navigate(`/user/roadmap`); // Navigate directly to roadmap
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll");
      if (err.response?.status === 400) {
        // already enrolled
        navigate(`/user/roadmap`);
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your personalized results...</div>;
  
  if (!result || result.recommendedRoles.length === 0) {
    return (
      <div className={`min-h-screen px-6 py-12 flex flex-col items-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <h1 className="text-2xl font-bold mb-4">No recommendations found</h1>
        <button onClick={() => navigate("/user/job-roles")} className="text-indigo-500 underline">Browse all Job Roles</button>
      </div>
    );
  }

  const topMatch = result.recommendedRoles[0];

  return (
    <div className={`min-h-screen px-6 py-12 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold mb-4">
            Analysis Complete
          </span>
          <h1 className="text-4xl font-extrabold mb-4">Your Best Career Matches</h1>
          <p className="opacity-70 max-w-xl mx-auto">
            Based on your test, we've found the Job Roles that best align with your current skills. Enrolling now will automatically skip the skills you've mastered!
          </p>
        </div>

        {/* Top Match */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🥇</span>
            <h2 className="text-2xl font-bold">Top Recommendation</h2>
          </div>
          
          <div className={`p-8 rounded-3xl border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-extrabold mb-2">{topMatch.jobRole.name}</h3>
                <p className="opacity-70 mb-4">{topMatch.jobRole.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(result.scoresByCategory || {}).map(([cat, score]) => (
                    <span key={cat} className="px-3 py-1 bg-gray-500/10 rounded-full text-xs font-semibold">
                      {cat}: {score}%
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-indigo-500/20 mb-4">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-indigo-500" 
                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${topMatch.matchScore}%, 0 ${topMatch.matchScore}%)` }}
                  ></div>
                  <span className="text-3xl font-bold">{topMatch.matchScore}%</span>
                </div>
                
                <button 
                  onClick={() => handleEnroll(topMatch.jobRole._id)}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  Enroll Now
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Other Matches */}
        {result.recommendedRoles.length > 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Other Strong Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.recommendedRoles.slice(1).map((match, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{match.jobRole.name}</h3>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg">{match.matchScore}% Match</span>
                  </div>
                  <p className="text-sm opacity-70 mb-6 line-clamp-2">{match.jobRole.description}</p>
                  <button 
                    onClick={() => handleEnroll(match.jobRole._id)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"}`}
                  >
                    View & Enroll
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticResults;
