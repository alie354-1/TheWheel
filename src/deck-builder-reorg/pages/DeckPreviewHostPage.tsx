import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeckPreviewer from '../preview/components/DeckPreviewer.tsx';
// import Layout from '../../components/Layout'; // Layout might not be needed if DeckPreviewer is full page

const DeckPreviewHostPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const handleClosePreview = () => {
    navigate(-1); // Go back to the previous page (editor)
  };

  if (!deckId) {
    return (
      // <Layout> Remove Layout wrapper if it doesn't take children or is not desired here
        <div className="flex items-center justify-center h-screen text-red-500 bg-gray-100">
          Error: No Deck ID provided in the URL.
        </div>
      // </Layout>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* DeckPreviewer is expected to take 100% width/height of this div */}
      <DeckPreviewer deckId={deckId} onClosePreview={handleClosePreview} />
    </div>
  );
};

export default DeckPreviewHostPage;
