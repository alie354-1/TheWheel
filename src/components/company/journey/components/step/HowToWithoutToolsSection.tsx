import React, { useState } from "react";

interface HowToWithoutToolsSectionProps {
  howto: string;
}

export const HowToWithoutToolsSection: React.FC<HowToWithoutToolsSectionProps> = ({ howto }) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <section className="bg-white rounded shadow p-4 border opacity-60">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-green-700">✓ Completed Without Tools</span>
          <button
            className="text-blue-600 text-sm underline"
            onClick={() => setDone(false)}
          >
            Reopen
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded shadow p-4 border">
      <button
        className="font-semibold mb-2 text-left w-full"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "▼" : "▶"} HOW TO DO THIS WITHOUT TOOLS
      </button>
      {open && (
        <>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
            <li>{howto}</li>
          </ul>
          <button
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
            onClick={() => setDone(true)}
          >
            Mark As Done Without Tools
          </button>
        </>
      )}
    </section>
  );
};
