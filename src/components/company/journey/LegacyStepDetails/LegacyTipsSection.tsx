import React from "react";

interface Tip {
  id: string;
  content: string;
  order_index: number;
}

interface TipsSectionProps {
  tips?: Tip[];
}

const TipsSection: React.FC<TipsSectionProps> = ({ tips }) => {
  if (!tips || tips.length === 0) return null;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Tips</h2>
        <ul className="list-disc list-inside space-y-1">
          {tips
            .sort((a, b) => a.order_index - b.order_index)
            .map(tip => (
              <li key={tip.id}>{tip.content}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default TipsSection;
