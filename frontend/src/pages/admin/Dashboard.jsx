import React from "react";
import StatCard from "../../components/StatCard";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";

const Dashboard = () => {
  const { darkMode } = useTheme();

  // Dummy stats for now; later fetch from backend
  const stats = [
    { title: "Total Job Roles", value: 12, icon: <BriefcaseIcon className="w-6 h-6" /> },
    { title: "Total Skills", value: 56, icon: <AcademicCapIcon className="w-6 h-6" /> },
    { title: "Total Questions", value: 120, icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
    { title: "Published Roles", value: 8, icon: <CheckCircleIcon className="w-6 h-6" /> },
  ];

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
