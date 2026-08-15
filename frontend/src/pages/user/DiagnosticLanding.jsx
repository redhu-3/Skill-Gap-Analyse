import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { SparklesIcon, ChartBarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const DiagnosticLanding = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen px-6 py-12 flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-indigo-50 text-gray-900"}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-2xl w-full p-8 md:p-12 rounded-3xl shadow-xl text-center border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="w-16 h-16 mx-auto bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-6">
          <SparklesIcon className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          Find Your Perfect Career Path
        </h1>
        
        <p className={`text-lg mb-8 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Take our quick 5-minute diagnostic test to assess your current skills. We'll recommend the best Job Roles for you and automatically skip the skills you already know!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          <div className={`p-4 rounded-xl border ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <ChartBarIcon className="w-6 h-6 text-indigo-500 mb-2" />
            <h3 className="font-semibold mb-1">AI Matchmaking</h3>
            <p className="text-sm opacity-70">Get matched with roles that fit your existing knowledge.</p>
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <svg className="w-6 h-6 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-semibold mb-1">Fast-Track Learning</h3>
            <p className="text-sm opacity-70">Prove your skills now and skip them in your personalized roadmap.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate("/user/diagnostic/test")}
          className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          Start Diagnostic Test
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => navigate("/user/job-roles")}
          className={`mt-4 text-sm underline opacity-70 hover:opacity-100 transition`}
        >
          Skip and explore Job Roles manually
        </button>
      </motion.div>
    </div>
  );
};

export default DiagnosticLanding;
