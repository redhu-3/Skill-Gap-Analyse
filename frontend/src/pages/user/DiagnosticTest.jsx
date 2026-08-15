import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const DiagnosticTest = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axiosInstance.get("/diagnostic/test");
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load diagnostic test.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      await axiosInstance.post("/diagnostic/submit", { answers: payload });
      navigate("/user/diagnostic/results");
    } catch (err) {
      setError("Failed to submit test.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading diagnostic test...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (questions.length === 0) return <div className="p-10 text-center">No questions available.</div>;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className={`min-h-screen px-6 py-12 flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-indigo-50 text-gray-900"}`}>
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between text-sm font-semibold mb-2 opacity-70">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`w-full max-w-2xl p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-8">{currentQ.questionText}</h2>
          
          <div className="space-y-4 mb-8">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = answers[currentQ._id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ._id, opt)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : darkMode ? "border-gray-700 bg-gray-900 hover:border-gray-500" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!answers[currentQ._id] || submitting}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : currentIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DiagnosticTest;
