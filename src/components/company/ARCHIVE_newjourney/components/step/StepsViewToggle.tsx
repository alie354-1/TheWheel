import React from "react";

export interface StepsViewToggleProps {
  view: "recommended" | "all";
  onChange: (view: "recommended" | "all") => void;
}

export const StepsViewToggle: React.FC<StepsViewToggleProps> = ({ view, onChange }) => (
  <div className="flex gap-2 mb-4">
    <button
      className={`px-4 py-2 rounded ${view === "recommended" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
      onClick={() => onChange("recommended")}
    >
      Recommended Steps
    </button>
    <button
      className={`px-4 py-2 rounded ${view === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
      onClick={() => onChange("all")}
    >
      View All Steps
    </button>
  </div>
);

export default StepsViewToggle;
