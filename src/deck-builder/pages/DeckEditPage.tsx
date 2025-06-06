import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeckService } from '../services/deckService';
import { supabase } from '../../lib/supabase';
import { Deck, DeckSection, SectionType } from '../types';
import { useDeck } from '../hooks/useDeck';
import { SectionEditor } from '../components/SectionEditor';
import { TemplateSelector } from '../components/TemplateSelector';
import { ComponentLibraryPanel } from '../components/ComponentLibraryPanel';
import { ThemeCustomizationPanel } from '../components/ThemeCustomizationPanel';
import { UnifiedDeckBuilder } from '../components/UnifiedDeckBuilder'; // Updated import
import { EnhancedSharingModal } from '../components/sharing'; // Added import for sharing modal
import { Share2 } from 'lucide-react'; // Added for Share icon

export default function DeckEditPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDeck, setInitialDeck] = useState<Deck | null>(null);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false); // State for sharing modal

  useEffect(() => {
    const loadDeck = async () => {
      setLoading(true); // Ensure loading is true at the start
      if (!deckId) {
        // This is a new deck scenario
        setInitialDeck(null);
        setError(null); // Clear any previous error
        setLoading(false);
        return;
      }

      // Existing deck scenario
      try {
        setError(null); // Clear previous error
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Please log in to edit decks');
          setLoading(false);
          return;
        }

        // Load the deck
        const loadedDeck = await DeckService.loadDeck(deckId);
        if (!loadedDeck) {
          setError('Deck not found');
          setLoading(false);
          return;
        }

        setInitialDeck(loadedDeck);
      } catch (err) {
        console.error('Error loading deck:', err);
        setError('Failed to load deck');
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deck...</p>
        </div>
      </div>
    );
  }

  // If a deckId was provided but an error occurred loading it
  if (deckId && error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Deck</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/deck-builder/library')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Library
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If a deckId was provided, no error, but deck still not found (e.g., DeckService.loadDeck returned null)
  if (deckId && !initialDeck && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">📄</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Deck Not Found</h1>
          <p className="text-gray-600 mb-6">The deck you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/deck-builder/library')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }
  
  // Render UnifiedDeckBuilder if not loading.
  // It will handle the case where initialDeck is null (for new decks) by showing TemplateSelector.
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/deck-builder/library')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {initialDeck ? `Editing: ${initialDeck.title}` : 'Create New Deck'}
            </h1>
          </div>
          {initialDeck && initialDeck.user_id && ( // Only show Share button if deck is saved (has user_id)
            <button
              onClick={() => setIsSharingModalOpen(true)}
              className="ml-auto flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              title="Share Deck"
            >
              <Share2 size={18} className="mr-2" />
              Share
            </button>
          )}
          {initialDeck && !initialDeck.user_id && ( // Show disabled/prompt-to-save button if deck is loaded but not saved
            <button
              className="ml-auto flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              title="Save the deck to enable sharing"
              disabled
            >
              <Share2 size={18} className="mr-2" />
              Share (Save First)
            </button>
          )}
        </div>
      </div>

      {/* Main content area fills all available space, white background */}
      <div className="flex-1 w-full h-full bg-white flex flex-col">
        {/* Pass initialDeck (which can be null for new decks) and onDeckUpdate callback */}
        <UnifiedDeckBuilder 
          initialDeck={initialDeck} 
          onDeckUpdate={(updatedDeck: Deck | null) => { // Explicitly type updatedDeck
            setInitialDeck(updatedDeck); // Directly set, whether it's a Deck or null
          }} 
        />
      </div>

      {initialDeck && (
        <EnhancedSharingModal
          deck={initialDeck}
          isOpen={isSharingModalOpen}
          onClose={() => setIsSharingModalOpen(false)}
        />
      )}
    </div>
  );
}

// The DeckBuilderEditor component below seems to be an older or alternative implementation
// and is not directly used by the exported DeckEditPage component.
// It can be removed if it's no longer needed.
/*
function DeckBuilderEditor({ initialDeck }: { initialDeck: Deck }) {
  // ... implementation ...
}
*/
