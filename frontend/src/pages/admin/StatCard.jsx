import CountUp from "react-countup";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon }) => {
  const { darkMode } = useTheme();

  const percentage = Math.min((value / 100) * 100, 100); // fake dynamic %
  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`relative p-8 rounded-3xl overflow-hidden shadow-xl border backdrop-blur-xl
        ${
          darkMode
            ? "bg-gray-900/70 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
    >
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>

      <div className="flex justify-between items-center mb-6">
        <div
          className={`p-3 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-indigo-100"
          }`}
        >
          <Icon className="w-6 h-6 text-indigo-500" />
        </div>

        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
          +12%
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-24 h-24">
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke={darkMode ? "#1f2937" : "#e5e7eb"}
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <motion.circle
              stroke="url(#gradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              strokeDashoffset={circumference}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5 }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
            {Math.round(percentage)}%
          </div>
        </div>

        {/* Count Section */}
        <div>
          <h2 className="text-3xl font-bold">
            <CountUp end={value || 0} duration={1.8} />
          </h2>
          <p className="text-sm opacity-60 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
