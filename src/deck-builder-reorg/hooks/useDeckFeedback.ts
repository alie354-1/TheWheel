import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { DeckComment } from '../types';
import { DeckService } from '../services/deckService';

interface UseDeckFeedbackReturn {
  comments: DeckComment[];
  loading: boolean;
  error: Error | null;
  addComment: (
    commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'deckId'>
  ) => Promise<DeckComment | null>;
  // updateComment and deleteComment can be added later
}

const useDeckFeedback = (deckId: string, slideId?: string): UseDeckFeedbackReturn => {
  const [comments, setComments] = useState<DeckComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!deckId) {
      setComments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedComments = await DeckService.getComments(deckId, slideId);
      setComments(fetchedComments);
      setError(null);
    } catch (e) {
      console.error('Error fetching comments:', e);
      setError(e as Error);
      setComments([]); // Clear comments on error
    } finally {
      setLoading(false);
    }
  }, [deckId, slideId]);

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`deck-comments-${deckId}${slideId ? `-${slideId}` : ''}`)
      .on<DeckComment>(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'deck_comments', 
          filter: `deck_id=eq.${deckId}${slideId ? `&slide_id=eq.${slideId}` : ''}` 
        },
        (payload) => {
          console.log('Realtime comment change received!', payload);
          // More sophisticated handling based on payload.eventType (INSERT, UPDATE, DELETE)
          // For simplicity, refetching all comments. This can be optimized.
          // Consider optimistic updates and merging for better UX.
          if (payload.eventType === 'INSERT') {
            // Ensure the new comment matches the current slideId if filtered
            const newComment = payload.new as DeckComment;
            if (!slideId || newComment.slideId === slideId) {
              setComments(prevComments => {
                // Avoid duplicates if the insert was from the current user and already added optimistically
                if (prevComments.find(c => c.id === newComment.id)) {
                  return prevComments.map(c => c.id === newComment.id ? newComment : c);
                }
                return [...prevComments, newComment];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedComment = payload.new as DeckComment;
            setComments(prevComments => 
              prevComments.map(comment => 
                comment.id === updatedComment.id ? updatedComment : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Ensure payload.old has an 'id' property, which it should for DELETE events
            const oldCommentId = (payload.old as { id: string }).id;
            setComments(prevComments => 
              prevComments.filter(comment => comment.id !== oldCommentId)
            );
          } else {
            // Fallback for other event types or if specific handling is complex
             fetchComments();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to deck comments for deck ${deckId}${slideId ? ` slide ${slideId}` : ''}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`Subscription error for deck ${deckId}: ${status}`, err);
          // Optionally, attempt to resubscribe or notify user
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId, slideId, fetchComments]);

  const addComment = useCallback(
    async (
      commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'deckId'>
    ): Promise<DeckComment | null> => {
      if (!deckId) {
        console.error("Deck ID is required to add a comment.");
        return null;
      }
      try {
        // Optimistic update can be added here if desired
        const newComment = await DeckService.addComment(deckId, { ...commentData, deckId });
        // The realtime subscription should handle updating the comments list from the DB echo.
        // If not relying on echo or for faster UI, add optimistically:
        // setComments(prev => [...prev, newComment]); 
        return newComment;
      } catch (e) {
        console.error('Error adding comment via hook:', e);
        // Revert optimistic update if it was done
        setError(e as Error);
        return null;
      }
    },
    [deckId] // Removed fetchComments from dependencies as realtime handles updates
  );

  return { comments, loading, error, addComment };
};

export default useDeckFeedback;
