import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';

interface Reaction {
  reaction_type: string;
  count: number;
  userHasReacted: boolean;
}

interface ThreadReactionButtonsProps {
  contentType: 'thread' | 'reply' | 'comment';
  contentId: string;
  initialReactions: Reaction[];
  onReactionChange?: () => void;
}

/**
 * ThreadReactionButtons Component
 * 
 * A set of buttons that allow users to react to content (threads, replies, comments).
 * Supports multiple reaction types like like, helpful, insightful, etc.
 */
const ThreadReactionButtons: React.FC<ThreadReactionButtonsProps> = ({
  contentType,
  contentId,
  initialReactions,
  onReactionChange
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  const handleReaction = async (reactionType: string) => {
    if (!user?.id) return;
    
    try {
      setLoading(prev => ({ ...prev, [reactionType]: true }));
      
      // Find the current reaction
      const currentReaction = reactions.find(r => r.reaction_type === reactionType);
      const hasReacted = currentReaction?.userHasReacted || false;
      
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('content_reactions')
          .delete()
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
          
        if (error) throw error;
        
        // Update local state
        setReactions(prev => 
          prev.map(r => 
            r.reaction_type === reactionType 
              ? { ...r, count: Math.max(0, r.count - 1), userHasReacted: false }
              : r
          )
        );
      } else {
        // Add reaction
        const { error } = await supabase
          .from('content_reactions')
          .insert({
            content_type: contentType,
            content_id: contentId,
            user_id: user.id,
            reaction_type: reactionType,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // Update local state
        setReactions(prev => 
          prev.map(r => 
            r.reaction_type === reactionType 
              ? { ...r, count: r.count + 1, userHasReacted: true }
              : r
          )
        );
      }
      
      // Notify parent component
      if (onReactionChange) {
        onReactionChange();
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
    } finally {
      setLoading(prev => ({ ...prev, [reactionType]: false }));
    }
  };
  
  // Get icon for reaction type
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        );
      case 'helpful':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        );
      case 'insightful':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'agree':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'disagree':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'question':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        );
    }
  };
  
  // Get display name for reaction type
  const getReactionName = (type: string) => {
    switch (type) {
      case 'like':
        return 'Like';
      case 'helpful':
        return 'Helpful';
      case 'insightful':
        return 'Insightful';
      case 'agree':
        return 'Agree';
      case 'disagree':
        return 'Disagree';
      case 'question':
        return 'Question';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.reaction_type}
          type="button"
          className={`flex items-center text-xs px-2 py-1 rounded-full border ${
            reaction.userHasReacted
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => handleReaction(reaction.reaction_type)}
          disabled={loading[reaction.reaction_type]}
        >
          {loading[reaction.reaction_type] ? (
            <svg className="animate-spin w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="mr-1">{getReactionIcon(reaction.reaction_type)}</span>
          )}
          <span>{getReactionName(reaction.reaction_type)}</span>
          {reaction.count > 0 && (
            <span className="ml-1 font-medium">{reaction.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ThreadReactionButtons;
