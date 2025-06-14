import React, { useState, useEffect } from 'react';
import { DeckComment, FeedbackCategory } from '../../types/index.ts';

interface CommentEditorProps {
  comment: DeckComment;
  onSave: (updates: Partial<Pick<DeckComment, 'textContent' | 'feedback_category'>>) => void;
  onCancel: () => void;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({ comment, onSave, onCancel }) => {
  const [textContent, setTextContent] = useState(comment.textContent);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>(comment.feedback_category || 'General');

  useEffect(() => {
    setTextContent(comment.textContent);
    setFeedbackCategory(comment.feedback_category || 'General');
  }, [comment]);

  const handleSave = () => {
    if (!textContent.trim()) {
      // Basic validation: do not save empty comments
      return;
    }
    const updates = {
      textContent,
      feedback_category: feedbackCategory,
    };
    console.log('[CommentEditor] handleSave called with:', updates);
    onSave(updates);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Edit Comment</h3>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        rows={4}
      />
      <div className="mt-2">
        <label htmlFor="feedback-category-editor" className="block text-sm font-medium text-gray-700">
          Feedback Category
        </label>
        <select
          id="feedback-category-editor"
          value={feedbackCategory}
          onChange={(e) => setFeedbackCategory(e.target.value as FeedbackCategory)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option>Content</option>
          <option>Form</option>
          <option>General</option>
        </select>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
