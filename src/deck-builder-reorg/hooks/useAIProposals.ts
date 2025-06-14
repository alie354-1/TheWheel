import { useState, useEffect, useCallback } from 'react';
import { DeckAiUpdateProposal } from '../types';
import { DeckService } from '../services/deckService';

interface UseAIProposalsReturn {
  proposals: DeckAiUpdateProposal[];
  isLoading: boolean;
  error: string | null;
  fetchProposals: (deckId: string, slideId?: string) => Promise<void>;
  updateProposalStatus: (
    proposalId: string,
    status: 'Accepted' | 'Rejected' | 'Modified' | 'Archived' | 'Pending',
    notes?: string
  ) => Promise<DeckAiUpdateProposal | null>;
  // Future: addProposal, deleteProposal if needed
}

export const useAIProposals = (initialDeckId?: string, initialSlideId?: string): UseAIProposalsReturn => {
  const [proposals, setProposals] = useState<DeckAiUpdateProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async (deckId: string, slideId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProposals = await DeckService.getAIProposals(deckId, slideId);
      setProposals(fetchedProposals);
    } catch (err) {
      console.error("Error fetching AI proposals in hook:", err);
      setError('Failed to load AI suggestions.');
      setProposals([]); // Clear proposals on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDeckId) {
      fetchProposals(initialDeckId, initialSlideId);
    }
  }, [initialDeckId, initialSlideId, fetchProposals]);

  const updateProposalStatus = useCallback(
    async (
      proposalId: string,
      status: 'Accepted' | 'Rejected' | 'Modified' | 'Archived' | 'Pending',
      notes?: string
    ): Promise<DeckAiUpdateProposal | null> => {
      // Note: isLoading state here might reflect the hook's general loading state,
      // individual components might want their own loading state for specific actions.
      // For simplicity, we'll assume the caller handles specific UI feedback for the update action.
      try {
        const updatedProposal = await DeckService.updateAIProposalStatus(proposalId, status, notes);
        if (updatedProposal) {
          setProposals(prev =>
            prev.map(p => (p.id === proposalId ? updatedProposal : p))
          );
          if (status === 'Accepted' && updatedProposal.deckId) {
            // Potentially trigger a re-fetch of deck data or notify other parts of the app.
            // This could be done via a callback prop or a global state/event system.
            console.log(`Proposal ${proposalId} accepted in hook. Deck content may have changed.`);
          }
        }
        return updatedProposal;
      } catch (err) {
        console.error(`Error updating proposal ${proposalId} to ${status} in hook:`, err);
        setError(`Failed to update suggestion ${proposalId}.`);
        return null;
      }
    },
    [] // No dependencies, relies on DeckService static methods
  );

  return {
    proposals,
    isLoading,
    error,
    fetchProposals,
    updateProposalStatus,
  };
};
