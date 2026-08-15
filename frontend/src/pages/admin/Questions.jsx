import React, { useEffect, useState } from "react";
import axiosDash from "../../api/axiosDash";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { usePermission } from "../../context/PermissionContext";
import AIChatWidget from "../../components/ai/AIChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const Questions = () => {
  const { darkMode } = useTheme();
  const { currentUser } = usePermission();

  // ====== MASTER DATA ======
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);

  // ====== CONTEXT ======
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  
  // ====== VIEW STATE ======
  // "assessments" | "builder"
  const [activeView, setActiveView] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // ====== ASSESSMENT FORM ======
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [assessmentForm, setAssessmentForm] = useState({
    name: "", level: "", timer: "", totalQuestions: "", randomPick: "", minPassingPercentage: "", maxAttempts: ""
  });

  // ====== QUESTION FORM ======
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionType, setQuestionType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  
  // Coding Specific
  const [language, setLanguage] = useState("javascript");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", isHidden: false }]);

  // ====== FETCH INITIAL DATA ======
  useEffect(() => {
    axiosDash.get("/").then(res => setRoles(res.data.roles || []));
    axiosInstance.get("/job-roles/access-requests/outgoing").then(res => setOutgoingRequests(res.data.requests || []));
  }, []);

  useEffect(() => {
    if (!selectedRole) {
      setSkills([]); setSelectedSkill(""); return;
    }
    axiosInstance.get(`/skills/job-role/${selectedRole}`).then(res => {
      setSkills(res.data.skills || []);
      setSelectedSkill("");
      setAssessments([]);
      setActiveView("assessments");
    });
  }, [selectedRole]);

  useEffect(() => {
    if (!selectedSkill) {
      setAssessments([]); return;
    }
    fetchAssessments();
  }, [selectedSkill]);

  useEffect(() => {
    if (!selectedAssessment) {
      setQuestions([]); return;
    }
    fetchQuestions(selectedAssessment._id);
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    try {
      const res = await axiosInstance.get(`/admin/assessments/skill/${selectedSkill}`);
      setAssessments(res.data.assessments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async (assessmentId) => {
    try {
      const res = await axiosInstance.get(`/questions/assessment/${assessmentId}`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ====== PERMISSION LOGIC ======
  const selectedRoleObj = roles.find(r => r._id === selectedRole);
  const creatorId = selectedRoleObj && (typeof selectedRoleObj.createdBy === 'object' ? selectedRoleObj.createdBy?._id : selectedRoleObj.createdBy);
  const isOwner = creatorId === currentUser?.id;
  
  const request = outgoingRequests.find(r => (r.jobRoleId?._id || r.jobRoleId) === selectedRole);
  let accessStatus = "none";
  if (request && request.status === "Approved" && new Date(request.accessExpiresAt) > new Date()) {
    accessStatus = "approved";
  }
  const canModify = selectedRole ? (isOwner || accessStatus === "approved") : false;


  // ====== ASSESSMENT ACTIONS ======
  const openCreateAssessment = () => {
    setEditingAssessmentId(null);
    setAssessmentForm({ name: "", level: "1", timer: "10", totalQuestions: "10", randomPick: "10", minPassingPercentage: "60", maxAttempts: "3" });
    setShowAssessmentModal(true);
  };

  const openEditAssessment = (a) => {
    setEditingAssessmentId(a._id);
    setAssessmentForm({
      name: a.name || "",
      level: a.level || 1,
      timer: (a.timer || 600) / 60,
      totalQuestions: a.totalQuestions || 10,
      randomPick: a.randomPick || 10,
      minPassingPercentage: a.minPassingPercentage || 60,
      maxAttempts: a.maxAttempts || 3
    });
    setShowAssessmentModal(true);
  };

  const saveAssessment = async () => {
    if (!assessmentForm.name) return alert("Assessment name required");
    
    const payload = {
      name: assessmentForm.name,
      skillId: selectedSkill,
      level: Number(assessmentForm.level),
      timer: Number(assessmentForm.timer) * 60,
      totalQuestions: Number(assessmentForm.totalQuestions),
      randomPick: Number(assessmentForm.randomPick),
      minPassingPercentage: Number(assessmentForm.minPassingPercentage),
      maxAttempts: Number(assessmentForm.maxAttempts),
    };
    if (editingAssessmentId) payload.assessmentId = editingAssessmentId;

    try {
      await axiosInstance.post("/admin/assessments/blueprints", payload);
      setShowAssessmentModal(false);
      fetchAssessments();
    } catch (err) {
      console.error(err);
      alert("Failed to save assessment");
    }
  };

  const deleteAssessment = async (id) => {
    if (!window.confirm("Delete this assessment? This will delete all its questions.")) return;
    try {
      await axiosInstance.delete(`/admin/assessments/${id}`);
      if (selectedAssessment?._id === id) {
        setSelectedAssessment(null);
        setActiveView("assessments");
      }
      fetchAssessments();
    } catch (err) {
      console.error(err);
    }
  };

  const openAssessmentBuilder = (a) => {
    setSelectedAssessment(a);
    setActiveView("builder");
  };

  // ====== QUESTION ACTIONS ======
  const openCreateQuestion = () => {
    if (questions.length >= selectedAssessment.totalQuestions) {
      return alert("Maximum questions reached for this assessment blueprint.");
    }
    setEditingQuestionId(null);
    setQuestionType("mcq");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setDifficulty("easy");
    setLanguage("javascript");
    setTestCases([{ input: "", expectedOutput: "", isHidden: false }]);
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionType(q.type || "mcq");
    setQuestionText(q.questionText || "");
    setOptions(q.options && q.options.length ? q.options : ["", "", "", ""]);
    setCorrectAnswer(q.correctAnswer || "");
    setDifficulty(q.difficulty || "easy");
    setLanguage(q.language || "javascript");
    setTestCases(q.testCases && q.testCases.length ? q.testCases : [{ input: "", expectedOutput: "", isHidden: false }]);
    setShowQuestionModal(true);
  };

  const saveQuestion = async () => {
    if (!questionText) return alert("Question text required");
    
    const payload = {
      assessment: selectedAssessment._id,
      type: questionType,
      questionText,
      options: questionType === "mcq" ? options.filter(Boolean) : [],
      correctAnswer: questionType !== "coding" ? correctAnswer : undefined,
      language: questionType === "coding" ? language : undefined,
      testCases: questionType === "coding" ? testCases : [],
      difficulty
    };

    try {
      if (editingQuestionId) {
        await axiosInstance.put(`/questions/${editingQuestionId}`, payload);
      } else {
        await axiosInstance.post("/questions", payload);
      }
      setShowQuestionModal(false);
      fetchQuestions(selectedAssessment._id);
    } catch (err) {
      console.error(err);
      alert("Failed to save question");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axiosInstance.delete(`/questions/${id}`);
      fetchQuestions(selectedAssessment._id);
      if (editingQuestionId === id) setShowQuestionModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAIQuestion = async () => {
    try {
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
        setTestCases(data.testCases || [{ input: "", expectedOutput: "", isHidden: false }]);
        setLanguage(data.language || "javascript");
      }
    } catch (err) {
      console.error("AI Generation Error", err);
      alert("AI Generation failed. Check console.");
    }
  };


  // ====== STYLING VARS ======
  const inputClass = `w-full px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-200 bg-admin-bg border-admin-border text-admin-text placeholder-admin-text-muted focus:border-admin-primary focus:ring-1 focus:ring-admin-primary focus:outline-none`;
  const selectClass = inputClass; 
  const labelClass = "block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-admin-text-muted";

  // ====== RENDERS ======
  
  const renderAssessmentList = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {!selectedSkill ? (
        <div className="p-10 rounded-2xl border flex flex-col items-center justify-center text-center bg-admin-surface/50 border-admin-border">
           <BeakerIcon className="w-12 h-12 mb-4 text-admin-text-muted opacity-50" />
           <p className="text-[15px] font-semibold text-admin-text">Select a Job Role and Skill to view assessments</p>
           <p className="text-[13px] mt-1 text-admin-text-muted">Assessments are attached directly to specific skills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {assessments.map(a => (
            <motion.div 
              key={a._id}
              whileHover={{ y: -4 }}
              className="flex flex-col p-6 rounded-[20px] border shadow-sm transition-all group bg-admin-surface border-admin-border"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-admin-primary-light text-admin-primary">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-admin-bg border-admin-border text-admin-text-muted">
                  Level {a.level}
                </div>
              </div>
              
              <h3 className="text-[16px] font-bold leading-tight mb-2 text-admin-text">{a.name}</h3>
              
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                   <ClockIcon className="w-3.5 h-3.5 text-admin-text-muted" />
                   <span className="text-[12px] font-semibold text-admin-text-muted">{a.timer / 60}m</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <CheckCircleIcon className="w-3.5 h-3.5 text-admin-text-muted" />
                   <span className="text-[12px] font-semibold text-admin-text-muted">{a.totalQuestions} Qs</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-admin-border flex gap-2">
                <button 
                  onClick={() => openAssessmentBuilder(a)}
                  className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-colors bg-admin-primary text-white hover:bg-admin-primary-hover"
                >
                  Questions
                </button>
                {canModify && (
                  <>
                    <button 
                      onClick={() => openEditAssessment(a)}
                      className="p-2 rounded-lg transition-colors bg-admin-bg hover:bg-admin-border text-admin-text-muted hover:text-admin-text"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteAssessment(a._id)}
                      className="p-2 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Create Placeholder */}
          {canModify && (
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={openCreateAssessment}
              className="flex flex-col items-center justify-center p-6 rounded-[20px] border border-dashed cursor-pointer transition-all bg-admin-surface/50 border-admin-border hover:border-admin-primary/50 hover:bg-admin-primary-light"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-admin-bg shadow-sm text-admin-text-muted group-hover:text-admin-primary">
                <PlusIcon className="w-6 h-6" />
              </div>
              <h3 className="text-[14px] font-bold text-admin-text">Create Assessment</h3>
              <p className="text-[12px] mt-1 text-admin-text-muted">Design a new test blueprint</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderQuestionBuilder = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)]">
      
      {/* LEFT: 70% QUESTION LIST */}
      <div className="w-full lg:w-[70%] flex flex-col rounded-[24px] border overflow-hidden bg-admin-surface border-admin-border shadow-sm">
        <div className="p-5 border-b flex justify-between items-center bg-admin-bg/50 border-admin-border">
          <div>
            <h3 className="text-[16px] font-bold flex items-center gap-2 text-admin-text">
              <button onClick={() => setActiveView("assessments")} className="p-1 rounded-md hover:bg-admin-border text-admin-text-muted"><ArrowLeftIcon className="w-4 h-4"/></button>
              {selectedAssessment.name} Questions
            </h3>
            <p className="text-[12px] mt-0.5 ml-8 text-admin-text-muted">
              {questions.length} / {selectedAssessment.totalQuestions} Questions Added
            </p>
          </div>
          {canModify && questions.length < selectedAssessment.totalQuestions && (
            <button onClick={openCreateQuestion} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors bg-admin-primary hover:bg-admin-primary-hover text-white">
              <PlusIcon className="w-4 h-4" /> Add Question
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
          {questions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <DocumentTextIcon className="w-12 h-12 mb-3 text-admin-text-muted opacity-50" />
                <p className="text-[14px] font-semibold text-admin-text">No questions yet</p>
                <p className="text-[12px] mt-1 text-admin-text-muted">Click Add Question to start building.</p>
             </div>
          ) : (
            questions.map((q, i) => (
              <div 
                key={q._id} 
                onClick={() => canModify ? openEditQuestion(q) : null}
                className={`p-4 rounded-xl border flex gap-4 cursor-pointer transition-all ${
                  editingQuestionId === q._id 
                    ? "border-admin-primary bg-admin-primary-light"
                    : "border-admin-border bg-admin-surface hover:border-admin-border-hover hover:shadow-sm"
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 bg-admin-bg text-admin-primary">
                  {(i+1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-admin-bg text-admin-text-muted">{q.type}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                      q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>{q.difficulty}</span>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed line-clamp-2 text-admin-text">{q.questionText}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: 30% QUESTION FORM */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full lg:w-[30%] flex flex-col rounded-[24px] border shadow-xl overflow-hidden shrink-0 bg-admin-elevated border-admin-border"
          >
            <div className="p-4 border-b flex justify-between items-center border-admin-border bg-admin-surface">
              <h3 className="text-[14px] font-bold text-admin-text">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="p-1.5 rounded-lg hover:bg-admin-bg text-admin-text-muted hover:text-admin-text">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
              {/* Question Form Fields */}
              <div className="flex gap-2 mb-2">
                 <button onClick={generateAIQuestion} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold transition-all border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
                   <SparklesIcon className="w-3.5 h-3.5"/> Auto-Generate
                 </button>
              </div>

              <div>
                <label className={labelClass}>Question Type</label>
                <select className={selectClass} value={questionType} onChange={e => setQuestionType(e.target.value)}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="coding">Coding Challenge</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Difficulty</label>
                <select className={selectClass} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Question Prompt</label>
                <textarea className={`${inputClass} min-h-[100px] resize-none`} value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Type the question here..." />
              </div>

              {questionType === "mcq" && (
                <div>
                  <label className={labelClass}>Options</label>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <input key={i} className={inputClass} placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => setOptions(p => p.map((x, idx) => idx === i ? e.target.value : x))} />
                    ))}
                  </div>
                </div>
              )}

              {questionType !== "coding" && (
                <div>
                  <label className={labelClass}>Correct Answer</label>
                  <input className={inputClass} placeholder="Exact match expected" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
                </div>
              )}

              {questionType === "coding" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Language</label>
                    <select className={selectClass} value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>Test Cases</label>
                      <button onClick={() => setTestCases(p => [...p, { input: "", expectedOutput: "", isHidden: false }])} className="text-[10px] font-bold text-admin-primary hover:text-admin-primary-hover">+ ADD CASE</button>
                    </div>
                    
                    <div className="space-y-3">
                      {testCases.map((tc, i) => (
                        <div key={i} className="p-3 rounded-xl border border-admin-border bg-admin-bg">
                          <input className={`${inputClass} mb-2 bg-transparent border-none p-0 focus:ring-0`} placeholder="Input" value={tc.input} onChange={e => { const t = [...testCases]; t[i].input = e.target.value; setTestCases(t); }} />
                          <div className="h-[1px] w-full mb-2 bg-admin-border" />
                          <input className={`${inputClass} mb-2 bg-transparent border-none p-0 focus:ring-0`} placeholder="Expected Output" value={tc.expectedOutput} onChange={e => { const t = [...testCases]; t[i].expectedOutput = e.target.value; setTestCases(t); }} />
                          
                          <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={tc.isHidden} onChange={e => { const t = [...testCases]; t[i].isHidden = e.target.checked; setTestCases(t); }} className="rounded border-admin-border text-admin-primary focus:ring-admin-primary bg-admin-surface" />
                            <span className="text-[11px] font-medium text-admin-text-muted">Hidden Test Case</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-2 border-admin-border bg-admin-surface">
               <button onClick={() => setShowQuestionModal(false)} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-colors bg-admin-bg hover:bg-admin-border text-admin-text">Cancel</button>
               <button onClick={saveQuestion} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-colors text-white bg-admin-primary hover:bg-admin-primary-hover">Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="w-full font-sans animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 relative z-10">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold mb-1.5 tracking-tight text-admin-text">
            Assessment Studio
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium text-admin-text-muted">
            Design, organize and publish assessments for each job role.
          </p>
        </div>
        
        {/* Warning if View Only */}
        {!canModify && selectedRole && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-xl flex items-center gap-2 text-[12px] font-bold">
            <ShieldCheckIcon className="w-4 h-4" /> View Only Access
          </div>
        )}
      </div>

      {/* CONTEXT SELECTORS */}
      <div className="flex flex-col md:flex-row gap-4 p-5 rounded-[24px] mb-8 border relative z-10 bg-admin-surface border-admin-border shadow-sm">
        <div className="flex-1">
          <label className={labelClass}>Job Role</label>
          <div className="relative">
             <BriefcaseIcon className="absolute left-3.5 top-3 w-4 h-4 text-admin-text-muted" />
             <select 
               className={`${selectClass} pl-10`}
               value={selectedRole}
               onChange={e => {
                 setSelectedRole(e.target.value);
                 setSelectedRoleName(e.target.options[e.target.selectedIndex].text);
               }}
             >
               <option value="" disabled>Select a Job Role...</option>
               {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
             </select>
          </div>
        </div>

        <div className="flex-1">
          <label className={labelClass}>Skill Domain</label>
          <div className="relative">
             <AcademicCapIcon className="absolute left-3.5 top-3 w-4 h-4 text-admin-text-muted" />
             <select 
               className={`${selectClass} pl-10`}
               value={selectedSkill}
               onChange={e => {
                 setSelectedSkill(e.target.value);
                 setSelectedSkillName(e.target.options[e.target.selectedIndex].text);
               }}
               disabled={!selectedRole}
             >
               <option value="" disabled>{selectedRole ? 'Select a Skill...' : 'Select a Job Role first'}</option>
               {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <div className="relative z-10">
         <AnimatePresence mode="wait">
            {activeView === "assessments" ? renderAssessmentList() : renderQuestionBuilder()}
         </AnimatePresence>
      </div>

      {/* CREATE/EDIT ASSESSMENT MODAL */}
      <AnimatePresence>
        {showAssessmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssessmentModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl rounded-[24px] shadow-2xl border overflow-hidden bg-admin-elevated border-admin-border">
              
              <div className="p-6 border-b flex justify-between items-center border-admin-border">
                <h2 className="text-[20px] font-bold text-admin-text">{editingAssessmentId ? 'Edit Assessment Blueprint' : 'Create Assessment Blueprint'}</h2>
                <button onClick={() => setShowAssessmentModal(false)} className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Assessment Name</label>
                  <input className={inputClass} placeholder="e.g. Advanced Java Concurrency Exam" value={assessmentForm.name} onChange={e => setAssessmentForm({...assessmentForm, name: e.target.value})} />
                </div>
                
                <div>
                  <label className={labelClass}>Difficulty Level (1-5)</label>
                  <input type="number" min="1" max="5" className={inputClass} value={assessmentForm.level} onChange={e => setAssessmentForm({...assessmentForm, level: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Duration (Minutes)</label>
                  <input type="number" min="1" className={inputClass} value={assessmentForm.timer} onChange={e => setAssessmentForm({...assessmentForm, timer: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Max Pool Size (Total Qs)</label>
                  <input type="number" min="1" className={inputClass} value={assessmentForm.totalQuestions} onChange={e => setAssessmentForm({...assessmentForm, totalQuestions: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Random Pick Amount</label>
                  <input type="number" min="1" className={inputClass} value={assessmentForm.randomPick} onChange={e => setAssessmentForm({...assessmentForm, randomPick: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Passing Score (%)</label>
                  <input type="number" min="1" max="100" className={inputClass} value={assessmentForm.minPassingPercentage} onChange={e => setAssessmentForm({...assessmentForm, minPassingPercentage: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Max Attempts Allowed</label>
                  <input type="number" min="1" className={inputClass} value={assessmentForm.maxAttempts} onChange={e => setAssessmentForm({...assessmentForm, maxAttempts: e.target.value})} />
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3 border-admin-border bg-admin-surface">
                <button onClick={() => setShowAssessmentModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-border text-admin-text">Cancel</button>
                <button onClick={saveAssessment} className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors text-white bg-admin-primary hover:bg-admin-primary-hover">Save Blueprint</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatWidget />
    </div>
  );
};

export default Questions;