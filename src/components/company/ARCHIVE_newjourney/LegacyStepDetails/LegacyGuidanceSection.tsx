import React from "react";

interface GuidanceSectionProps {
  guidance?: string;
}

const GuidanceSection: React.FC<GuidanceSectionProps> = ({ guidance }) => {
  if (!guidance) return null;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Guidance</h2>
        <div className="prose max-w-none">
          {guidance}
        </div>
      </div>
    </div>
  );
};

export default GuidanceSection;
