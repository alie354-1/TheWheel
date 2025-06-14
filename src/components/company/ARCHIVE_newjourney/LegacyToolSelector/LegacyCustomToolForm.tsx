import React, { useState } from "react";

interface CustomToolFormProps {
  onAddCustomTool: (tool: {
    name: string;
    url: string;
    description?: string;
    logo_url?: string;
  }) => void;
  isSubmitting?: boolean;
}

const CustomToolForm: React.FC<CustomToolFormProps> = ({
  onAddCustomTool,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onAddCustomTool({
      name,
      url,
      description: description || undefined,
      logo_url: logoUrl || undefined,
    });
    setName("");
    setUrl("");
    setDescription("");
    setLogoUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Add a Custom Tool</h3>
      <div className="form-control mb-2">
        <label className="label">Tool Name</label>
        <input
          className="input input-bordered"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-control mb-2">
        <label className="label">Tool URL</label>
        <input
          className="input input-bordered"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
      </div>
      <div className="form-control mb-2">
        <label className="label">Description</label>
        <textarea
          className="textarea textarea-bordered"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="form-control mb-2">
        <label className="label">Logo URL (optional)</label>
        <input
          className="input input-bordered"
          value={logoUrl}
          onChange={e => setLogoUrl(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary btn-sm mt-2"
        type="submit"
        disabled={isSubmitting || !name || !url}
      >
        {isSubmitting ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          "Add Custom Tool"
        )}
      </button>
    </form>
  );
};

export default CustomToolForm;
