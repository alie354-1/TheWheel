import React from "react";

interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
}

interface ResourcesSectionProps {
  resources?: Resource[];
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Resources</h2>
        <ul className="space-y-2">
          {resources.map(resource => (
            <li key={resource.id}>
<button 
  type="button"
  className="font-semibold text-primary underline"
  onClick={(e) => {
    e.stopPropagation(); // Stop event bubbling entirely
    // Ensure URL has protocol
    const resourceUrl = resource.url;
    const fullUrl = resourceUrl.startsWith('http') ? resourceUrl : `https://${resourceUrl}`;
    const win = window.open(fullUrl, '_blank');
    if (win) win.focus();
    return false; // Extra prevention
  }}
>
  {resource.title}
</button>
              {resource.description && (
                <div className="text-base-content/70">{resource.description}</div>
              )}
              <div className="badge badge-outline badge-sm">{resource.type}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResourcesSection;
