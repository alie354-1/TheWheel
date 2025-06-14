import React, { useEffect } from 'react';
import { DeckAiUpdateProposal } from '../../types/index.ts';
import { AIProposalCard } from './AIProposalCard.tsx';
import { useAIProposals } from '../../hooks/useAIProposals.ts';

interface AIProposalsPanelProps {
  deckId: string;
  selectedSlideId?: string | null;
  refreshKey?: number; // New prop to trigger re-fetch
}

export const AIProposalsPanel: React.FC<AIProposalsPanelProps> = ({
  deckId,
  selectedSlideId,
  refreshKey,
}) => {
  const {
    proposals,
    isLoading,
    error,
    fetchProposals,
    updateProposalStatus,
  } = useAIProposals(deckId, selectedSlideId ? selectedSlideId : undefined);

  // Effect to re-fetch when deckId, selectedSlideId, or refreshKey changes
  useEffect(() => {
    if (deckId) {
      fetchProposals(deckId, selectedSlideId ? selectedSlideId : undefined);
    }
  }, [deckId, selectedSlideId, fetchProposals, refreshKey]);


  //isLoading state for individual card actions might be desirable
  //For now, the hook's isLoading will cover the panel during updates.
  //A more granular approach could involve passing a specific loading state to AIProposalCard
  //or managing it within the card itself if it makes direct calls (not current pattern).

  const panelStyle: React.CSSProperties = {
    padding: '15px',
    borderLeft: '1px solid #ddd', // Assuming it's a sidebar panel
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9', // Slightly different background
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  };

  if (isLoading && proposals.length === 0) {
    return <div style={panelStyle}><p>Loading AI suggestions...</p></div>;
  }

  if (error) {
    return <div style={panelStyle}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  const pendingProposals = proposals.filter(p => p.status === 'Pending');
  const otherProposals = proposals.filter(p => p.status !== 'Pending');

  return (
    <div style={panelStyle}>
      <h3 style={titleStyle}>
        AI Suggestions {selectedSlideId ? `for this slide` : `for the deck`}
      </h3>

      {proposals.length === 0 && !isLoading && (
        <p style={{ color: '#777', fontStyle: 'italic' }}>
          No AI suggestions available at the moment.
        </p>
      )}

      {pendingProposals.length > 0 && (
        <>
          <h4 style={{ fontSize: '15px', color: '#444', marginTop:'20px', marginBottom: '10px' }}>Pending Review ({pendingProposals.length})</h4>
          {pendingProposals.map(proposal => (
            <AIProposalCard
              key={proposal.id}
              proposal={proposal}
              onUpdateStatus={updateProposalStatus} // Use from hook
              isLoading={isLoading} // This isLoading is panel-wide, might need per-card later
            />
          ))}
        </>
      )}
      
      {otherProposals.length > 0 && pendingProposals.length > 0 && (
         <hr style={{margin: '20px 0'}} />
      )}

      {otherProposals.length > 0 && (
         <>
          <h4 style={{ fontSize: '15px', color: '#666', marginTop:'20px', marginBottom: '10px' }}>Reviewed Suggestions ({otherProposals.length})</h4>
           {otherProposals.map(proposal => (
            <AIProposalCard
              key={proposal.id}
              proposal={proposal}
              onUpdateStatus={updateProposalStatus} // Use from hook
              isLoading={isLoading}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default AIProposalsPanel;
