import React from 'react';
import { X, FileText, FileImage, Code } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExportPDF }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export Deck</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <button
            onClick={onExportPDF}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <FileText className="h-5 w-5 mr-2" />
            Download as PDF
          </button>
          <div className="text-center">
            <span className="text-sm text-gray-500">More formats coming soon!</span>
          </div>
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed"
          >
            <FileImage className="h-5 w-5 mr-2" />
            Download as PowerPoint (Coming Soon)
          </button>
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed"
          >
            <Code className="h-5 w-5 mr-2" />
            Download as HTML (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};
