import React from 'react';
import { 
  DeckAiUpdateProposal, 
  DeckComment, 
  ProposedContentDataType,
  TextEditProposedData,
  NewElementProposedData,
  ImageSwapProposedData,
  ChartUpdateProposedData,
  ReorderElementProposedData,
  NewSlideProposedData,
  ReorderSlideProposedData,
  BlockType // Assuming BlockType is exported from types/index.ts now
} from '../../types/index.ts'; 
// import { DeckService } from '../../services/deckService.ts'; // Not needed if sourceComments are passed or handled by hook

interface AIProposalCardProps {
  proposal: DeckAiUpdateProposal;
  // sourceComments?: DeckComment[]; // This can be removed if not directly used for display here
  onUpdateStatus: (
    proposalId: string,
    status: 'Accepted' | 'Rejected' | 'Modified' | 'Archived' | 'Pending',
    notes?: string
  ) => Promise<DeckAiUpdateProposal | null>;
  isLoading: boolean; // Panel-wide loading state
  // Consider adding a specific loading state for this card's actions if needed
  // isCardActionLoading?: boolean; 
}

export const AIProposalCard: React.FC<AIProposalCardProps> = ({
  proposal,
  // sourceComments, 
  onUpdateStatus,
  isLoading, 
}) => {
  const cardStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    marginBottom: '10px',
    color: '#555',
    whiteSpace: 'pre-wrap', // To respect newlines in description
  };

  const contentChangeStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px dashed #ccc',
    borderRadius: '4px',
  };

  const originalContentStyle: React.CSSProperties = {
    textDecoration: 'line-through',
    color: '#d9534f', // Reddish
    marginRight: '10px',
    fontSize: '13px',
  };

  const proposedContentStyle: React.CSSProperties = {
    color: '#5cb85c', // Greenish
    fontWeight: 'bold',
    fontSize: '13px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    marginRight: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  };

  const acceptButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#5cb85c',
    color: 'white',
  };

  const rejectButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#d9534f',
    color: 'white',
  };
  
  const renderContentChange = () => {
    const { changeType, originalContentSnapshot, proposedContentData } = proposal;

    if (!proposedContentData && changeType !== 'DeleteElement') {
      return <p style={{ fontSize: '13px', fontStyle: 'italic' }}>No specific content change data available for this proposal type.</p>;
    }

    switch (changeType) {
      case 'TextEdit': {
        const originalText = originalContentSnapshot?.textContent || originalContentSnapshot?.data?.textContent || '(original not available)';
        const proposed = proposedContentData as TextEditProposedData;
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggested Text Change (Element ID: {proposal.elementId || 'N/A'}):</p>
            <div><span style={originalContentStyle}>Original: {originalText}</span></div>
            <div><span style={proposedContentStyle}>Proposed: {proposed.newTextContent}</span></div>
          </div>
        );
      }
      case 'ImageSwap': {
        const proposed = proposedContentData as ImageSwapProposedData;
        const originalUrl = originalContentSnapshot?.src || originalContentSnapshot?.data?.src || '(original not available)';
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggested Image Swap (Element ID: {proposal.elementId || 'N/A'}):</p>
            <div><span style={originalContentStyle}>Original URL: {originalUrl}</span></div>
            <div><span style={proposedContentStyle}>New URL: {proposed.newImageUrl}</span></div>
            {proposed.newAltText && <div><span style={proposedContentStyle}>New Alt Text: {proposed.newAltText}</span></div>}
          </div>
        );
      }
      case 'NewElement': {
        const proposed = proposedContentData as NewElementProposedData;
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggests Adding New Element to Slide ID: {proposal.slideId}:</p>
            <div>Type: <span style={proposedContentStyle}>{proposed.componentType}</span></div>
            <div>Data: <pre style={{ fontSize: '11px', backgroundColor: '#eee', padding: '5px', borderRadius: '3px', maxHeight: '100px', overflow: 'auto' }}>{JSON.stringify(proposed.data, null, 2)}</pre></div>
            {proposed.layout && <div>Layout: <span style={proposedContentStyle}>{`x:${proposed.layout.x}, y:${proposed.layout.y}, w:${proposed.layout.width}, h:${proposed.layout.height}`}</span></div>}
          </div>
        );
      }
      case 'DeleteElement':
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggests Deleting Element:</p>
            <div>Element ID: <span style={proposedContentStyle}>{proposal.elementId || 'N/A'}</span></div>
          </div>
        );
      case 'ReorderElement': {
        const proposed = proposedContentData as ReorderElementProposedData;
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggests Reordering Element:</p>
            <div>Element ID: <span style={proposedContentStyle}>{proposal.elementId || 'N/A'}</span></div>
            <div>New Order: <span style={proposedContentStyle}>{proposed.newOrder}</span></div>
          </div>
        );
      }
      case 'NewSlide': {
        const proposed = proposedContentData as NewSlideProposedData;
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggests Adding New Slide:</p>
            <div>Title: <span style={proposedContentStyle}>{proposed.newSlideData.title}</span></div>
            <div>Type: <span style={proposedContentStyle}>{proposed.newSlideData.type}</span></div>
            <div>Target Order: <span style={proposedContentStyle}>{proposed.targetOrder}</span></div>
          </div>
        );
      }
      case 'ReorderSlide': {
        const proposed = proposedContentData as ReorderSlideProposedData;
        return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggests Reordering Slide:</p>
            <div>Slide ID: <span style={proposedContentStyle}>{proposal.slideId}</span></div>
            <div>New Order: <span style={proposedContentStyle}>{proposed.newOrder}</span></div>
          </div>
        );
      }
      case 'ChartUpdate': {
         const proposed = proposedContentData as ChartUpdateProposedData;
         return (
          <div style={contentChangeStyle}>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>Suggested Chart Update (Element ID: {proposal.elementId || 'N/A'}):</p>
            <div>New Data: <pre style={{ fontSize: '11px', backgroundColor: '#eee', padding: '5px', borderRadius: '3px', maxHeight: '100px', overflow: 'auto' }}>{JSON.stringify(proposed.newData, null, 2)}</pre></div>
            {proposed.newChartOptions && <div>New Options: <pre style={{ fontSize: '11px', backgroundColor: '#eee', padding: '5px', borderRadius: '3px', maxHeight: '100px', overflow: 'auto' }}>{JSON.stringify(proposed.newChartOptions, null, 2)}</pre></div>}
          </div>
        );
      }
      default:
        return <p style={{ fontSize: '13px', fontStyle: 'italic' }}>Details for change type '{changeType}' not fully visualized yet.</p>;
    }
  };

  return (
    <div style={cardStyle}>
      <h4 style={headerStyle}>AI Suggestion (ID: ...{proposal.id.slice(-6)})</h4>
      <p style={descriptionStyle}>{proposal.description}</p>
      
      {renderContentChange()}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        {proposal.aiConfidenceScore && (
          <span style={{ marginRight: '15px' }}>
            AI Confidence: {Math.round(proposal.aiConfidenceScore * 100)}%
          </span>
        )}
        {proposal.weightedFeedbackScore !== undefined && (
          <span>
            Feedback Score: {proposal.weightedFeedbackScore.toFixed(1)}
          </span>
        )}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={rejectButtonStyle}
          onClick={() => onUpdateStatus(proposal.id, 'Rejected')}
          disabled={isLoading || proposal.status !== 'Pending'}
        >
          {isLoading && proposal.status === 'Pending' ? 'Processing...' : 'Reject'}
        </button>
        <button
          style={acceptButtonStyle}
          onClick={() => onUpdateStatus(proposal.id, 'Accepted')}
          disabled={isLoading || proposal.status !== 'Pending'}
        >
          {isLoading && proposal.status === 'Pending' ? 'Processing...' : 'Accept'}
        </button>
        {/* TODO: Add "Edit & Accept" later */}
      </div>
      {proposal.status !== 'Pending' && (
        <p style={{ fontSize: '12px', color: '#777', marginTop: '10px', textAlign: 'right' }}>
          Status: {proposal.status}
        </p>
      )}
      {/* TODO: Display source comments if needed, or link to them */}
    </div>
  );
};

export default AIProposalCard;
