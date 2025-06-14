import React from "react";

interface DescriptionSectionProps {
  description?: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => {
  if (!description) return null;
  return (
    <div className="text-base-content/80">
      {description}
    </div>
  );
};

export default DescriptionSection;
