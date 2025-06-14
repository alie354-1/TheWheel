import React from "react";

interface ChecklistItem {
  id: string;
  item: string;
  order_index: number;
}

interface ChecklistSectionProps {
  checklists?: ChecklistItem[];
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklists }) => {
  if (!checklists || checklists.length === 0) return null;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Checklist</h2>
        <ul className="list-disc list-inside space-y-1">
          {checklists
            .sort((a, b) => a.order_index - b.order_index)
            .map(item => (
              <li key={item.id}>{item.item}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ChecklistSection;
