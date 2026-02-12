import React from "react";

const SkeletonGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-8 rounded-3xl bg-gray-300/20 dark:bg-gray-700/30 animate-pulse h-40"
        />
      ))}
    </div>
  );
};

export default SkeletonGrid;
