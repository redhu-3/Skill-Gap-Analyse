import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-indigo-600 mt-2">
        {value}
      </h2>
    </div>
  );
};

export default StatCard;
