import React from "react";

interface Option {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

interface OptionsSectionProps {
  options?: Option[];
}

const OptionsSection: React.FC<OptionsSectionProps> = ({ options }) => {
  if (!options || options.length === 0) return null;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Options</h2>
        <ul className="space-y-2">
          {options
            .sort((a, b) => a.order_index - b.order_index)
            .map(option => (
              <li key={option.id}>
                <div className="font-semibold">{option.name}</div>
                {option.description && (
                  <div className="text-base-content/70">{option.description}</div>
                )}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default OptionsSection;
