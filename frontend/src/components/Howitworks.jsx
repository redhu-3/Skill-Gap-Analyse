import { useTheme } from "../context/ThemeContext";
import { FaUserTie, FaListCheck, FaClipboardCheck, FaChartLine } from "react-icons/fa6";

const HowItWorks = () => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen pt-28 transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
            Simple Process
          </span>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold">
            How <span className="text-blue-600">Skill Map</span> Works
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Skill Map helps you understand where you stand today and what skills
            you need to reach your desired job role.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-blue-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                <FaUserTie />
              </div>
              <span className="text-blue-600 font-bold text-lg">01</span>
            </div>

            <h3 className="mt-6 text-xl font-semibold">Select Your Job Role</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Choose the job role you are targeting. Skill Map automatically
              maps the required skills and competencies for that role.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-blue-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                <FaListCheck />
              </div>
              <span className="text-blue-600 font-bold text-lg">02</span>
            </div>

            <h3 className="mt-6 text-xl font-semibold">View Required Skills</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Explore a structured list of skills and sub-skills needed for your
              chosen role, organized in a clear roadmap.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-blue-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                <FaClipboardCheck />
              </div>
              <span className="text-blue-600 font-bold text-lg">03</span>
            </div>

            <h3 className="mt-6 text-xl font-semibold">Take Skill Assessments</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Attempt skill-based assessments designed to test both conceptual
              knowledge and practical understanding.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-8 rounded-2xl bg-blue-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                <FaChartLine />
              </div>
              <span className="text-blue-600 font-bold text-lg">04</span>
            </div>

            <h3 className="mt-6 text-xl font-semibold">Analyze Your Position</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get a clear analysis of your strengths, weaknesses, and overall
              readiness level for your target job role.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks;