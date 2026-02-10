import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const QuestionForm = ({ skillId }) => {
  const [type, setType] = useState("mcq");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const addOption = () => setOptions([...options, ""]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      skill: skillId,
      type,
      difficulty,
      questionText,
      correctAnswer,
      options: type === "mcq" ? options : [],
    };

    await axiosInstance.post("/questions", payload);
    alert("Question added successfully");

    setQuestionText("");
    setOptions(["", ""]);
    setCorrectAnswer("");
  };

  return (
    <div>
      <h3>Add Question</h3>

      <select onChange={(e) => setType(e.target.value)}>
        <option value="mcq">MCQ</option>
        <option value="coding">Coding</option>
        <option value="output">Output</option>
      </select>

      <select onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <textarea
        placeholder="Enter question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      {/* MCQ Options */}
      {type === "mcq" && (
        <>
          {options.map((opt, idx) => (
            <input
              key={idx}
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) =>
                handleOptionChange(idx, e.target.value)
              }
            />
          ))}
          <button onClick={addOption}>+ Add Option</button>
        </>
      )}

      <input
        placeholder="Correct Answer"
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Question</button>
    </div>
  );
};

export default QuestionForm;
