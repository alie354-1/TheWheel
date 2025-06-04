import React, { useState } from "react";
import { StepTasksChecklist } from "./StepTasksChecklist";

interface AISuggestionsPanelProps {
  onAddTask: (task: string) => void;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ onAddTask }) => {
  // Example suggestions; in a real system, these would come from an API
  const suggestions = [
    "Define Brand Voice",
    "Check Trademark",
    "Get Domain Name"
  ];

  return (
    <section className="bg-white rounded shadow p-4 border">
      <h3 className="font-semibold mb-2">AI Suggestions</h3>
      <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
        {suggestions.map((s, idx) => (
          <li key={idx}>
            <button
              className="hover:underline"
              onClick={() => onAddTask(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
