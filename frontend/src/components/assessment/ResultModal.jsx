import React from "react";

const ResultModal = ({ isOpen, onClose, score, status, attemptsLeft }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Assessment Result</h2>
        <p className="mb-2">Score: {score.toFixed(2)}%</p>
        <p className="mb-2">Status: {status}</p>
        <p className="mb-4">Attempts Left: {attemptsLeft}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );

  
};

export default ResultModal;
