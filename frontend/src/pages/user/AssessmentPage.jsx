

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Timer from "../../components/assessment/Timer";
import QuestionCard from "../../components/assessment/QuestionCard";
import ResultModal from "../../components/assessment/ResultModal";
import { startAssessment, submitAssessment } from "../../api/assessmentService";
import { useNavigate } from "react-router-dom";

const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const QUESTION_KEY = `assessment_questions_${assessmentId}`;
  const ANSWER_KEY = `assessment_answers_${assessmentId}`;
  const INDEX_KEY = `assessment_current_index_${assessmentId}`;
  const TIMER_KEY = `assessment_start_time_${assessmentId}`;

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load assessment & questions
  useEffect(() => {
    if (!assessmentId) return;

    const cachedQuestions = localStorage.getItem(QUESTION_KEY);
    const cachedAnswers = localStorage.getItem(ANSWER_KEY);
    const cachedIndex = localStorage.getItem(INDEX_KEY);

    startAssessment(assessmentId)
      .then((res) => {
        const assessmentData = res.data.assessment;
        const totalTime = assessmentData.timer;

        // Timer persistence
        let startTime = localStorage.getItem(TIMER_KEY);
        if (!startTime) {
          startTime = Date.now();
          localStorage.setItem(TIMER_KEY, startTime);
        }
        const elapsed = Math.floor((Date.now() - Number(startTime)) / 1000);
        setRemainingTime(Math.max(totalTime - elapsed, 0));
        setAssessment(assessmentData);

        // Questions persistence
        if (cachedQuestions) {
          setQuestions(JSON.parse(cachedQuestions));
        } else {
          setQuestions(res.data.questions);
          localStorage.setItem(QUESTION_KEY, JSON.stringify(res.data.questions));
        }

        // Answers persistence
        if (cachedAnswers) {
          setAnswers(JSON.parse(cachedAnswers));
        }

        // Current index persistence
        if (cachedIndex) {
          setCurrentIndex(Number(cachedIndex));
        }
      })
      .catch(() => alert("Failed to load assessment"))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  // Save answers whenever changed
  // const handleAnswerChange = (qid, ans) => {
  //   const updated = { ...answers, [qid]: { ...answers[qid], ...ans } };
  //   setAnswers(updated);
  //   localStorage.setItem(ANSWER_KEY, JSON.stringify(updated));
  // };

  // // Navigation
  // const goNext = () => {
  //   const next = currentIndex + 1;
  //   setCurrentIndex(next);
  //   localStorage.setItem(INDEX_KEY, next);
  // };

  // const goPrev = () => {
  //   const prev = currentIndex - 1;
  //   setCurrentIndex(prev);
  //   localStorage.setItem(INDEX_KEY, prev);
  // };
  // Save answers whenever changed
const handleAnswerChange = (qid, ans) => {
  let updated;

  // If coding question (ans will be an object)
  if (typeof ans === "object" && ans !== null) {
    updated = {
      ...answers,
      [qid]: {
        ...answers[qid],
        ...ans,
      },
    };
  } 
  // If MCQ or Fill in blank (ans will be string)
  else {
    updated = {
      ...answers,
      [qid]: ans,
    };
  }

  setAnswers(updated);
  localStorage.setItem(ANSWER_KEY, JSON.stringify(updated));
};

// Navigation
const goNext = () => {
  const next = currentIndex + 1;
  setCurrentIndex(next);
  localStorage.setItem(INDEX_KEY, next);
};

const goPrev = () => {
  const prev = currentIndex - 1;
  setCurrentIndex(prev);
  localStorage.setItem(INDEX_KEY, prev);
};


  // Submit assessment
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (!questions.length) {
        alert("No questions available to submit.");
        setSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = questions.map((q) => {
        const userAns = answers[q._id] || {};
        if (q.type === "coding") {
          return {
            questionId: q._id,
            code: userAns.code || "",
            language: userAns.language || q.language,
            stdin: userAns.stdin || "",
          };
        } else {
          return {
            questionId: q._id,
            answer: userAns.answer || userAns || "",
          };
        }
      });

      // Warn if unanswered
      const unanswered = questions.filter((q) => {
        const ans = answers[q._id];
        if (q.type === "coding") return !ans?.code;
        return !ans || ans === "";
      });

      if (unanswered.length) {
        alert("Please answer all questions before submitting.");
        setSubmitting(false);
        return;
      }

      // Submit to backend
      const res = await submitAssessment(assessmentId, payload);
setResult(res.data);

// Clear localStorage
localStorage.removeItem(QUESTION_KEY);
localStorage.removeItem(ANSWER_KEY);
localStorage.removeItem(INDEX_KEY);
localStorage.removeItem(TIMER_KEY);

// Redirect after 2 seconds
setTimeout(() => {
  navigate(`/skills/${res.data.skillId}`);   // change if your route is different
}, 2000);

    } catch (err) {
      console.error(err);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{assessment?.name}</h1>

      {remainingTime !== null && (
        <Timer initialTime={remainingTime} onTimeUp={handleSubmit} />
      )}

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          selectedAnswer={answers[currentQuestion._id]}
          onSelect={handleAnswerChange}
        />
      )}

      <div className="flex justify-between mt-6">
        <button
          disabled={currentIndex === 0}
          onClick={goPrev}
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>

      {/* Result Modal */}
      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
    </div>
  );
};

export default AssessmentPage;
