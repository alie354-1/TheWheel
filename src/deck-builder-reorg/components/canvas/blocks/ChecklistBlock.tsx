import React from "react";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistBlockProps {
  items: ChecklistItem[];
  allowReorder?: boolean;
  showProgress?: boolean;
  label?: string;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({
  items = [],
  allowReorder = false,
  showProgress = false,
  label,
}) => {
  const completed = items.filter((item) => item.checked).length;
  const total = items.length;

  return (
    <div className="p-4">
      {label && <div className="font-semibold mb-2">{label}</div>}
      {showProgress && (
        <div className="text-xs text-gray-500 mb-2">
          {completed} / {total} completed
        </div>
      )}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            <input
              type="checkbox"
              checked={item.checked}
              readOnly
              className="mr-2"
            />
            <span className={item.checked ? "line-through text-gray-400" : ""}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
      {allowReorder && (
        <div className="text-xs text-gray-400 mt-2">
          (Reordering not yet implemented)
        </div>
      )}
    </div>
  );
};

export default ChecklistBlock;
