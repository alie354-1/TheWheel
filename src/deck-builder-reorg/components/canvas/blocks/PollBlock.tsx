import React, { useState } from "react";

interface PollBlockProps {
  question?: string;
  options?: string[];
  allowMultiple?: boolean;
  showResults?: boolean;
}

export const PollBlock: React.FC<PollBlockProps> = ({
  question = "Your poll question?",
  options = [],
  allowMultiple = false,
  showResults = false,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState<number[]>(Array(options.length).fill(0));

  const handleSelect = (idx: number) => {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setSelected([idx]);
    }
  };

  const handleSubmit = () => {
    const newVotes = [...votes];
    selected.forEach((idx) => {
      newVotes[idx] = (newVotes[idx] || 0) + 1;
    });
    setVotes(newVotes);
    setSubmitted(true);
  };

  return (
    <div className="p-4">
      <div className="font-semibold mb-2">{question}</div>
      <ul className="space-y-2 mb-2">
        {options.map((opt, idx) => (
          <li key={idx} className="flex items-center">
            <input
              type={allowMultiple ? "checkbox" : "radio"}
              name="poll"
              checked={selected.includes(idx)}
              disabled={submitted}
              onChange={() => handleSelect(idx)}
              className="mr-2"
            />
            <span>{opt}</span>
            {showResults && submitted && (
              <span className="ml-2 text-xs text-gray-500">
                ({votes[idx]} votes)
              </span>
            )}
          </li>
        ))}
      </ul>
      {!submitted ? (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={handleSubmit}
          disabled={selected.length === 0}
        >
          Submit
        </button>
      ) : (
        <div className="text-green-600 text-sm">Thank you for voting!</div>
      )}
    </div>
  );
};

export default PollBlock;
