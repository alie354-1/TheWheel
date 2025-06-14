import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DeckService } from '../services/deckService.ts';
import { DeckPreview } from '../components/DeckPreview.tsx';
import { Deck } from '../types/index.ts';
import { supabase } from '../../lib/supabase.ts';
import { ArrowLeft, Share, Edit, Download } from 'lucide-react';

function DeckPreviewPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (deckId && user) {
      loadDeck();
    }
  }, [deckId, user]);

  const loadDeck = async () => {
    if (!deckId || !user) return;

    try {
      setLoading(true);
      const deckData = await DeckService.getDeck(deckId);
      if (deckData) {
        setDeck(deckData);
        setIsOwner(deckData.user_id === user.id);
      }
    } catch (err) {
      setError('Failed to load deck. Please try again.');
      console.error('Error loading deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing modal
    console.log('Share deck:', deckId);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download deck:', deckId);
  };

  const handleEdit = () => {
    navigate(`/deck-builder/edit/${deckId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deck Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested deck could not be found.'}</p>
          <Link
            to="/deck-builder/library"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/deck-builder/library"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Library
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-xl font-semibold text-gray-900 truncate">{deck.title}</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </button>
              
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>

              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 w-full h-full overflow-auto">
        <DeckPreview
          deck={deck}
          isPublic={!isOwner}
          onShare={handleShare}
          onEdit={isOwner ? handleEdit : undefined}
        />
      </div>
    </div>
  );
}

export default DeckPreviewPage;
