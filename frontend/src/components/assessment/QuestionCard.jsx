const QuestionCard = ({
  question,
  index,
  selectedAnswer,
  onSelect,
}) => {
  if (!question) return null;

  return (
    <div className="border p-5 my-5 rounded-lg shadow bg-white">
      {/* Question */}
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
          onChange={(e) =>
            onSelect(question._id, e.target.value)
          }
          placeholder="Type your answer here..."
          className="w-full border p-2 rounded"
        />
      )}

      {/* Coding Question */}
      {question.type === "coding" && (
        <>
          {/* Problem description */}
          {question.description && (
            <p className="mb-3 text-gray-700">
              {question.description}
            </p>
          )}

          {/* Starter code */}
          {question.starterCode && (
            <pre className="bg-gray-100 p-3 rounded mb-3 text-sm overflow-x-auto">
              {question.starterCode}
            </pre>
          )}

          {/* Code editor */}
          <textarea
            rows={10}
            value={selectedAnswer || ""}
            onChange={(e) =>
              onSelect(question._id, e.target.value)
            }
            placeholder="Write your code here..."
            className="w-full border rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}
    </div>
  );
};

export default QuestionCard;
