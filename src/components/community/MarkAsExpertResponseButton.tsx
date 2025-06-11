import React, { useState } from 'react';
import { expertService } from '../../lib/services/expert.service';
import { useAuth } from '../../lib/contexts/AuthContext';

interface MarkAsExpertResponseButtonProps {
  threadId: string;
  replyId: string;
  isExpertResponse: boolean;
  onUpdate: (isExpert: boolean) => Promise<void>;
}

/**
 * MarkAsExpertResponseButton Component
 * 
 * A button that allows experts to mark their replies as expert responses.
 * Only visible to users with expert profiles and only for their own replies.
 */
const MarkAsExpertResponseButton: React.FC<MarkAsExpertResponseButtonProps> = ({
  threadId,
  replyId,
  isExpertResponse,
  onUpdate
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfidenceInput, setShowConfidenceInput] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(80); // Default confidence score
  const [expertiseArea, setExpertiseArea] = useState('');
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  
  // Fetch expert profile on mount
  React.useEffect(() => {
    const fetchExpertProfile = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await expertService.getExpertProfile(user.id);
        setExpertProfile(profile);
        
        if (profile) {
          // Combine primary and secondary expertise areas
          const areas = [
            ...(profile.primary_expertise_areas || []),
            ...(profile.secondary_expertise_areas || [])
          ];
          setExpertiseAreas(areas);
          
          // Set default expertise area
          if (areas.length > 0) {
            setExpertiseArea(areas[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching expert profile:', err);
      }
    };
    
    fetchExpertProfile();
  }, [user?.id]);
  
  // If user is not an expert, don't render the button
  if (!expertProfile) {
    return null;
  }
  
  const handleMarkAsExpertResponse = async () => {
    try {
      setLoading(true);
      
      await expertService.markAsExpertResponse({
        thread_id: threadId,
        reply_id: replyId,
        expert_id: user?.id || '',
        expertise_area: expertiseArea,
        confidence_score: confidenceScore,
        verification_status: 'self_reported'
      });
      
      // Reset state and notify parent
      setShowConfidenceInput(false);
      await onUpdate(true);
    } catch (err) {
      console.error('Error marking as expert response:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveExpertResponse = async () => {
    try {
      setLoading(true);
      
      await expertService.removeExpertResponse(replyId);
      
      // Notify parent
      await onUpdate(false);
    } catch (err) {
      console.error('Error removing expert response:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // If already marked as expert response, show remove button
  if (isExpertResponse) {
    return (
      <button
        type="button"
        className="text-sm flex items-center text-blue-600 hover:text-blue-700"
        onClick={handleRemoveExpertResponse}
        disabled={loading}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        Remove Expert Response
      </button>
    );
  }
  
  // If showing confidence input form
  if (showConfidenceInput) {
    return (
      <div className="mt-2 p-3 border rounded-md bg-gray-50">
        <h4 className="font-medium text-sm mb-2">Mark as Expert Response</h4>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expertise Area
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={expertiseArea}
            onChange={(e) => setExpertiseArea(e.target.value)}
          >
            {expertiseAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confidence Level: {confidenceScore}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={confidenceScore}
            onChange={(e) => setConfidenceScore(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            onClick={handleMarkAsExpertResponse}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            className="px-3 py-1 border rounded-md text-sm"
            onClick={() => setShowConfidenceInput(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  // Default state - show button to mark as expert response
  return (
    <button
      type="button"
      className="text-sm flex items-center text-blue-600 hover:text-blue-700"
      onClick={() => setShowConfidenceInput(true)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      Mark as Expert Response
    </button>
  );
};

export default MarkAsExpertResponseButton;
