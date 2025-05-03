import React, { useState } from 'react';
import { useCompany } from '@/lib/hooks/useCompany';
import { FeedbackService, ImprovementSuggestion } from '@/lib/services/feedback.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'content', label: 'Content Improvement' },
  { id: 'ux', label: 'User Experience' },
  { id: 'tools', label: 'Tool Recommendations' },
  { id: 'resources', label: 'Additional Resources' },
  { id: 'other', label: 'Other' }
];

interface SuggestionFormProps {
  entityId: string;
  entityType: 'step' | 'tool' | 'resource';
  entityName: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * StepImprovementSuggestionForm
 * 
 * A form for users to submit improvement suggestions for journey steps,
 * tools, and resources. Part of the Sprint 4 User Feedback Collection System.
 */
export const StepImprovementSuggestionForm: React.FC<SuggestionFormProps> = ({
  entityId,
  entityType,
  entityName,
  onSubmitSuccess,
  onCancel,
  className = ''
}) => {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [impactDescription, setImpactDescription] = useState<string>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!title.trim()) {
      newErrors.title = 'Please enter a title';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user || !currentCompany) return;
    
    setIsSubmitting(true);
    
    try {
      const suggestion: ImprovementSuggestion = {
        userId: user.id,
        companyId: currentCompany.id,
        entityId,
        entityType,
        category,
        title: title.trim(),
        description: description.trim(),
        impactDescription: impactDescription.trim() || undefined
      };
      
      await FeedbackService.submitImprovementSuggestion(suggestion);
      
      setSubmitSuccess(true);
      
      // Reset form
      setCategory('');
      setTitle('');
      setDescription('');
      setImpactDescription('');
      
      // Call success callback if provided
      onSubmitSuccess?.();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setErrors({ 
        submit: 'An error occurred while submitting your suggestion. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Suggest Improvement for {entityName}
      </h2>
      
      {submitSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4"
        >
          <p>Your suggestion has been submitted successfully! Thank you for helping improve the journey.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Improvement Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>
          
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A brief title for your suggestion"
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your suggestion in detail"
              rows={4}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          
          {/* Impact Description (Optional) */}
          <div className="mb-5">
            <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
              Impact Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="impact"
              value={impactDescription}
              onChange={(e) => setImpactDescription(e.target.value)}
              placeholder="How will this improvement help users?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{errors.submit}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Suggestion'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StepImprovementSuggestionForm;
