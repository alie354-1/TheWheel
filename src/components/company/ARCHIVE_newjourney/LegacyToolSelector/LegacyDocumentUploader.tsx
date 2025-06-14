import React, { useRef, useState } from "react";

interface DocumentUploaderProps {
  onUpload: (file: File, description?: string) => void;
  isUploading?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, description);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setDescription("");
    }
  };

  return (
    <div className="card bg-base-100 shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Upload Supporting Document</h3>
      <div className="form-control mb-2">
        <label className="label">Description (optional)</label>
        <input
          className="input input-bordered"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <input
        type="file"
        className="file-input file-input-bordered w-full mb-2"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && (
        <div className="text-xs text-base-content/50">Uploading...</div>
      )}
    </div>
  );
};

export default DocumentUploader;
