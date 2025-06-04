import React from "react";
import { Step } from "../../types/journey.types";
import { StepTasksChecklist } from "./StepTasksChecklist";
import { useAIContext } from "../../../lib/services/ai/ai-context-provider";

interface StepDetailsModalProps {
  step: Step | null;
  open: boolean;
  onClose: () => void;
  onOpenFullStep?: (step: Step) => void;
  peerRate?: number;
  peerInsights?: string[];
}

const StepDetailsModal: React.FC<StepDetailsModalProps> = ({
  step,
  open,
  onClose,
  onOpenFullStep,
  peerRate,
  peerInsights
}) => {
  const [status, setStatus] = React.useState<"not_started" | "started" | "completed">("not_started");
  const [note, setNote] = React.useState("");
  const [showNoteInput, setShowNoteInput] = React.useState(false);

  // AI enhancement state
  const { enhanceIdea, isLoading } = useAIContext();
  const [aiEnhanced, setAIEnhanced] = React.useState<any | null>(null);
  const [aiError, setAIError] = React.useState<string | null>(null);
  const [aiFeedback, setAIFeedback] = React.useState<"up" | "down" | null>(null);

  async function handleAIEnhance() {
    setAIError(null);
    setAIEnhanced(null);
    setAIFeedback(null);
    try {
      const result = await enhanceIdea({
        title: step?.name,
        description: step?.description,
        problem: step?.description, // Use description as problem statement
        solution: step?.howto_without_tools, // Use howto_without_tools as solution
        audience: step?.audience,
        value: step?.coverage_notes, // Use coverage_notes as value proposition
      });
      setAIEnhanced(result);
    } catch (e) {
      setAIError("AI enhancement failed. Please try again.");
    }
  }

  React.useEffect(() => {
    if (!open || !step) return;
    // Load status and note from localStorage
    const completedStepIds: string[] = JSON.parse(localStorage.getItem("completedStepIds") || "[]");
    if (completedStepIds.includes(step.id)) {
      setStatus("completed");
    } else {
      setStatus("not_started");
    }
    const notes = JSON.parse(localStorage.getItem("stepNotes") || "{}");
    setNote(notes[step.id] || "");
  }, [open, step]);

  function handleMarkStarted() {
    setStatus("started");
    // Optionally persist status
  }

  function handleMarkCompleted() {
    setStatus("completed");
    // Persist to localStorage
    const completedStepIds: string[] = JSON.parse(localStorage.getItem("completedStepIds") || "[]");
    if (!completedStepIds.includes(step!.id)) {
      completedStepIds.push(step!.id);
      localStorage.setItem("completedStepIds", JSON.stringify(completedStepIds));
    }
  }

  function handleAddNote() {
    setShowNoteInput(true);
  }

  function handleSaveNote() {
    setShowNoteInput(false);
    const notes = JSON.parse(localStorage.getItem("stepNotes") || "{}");
    notes[step!.id] = note;
    localStorage.setItem("stepNotes", JSON.stringify(notes));
  }

  if (!open || !step) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-details-modal-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative" tabIndex={0} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {onOpenFullStep && (
          <button
            className="absolute top-3 left-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
            onClick={() => onOpenFullStep(step)}
            aria-label="Open Full Step"
          >
            Open Full Step
          </button>
        )}
        <h2 className="text-2xl font-bold mb-2" id="step-details-modal-title">{step.name}</h2>
        <div className="mb-2 text-gray-700">{step.description}</div>
        <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
          <span>Difficulty: {step.difficulty}</span>
          <span>Time: {step.time_estimate}</span>
          <span>Status: <span className="font-semibold">{status === "not_started" ? "Not Started" : status.charAt(0).toUpperCase() + status.slice(1)}</span></span>
        </div>
        {peerRate && (
          <div className="text-xs text-blue-700 font-medium mb-1">
            {peerRate}% of similar companies chose this
          </div>
        )}
        {peerInsights && peerInsights.length > 0 && (
          <ul className="text-xs text-blue-600 list-disc pl-4 mb-2">
            {peerInsights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        )}
        <div className="mb-4">
          <strong>How to do this step without tools:</strong>
          <div className="text-sm text-gray-600 mt-1">{step.howto_without_tools}</div>
        </div>
        {/* AI Enhancement */}
        <div className="mb-4">
          <button
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
            onClick={handleAIEnhance}
            disabled={isLoading}
          >
            {isLoading ? "Enhancing..." : "AI Validate/Enhance Step"}
          </button>
          {aiError && <div className="text-red-600 text-xs mt-2">{aiError}</div>}
          {aiEnhanced && (
            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="font-semibold mb-1">AI Suggestions:</div>
              {aiEnhanced.title && <div><strong>Title:</strong> {aiEnhanced.title}</div>}
              {aiEnhanced.description && <div><strong>Description:</strong> {aiEnhanced.description}</div>}
              {aiEnhanced.problem && <div><strong>Problem:</strong> {aiEnhanced.problem}</div>}
              {aiEnhanced.solution && <div><strong>Solution:</strong> {aiEnhanced.solution}</div>}
              {aiEnhanced.audience && <div><strong>Audience:</strong> {aiEnhanced.audience}</div>}
              {aiEnhanced.value && <div><strong>Value Proposition:</strong> {aiEnhanced.value}</div>}
              {/* AI Feedback UI */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">Was this AI suggestion helpful?</span>
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-xs ${aiFeedback === "up" ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-700"}`}
                  onClick={() => setAIFeedback("up")}
                  aria-label="Thumbs up"
                >
                  👍
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-xs ${aiFeedback === "down" ? "bg-red-200 text-red-800" : "bg-gray-100 text-gray-700"}`}
                  onClick={() => setAIFeedback("down")}
                  aria-label="Thumbs down"
                >
                  👎
                </button>
                {aiFeedback && (
                  <span className="text-xs text-gray-500 ml-2">
                    {aiFeedback === "up" ? "Thanks for your feedback!" : "We'll use this to improve future suggestions."}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Step Tasks/Checklist */}
        <div className="mb-4">
          <strong>Checklist & Tasks:</strong>
          <div className="mt-2">
            <StepTasksChecklist initialTasks={[]} />
          </div>
        </div>
        {/* Suggestions */}
        <div className="mb-4">
          <strong>Suggestions:</strong>
          <ul className="list-disc pl-5 text-sm text-blue-700">
            <li>Try using the interview template for SaaS products.</li>
            <li>Check out the "How I Built This" podcast for founder stories.</li>
          </ul>
          <button
            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
            onClick={() => alert("Launching co-founder bot for help with this step!")}
          >
            Need Help? Ask the Co-founder Bot
          </button>
        </div>
        {/* Peer Trends & Success Stories */}
        <div className="mb-4">
          <strong>Peer Trends & Success Stories:</strong>
          <ul className="list-disc pl-5 text-sm text-green-700">
            <li>“We pivoted after 10 customer interviews and landed our first paying client in 3 weeks.”</li>
            <li>Most SaaS founders in your stage are focusing on customer validation this month.</li>
            <li>Popular path: Customer Interviews → MVP → Beta Launch</li>
          </ul>
        </div>
        {/* Resources/Template Quick Action */}
        <div className="mb-4">
          <strong>Resources:</strong>
          <ul className="list-disc pl-5 text-sm text-blue-700">
            {step.resource_links.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {url}
                </a>
                {idx === 0 && (
                  <button
                    className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    onClick={() => window.open(url, "_blank")}
                  >
                    Use Template
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mb-4">
          {status !== "started" && status !== "completed" && (
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleMarkStarted}>
              Mark as Started
            </button>
          )}
          {status !== "completed" && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleMarkCompleted}>
              Mark as Completed
            </button>
          )}
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={handleAddNote}>
            {note ? "Edit Note/Blocker" : "Add Note/Blocker"}
          </button>
        </div>
        {/* Persistent Save Button */}
        {showNoteInput || note !== (JSON.parse(localStorage.getItem("stepNotes") || "{}")[step.id] || "") ? (
          <div className="flex justify-end mb-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSaveNote}>
              Save
            </button>
          </div>
        ) : null}
        {showNoteInput && (
          <div className="mb-2">
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe a blocker, note, or question for this step..."
            />
            <div className="flex justify-end mt-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs" onClick={handleSaveNote}>
                Save Note
              </button>
              <button className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs" onClick={() => setShowNoteInput(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {note && !showNoteInput && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2 text-sm text-yellow-900">
            <strong>Note/Blocker:</strong> {note}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepDetailsModal;
