// import { useState } from "react";
// import runCode from "../../api/axiosrunCode";

// const QuestionCard = ({ question, index, selectedAnswer, onSelect }) => {
//   const [output, setOutput] = useState(""); // For code execution output
//   const [isRunning, setIsRunning] = useState(false);

//   if (!question) return null;

// const handleRunCode = async () => {
//   setIsRunning(true);
//   setOutput("");

//   try {
//     const codeData = {
//       questionId: question._id,
//       code: selectedAnswer?.code || question.starterCode || "",
//       language: selectedAnswer?.language || question.language || "javascript",
//       stdin: selectedAnswer?.stdin || "",
//     };

//     console.log("Sending codeData:", codeData);

//     const result = await runCode(codeData);

//     // 🔴 FIRST: CHECK COMPILER ERROR
//     if (result?.compilerError) {
//       setOutput("❌ Compiler / Runtime Error:\n\n" + result.compilerError);
//       return;
//     }

//     // 🔴 If no results returned
//     if (!result || !result.testCaseResults) {
//       setOutput("No test case results received.");
//       return;
//     }

//     // 🔵 Show public test results
//     const publicResults = result.testCaseResults
//       .filter(tc => !tc.isHidden)
//       .map(tc =>
//         `Input: ${tc.input}
// Expected: ${tc.expectedOutput}
// Your Output: ${tc.actualOutput}
// Passed: ${tc.passed}`
//       )
//       .join("\n\n");

//     // ❌ If public failed
//     if (!result.allPublicPassed) {
//       setOutput(publicResults + "\n\n❌ Public test case failed.");
//       return;
//     }

//     // ❌ If hidden failed
//     if (!result.allHiddenPassed) {
//       setOutput(publicResults + "\n\n❌ Hidden test case failed.");
//       return;
//     }

//     // ✅ All passed
//     setOutput(publicResults + "\n\n✅ All test cases passed!");

//   } catch (err) {
//     console.error("Code run error:", err);
//     setOutput(
//       err.response?.data?.compilerError ||
//       err.response?.data?.error ||
//       err.message ||
//       "Error running code"
//     );
//   } finally {jjjjjjjjj
//     setIsRunning(false);
//   }
// };
 


//   return (
//     <div className="border p-5 my-5 rounded-lg shadow bg-white">
//       {/* Question */}
//       <p className="font-semibold mb-4 text-lg">
//         {index + 1}. {question.questionText}
//       </p>

//       {/* MCQ */}
//       {question.type === "mcq" &&
//         question.options?.map((opt, i) => (
//           <div key={i} className="mb-2">
//             <label className="flex items-center space-x-2 cursor-pointer">
//               <input
//                 type="radio"
//                 name={question._id}
//                 value={opt}
//                 checked={selectedAnswer === opt}
//                 onChange={() => onSelect(question._id, opt)}
//                 className="accent-blue-600"
//               />
//               <span>{opt}</span>
//             </label>
//           </div>
//         ))}

//       {/* Fill in the blank */}
//       {question.type === "fill-blank" && (
//         <input
//           type="text"
//           value={selectedAnswer || ""}
//           onChange={(e) => onSelect(question._id, e.target.value)}
//           placeholder="Type your answer here..."
//           className="w-full border p-2 rounded"
//         />
//       )}

//       {/* Coding Question */}
//       {question.type === "coding" && (
//         <>
//           {/* Problem description */}
//           {question.description && (
//             <p className="mb-3 text-gray-700">{question.description}</p>
//           )}

//           {/* Public Test Cases */}
//           {question.testCases?.length > 0 && (
//             <div className="mb-3">
//               <h4 className="font-semibold mb-2">Public Test Cases:</h4>
//               {question.testCases.map((tc, i) => (
//                 <div
//                   key={i}
//                   className="border p-2 rounded mb-2 bg-gray-50 text-sm"
//                 >
//                   <p><strong>Input:</strong> {tc.input || "(empty)"}</p>
//                   <p><strong>Expected Output:</strong> {tc.expectedOutput}</p>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Starter code */}
//           {question.starterCode && (
//             <pre className="bg-gray-100 p-3 rounded mb-3 text-sm overflow-x-auto">
//               {question.starterCode}
//             </pre>
//           )}

//           {/* Language selector */}
//           <select
//             value={selectedAnswer?.language || question.language || "javascript"}
//             onChange={(e) =>
//               onSelect(question._id, {
//                 ...selectedAnswer,
//                 language: e.target.value,
//                 code: selectedAnswer?.code || question.starterCode || "",
//                 stdin: selectedAnswer?.stdin || "",
//               })
//             }
//             className="mb-2 border p-2 rounded"
//           >
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//             <option value="java">Java</option>
//           </select>

//           {/* Code editor */}
//           <textarea
//             rows={10}
//             value={selectedAnswer?.code || ""}
//             onChange={(e) =>
//               onSelect(question._id, {
//                 ...selectedAnswer,
//                 code: e.target.value,
//               })
//             }
//             placeholder="Write your code here..."
//             className="w-full border rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           {/* Optional stdin input */}
//           <input
//             type="text"
//             value={selectedAnswer?.stdin || ""}
//             onChange={(e) =>
//               onSelect(question._id, {
//                 ...selectedAnswer,
//                 stdin: e.target.value,
//               })
//             }
//             placeholder="Optional input (stdin)"
//             className="w-full border p-2 rounded mt-2"
//           />

//           {/* Run Code button */}
//           <button
//             className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             onClick={handleRunCode}
//             disabled={isRunning}
//           >
//             {isRunning ? "Running..." : "Run Code"}
//           </button>

//           {/* Output */}
//           {output && (
//             <pre className="bg-gray-100 p-3 mt-3 rounded text-sm overflow-x-auto">
//               {output}
//             </pre>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default QuestionCard;
import runCode from "../../api/axiosrunCode";

const QuestionCard = ({ question, index, selectedAnswer, onSelect }) => {
  if (!question) return null;

  const handleRunCode = async () => {
    onSelect(question._id, { ...selectedAnswer, output: "Running..." });

    try {
      const codeData = {
        questionId: question._id,
        code: selectedAnswer?.code || question.starterCode || "",
        language: selectedAnswer?.language || question.language || "javascript",
        stdin: selectedAnswer?.stdin || "",
      };

      const result = await runCode(codeData);

      let outputText = "";

      if (result?.compilerError) {
        outputText = "❌ Compiler / Runtime Error:\n\n" + result.compilerError;
      } else if (!result?.testCaseResults) {
        outputText = "No test case results received.";
      } else {
        const publicResults = result.testCaseResults
          .filter((tc) => !tc.isHidden)
          .map(
            (tc) =>
              `Input: ${tc.input || "(empty)"}\nExpected: ${tc.expectedOutput}\nYour Output: ${tc.actualOutput}\nPassed: ${tc.passed}`
          )
          .join("\n\n");

        if (!result.allPublicPassed) {
          outputText = publicResults + "\n\n❌ Public test case failed.";
        } else if (!result.allHiddenPassed) {
          outputText = publicResults + "\n\n❌ Hidden test case failed.";
        } else {
          outputText = publicResults + "\n\n✅ All test cases passed!";
        }
      }

      // Update output in parent state
      onSelect(question._id, { ...selectedAnswer, output: outputText });
    } catch (err) {
      console.error(err);
      onSelect(question._id, {
        ...selectedAnswer,
        output:
          err.response?.data?.compilerError ||
          err.response?.data?.error ||
          err.message ||
          "Error running code",
      });
    }
  };

  return (
    <div className="border p-5 my-5 rounded-lg shadow bg-white">
      <p className="font-semibold mb-4 text-lg">
        {index + 1}. {question.questionText}
      </p>

      {/* MCQ */}
      {question.type === "mcq" &&
        question.options?.map((opt, i) => (
          <div key={i} className="mb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={selectedAnswer === opt}
                onChange={() => onSelect(question._id, opt)}
                className="accent-blue-600"
              />
              <span>{opt}</span>
            </label>
          </div>
        ))}

      {/* Fill in the blank */}
      {question.type === "fill-blank" && (
        <input
          type="text"
          value={selectedAnswer || ""}
          onChange={(e) => onSelect(question._id, e.target.value)}
          placeholder="Type your answer here..."
          className="w-full border p-2 rounded"
        />
      )}

      {/* Coding Question */}
      {question.type === "coding" && (
        <>
          {question.description && (
            <p className="mb-3 text-gray-700">{question.description}</p>
          )}

          {question.testCases?.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold mb-2">Public Test Cases:</h4>
              {question.testCases.map((tc, i) => (
                <div
                  key={i}
                  className="border p-2 rounded mb-2 bg-gray-50 text-sm"
                >
                  <p>
                    <strong>Input:</strong> {tc.input || "(empty)"}
                  </p>
                  <p>
                    <strong>Expected Output:</strong> {tc.expectedOutput}
                  </p>
                </div>
              ))}
            </div>
          )}

          {question.starterCode && (
            <pre className="bg-gray-100 p-3 rounded mb-3 text-sm overflow-x-auto">
              {question.starterCode}
            </pre>
          )}

          <select
            value={selectedAnswer?.language || question.language || "javascript"}
            onChange={(e) =>
              onSelect(question._id, {
                ...selectedAnswer,
                language: e.target.value,
                code: selectedAnswer?.code || question.starterCode || "",
                stdin: selectedAnswer?.stdin || "",
              })
            }
            className="mb-2 border p-2 rounded"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <textarea
            rows={10}
            value={selectedAnswer?.code || ""}
            onChange={(e) =>
              onSelect(question._id, { ...selectedAnswer, code: e.target.value })
            }
            placeholder="Write your code here..."
            className="w-full border rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={selectedAnswer?.stdin || ""}
            onChange={(e) =>
              onSelect(question._id, { ...selectedAnswer, stdin: e.target.value })
            }
            placeholder="Optional input (stdin)"
            className="w-full border p-2 rounded mt-2"
          />

          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleRunCode}
          >
            Run Code
          </button>

          {selectedAnswer?.output && (
            <pre className="bg-gray-100 p-3 mt-3 rounded text-sm overflow-x-auto">
              {selectedAnswer.output}
            </pre>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
