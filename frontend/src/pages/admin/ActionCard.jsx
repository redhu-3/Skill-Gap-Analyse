import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const ActionCard = ({ title, onClick }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`p-8 rounded-3xl cursor-pointer border shadow-lg
      ${
        darkMode
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
    </motion.div>
  );
};

export default ActionCard;
