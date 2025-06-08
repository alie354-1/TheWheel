import React, { useState, useEffect } from 'react';
import { ExpertProfile } from '../../../lib/types/community.types';

interface SuccessStoriesStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

/**
 * Fourth step of the expert profile wizard
 * Collects success stories and achievements
 */
const SuccessStoriesStep: React.FC<SuccessStoriesStepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep
}) => {
  // Initialize success stories
  const [successStories, setSuccessStories] = useState<string[]>(
    formData.success_stories || []
  );
  
  // Current story being edited
  const [currentStory, setCurrentStory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Form validation
  const [isValid, setIsValid] = useState(false);
  
  // Validate the form
  useEffect(() => {
    setIsValid(successStories.length > 0);
  }, [successStories]);

  // Add a new success story
  const addStory = () => {
    if (currentStory.trim()) {
      if (editingIndex !== null) {
        // Update existing story
        const updatedStories = [...successStories];
        updatedStories[editingIndex] = currentStory.trim();
        setSuccessStories(updatedStories);
        setEditingIndex(null);
      } else {
        // Add new story
        setSuccessStories([...successStories, currentStory.trim()]);
      }
      setCurrentStory('');
    }
  };

  // Edit an existing story
  const editStory = (index: number) => {
    setCurrentStory(successStories[index]);
    setEditingIndex(index);
  };

  // Delete a story
  const deleteStory = (index: number) => {
    const updatedStories = [...successStories];
    updatedStories.splice(index, 1);
    setSuccessStories(updatedStories);
    
    // If we were editing this story, reset the form
    if (editingIndex === index) {
      setCurrentStory('');
      setEditingIndex(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's an unsaved story, add it
    if (currentStory.trim()) {
      addStory();
    }
    
    if (isValid) {
      updateFormData({
        success_stories: successStories
      });
      goToNextStep();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Success Stories</h3>
      <p className="text-gray-600 mb-6">
        Share specific examples of how you've helped companies or individuals succeed. These stories will help others understand your expertise and impact.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Success Stories List */}
        {successStories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Your Success Stories</h4>
            <div className="space-y-3">
              {successStories.map((story, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-md p-4 relative"
                >
                  <p className="pr-16 text-gray-700">{story}</p>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => editStory(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStory(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Story Form */}
        <div className="mb-6">
          <label htmlFor="success-story" className="block text-sm font-medium text-gray-700 mb-1">
            {editingIndex !== null ? 'Edit Success Story' : 'Add a Success Story'} {successStories.length === 0 && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id="success-story"
            value={currentStory}
            onChange={(e) => setCurrentStory(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe a specific achievement or how you helped a company succeed..."
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={addStory}
              disabled={!currentStory.trim()}
              className={`px-4 py-1 rounded-md text-sm font-medium ${
                currentStory.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {editingIndex !== null ? 'Update Story' : 'Add Story'}
            </button>
          </div>
        </div>

        {/* Story Writing Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
          <h4 className="text-md font-medium text-blue-800 mb-2">Tips for Great Success Stories</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
            <li>Be specific about the challenge or problem you helped solve</li>
            <li>Include measurable results or outcomes when possible</li>
            <li>Keep each story concise (2-3 paragraphs)</li>
            <li>Focus on your specific contribution and expertise</li>
            <li>Consider including different types of success stories to showcase your range</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`px-6 py-2 rounded-md font-medium ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuccessStoriesStep;
