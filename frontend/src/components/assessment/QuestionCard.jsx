
// // import runCode from "../../api/axiosrunCode";

// // const QuestionCard = ({ question, index, selectedAnswer, onSelect }) => {
// //   if (!question) return null;

// //   const handleRunCode = async () => {
// //     onSelect(question._id, { ...selectedAnswer, output: "Running..." });

// //     try {
// //       const codeData = {
// //         questionId: question._id,
// //         code: selectedAnswer?.code || question.starterCode || "",
// //         language: selectedAnswer?.language || question.language || "javascript",
// //         stdin: selectedAnswer?.stdin || "",
// //       };

// //       const result = await runCode(codeData);

// //       let outputText = "";

// //       if (result?.compilerError) {
// //         outputText = "❌ Compiler / Runtime Error:\n\n" + result.compilerError;
// //       } else if (!result?.testCaseResults) {
// //         outputText = "No test case results received.";
// //       } else {
// //         const publicResults = result.testCaseResults
// //           .filter((tc) => !tc.isHidden)
// //           .map(
// //             (tc) =>
// //               `Input: ${tc.input || "(empty)"}\nExpected: ${tc.expectedOutput}\nYour Output: ${tc.actualOutput}\nPassed: ${tc.passed}`
// //           )
// //           .join("\n\n");

// //         if (!result.allPublicPassed) {
// //           outputText = publicResults + "\n\n❌ Public test case failed.";
// //         } else if (!result.allHiddenPassed) {
// //           outputText = publicResults + "\n\n❌ Hidden test case failed.";
// //         } else {
// //           outputText = publicResults + "\n\n✅ All test cases passed!";
// //         }
// //       }

// //       // Update output in parent state
// //       onSelect(question._id, { ...selectedAnswer, output: outputText });
// //     } catch (err) {
// //       console.error(err);
// //       onSelect(question._id, {
// //         ...selectedAnswer,
// //         output:
// //           err.response?.data?.compilerError ||
// //           err.response?.data?.error ||
// //           err.message ||
// //           "Error running code",
// //       });
// //     }
// //   };

// //   return (
// //     <div className="border p-5 my-5 rounded-lg shadow bg-white">
// //       <p className="font-semibold mb-4 text-lg">
// //         {index + 1}. {question.questionText}
// //       </p>

// //       {/* MCQ */}
// //       {question.type === "mcq" &&
// //         question.options?.map((opt, i) => (
// //           <div key={i} className="mb-2">
// //             <label className="flex items-center space-x-2 cursor-pointer">
// //               <input
// //                 type="radio"
// //                 name={question._id}
// //                 value={opt}
// //                 checked={selectedAnswer === opt}
// //                 onChange={() => onSelect(question._id, opt)}
// //                 className="accent-blue-600"
// //               />
// //               <span>{opt}</span>
// //             </label>
// //           </div>
// //         ))}

// //       {/* Fill in the blank */}
// //       {question.type === "fill-blank" && (
// //         <input
// //           type="text"
// //           value={selectedAnswer || ""}
// //           onChange={(e) => onSelect(question._id, e.target.value)}
// //           placeholder="Type your answer here..."
// //           className="w-full border p-2 rounded"
// //         />
// //       )}

// //       {/* Coding Question */}
// //       {question.type === "coding" && (
// //         <>
// //           {question.description && (
// //             <p className="mb-3 text-gray-700">{question.description}</p>
// //           )}

// //           {question.testCases?.length > 0 && (
// //             <div className="mb-3">
// //               <h4 className="font-semibold mb-2">Public Test Cases:</h4>
// //               {question.testCases.map((tc, i) => (
// //                 <div
// //                   key={i}
// //                   className="border p-2 rounded mb-2 bg-gray-50 text-sm"
// //                 >
// //                   <p>
// //                     <strong>Input:</strong> {tc.input || "(empty)"}
// //                   </p>
// //                   <p>
// //                     <strong>Expected Output:</strong> {tc.expectedOutput}
// //                   </p>
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           {question.starterCode && (
// //             <pre className="bg-gray-100 p-3 rounded mb-3 text-sm overflow-x-auto">
// //               {question.starterCode}
// //             </pre>
// //           )}

// //           <select
// //             value={selectedAnswer?.language || question.language || "javascript"}
// //             onChange={(e) =>
// //               onSelect(question._id, {
// //                 ...selectedAnswer,
// //                 language: e.target.value,
// //                 code: selectedAnswer?.code || question.starterCode || "",
// //                 stdin: selectedAnswer?.stdin || "",
// //               })
// //             }
// //             className="mb-2 border p-2 rounded"
// //           >
// //             <option value="javascript">JavaScript</option>
// //             <option value="python">Python</option>
// //             <option value="java">Java</option>
// //           </select>

// //           <textarea
// //             rows={10}
// //             value={selectedAnswer?.code || ""}
// //             onChange={(e) =>
// //               onSelect(question._id, { ...selectedAnswer, code: e.target.value })
// //             }
// //             placeholder="Write your code here..."
// //             className="w-full border rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />

// //           <input
// //             type="text"
// //             value={selectedAnswer?.stdin || ""}
// //             onChange={(e) =>
// //               onSelect(question._id, { ...selectedAnswer, stdin: e.target.value })
// //             }
// //             placeholder="Optional input (stdin)"
// //             className="w-full border p-2 rounded mt-2"
// //           />

// //           <button
// //             className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
// //             onClick={handleRunCode}
// //           >
// //             Run Code
// //           </button>

// //           {selectedAnswer?.output && (
// //             <pre className="bg-gray-100 p-3 mt-3 rounded text-sm overflow-x-auto">
// //               {selectedAnswer.output}
// //             </pre>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default QuestionCard;
// // QuestionCard.js
// import runCode from "../../api/axiosrunCode";

// const QuestionCard = ({ question, index, selectedAnswer, onSelect }) => {
//   if (!question) return null;

//   const handleRunCode = async () => {
//     onSelect(question._id, { ...selectedAnswer, output: "Running..." });
//     try {
//       const codeData = {
//         questionId: question._id,
//         code: selectedAnswer?.code || question.starterCode || "",
//         language: selectedAnswer?.language || question.language || "javascript",
//         stdin: selectedAnswer?.stdin || "",
//       };
//       const result = await runCode(codeData);
//       let outputText = "";

//       if (result?.compilerError) {
//         outputText = "❌ Compiler / Runtime Error:\n\n" + result.compilerError;
//       } else if (!result?.testCaseResults) {
//         outputText = "No test case results received.";
//       } else {
//         const publicResults = result.testCaseResults
//           .filter((tc) => !tc.isHidden)
//           .map(
//             (tc) =>
//               `Input: ${tc.input || "(empty)"}\nExpected: ${tc.expectedOutput}\nYour Output: ${tc.actualOutput}\nPassed: ${tc.passed}`
//           )
//           .join("\n\n");

//         if (!result.allPublicPassed) {
//           outputText = publicResults + "\n\n❌ Public test case failed.";
//         } else if (!result.allHiddenPassed) {
//           outputText = publicResults + "\n\n❌ Hidden test case failed.";
//         } else {
//           outputText = publicResults + "\n\n✅ All test cases passed!";
//         }
//       }

//       onSelect(question._id, { ...selectedAnswer, output: outputText });
//     } catch (err) {
//       console.error(err);
//       onSelect(question._id, {
//         ...selectedAnswer,
//         output:
//           err.response?.data?.compilerError ||
//           err.response?.data?.error ||
//           err.message ||
//           "Error running code",
//       });
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 my-5 transition hover:shadow-2xl border border-gray-200 dark:border-gray-700">
//       <p className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
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
//                 className="accent-blue-600 w-5 h-5"
//               />
//               <span className="text-gray-800 dark:text-gray-200">{opt}</span>
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
//           className="w-full border rounded-lg p-3 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//         />
//       )}

//       {/* Coding */}
//       {question.type === "coding" && (
//         <>
//           {question.starterCode && (
//             <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg mb-3 overflow-x-auto font-mono text-sm shadow-inner">
//               {question.starterCode}
//             </pre>
//           )}

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
//             className="mb-2 border rounded-lg p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
//           >
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//             <option value="java">Java</option>
//           </select>

//           <textarea
//             rows={10}
//             value={selectedAnswer?.code || ""}
//             onChange={(e) =>
//               onSelect(question._id, { ...selectedAnswer, code: e.target.value })
//             }
//             placeholder="Write your code here..."
//             className="w-full border rounded-lg p-4 font-mono text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />

//           <input
//             type="text"
//             value={selectedAnswer?.stdin || ""}
//             onChange={(e) =>
//               onSelect(question._id, { ...selectedAnswer, stdin: e.target.value })
//             }
//             placeholder="Optional input (stdin)"
//             className="w-full border rounded-lg p-2 mt-2 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
//           />

//           <button
//             className="mt-3 w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition font-semibold"
//             onClick={handleRunCode}
//           >
//             Run Code
//           </button>

//           {selectedAnswer?.output && (
//             <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-3 mt-3 rounded-lg text-sm overflow-x-auto shadow-inner">
//               {selectedAnswer.output}
//             </pre>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default QuestionCard;

// QuestionCard.js
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
    <div className="bg-white rounded-2xl shadow-md p-6 my-5 border border-gray-200 transition hover:shadow-xl">
      <p className="text-lg font-semibold mb-4 text-gray-900">
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
                className="accent-blue-500 w-5 h-5"
              />
              <span className="text-gray-800">{opt}</span>
            </label>
          </div>
        ))}

      {/* Fill in blank */}
      {question.type === "fill-blank" && (
        <input
          type="text"
          value={selectedAnswer || ""}
          onChange={(e) => onSelect(question._id, e.target.value)}
          placeholder="Type your answer here..."
          className="w-full border rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      )}

      {/* Coding */}
      {question.type === "coding" && (
        <>
          {question.starterCode && (
            <pre className="bg-gray-100 text-gray-900 p-4 rounded-lg mb-3 overflow-x-auto font-mono text-sm shadow-inner">
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
            className="mb-2 border rounded-lg p-2 w-full text-gray-900 focus:ring-2 focus:ring-blue-500 transition"
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
            className="w-full border rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            type="text"
            value={selectedAnswer?.stdin || ""}
            onChange={(e) =>
              onSelect(question._id, { ...selectedAnswer, stdin: e.target.value })
            }
            placeholder="Optional input (stdin)"
            className="w-full border rounded-lg p-2 mt-2 focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
            onClick={handleRunCode}
          >
            Run Code
          </button>

          {selectedAnswer?.output && (
            <pre className="bg-gray-100 text-gray-900 p-3 mt-3 rounded-lg text-sm overflow-x-auto shadow-inner">
              {selectedAnswer.output}
            </pre>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
