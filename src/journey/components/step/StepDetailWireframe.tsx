import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Step, Tool } from "../../types/journey.types";
import { StepTasksChecklist } from "./StepTasksChecklist";
import { HowToWithoutToolsSection } from "./HowToWithoutToolsSection";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { createTaskQuick } from "../../../components/tasks/taskCreationApi";

interface StepDetailWireframeProps {
  step: Step;
  tools: Tool[];
  nextSteps?: { to_step_id: string; probability_weight: number; step_name?: string }[];
  prereqSteps?: { from_step_id: string; relationship_type: string; step_name?: string }[];
}

export const StepDetailWireframe: React.FC<StepDetailWireframeProps> = ({
  step,
  tools = [],
  nextSteps = [],
  prereqSteps = [],
}) => {
  const [status, setStatus] = useState<"active" | "completed" | "skipped">("active");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);

  // Handler for adding a task from AI Suggestions
  const handleAddTask = async (task: string) => {
    if (!step.id) return;
    try {
      await createTaskQuick(task, step.id);
      setTasksRefreshKey((k) => k + 1); // force StepTasksChecklist to refresh
    } catch (err) {
      alert("Failed to add task: " + (err as any)?.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{step.name}</h1>
          <div className="space-x-2">
            {status === "completed" ? (
              <button className="px-4 py-2 bg-green-500 text-white rounded" disabled>
                ✓ Completed
              </button>
            ) : status === "skipped" ? (
              <button className="px-4 py-2 bg-gray-400 text-white rounded" disabled>
                Skipped
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setStatus("completed")}
                >
                  Mark Complete
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => setStatus("skipped")}
                >
                  Skip
                </button>
              </>
            )}
            {(status === "completed" || status === "skipped") && (
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded ml-2"
                onClick={() => setStatus("active")}
              >
                Reopen
              </button>
            )}
          </div>
        </div>
        {/* Why This Matters */}
        <section className="bg-white rounded shadow p-4 border">
          <h2 className="font-semibold mb-1">Why This Matters</h2>
          <p className="text-gray-700">{step.description}</p>
        </section>
        {/* Tasks Checklist */}
        <section className="bg-white rounded shadow p-4 border">
          <h2 className="font-semibold mb-2">Tasks</h2>
          <StepTasksChecklist stepId={step.id} key={tasksRefreshKey} />
        </section>
        {/* How to Do Without Tools (Collapsible) */}
        <HowToWithoutToolsSection howto={step.howto_without_tools} />
      </div>
      {/* Sidebar */}
      <aside className="w-full lg:w-1/3 space-y-6">
        {/* Prerequisites / Blocked By */}
        {prereqSteps && prereqSteps.length > 0 && (
          <section className="bg-white rounded shadow p-4 border">
            <h3 className="font-semibold mb-2">Blocked By / Prerequisites</h3>
            <ul className="space-y-2">
              {prereqSteps.map((ps) => (
                <li key={ps.from_step_id} className="flex items-center justify-between">
                  <span>
                    {ps.from_step_id ? (
                      <Link
                        to={`/journey/step/${ps.from_step_id}`}
                        className="text-blue-700 hover:underline"
                      >
                        {ps.step_name || ps.from_step_id}
                      </Link>
                    ) : (
                      ps.step_name || ps.from_step_id
                    )}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {ps.relationship_type}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Recommended Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <section className="bg-white rounded shadow p-4 border">
            <h3 className="font-semibold mb-2">Recommended Next Steps</h3>
            <ul className="space-y-2">
              {nextSteps.map((ns) => (
                <li key={ns.to_step_id} className="flex items-center justify-between">
                  <span>
                    {ns.to_step_id ? (
                      <Link
                        to={`/journey/step/${ns.to_step_id}`}
                        className="text-blue-700 hover:underline"
                      >
                        {ns.step_name || ns.to_step_id}
                      </Link>
                    ) : (
                      ns.step_name || ns.to_step_id
                    )}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {(ns.probability_weight * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Recommended Tools */}
        <section className="bg-white rounded shadow p-4 border">
          <h3 className="font-semibold mb-2">Recommended Tools</h3>
          <ul className="space-y-2">
            {(tools || []).slice(0, 3).map((tool) => (
              <li key={tool.id}>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-medium">
                  {tool.name}
                </a>
                <div className="text-xs text-gray-500">{tool.summary}</div>
              </li>
            ))}
            <li>
              <button className="text-blue-600 hover:underline text-sm">See all recommended tools</button>
            </li>
          </ul>
        </section>
        {/* AI Suggestions */}
        <AISuggestionsPanel
          onAddTask={handleAddTask}
        />
        {/* Templates & Resources */}
        <section className="bg-white rounded shadow p-4 border">
          <h3 className="font-semibold mb-2">Templates & Resources</h3>
          <ul className="space-y-2">
            {(step.resource_links || []).map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
};
