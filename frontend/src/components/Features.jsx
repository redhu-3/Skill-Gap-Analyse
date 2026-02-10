import { useTheme } from "../context/ThemeContext";
import {
  FaUserTie,
  FaListAlt,
  FaClipboardCheck,
  FaChartPie,
  FaRoad,
  FaLightbulb,
} from "react-icons/fa";

const Features = () => {
  const { darkMode } = useTheme();

  const features = [
    {
      icon: <FaUserTie />,
      title: "Job Role Selection",
      desc: "Users start by selecting their target job role. Skill DNA dynamically identifies the exact skills and competencies required for that role.",
    },
    {
      icon: <FaListAlt />,
      title: "Structured Skill Mapping",
      desc: "All required skills and sub-skills are organized into a clear, dependency-based roadmap so learners know what to learn and in what order.",
    },
    {
      icon: <FaClipboardCheck />,
      title: "Skill-Based Assessments",
      desc: "Each skill is evaluated using carefully designed assessments to measure conceptual understanding and practical knowledge.",
    },
    {
      icon: <FaChartPie />,
      title: "Performance Analysis",
      desc: "After assessments, users receive a detailed breakdown of strengths, weaknesses, and skill gaps relative to their chosen job role.",
    },
    {
      icon: <FaRoad />,
      title: "Personalized Learning Roadmap",
      desc: "Based on assessment results, Skill DNA generates a customized roadmap guiding users on which skills to focus on next.",
    },
    {
      icon: <FaLightbulb />,
      title: "Career Readiness Insights",
      desc: "Users can clearly see their current position, readiness level, and progress toward becoming job-ready in their target role.",
    },
  ];

  return (
    <div
      className={`min-h-screen pt-28 transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium ${
              darkMode
                ? "bg-blue-900 text-blue-300"
                : "bg-blue-100 text-blue-600"
            }`}
          >
           
          </span>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Analyze Your Skills
            </span>
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-350">
            Skill Map provides a complete system to evaluate your skills,
            identify gaps, and guide you toward your desired job role with
            clarity and confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl ${
                  darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {item.icon}
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                {item.title}
              </h3>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;