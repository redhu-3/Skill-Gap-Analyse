import React from "react";

const ResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const { score, passed, currentAssessmentLevel, skillStatus, codingResults } = result;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Assessment Result</h2>

        {/* Score & Pass/Fail */}
        <p className="mb-2 text-lg">
          <span className="font-semibold">Score:</span> {score.toFixed(2)}%
        </p>
        <p
          className={`mb-4 text-lg font-semibold ${
            passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {passed ? "Passed ✅" : "Failed ❌"}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Current Assessment Level:</span>{" "}
          {currentAssessmentLevel}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Skill Status:</span> {skillStatus}
        </p>

        {/* Coding Question Results */}
        {codingResults && codingResults.length > 0 && (
          <div className="text-left mb-4">
            <h3 className="font-semibold text-lg mb-2">Coding Question Results:</h3>
            {codingResults.map((q, idx) => (
              <div key={q.questionId} className="mb-3 border rounded p-3 bg-gray-50">
                <p className="font-semibold mb-1">
                  Question {idx + 1}:
                </p>
                {q.publicTestCases.map((tc, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded mb-1 text-sm ${
                      tc.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <p>
                      <strong>Input:</strong> {tc.input || "(none)"}
                    </p>
                    <p>
                      <strong>Expected:</strong> {tc.expectedOutput}
                    </p>
                    <p>
                      <strong>Output:</strong> {tc.output}
                    </p>
                    <p>
                      <strong>Status:</strong> {tc.passed ? "Passed ✅" : "Failed ❌"}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

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
