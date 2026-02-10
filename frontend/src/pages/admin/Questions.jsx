
// import React, { useEffect, useState } from "react";
// import axiosDash from "../../api/axiosDash";
// import axiosInstance from "../../api/axiosInstance";
// import { useTheme } from "../../context/ThemeContext";
// import axios from "axios";
// import AIChatWidget from "../../components/ai/AIChatWidget";


// const Questions = () => {
//   const { darkMode } = useTheme();

//   /* ===================== MASTER DATA ===================== */
//   const [roles, setRoles] = useState([]);
//   const [skills, setSkills] = useState([]);
//   const [assessments, setAssessments] = useState([]);
//   const [questions, setQuestions] = useState([]);

//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedSkill, setSelectedSkill] = useState("");
//   const [selectedAssessment, setSelectedAssessment] = useState("");

//   /* ===================== ASSESSMENT ===================== */
//   const [showCreateAssessment, setShowCreateAssessment] = useState(false);
//   const [assessmentName, setAssessmentName] = useState("");
//   const [assessmentLevel, setAssessmentLevel] = useState(1);
//   const [assessmentTimer, setAssessmentTimer] = useState(600);
//   const [totalQuestions, setTotalQuestions] = useState(10);
//   const [randomPick, setRandomPick] = useState(10);

//   /* ===================== QUESTION ===================== */
//   const [editingQuestionId, setEditingQuestionId] = useState(null);
//   const [questionType, setQuestionType] = useState("mcq");
//   const [questionText, setQuestionText] = useState("");
//   const [options, setOptions] = useState(["", "", "", ""]);
//   const [correctAnswer, setCorrectAnswer] = useState("");
//   const [selectedSkillName, setSelectedSkillName] = useState("");
//   const [selectedRoleName, setSelectedRoleName] = useState("");


//   /* Coding */
//   const [language, setLanguage] = useState("javascript");
//   const [testCases, setTestCases] = useState([
//     { input: "", expectedOutput: "", isHidden: false },
//   ]);

//   /* ===================== AI/QUESTION SETTINGS ===================== */
//   const [difficulty, setDifficulty] = useState("easy"); // ✅ added

//   /* ===================== UI ===================== */
//   const input = `w-full p-2 rounded border mb-2 ${
//     darkMode
//       ? "bg-gray-800 text-white border-gray-700"
//       : "bg-white text-black border-gray-300"
//   }`;

//   /* ===================== FETCH ===================== */
//   useEffect(() => {
//     axiosDash.get("/").then(res => setRoles(res.data.roles || []));
//   }, []);

//   useEffect(() => {
//     if (!selectedRole) return;
//     axiosInstance.get(`/skills/job-role/${selectedRole}`).then(res => {
//       setSkills(res.data.skills || []);
//       setSelectedSkill("");
//       setAssessments([]);
//       setQuestions([]);
//     });
//   }, [selectedRole]);

//   useEffect(() => {
//     if (!selectedSkill) return;
//     fetchAssessments();
//   }, [selectedSkill]);

//   useEffect(() => {
//     if (!selectedAssessment) return;
//     fetchQuestions();
//   }, [selectedAssessment]);

//   const fetchAssessments = async () => {
//     const res = await axiosInstance.get(
//       `/admin/assessments/skill/${selectedSkill}`
//     );
//     setAssessments(res.data.assessments || []);
//   };

//   const fetchQuestions = async () => {
//     const res = await axiosInstance.get(
//       `/questions/assessment/${selectedAssessment}`
//     );
//     setQuestions(res.data.questions || []);
//   };

//   /* ===================== ASSESSMENT ===================== */
//   const createAssessment = async () => {
//     if (!assessmentName) return alert("Assessment name required");

//     await axiosInstance.post("/admin/assessments", {
//       name: assessmentName,
//       skill: selectedSkill,
//       level: Number(assessmentLevel),
//       timer: Number(assessmentTimer),
//       totalQuestions: Number(totalQuestions),
//       randomPick: Number(randomPick),
//       minPassingPercentage: 60,
//       maxAttempts: 3,
//     });

//     setShowCreateAssessment(false);
//     setAssessmentName("");
//     fetchAssessments();
//   };

//   /* ===================== QUESTION SAVE ===================== */
//   const saveQuestion = async () => {
//     if (!questionText) return alert("Question text required");

//     const payload = {
//       assessment: selectedAssessment,
//       type: questionType,
//       questionText,
//       options: questionType === "mcq" ? options.filter(Boolean) : [],
//       correctAnswer: questionType !== "coding" ? correctAnswer : undefined,
//       language: questionType === "coding" ? language : undefined,
//       testCases: questionType === "coding" ? testCases : [],
//     };

//     if (editingQuestionId) {
//       await axiosInstance.put(`/questions/${editingQuestionId}`, payload);
//     } else {
//       await axiosInstance.post("/questions", payload);
//     }

//     resetQuestionForm();
//     fetchQuestions();
//   };

//   const resetQuestionForm = () => {
//     setEditingQuestionId(null);
//     setQuestionType("mcq");
//     setQuestionText("");
//     setOptions(["", "", "", ""]);
//     setCorrectAnswer("");
//     setLanguage("javascript");
//     setTestCases([{ input: "", expectedOutput: "", isHidden: false }]);
//     setDifficulty("easy"); // reset difficulty
//   };

//   /* ===================== AI GENERATION ===================== */
//   const generateAIQuestion = async () => {
//     try {
//       if (!selectedSkill) return alert("Select a skill first");
//       if (!questionType) return alert("Select question type");
//       if (!difficulty) return alert("Select difficulty");

//       const response = await axiosInstance.post("/ai/generate", {
//          role: selectedRoleName, 
//         skill: selectedSkillName,
//         difficulty: difficulty,
//         type: questionType,
//       });

//       const data = response.data;

//       setQuestionText(data.questionText || "");

//       if (questionType === "mcq" || questionType === "fill-blank") {
//         setOptions(data.options || ["", "", "", ""]);
//         setCorrectAnswer(data.correctAnswer || "");
//       }

//       if (questionType === "coding") {
//         setTestCases(
//           data.testCases || [{ input: "", expectedOutput: "", isHidden: false }]
//         );
//         setLanguage(data.language || "javascript");
//       }
//     } catch (error) {
//       console.error("AI generation error:", error);
//       alert("Failed to generate AI question");
//     }
//   };

//   /* ===================== EDIT / DELETE ===================== */
//   const editQuestion = q => {
//     setEditingQuestionId(q._id);
//     setQuestionType(q.type);
//     setQuestionText(q.questionText);
//     setOptions(q.options || ["", "", "", ""]);
//     setCorrectAnswer(q.correctAnswer || "");
//     setLanguage(q.language || "javascript");
//     setTestCases(q.testCases || []);
//     setDifficulty(q.difficulty || "easy"); // if saved
//   };

//   const deleteQuestion = async id => {
//     if (!window.confirm("Delete this question?")) return;
//     await axiosInstance.delete(`/questions/${id}`);
//     fetchQuestions();
//   };

//   /* ===================== UI ===================== */
//   return (
//     <div
//       className={`p-6 min-h-screen ${
//         darkMode ? "bg-gray-950 text-white" : "bg-gray-100"
//       }`}
//     >
//       <h1 className="text-3xl font-bold mb-6">Assessment Builder</h1>

//       {/* ROLES */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         {roles.map(r => (
//           <div
//             key={r._id}
//             onClick={() => {
//            setSelectedRole(r._id);
//            setSelectedRoleName(r.name); // send role name to AI
//          }}
//             className="p-4 bg-blue-600 text-white rounded cursor-pointer text-center"
//           >
//             {r.name}
//           </div>
//         ))}
//       </div>

//       {/* SKILLS */}
//       <div className="mb-4">
//         {skills.map(s => (
//           <button
//             key={s._id}
//             onClick={() => {
//           setSelectedSkill(s._id);       // keep ID for fetching assessments
//           setSelectedSkillName(s.name);  // save name for AI
//         }}
//             className="mr-2 mb-2 px-3 py-1 bg-green-600 text-white rounded"
//           >
//             {s.name}
//           </button>
//         ))}
//       </div>

//       {/* ASSESSMENTS */}
//       {selectedSkill && (
//         <>
//           <div className="mb-3">
//             {assessments.map(a => (
//               <button
//                 key={a._id}
//                 onClick={() => setSelectedAssessment(a._id)}
//                 className="mr-2 mb-2 px-3 py-1 bg-purple-600 text-white rounded"
//               >
//                 {a.name} (L{a.level})
//               </button>
//             ))}
//           </div>

//           {/* CREATE ASSESSMENT BUTTON */}
//           <button
//             onClick={() => setShowCreateAssessment(prev => !prev)}
//             className="px-4 py-2 bg-yellow-600 text-black rounded font-semibold"
//           >
//             + Create New Assessment
//           </button>
//         </>
//       )}

//       {/* CREATE ASSESSMENT FORM */}
//       {showCreateAssessment && (
//         <div className="mt-4 p-4 bg-yellow-100 rounded text-black">
//           <input
//             className={input}
//             placeholder="Assessment Name"
//             value={assessmentName}
//             onChange={e => setAssessmentName(e.target.value)}
//           />
//           <input
//             className={input}
//             type="number"
//             placeholder="Level"
//             value={assessmentLevel}
//             onChange={e => setAssessmentLevel(e.target.value)}
//           />
//           <input
//             className={input}
//             type="number"
//             placeholder="Total Questions"
//             value={totalQuestions}
//             onChange={e => setTotalQuestions(e.target.value)}
//           />
//           <input
//             className={input}
//             type="number"
//             placeholder="Random Pick"
//             value={randomPick}
//             onChange={e => setRandomPick(e.target.value)}
//           />
//           <input
//             className={input}
//             type="number"
//             placeholder="Timer (sec)"
//             value={assessmentTimer}
//             onChange={e => setAssessmentTimer(e.target.value)}
//           />
//           <button
//             onClick={createAssessment}
//             className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
//           >
//             Create Assessment
//           </button>
//         </div>
//       )}

//       {/* QUESTION FORM */}
//       {selectedAssessment && (
//         <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded">
//           <textarea
//             className={input}
//             placeholder="Question text"
//             value={questionText}
//             onChange={e => setQuestionText(e.target.value)}
//           />

//           <select
//             className={input}
//             value={questionType}
//             onChange={e => setQuestionType(e.target.value)}
//           >
//             <option value="mcq">MCQ</option>
//             <option value="fill-blank">Fill Blank</option>
//             <option value="coding">Coding</option>
//           </select>

//           {questionType === "mcq" &&
//             options.map((o, i) => (
//               <input
//                 key={i}
//                 className={input}
//                 placeholder={`Option ${i + 1}`}
//                 value={o}
//                 onChange={e =>
//                   setOptions(p => p.map((x, idx) => (idx === i ? e.target.value : x)))
//                 }
//               />
//             ))}

//           {questionType === "coding" && (
//             <>
//               <select
//                 className={input}
//                 value={language}
//                 onChange={e => setLanguage(e.target.value)}
//               >
//                 <option value="javascript">JavaScript</option>
//                 <option value="python">Python</option>
//                 <option value="java">Java</option>
//               </select>

//               {testCases.map((tc, i) => (
//                 <div key={i} className="border p-2 mb-2 rounded">
//                   <input
//                     className={input}
//                     placeholder="Input"
//                     value={tc.input}
//                     onChange={e => {
//                       const t = [...testCases];
//                       t[i].input = e.target.value;
//                       setTestCases(t);
//                     }}
//                   />
//                   <input
//                     className={input}
//                     placeholder="Expected Output"
//                     value={tc.expectedOutput}
//                     onChange={e => {
//                       const t = [...testCases];
//                       t[i].expectedOutput = e.target.value;
//                       setTestCases(t);
//                     }}
//                   />
//                   <label className="text-sm">
//                     <input
//                       type="checkbox"
//                       checked={tc.isHidden}
//                       onChange={e => {
//                         const t = [...testCases];
//                         t[i].isHidden = e.target.checked;
//                         setTestCases(t);
//                       }}
//                     />{" "}
//                     Hidden
//                   </label>
//                 </div>
//               ))}

//               {/* Difficulty Selector */}
//               <select
//                 className={input}
//                 value={difficulty}
//                 onChange={e => setDifficulty(e.target.value)}
//               >
//                 <option value="easy">Easy</option>
//                 <option value="medium">Medium</option>
//                 <option value="hard">Hard</option>
//               </select>

//               <button
//                 onClick={() =>
//                   setTestCases(p => [...p, { input: "", expectedOutput: "", isHidden: false }])
//                 }
//                 className="px-3 py-1 bg-gray-700 text-white rounded"
//               >
//                 + Add Test Case
//               </button>
//             </>
//           )}

//           {questionType !== "coding" && (
//             <input
//               className={input}
//               placeholder="Correct Answer"
//               value={correctAnswer}
//               onChange={e => setCorrectAnswer(e.target.value)}
//             />
//           )}

//           {/* ================= AI BUTTON ================= */}
//           <button
//             onClick={generateAIQuestion} // <-- call the function here
//             className="mt-2 mr-2 px-4 py-2 bg-purple-600 text-white rounded"
//           >
//             Generate AI Question
//           </button>

//           <button
//             onClick={saveQuestion}
//             className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             {editingQuestionId ? "Update Question" : "Add Question"}
//           </button>
//         </div>
//       )}

//       {/* QUESTIONS LIST */}
//       <div className="mt-6">
//         {questions.map(q => (
//           <div key={q._id} className="p-3 border rounded mb-2">
//             <b>{q.type.toUpperCase()}</b> – {q.questionText}
//             <div className="mt-2">
//               <button onClick={() => editQuestion(q)} className="mr-3 text-blue-600">
//                 Edit
//               </button>
//               <button onClick={() => deleteQuestion(q._id)} className="text-red-600">
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//       <AIChatWidget />

//     </div>
//   );
// };

// export default Questions;




import React, { useEffect, useState } from "react";
import axiosDash from "../../api/axiosDash";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import AIChatWidget from "../../components/ai/AIChatWidget";

const Questions = () => {
  const { darkMode } = useTheme();

  /* ===================== MASTER DATA ===================== */
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");

  /* ===================== ASSESSMENT ===================== */
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentLevel, setAssessmentLevel] = useState("");
  const [assessmentTimer, setAssessmentTimer] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [randomPick, setRandomPick] = useState("");
  const [minPassingPercentage, setMinPassingPercentage] = useState("");

  /* ===================== QUESTION ===================== */
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionType, setQuestionType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  /* Coding */
  const [language, setLanguage] = useState("javascript");
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", isHidden: false },
  ]);

  /* ===================== AI ===================== */
  const [difficulty, setDifficulty] = useState("easy");

  /* ===================== INPUT STYLE ===================== */
  const input = `w-full p-3 rounded-lg border text-sm focus:outline-none transition ${
    darkMode
      ? "bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-500"
      : "bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-400"
  }`;

  /* ===================== FETCH ===================== */
  useEffect(() => {
    axiosDash.get("/").then(res => setRoles(res.data.roles || []));
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    axiosInstance.get(`/skills/job-role/${selectedRole}`).then(res => {
      setSkills(res.data.skills || []);
      setSelectedSkill("");
      setAssessments([]);
      setQuestions([]);
    });
  }, [selectedRole]);

  useEffect(() => {
    if (!selectedSkill) return;
    fetchAssessments();
  }, [selectedSkill]);

  useEffect(() => {
    if (!selectedAssessment) return;
    fetchQuestions();
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    const res = await axiosInstance.get(
      `/admin/assessments/skill/${selectedSkill}`
    );
    setAssessments(res.data.assessments || []);
  };

  const fetchQuestions = async () => {
    const res = await axiosInstance.get(
      `/questions/assessment/${selectedAssessment}`
    );
    setQuestions(res.data.questions || []);
  };

  /* ===================== CREATE / UPDATE ASSESSMENT ===================== */
const createAssessment = async () => {
  if (!assessmentName) return alert("Assessment name required");

  const payload = {
    name: assessmentName,
    skill: selectedSkill,
    level: Number(assessmentLevel),
    timer: Number(assessmentTimer) * 60, // minutes → seconds
    totalQuestions: Number(totalQuestions),
    randomPick: Number(randomPick),
    minPassingPercentage: Number(minPassingPercentage),
    maxAttempts: Number(maxAttempts),
  };

  if (editingAssessmentId) {
    // UPDATE assessment
    await axiosInstance.put(
      `/admin/assessments/${editingAssessmentId}`,
      payload
    );
  } else {
    // CREATE assessment
    await axiosInstance.post("/admin/assessments", payload);
  }

  // reset form
  setEditingAssessmentId(null);
  setShowCreateAssessment(false);
  setAssessmentName("");
  fetchAssessments();
};

/* ===================== HANDLE EDIT ASSESSMENT ===================== */
const handleEditAssessment = a => {
  setEditingAssessmentId(a._id);
  setAssessmentName(a.name);
  setAssessmentLevel(a.level);
  setTotalQuestions(a.totalQuestions);
  setRandomPick(a.randomPick);
  setAssessmentTimer(a.timer / 60); // seconds → minutes
  setMaxAttempts(a.maxAttempts);
  setMinPassingPercentage(a.minPassingPercentage);
  setShowCreateAssessment(true);
};
/* handle delete */
const handleDeleteAssessment = async (id) => {
  if (!window.confirm("Delete this assessment?")) return;

  await axiosInstance.delete(`/admin/assessments/${id}`);

  if (selectedAssessment === id) {
    setSelectedAssessment("");
    setQuestions([]);
  }

  fetchAssessments();
};
  /* ===================== SAVE QUESTION ===================== */
  const saveQuestion = async () => {
    if (!questionText) return alert("Question text required");
    const selectedAssessmentObj = assessments.find(
  a => a._id === selectedAssessment
);

if (
  !editingQuestionId &&
  selectedAssessmentObj &&
  questions.length >= selectedAssessmentObj.totalQuestions
) {
  return alert(
    "You have already added the maximum number of questions for this assessment"
  );
}

    const payload = {
      assessment: selectedAssessment,
      type: questionType,
      questionText,
      options: questionType === "mcq" ? options.filter(Boolean) : [],
      correctAnswer: questionType !== "coding" ? correctAnswer : undefined,
      language: questionType === "coding" ? language : undefined,
      testCases: questionType === "coding" ? testCases : [],
    };

    if (editingQuestionId) {
      await axiosInstance.put(`/questions/${editingQuestionId}`, payload);
    } else {
      await axiosInstance.post("/questions", payload);
    }

    resetQuestionForm();
    fetchQuestions();
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionType("mcq");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setLanguage("javascript");
    setTestCases([{ input: "", expectedOutput: "", isHidden: false }]);
    setDifficulty("easy");
  };

  /* ===================== AI ===================== */
  const generateAIQuestion = async () => {
    if (!selectedSkill || !difficulty || !questionType)
      return alert("Select role, skill, type & difficulty");

    const response = await axiosInstance.post("/ai/generate", {
      role: selectedRoleName,
      skill: selectedSkillName,
      difficulty,
      type: questionType,
    });

    const data = response.data;
    setQuestionText(data.questionText || "");

    if (questionType === "mcq") {
      setOptions(data.options || ["", "", "", ""]);
      setCorrectAnswer(data.correctAnswer || "");
    }

    if (questionType === "coding") {
      setTestCases(data.testCases || []);
      setLanguage(data.language || "javascript");
    }
  };

  /* ===================== EDIT / DELETE ===================== */
  const editQuestion = q => {
    setEditingQuestionId(q._id);
    setQuestionType(q.type);
    setQuestionText(q.questionText);
    setOptions(q.options || ["", "", "", ""]);
    setCorrectAnswer(q.correctAnswer || "");
    setLanguage(q.language || "javascript");
    setTestCases(q.testCases || []);
    setDifficulty(q.difficulty || "easy");
  };

  const deleteQuestion = async id => {
    if (!window.confirm("Delete this question?")) return;
    await axiosInstance.delete(`/questions/${id}`);
    fetchQuestions();
  };

  /* ===================== UI ===================== */
  return (
    <div
      className={`p-4 md:p-6 min-h-screen ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">Assessment Builder</h1>

      {/* JOB ROLES */}
      <h2 className="font-semibold mb-2">Select Job Role</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {roles.map(r => (
          <button
            key={r._id}
            onClick={() => {
              setSelectedRole(r._id);
              setSelectedRoleName(r.name);
            }}
            className={`p-3 rounded-lg font-medium transition ${
              selectedRole === r._id
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-white hover:bg-gray-200"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* SKILLS */}
      <h2 className="font-semibold mb-2">Select Skill</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.map(s => (
          <button
            key={s._id}
            onClick={() => {
              setSelectedSkill(s._id);
              setSelectedSkillName(s.name);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              selectedSkill === s._id
                ? "bg-green-600 text-white"
                : darkMode
                ? "bg-gray-800"
                : "bg-white border"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* ASSESSMENTS */}
      {selectedSkill && (
        <>
          <h2 className="font-semibold mb-2">Assessments</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {assessments.map(a => (
  <div key={a._id} className="flex items-center gap-2">
    <button
      onClick={() => setSelectedAssessment(a._id)}
      className={`px-4 py-1.5 rounded-full ${
        selectedAssessment === a._id
          ? "bg-purple-600 text-white"
          : darkMode ? "bg-gray-800" : "bg-white border"
      }`}
    >
      {a.name} (L{a.level})
    </button>

    <button
      onClick={() => handleEditAssessment(a)}
      className="text-blue-500 text-sm"
    >
      Edit
    </button>

    <button
      onClick={() => handleDeleteAssessment(a._id)}
      className="text-red-500 text-sm"
    >
      Delete
    </button>
  </div>
))}
          </div>

          <button
            onClick={() => setShowCreateAssessment(!showCreateAssessment)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg mb-6"
          >
            + Create Assessment
          </button>
        </>
      )}

      {/* CREATE ASSESSMENT */}
      {showCreateAssessment && (
        <div
          className={`p-6 rounded-xl mb-6 ${
            darkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          <h3 className="font-semibold mb-4">New Assessment</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <input className={input} placeholder="Assessment Name" value={assessmentName} onChange={e => setAssessmentName(e.target.value)} />
            <input className={input} type="number" placeholder="Level" value={assessmentLevel} onChange={e => setAssessmentLevel(e.target.value)} />
            <input className={input} type="number" placeholder="Total Questions" value={totalQuestions} onChange={e => setTotalQuestions(e.target.value)} />
            <input className={input} type="number" placeholder="Random Pick" value={randomPick} onChange={e => setRandomPick(e.target.value)} />
            <input className={input} type="number" placeholder="Timer (minutes)" value={assessmentTimer} onChange={e => setAssessmentTimer(e.target.value)} />
            <input
  className={input}
  type="number"
  placeholder="Max Attempts"
  value={maxAttempts}
  onChange={e => setMaxAttempts(e.target.value)}
/>
 <input
    className={input}
    type="number"
    placeholder="Min Passing Percentage"
    value={minPassingPercentage}
    onChange={e => setMinPassingPercentage(e.target.value)}
  />
          </div>

          <button
            onClick={createAssessment}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            Create Assessment
          </button>
        </div>
      )}

      {/* QUESTION FORM */}
      {selectedAssessment && (
        <div
          className={`p-6 rounded-xl mb-6 ${
            darkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          <h3 className="font-semibold mb-4">Add New Question</h3>

          <label className="text-sm">Question Text</label>
          <textarea className={input} value={questionText} onChange={e => setQuestionText(e.target.value)} />

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm">Question Type</label>
              <select className={input} value={questionType} onChange={e => setQuestionType(e.target.value)}>
                <option value="mcq">MCQ</option>
                <option value="fill-blank">Fill Blank</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Difficulty</label>
              <select className={input} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {questionType === "mcq" &&
            options.map((o, i) => (
              <input
                key={i}
                className={input}
                placeholder={`Option ${i + 1}`}
                value={o}
                onChange={e =>
                  setOptions(p => p.map((x, idx) => (idx === i ? e.target.value : x)))
                }
              />
            ))}

          {questionType !== "coding" && (
            <input
              className={input}
              placeholder="Correct Answer"
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
            />
          )}

          {questionType === "coding" && (
            <>
              <select className={input} value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>

              {testCases.map((tc, i) => (
                <div key={i} className="border rounded-lg p-3 mb-3">
                  <input className={input} placeholder="Input" value={tc.input} onChange={e => {
                    const t = [...testCases]; t[i].input = e.target.value; setTestCases(t);
                  }} />
                  <input className={input} placeholder="Expected Output" value={tc.expectedOutput} onChange={e => {
                    const t = [...testCases]; t[i].expectedOutput = e.target.value; setTestCases(t);
                  }} />
                  <label className="text-sm">
                    <input type="checkbox" checked={tc.isHidden} onChange={e => {
                      const t = [...testCases]; t[i].isHidden = e.target.checked; setTestCases(t);
                    }} /> Hidden
                  </label>
                </div>
              ))}

              <button
                onClick={() => setTestCases(p => [...p, { input: "", expectedOutput: "", isHidden: false }])}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                + Add Test Case
              </button>
            </>
          )}

          <div className="mt-4 flex gap-3">
            <button onClick={generateAIQuestion} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              Generate AI Question
            </button>
            <button onClick={saveQuestion} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {editingQuestionId ? "Update Question" : "Add Question"}
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONS LIST */}
      <div className="space-y-3">
        {questions.map(q => (
          <div
            key={q._id}
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">{q.type.toUpperCase()}</span>
              <div className="space-x-3">
                <button onClick={() => editQuestion(q)} className="text-blue-500">Edit</button>
                <button onClick={() => deleteQuestion(q._id)} className="text-red-500">Delete</button>
              </div>
            </div>
            <p className="mt-2">{q.questionText}</p>
          </div>
        ))}
      </div>

      <AIChatWidget />
    </div>
  );
};

export default Questions;